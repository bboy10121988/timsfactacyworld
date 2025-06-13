const path = require("path")

module.exports = {
  darkMode: "class",
  presets: [require("@medusajs/ui-preset")],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/modules/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-base)'],
        heading: ['var(--font-heading)'],
        body: ['var(--font-base)'],
      },
      fontSize: {
        "xs": ["0.75rem", { lineHeight: "1rem" }],      // 12px
        "sm": ["0.875rem", { lineHeight: "1.25rem" }],  // 14px
        "base": ["1rem", { lineHeight: "1.5rem" }],     // 16px
        "lg": ["1.125rem", { lineHeight: "1.75rem" }],  // 18px
        "xl": ["1.25rem", { lineHeight: "1.75rem" }],   // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }],      // 24px
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],   // 36px
        "5xl": ["3rem", { lineHeight: "1.16" }],        // 48px
      },
      textStyles: {
        'xs-regular': {
          fontSize: '0.75rem',
          lineHeight: '1rem',
          fontWeight: '400'
        },
        'sm-regular': {
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          fontWeight: '400'
        },
        'base-regular': {
          fontSize: '1rem',
          lineHeight: '1.5rem',
          fontWeight: '400'
        },
        'lg-regular': {
          fontSize: '1.125rem',
          lineHeight: '1.75rem',
          fontWeight: '400'
        }
      },
      // 統一的標題樣式類別
      sectionHeading: {
        fontSize: ['1.875rem', { lineHeight: '2.25rem' }],
        fontFamily: ['Helvetica Neue', 'sans-serif'],
        fontWeight: '300',
        letterSpacing: '0.2em',
        '@screen md': {
          fontSize: ['2.25rem', { lineHeight: '2.5rem' }]
        }
      },
      sectionSubheading: {
        fontSize: ['1rem', { lineHeight: '1.5rem' }],
        fontFamily: ['Noto Sans TC', 'sans-serif'],
        fontWeight: '400',
        color: '#6B7280'
      },
      transitionProperty: {
        width: "width margin",
        height: "height",
        bg: "background-color",
        display: "display opacity",
        visibility: "visibility",
        padding: "padding-top padding-right padding-bottom padding-left",
      },
      colors: {
        grey: {
          0: "#FFFFFF",
          5: "#F9FAFB",
          10: "#F3F4F6",
          20: "#E5E7EB",
          30: "#D1D5DB",
          40: "#9CA3AF",
          50: "#6B7280",
          60: "#4B5563",
          70: "#374151",
          80: "#1F2937",
          90: "#111827",
        },
      },
      borderRadius: {
        none: "0px",
        soft: "2px",
        base: "4px",
        rounded: "8px",
        large: "16px",
        circle: "9999px",
      },
      maxWidth: {
        "8xl": "100rem",
      },
      perspective: {
        '500': '500px',
      },
      backfaceVisibility: {
        'hidden': 'hidden',
      },
      screens: {
        "2xsmall": "320px",
        xsmall: "512px",
        small: "1024px",
        medium: "1280px",
        large: "1440px",
        xlarge: "1680px",
        "2xlarge": "1920px",
      },
      keyframes: {
        ring: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-in-right": {
          "0%": {
            opacity: "0",
            transform: "translateX(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "fade-in-top": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-out-top": {
          "0%": {
            height: "100%",
          },
          "99%": {
            height: "0",
          },
          "100%": {
            visibility: "hidden",
          },
        },
        "accordion-slide-up": {
          "0%": {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
          "100%": {
            height: "0",
            opacity: "0",
          },
        },
        "accordion-slide-down": {
          "0%": {
            "min-height": "0",
            "max-height": "0",
            opacity: "0",
          },
          "100%": {
            "min-height": "var(--radix-accordion-content-height)",
            "max-height": "none",
            opacity: "1",
          },
        },
        enter: {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        leave: {
          "0%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(0.9)", opacity: 0 },
        },
        "slide-in": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": {
            opacity: "0",
            transform: "translate(-50%, -20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translate(-50%, 0)",
          },
        },
        marquee: {
          '0%': { transform: 'translateY(0)' },
          '20%': { transform: 'translateY(0)' },
          '25%': { transform: 'translateY(-25%)' },
          '45%': { transform: 'translateY(-25%)' },
          '50%': { transform: 'translateY(-50%)' },
          '70%': { transform: 'translateY(-50%)' },
          '75%': { transform: 'translateY(-75%)' },
          '95%': { transform: 'translateY(-75%)' },
          '100%': { transform: 'translateY(0)' }
        }
      },
      animation: {
        ring: "ring 2.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
        "fade-in-right":
          "fade-in-right 0.3s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-in-top": "fade-in-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-out-top":
          "fade-out-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "accordion-open":
          "accordion-slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        "accordion-close":
          "accordion-slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        enter: "enter 200ms ease-out",
        "slide-in": "slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)",
        leave: "leave 150ms ease-in forwards",
        "fade-in-down": "fadeInDown 0.3s ease-out",
        marquee: 'marquee 12s cubic-bezier(0.4, 0, 0.2, 1) infinite'
      },
    },
  },
  plugins: [
    require("tailwindcss-radix")(),
    function({ addUtilities, theme }) {
      addUtilities({
        // 標題等級系統 - 根據你的具體需求
        '.h1': {
          fontSize: theme('fontSize.2xl')[0],
          lineHeight: theme('fontSize.2xl')[1].lineHeight,
          fontFamily: "'Helvetica Neue', sans-serif",
          fontWeight: '300',
          letterSpacing: '0.2em',
          marginBottom: theme('spacing.4'),
          '@screen md': {
            fontSize: '2rem',
            lineHeight: '1.2',
          }
        },
        '.h2': {
          fontFamily: "'Noto Sans TC', sans-serif",
          color: theme('colors.gray.600'),
          fontSize: theme('fontSize.base')[0],
          lineHeight: theme('fontSize.base')[1].lineHeight,
          fontWeight: '400'
        },
        '.h3': {
          fontSize: theme('fontSize.xl')[0],
          lineHeight: theme('fontSize.xl')[1].lineHeight,
          fontFamily: "'Helvetica Neue', sans-serif",
          fontWeight: '400',
          letterSpacing: '0.1em'
        },
        '.h4': {
          fontSize: theme('fontSize.lg')[0],
          lineHeight: theme('fontSize.lg')[1].lineHeight,
          fontFamily: "'Noto Sans TC', sans-serif",
          fontWeight: '500'
        },
        
        // 統一容器樣式
        '.section-container': {
          marginBottom: theme('spacing.16'),
          textAlign: 'center',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          '@screen md': {
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
          }
        },
        
        // 向後相容的舊樣式類別（保持現有代碼正常運作）
        '.section-heading': {
          fontSize: theme('fontSize.3xl')[0],
          lineHeight: theme('fontSize.3xl')[1].lineHeight,
          fontFamily: "'Helvetica Neue', sans-serif",
          fontWeight: '300',
          letterSpacing: '0.2em',
          marginBottom: theme('spacing.4'),
          '@screen md': {
            fontSize: theme('fontSize.4xl')[0],
            lineHeight: theme('fontSize.4xl')[1].lineHeight,
          }
        },
        '.section-subheading': {
          fontFamily: "'Noto Sans TC', sans-serif",
          color: theme('colors.gray.600')
        },
        '.section-header-container': {
          marginBottom: theme('spacing.16'),
          textAlign: 'center',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          '@screen md': {
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
          }
        },
        
        // 文字樣式工具類
        '.text-helvetica': {
          fontFamily: "'Helvetica Neue', sans-serif"
        },
        '.text-noto': {
          fontFamily: "'Noto Sans TC', sans-serif"
        },
        '.tracking-wide-2': {
          letterSpacing: '0.2em'
        },
        '.tracking-wide-1': {
          letterSpacing: '0.1em'
        }
      })
    }
  ],
}
