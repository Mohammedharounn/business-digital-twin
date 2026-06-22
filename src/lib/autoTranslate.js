/**
 * Runtime whole-page translator. When Arabic is enabled it walks every visible
 * text node, batch-translates via the backend (/api/v1/translate → Google), and
 * replaces the text. It keeps observing the DOM so newly-rendered content
 * (page changes, charts, modals) gets translated too. Switching back to English
 * restores the original text.
 */
import api from './api';

const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA', 'INPUT',
    'SELECT', 'OPTION', 'SVG', 'CANVAS', 'KBD', 'SAMP',
]);

const hasLetters = (s) => /[A-Za-z]{2,}/.test(s);

let observer = null;
let active = false;
let targetLang = 'ar';
const originals = []; // { node, text } for restore
let seen = new WeakSet(); // text nodes already handled
let pending = false;

function collectTextNodes(root) {
    const out = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (seen.has(node)) return NodeFilter.FILTER_REJECT;
            const val = node.nodeValue;
            if (!val || !hasLetters(val)) return NodeFilter.FILTER_REJECT;
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
            if (parent.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        },
    });
    let n;
    while ((n = walker.nextNode())) out.push(n);
    return out;
}

async function translatePending() {
    if (pending) return;
    pending = true;
    try {
        const root = document.getElementById('root') || document.body;
        const nodes = collectTextNodes(root);
        if (!nodes.length) return;

        // Mark as seen up-front so concurrent mutations don't double-queue them.
        const items = nodes.map((node) => {
            seen.add(node);
            return { node, text: node.nodeValue };
        });
        const texts = items.map((it) => it.text.trim());

        const { data } = await api.post('/translate', { texts, target: targetLang });
        const translations = data?.translations || [];

        if (observer) observer.disconnect();
        items.forEach((it, i) => {
            const tr = translations[i];
            if (tr && tr !== it.text.trim()) {
                originals.push({ node: it.node, text: it.node.nodeValue });
                // preserve leading/trailing whitespace
                const lead = it.node.nodeValue.match(/^\s*/)[0];
                const trail = it.node.nodeValue.match(/\s*$/)[0];
                it.node.nodeValue = lead + tr + trail;
            }
        });
        if (active && observer) observer.observe(root, { childList: true, subtree: true, characterData: false });
    } catch {
        /* never break the UI */
    } finally {
        pending = false;
    }
}

let debounceTimer = null;
function scheduleTranslate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(translatePending, 350);
}

export function enableAutoTranslate(lang = 'ar') {
    if (active && targetLang === lang) return;
    targetLang = lang;
    active = true;
    const root = document.getElementById('root') || document.body;
    translatePending();
    if (!observer) {
        observer = new MutationObserver(() => { if (active) scheduleTranslate(); });
    }
    observer.observe(root, { childList: true, subtree: true, characterData: false });
}

export function disableAutoTranslate() {
    active = false;
    if (observer) observer.disconnect();
    // Restore originals (English)
    for (const { node, text } of originals) {
        try { node.nodeValue = text; } catch { /* node detached */ }
    }
    originals.length = 0;
    // Fresh WeakSet so a future re-enable re-translates everything
    seen = new WeakSet();
}
