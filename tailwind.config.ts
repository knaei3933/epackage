import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary 色トークン（brixa ブランド緑のエイリアス）。
        // これまで *-primary 系クラス（border-primary / bg-primary / ring-primary /
        // text-primary 等）がトークン不存在で無効化し、選択ハイライトや同意チェックの
        // 強調色が一切表示されない不具合を根本解決するため追加。
        // hex 直書きにすることで Tailwind が opacity modifier（bg-primary/10 等）も
        // 自動で RGB 変換して計算できるようにする（CSS 変数だと hex 形式で壊れるため）。
        primary: {
          DEFAULT: '#5EB6AC',
          50: '#F0FBFA',
          100: '#E1F6F4',
          200: '#C3EBE6',
          300: '#89E1D8',
          400: '#5EB6AC',
          500: '#47A39A',
          600: '#3A827B',
          700: '#2D6C65',
          800: '#235954',
          900: '#1A453F',
        },
        // ── Epackage UI Standard v1：意味トークン（正本: src/styles/DESIGN_STANDARD.md）──
        // 名前は Astryx（meta/astryx）の文法に合わせる。「brand」は Astryx の「accent」。
        // 同じ名前でも、使うクラスで役割が変わる:
        //   bg-brand / border-brand / ring-brand = 塗り・基準色（ヘッダーの「会員登録」「今すぐ相談」ボタンの色）
        //   text-brand                          = ブランド色の文字（下の textColor で上書き。淡い面の上でも 4.5:1 以上）
        //   bg-brand-soft / border-brand-soft   = 装飾の細線・淡い面だけ（文字・ボタンには使わない）
        // CSS 変数なので bg-brand/10 のような透明度の指定はできない。淡い色は -muted / -subtle を使う。
        brand: {
          DEFAULT: 'var(--color-brand)',
          hover: 'var(--color-brand-hover)',
          pressed: 'var(--color-brand-pressed)',
          muted: 'var(--color-brand-muted)',
          subtle: 'var(--color-brand-subtle)',
          soft: 'var(--color-brand-soft)',
        },
        'on-brand': {
          DEFAULT: 'var(--color-on-brand)',
          muted: 'var(--color-on-brand-muted)',
        },
        'on-success': { DEFAULT: 'var(--color-on-success)', muted: 'var(--color-on-success-muted)' },
        'on-warning': { DEFAULT: 'var(--color-on-warning)', muted: 'var(--color-on-warning-muted)' },
        'on-error': { DEFAULT: 'var(--color-on-error)', muted: 'var(--color-on-error-muted)' },
        'on-info': { DEFAULT: 'var(--color-on-info)', muted: 'var(--color-on-info-muted)' },
        // Epackage Lab Brand Colors（色の「土台」。新しい作業では brand を使い、brixa-* は直接使わない）
        brixa: {
          DEFAULT: 'var(--brixa-primary)',
          50: 'var(--brixa-primary-50)',
          100: 'var(--brixa-primary-100)',
          200: 'var(--brixa-primary-200)',
          300: 'var(--brixa-primary-300)',
          400: 'var(--brixa-primary-400)',
          500: 'var(--brixa-primary-500)',
          600: 'var(--brixa-primary-600)',
          700: 'var(--brixa-primary-700)',
          800: 'var(--brixa-primary-800)',
          900: 'var(--brixa-primary-900)',
        },
        // Secondary Navy Colors
        navy: {
          DEFAULT: 'var(--brixa-secondary)',
          50: 'var(--brixa-secondary-50)',
          100: 'var(--brixa-secondary-100)',
          200: 'var(--brixa-secondary-200)',
          300: 'var(--brixa-secondary-300)',
          400: 'var(--brixa-secondary-400)',
          500: 'var(--brixa-secondary-500)',
          600: 'var(--brixa-secondary-600)',
          700: 'var(--brixa-secondary-700)',
          800: 'var(--brixa-secondary-800)',
          900: 'var(--brixa-secondary-900)',
        },
        // Metallic Colors
        metallic: {
          silver: 'var(--metallic-silver)',
          gold: 'var(--metallic-gold)',
          copper: 'var(--metallic-copper)',
          blue: 'var(--metallic-blue)',
        },
        // Semantic Colors with proper states
        // DEFAULT = 塗り（白文字 4.5:1 以上）かつ文字色。muted = 淡い塗り（文字は text-on-<status>-muted）。
        // 50〜700 は互換用の土台。新しい作業では DEFAULT / muted を使う。
        success: {
          DEFAULT: 'var(--color-success)',
          muted: 'var(--color-success-muted)',
          50: 'var(--success-50)',
          500: 'var(--success-500)',
          600: 'var(--success-600)',
          700: 'var(--success-700)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          muted: 'var(--color-warning-muted)',
          50: 'var(--warning-50)',
          500: 'var(--warning-500)',
          600: 'var(--warning-600)',
          700: 'var(--warning-700)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          muted: 'var(--color-error-muted)',
          50: 'var(--error-50)',
          500: 'var(--error-500)',
          600: 'var(--error-600)',
          700: 'var(--error-700)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          muted: 'var(--color-info-muted)',
          50: 'var(--info-50)',
          500: 'var(--info-500)',
          600: 'var(--info-600)',
          700: 'var(--info-700)',
        },
        // Background Colors
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          accent: 'var(--bg-accent)',
          muted: 'var(--bg-muted)',
        },
        // Text Colors
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
          muted: 'var(--text-muted)',
        },
        // Border Colors
        border: {
          light: 'var(--border-light)',
          medium: 'var(--border-medium)',
          dark: 'var(--border-dark)',
          strong: 'var(--border-strong)',
        },
      },
      // text-brand だけは「文字の役割」の色にする（colors.brand は塗りの色。淡い面の上の文字は 4.5:1 が必要）
      textColor: {
        brand: 'var(--color-text-brand)',
      },
      fontFamily: {
        // 見出し用の明朝（公開ページのタイトルだけ）。本文・画面の部品は sans。
        // --font-heading は next/font（src/components/home/fonts.ts）が定義する。未定義の範囲では下の明朝系にフォールバック。
        heading: ['var(--font-heading, "Shippori Mincho B1")', '"Hiragino Mincho ProN"', '"Yu Mincho"', 'serif'],
        sans: [
          '"Noto Sans JP"',
          '"Noto Sans CJK JP"',
          '"Hiragino Sans"',
          '"Yu Gothic"',
          'sans-serif',
        ],
        korean: [
          '"Noto Sans KR"',
          '"Malgun Gothic"',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          '"Monaco"',
          '"Cascadia Code"',
          '"Roboto Mono"',
          'monospace',
        ],
      },
      fontSize: {
        xs: ['var(--font-size-xs)', { lineHeight: '1rem' }],
        sm: ['var(--font-size-sm)', { lineHeight: '1.25rem' }],
        base: ['var(--font-size-base)', { lineHeight: '1.5rem' }],
        lg: ['var(--font-size-lg)', { lineHeight: '1.75rem' }],
        xl: ['var(--font-size-xl)', { lineHeight: '1.75rem' }],
        '2xl': ['var(--font-size-2xl)', { lineHeight: '2rem' }],
        '3xl': ['var(--font-size-3xl)', { lineHeight: '2.25rem' }],
        '4xl': ['var(--font-size-4xl)', { lineHeight: '2.5rem' }],
        '5xl': ['var(--font-size-5xl)', { lineHeight: '1' }],
        '6xl': ['var(--font-size-6xl)', { lineHeight: '1' }],
      },
      spacing: {
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)',
        '4xl': 'var(--space-4xl)',
        '5xl': 'var(--space-5xl)',
      },
      borderRadius: {
        // 役割で決める形: inner=チップ・サムネイル / element=ボタン・入力欄・バッジ / container=カード・パネル・ダイアログ
        inner: 'var(--radius-inner)',
        element: 'var(--radius-element)',
        container: 'var(--radius-container)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        // 影は「浮いているもの」だけ: low=持ち上がり / med=メニュー・ポップオーバー / high=ダイアログ・ドロワー
        low: 'var(--shadow-sm)',
        med: 'var(--shadow-md)',
        high: 'var(--shadow-lg)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
      },
      backgroundImage: {
        'gradient-metallic': 'var(--gradient-metallic)',
        'gradient-blue-metallic': 'var(--gradient-blue-metallic)',
        'gradient-brixa': 'var(--gradient-brixa)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        'ease-in': 'var(--ease-in)',
        'ease-out': 'var(--ease-out)',
        'ease-in-out': 'var(--ease-in-out)',
      },
      letterSpacing: {
        japanese: '0.02em',
        korean: '0.01em',
      },
      lineHeight: {
        japanese: '1.75',
        korean: '1.6',
      },
      animation: {
        'fade-in': 'fadeIn var(--duration-normal) var(--ease-out)',
        'slide-up': 'slideUp var(--duration-normal) var(--ease-out)',
        'slide-down': 'slideDown var(--duration-normal) var(--ease-out)',
        'scale-in': 'scaleIn var(--duration-normal) var(--ease-out)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      screens: {
        '2xl': '1536px',
      },
    },
  },
  plugins: [typography],
}

export default config