import type { TranslationKeys } from '@/lib/i18n'

export const jaTranslations: TranslationKeys = {
  nav: {
    home: 'ホーム',
    about: '会社概要',
    services: 'パウチ製品',
    pricing: '費用対効果計算',
    contact: 'お問い合わせ',
    login: 'ログイン',
    signup: '新規登録',
    dashboard: 'ダッシュボード',
  },

  header: {
    tagline: '最先端のパッケージングソリューション',
    description: '革新的な包装技術で、ビジネスの可能性を広げます',
    cta: 'お問い合わせ',
    languageSelect: '言語を選択',
    mobileMenu: 'メニュー',
    closeMenu: '閉じる',
  },

  footer: {
    company: '会社',
    aboutUs: '私たちについて',
    ourServices: 'サービス内容',
    contactInfo: 'お問い合わせ',
    followUs: 'フォローする',
    newsletter: 'ニュースレター',
    subscribe: '購読する',
    emailPlaceholder: 'メールアドレスを入力',
    copyright: 'すべての権利を保有',
    allRightsReserved: 'すべての権利を保有',
    privacyPolicy: 'プライバシーポリシー',
    termsOfService: '利用規約',
    address: '住所',
    phone: '電話番号',
    email: 'メールアドレス',
    businessHours: '営業時間',
    hours: '月曜日〜金曜日 9:00-18:00',
  },

  common: {
    loading: '読み込み中...',
    error: 'エラー',
    retry: '再試行',
    close: '閉じる',
    cancel: 'キャンセル',
    confirm: '確認',
    save: '保存',
    delete: '削除',
    edit: '編集',
    view: '表示',
    search: '検索',
    searchPlaceholder: '検索キーワードを入力',
    filter: 'フィルター',
    sort: '並び替え',
    more: 'もっと見る',
    less: '閉じる',
    next: '次へ',
    previous: '前へ',
    page: 'ページ',
    of: '/',
    results: '件の結果',
    noResults: '結果が見つかりません',
    select: '選択',
    selected: '選択済み',
    yes: 'はい',
    no: 'いいえ',
    ok: 'OK',
    success: '成功',
    warning: '警告',
    info: '情報',
    reset: 'リセット',
  },

  errors: {
    pageNotFound: 'ページが見つかりません',
    serverError: 'サーバーエラーが発生しました',
    networkError: 'ネットワークエラーが発生しました',
    validationError: '入力内容を確認してください',
    unauthorized: '認証が必要です',
    forbidden: 'アクセス権限がありません',
    unknownError: '不明なエラーが発生しました',
    tryAgain: '再試行してください',
    goHome: 'ホームに戻る',
  },

  loading: {
    initializing: '初期化中...',
    processing: '処理中...',
    saving: '保存中...',
    deleting: '削除中...',
    updating: '更新中...',
    loadingData: 'データを読み込み中...',
    pleaseWait: 'お待ちください...',
  },

  catalog: {
    title: '製品カタログ',
    subtitle: '最先端のパッケージングソリューションでビジネスを次のレベルへ',
    searchPlaceholder: '製品名、材質、用途で検索...',
    categoryFilter: 'カテゴリーで絞り込み',
    allCategories: 'すべてのカテゴリー',
    sortBy: '並び替え',
    sortByRelevance: '関連度順',
    sortByPrice: '価格順',
    sortByPopularity: '人気順',
    packageTypes: {
      standard: 'スタンダード',
      premium: 'プレミアム',
      eco: 'エコ',
      luxury: 'ラグジュアリー',
      industrial: 'インダストリアル',
      custom: 'カスタム'
    },
    category: {
      type: 'タイプ',
      material: '材質',
      size: 'サイズ',
      industry: '業界'
    },
    actions: {
      viewDetails: '詳細をご確認',
      requestSample: 'サンプルご依頼',
      addToQuotation: 'お見積もりに追加',
      contactUs: 'お問い合わせ'
    },
    details: {
      specifications: '仕様',
      materials: '材質',
      dimensions: '寸法',
      features: '特徴',
      applications: '用途',
      leadTime: '納期',
      minOrder: '最小注文数',
      price: '価格'
    },
    modal: {
      close: '閉じる',
      previousImage: '前の画像',
      nextImage: '次の画像',
      imageOf: '/',
      inquireAbout: 'この製品についてお問い合わせ'
    }
  }
}