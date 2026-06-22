import { useAppStore } from '../store/useAppStore';

/**
 * Lightweight i18n. English + Arabic for the navigation, section headers and
 * common UI chrome. Pages fall back to English where a key is missing.
 * Arabic mode also flips the document to RTL (handled in App.jsx).
 */
export const STRINGS = {
    en: {
        // sidebar sections
        'section.Laboratory': 'Laboratory',
        'section.Intelligence': 'Intelligence',
        'section.Ecosystem': 'Ecosystem',
        // sidebar items
        'nav.dashboard': 'Overview',
        'nav.visualizer': '3D Twin',
        'nav.scenarios': 'Forge',
        'nav.location': 'Territory',
        'nav.optimization': 'Optimizer',
        'nav.ml_analytics': 'ML Analytics',
        'nav.benchmarks': 'Benchmarks',
        'nav.decision_tools': 'Decision Tools',
        'nav.weekly_report': 'Weekly Sync',
        'nav.reports': 'Full Audit',
        'nav.datasets': 'Datasets',
        'nav.research': 'Research',
        'nav.marketplace': 'Marketplace',
        'nav.gamification': 'Achievements',
        'nav.collaboration': 'Collaboration',
        // topbar / common
        'common.newProject': 'New Project',
        'common.commandAstra': 'Command Astra',
        'common.theme': 'Theme',
        'common.language': 'العربية',
        'common.logout': 'Log out',
        'sidebar.kernel': 'Kernel',
        'sidebar.activeLink': 'Active Link',
    },
    ar: {
        'section.Laboratory': 'المختبر',
        'section.Intelligence': 'الذكاء',
        'section.Ecosystem': 'المنظومة',
        'nav.dashboard': 'نظرة عامة',
        'nav.visualizer': 'التوأم ثلاثي الأبعاد',
        'nav.scenarios': 'السيناريوهات',
        'nav.location': 'الموقع',
        'nav.optimization': 'المُحسِّن',
        'nav.ml_analytics': 'تحليلات الذكاء الاصطناعي',
        'nav.benchmarks': 'المعايير المرجعية',
        'nav.decision_tools': 'أدوات القرار',
        'nav.weekly_report': 'التقرير الأسبوعي',
        'nav.reports': 'التدقيق الكامل',
        'nav.datasets': 'مجموعات البيانات',
        'nav.research': 'البحث',
        'nav.marketplace': 'المتجر',
        'nav.gamification': 'الإنجازات',
        'nav.collaboration': 'التعاون',
        'common.newProject': 'مشروع جديد',
        'common.commandAstra': 'استدعِ أسترا',
        'common.theme': 'المظهر',
        'common.language': 'English',
        'common.logout': 'تسجيل الخروج',
        'sidebar.kernel': 'النواة',
        'sidebar.activeLink': 'اتصال نشط',
    },
};

export function translate(lang, key) {
    const table = STRINGS[lang] || STRINGS.en;
    return table[key] ?? STRINGS.en[key] ?? key;
}

/** Hook: returns { t, lang, isRTL }. */
export function useT() {
    const lang = useAppStore((s) => s.language) || 'en';
    return {
        lang,
        isRTL: lang === 'ar',
        t: (key) => translate(lang, key),
    };
}
