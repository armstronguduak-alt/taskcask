/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#2563eb",
        "on-primary": "#ffffff",
        "primary-container": "#dbeafe",
        "on-primary-container": "#1e3a8a",
        "secondary": "#1d4ed8",
        "on-secondary": "#ffffff",
        "secondary-container": "#bfdbfe",
        "on-secondary-container": "#1e40af",
        "tertiary": "#f59e0b",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#fef3c7",
        "on-tertiary-container": "#92400e",
        "error": "#ef4444",
        "on-error": "#ffffff",
        "error-container": "#fee2e2",
        "on-error-container": "#991b1b",
        "background": "#f8fafc",
        "on-background": "#0f172a",
        "surface": "#ffffff",
        "on-surface": "#0f172a",
        "surface-variant": "#f1f5f9",
        "on-surface-variant": "#475569",
        "outline": "#cbd5e1",
        "outline-variant": "#e2e8f0",
        "inverse-surface": "#1e293b",
        "inverse-on-surface": "#f8fafc",
        "inverse-primary": "#60a5fa",
        "surface-tint": "#2563eb"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
        "full": "9999px"
      },
      spacing: {
        "base": "4px",
        "stack-sm": "8px",
        "stack-lg": "24px",
        "gutter": "12px",
        "container-padding": "20px",
        "stack-md": "16px"
      },
      fontFamily: {
        "label-caps": ["Inter", "sans-serif"],
        "stat-label": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "display-financial": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
}
