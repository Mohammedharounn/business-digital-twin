/**
 * Digital Twin Data Visualization Design System
 * Established for high-fidelity SaaS analytics
 */

export const CHART_THEME = {
    colors: {
        primary: {
            solid: "#6366f1", // Indigo
            light: "rgba(99, 102, 241, 0.4)",
            faded: "rgba(99, 102, 241, 0.1)",
            gradient: ["#6366f1", "#4f46e5"]
        },
        secondary: {
            solid: "#a855f7", // Purple
            light: "rgba(168, 85, 247, 0.4)",
            faded: "rgba(168, 85, 247, 0.1)",
            gradient: ["#a855f7", "#9333ea"]
        },
        success: {
            solid: "#10b981", // Emerald
            light: "rgba(16, 185, 129, 0.4)",
            faded: "rgba(16, 185, 129, 0.1)",
            gradient: ["#10b981", "#059669"]
        },
        warning: {
            solid: "#f59e0b", // Amber
            light: "rgba(245, 158, 11, 0.4)",
            faded: "rgba(245, 158, 11, 0.1)",
            gradient: ["#f59e0b", "#d97706"]
        },
        danger: {
            solid: "#f43f5e", // Rose
            light: "rgba(244, 63, 94, 0.4)",
            faded: "rgba(244, 63, 94, 0.1)",
            gradient: ["#f43f5e", "#e11d48"]
        },
        info: {
            solid: "#22d3ee", // Cyan
            light: "rgba(34, 211, 238, 0.4)",
            faded: "rgba(34, 211, 238, 0.1)",
            gradient: ["#22d3ee", "#0891b2"]
        }
    },
    grid: {
        stroke: "rgba(255, 255, 255, 0.05)",
        strokeDasharray: "3 3"
    },
    text: {
        fill: "#475569",
        fontSize: 10,
        fontFamily: "JetBrains Mono"
    },
    tooltip: {
        background: "rgba(10, 12, 21, 0.9)",
        border: "rgba(255, 255, 255, 0.1)",
        blur: "20px"
    }
};

export const GRADIENTS = [
    { id: "gradPrimary", colors: CHART_THEME.colors.primary.gradient },
    { id: "gradSecondary", colors: CHART_THEME.colors.secondary.gradient },
    { id: "gradSuccess", colors: CHART_THEME.colors.success.gradient },
    { id: "gradDanger", colors: CHART_THEME.colors.danger.gradient },
    { id: "gradInfo", colors: CHART_THEME.colors.info.gradient }
];
