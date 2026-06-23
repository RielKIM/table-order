/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary: 따뜻한 terracotta / red-orange — 식욕을 돋우는 메인 브랜드 컬러
        primary: {
          50: "#fdf3f0",
          100: "#fae3dc",
          200: "#f4c4b6",
          300: "#ec9c85",
          400: "#e27358",
          500: "#d65437", // base
          600: "#c2402a",
          700: "#a23123",
          800: "#822a21",
          900: "#6b261f",
          950: "#3a110d",
        },
        // Secondary: 리치 브라운 — 안정감, 헤더/텍스트
        secondary: {
          50: "#f8f5f1",
          100: "#ece2d6",
          200: "#d8c3ac",
          300: "#c19f7c",
          400: "#ae8059",
          500: "#9c6b48",
          600: "#85553c",
          700: "#6c4333",
          800: "#5a382e",
          900: "#4e3128",
          950: "#2c1a15",
        },
        // Accent: 따뜻한 앰버/옐로우 — CTA, 강조, 신규 배지
        accent: {
          50: "#fffaeb",
          100: "#fef0c7",
          200: "#fde08a",
          300: "#fcca4d",
          400: "#fbb524",
          500: "#f59e0b", // base
          600: "#d97c06",
          700: "#b45709",
          800: "#92440e",
          900: "#78380f",
          950: "#451c03",
        },
        // Neutral: warm gray (taupe 베이스) — 순수 회색 대신 따뜻한 무채색
        neutral: {
          50: "#faf9f7",
          100: "#f3f1ec",
          200: "#e7e3da",
          300: "#d4cdc0",
          400: "#b3a995",
          500: "#928876",
          600: "#766d5e",
          700: "#5f574b",
          800: "#433d35",
          900: "#2a2620",
          950: "#1a1712",
        },
        // Semantic colors
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        info: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
        },
        // 주문 상태 색상 (pending/preparing/completed) — 앱의 실제 OrderStatus와 1:1 매핑.
        // 색맹 고려: hue + 명도 + (컴포넌트에서) 아이콘/라벨을 함께 사용해 색에만 의존하지 않음.
        status: {
          // 대기중 — 중립 슬레이트(차분, 아직 액션 전)
          pending: {
            50: "#f8fafc",
            100: "#f1f5f9",
            200: "#e2e8f0",
            500: "#64748b",
            600: "#475569",
            700: "#334155",
            fg: "#334155", // 텍스트/아이콘 (배경 100 위에서 AA 충족)
          },
          // 준비중 — 따뜻한 앰버(진행중, 주의 환기)
          preparing: {
            50: "#fffbeb",
            100: "#fef3c7",
            200: "#fde68a",
            500: "#f59e0b",
            600: "#d97706",
            700: "#b45309",
            fg: "#92400e", // amber-800, 100 위에서 AA 충족
          },
          // 완료 — 그린(성공/마감)
          completed: {
            50: "#f0fdf4",
            100: "#dcfce7",
            200: "#bbf7d0",
            500: "#22c55e",
            600: "#16a34a",
            700: "#15803d",
            fg: "#166534", // green-800, 100 위에서 AA 충족
          },
        },
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      fontSize: {
        // 태블릿 가독성을 위해 base를 살짝 키운 스케일
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
      },
      spacing: {
        // 터치 친화적 사이징 토큰
        touch: "2.75rem", // 44px — 최소 터치 타깃
        "touch-lg": "3rem", // 48px — 기본 버튼
        "touch-xl": "3.5rem", // 56px — 키오스크 CTA
        18: "4.5rem",
        88: "22rem",
        100: "25rem",
        120: "30rem",
      },
      minHeight: {
        touch: "2.75rem",
        "touch-lg": "3rem",
        "touch-xl": "3.5rem",
      },
      minWidth: {
        touch: "2.75rem",
        "touch-lg": "3rem",
        "touch-xl": "3.5rem",
      },
      borderRadius: {
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.875rem",
        xl: "1.125rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        control: "0.625rem", // 인풋/버튼
        card: "0.875rem", // 카드
      },
      boxShadow: {
        // 따뜻한 톤이 살짝 섞인 부드러운 그림자
        xs: "0 1px 2px 0 rgba(42, 38, 32, 0.05)",
        sm: "0 1px 3px 0 rgba(42, 38, 32, 0.08), 0 1px 2px -1px rgba(42, 38, 32, 0.06)",
        DEFAULT: "0 2px 8px -1px rgba(42, 38, 32, 0.10), 0 2px 4px -2px rgba(42, 38, 32, 0.06)",
        md: "0 4px 12px -2px rgba(42, 38, 32, 0.12), 0 2px 6px -2px rgba(42, 38, 32, 0.07)",
        lg: "0 10px 24px -4px rgba(42, 38, 32, 0.14), 0 4px 10px -4px rgba(42, 38, 32, 0.08)",
        xl: "0 20px 40px -8px rgba(42, 38, 32, 0.18), 0 8px 16px -8px rgba(42, 38, 32, 0.10)",
        card: "0 2px 10px -2px rgba(42, 38, 32, 0.10)",
        "card-hover": "0 8px 24px -4px rgba(42, 38, 32, 0.16)",
        focus: "0 0 0 3px rgba(214, 84, 55, 0.35)",
      },
      keyframes: {
        // 신규 주문 강조용
        "pulse-highlight": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245, 158, 11, 0.55)" },
          "50%": { boxShadow: "0 0 0 8px rgba(245, 158, 11, 0)" },
        },
        "flash-bg": {
          "0%": { backgroundColor: "rgba(254, 240, 199, 0.9)" },
          "100%": { backgroundColor: "rgba(254, 240, 199, 0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-highlight": "pulse-highlight 1.6s ease-out infinite",
        "flash-bg": "flash-bg 2s ease-out 1",
        "fade-in": "fade-in 0.25s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        shimmer: "shimmer 1.8s linear infinite",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
