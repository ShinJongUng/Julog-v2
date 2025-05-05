import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}', // src 디렉토리 사용 시
    './mdx-components.tsx', // MDX 컴포넌트 파일 포함
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"], // Pretendard 변수 사용
        title: ["var(--font-title)"], // 학교안심알림장 변수 사용
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      // Typography 플러그인 스타일 커스터마이징 (선택 사항)
      typography: ({ theme }: { theme: any }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.foreground / 90%'), // 본문 텍스트 색상 조정
            '--tw-prose-headings': theme('colors.foreground'),    // 제목 색상
            '--tw-prose-lead': theme('colors.muted.foreground'),
            '--tw-prose-links': theme('colors.primary.DEFAULT'), // 링크 색상
            '--tw-prose-bold': theme('colors.foreground'),
            '--tw-prose-counters': theme('colors.muted.foreground'),
            '--tw-prose-bullets': theme('colors.muted.foreground / 50%'), // 목록 불릿 색상 조정
            '--tw-prose-hr': theme('colors.border'),              // 구분선 색상
            '--tw-prose-quotes': theme('colors.foreground'),
            '--tw-prose-quote-borders': theme('colors.border'),
            '--tw-prose-captions': theme('colors.muted.foreground'),
            '--tw-prose-code': theme('colors.foreground'),        // 인라인 코드 색상
            '--tw-prose-pre-code': theme('colors.gray[300]'),    // 코드 블록 텍스트 색상 (라이트 모드)
            '--tw-prose-pre-bg': theme('colors.gray[900]'),      // 코드 블록 배경색 (라이트 모드)
            '--tw-prose-th-borders': theme('colors.border'),
            '--tw-prose-td-borders': theme('colors.border'),
            '--tw-prose-invert-body': theme('colors.muted.foreground'), // 다크 모드 본문 색상
            '--tw-prose-invert-headings': theme('colors.foreground'),
            '--tw-prose-invert-lead': theme('colors.muted.foreground / 70%'),
            '--tw-prose-invert-links': theme('colors.primary.DEFAULT'),
            '--tw-prose-invert-bold': theme('colors.foreground'),
            '--tw-prose-invert-counters': theme('colors.muted.foreground / 70%'),
            '--tw-prose-invert-bullets': theme('colors.muted.foreground / 30%'),
            '--tw-prose-invert-hr': theme('colors.border / 50%'),
            '--tw-prose-invert-quotes': theme('colors.muted.foreground'),
            '--tw-prose-invert-quote-borders': theme('colors.border / 50%'),
            '--tw-prose-invert-captions': theme('colors.muted.foreground / 70%'),
            '--tw-prose-invert-code': theme('colors.foreground'),          // 다크 모드 인라인 코드
            '--tw-prose-invert-pre-code': theme('colors.gray[300]'),      // 다크 모드 코드 블록 텍스트
            '--tw-prose-invert-pre-bg': 'rgb(31 41 55 / 80%)', // 다크 모드 코드 블록 배경 (약간 투명하게)
            '--tw-prose-invert-th-borders': theme('colors.border / 50%'),
            '--tw-prose-invert-td-borders': theme('colors.border / 50%'),
            // 링크 밑줄 제거
            a: {
              'text-decoration': 'none',
              '&:hover': {
                'text-decoration': 'underline',
              },
            },
            // 코드 블록 스타일 추가
            'pre': {
               borderRadius: theme('borderRadius.md'),
               padding: theme('spacing.4'),
            },
             // 인라인 코드 스타일
            'code::before': { content: 'none' }, // 기본 `` 제거
            'code::after': { content: 'none' },
             code: {
               fontWeight: '500',
               padding: '0.1em 0.3em',
               borderRadius: theme('borderRadius.sm'),
               backgroundColor: 'hsl(var(--muted) / 0.5)', // 인라인 코드 배경
             },
          },
        },
      }),
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography") // Typography 플러그인 추가
  ],
} satisfies Config

export default config 