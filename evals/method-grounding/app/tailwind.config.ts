// GENERATED from ../DESIGN.md by app/scripts/gen-tailwind-config.ts — do not edit by hand.
// Regenerate: (from method-grounding) bun app/scripts/gen-tailwind-config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{astro,tsx,jsx,ts,js,html,md,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
    "colors": {
        "primary": "#6d4de3",
        "secondary": "#5b6fe0",
        "tertiary": "#b45cc9",
        "neutral": "#e9e9ec",
        "ink": "#1c1b22",
        "ink-muted": "#6b6a74",
        "paper": "#ffffff",
        "line": "#d8d8dc",
        "accent-wash": "#efebfd"
    },
    "fontFamily": {
        "display": [
            "IBM Plex Sans"
        ],
        "body": [
            "IBM Plex Sans"
        ],
        "label": [
            "IBM Plex Sans"
        ],
        "data": [
            "IBM Plex Mono"
        ]
    },
    "fontSize": {
        "display": [
            "28px",
            {
                "fontWeight": "600"
            }
        ],
        "body": [
            "15px",
            {
                "fontWeight": "400"
            }
        ],
        "label": [
            "12px",
            {
                "letterSpacing": "0.04em",
                "fontWeight": "500"
            }
        ],
        "data": [
            "12.5px",
            {
                "fontWeight": "400"
            }
        ]
    },
    "borderRadius": {
        "sharp": "0px",
        "soft": "2px"
    },
    "spacing": {
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "40px"
    }
},
  },
  plugins: [],
} satisfies Config;
