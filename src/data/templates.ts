// Static template data for client-side use
export interface Template {
  filename: string
  displayName: string
  downloadUrl: string
  fileType: string
}

export const templateData: Record<string, Template[]> = {
  flat_3_side: [
    {
      filename: '三辺シール袋_テンプレート.ai',
      displayName: '三辺シール袋 デザインテンプレート',
      downloadUrl: '/templates/three-side-seal-pouch.ai',
      fileType: 'AI'
    },
    {
      filename: '三辺シール袋_テンプレート.pdf',
      displayName: '三辺シール袋 デザインガイドライン',
      downloadUrl: '/templates/three-side-seal-pouch.pdf',
      fileType: 'PDF'
    }
  ],
  stand_up: [
    {
      filename: 'スタンドパウチ_テンプレート.ai',
      displayName: 'スタンドパウチ デザインテンプレート',
      downloadUrl: '/templates/stand-pouch.ai',
      fileType: 'AI'
    },
    {
      filename: 'スタンドパウチ_テンプレート.eps',
      displayName: 'スタンドパウチ ベクターテンプレート',
      downloadUrl: '/templates/stand-pouch.eps',
      fileType: 'EPS'
    }
  ],
  box: [
    {
      filename: 'ボックス型パウチ_テンプレート.ai',
      displayName: 'ボックス型パウチ デザインテンプレート',
      downloadUrl: '/templates/box-pouch.ai',
      fileType: 'AI'
    },
    {
      filename: 'ボックス型パウチ_テンプレート.pdf',
      displayName: 'ボックス型パウチ デザインガイドライン',
      downloadUrl: '/templates/box-pouch.pdf',
      fileType: 'PDF'
    }
  ],
  box_with_valve: [
    {
      filename: 'ガス抜きバルブ付きBOX型パウチ_テンプレート.ai',
      displayName: 'ガス抜きバルブ付きBOX型パウチ デザインテンプレート',
      downloadUrl: '/templates/box-valve-pouch.ai',
      fileType: 'AI'
    },
    {
      filename: 'ガス抜きバルブ付きBOX型パウチ_テンプレート.pdf',
      displayName: 'ガス抜きバルブ付きBOX型パウチ デザインガイドライン',
      downloadUrl: '/templates/box-valve-pouch.pdf',
      fileType: 'PDF'
    }
  ],
  spout_pouch: [
    {
      filename: 'スパウトパウチ_テンプレート.ai',
      displayName: 'スパウトパウチ デザインテンプレート',
      downloadUrl: '/templates/spout-pouch.ai',
      fileType: 'AI'
    },
    {
      filename: 'スパウトパウチ_テンプレート.pdf',
      displayName: 'スパウトパウチ デザインガイドライン',
      downloadUrl: '/templates/spout-pouch.pdf',
      fileType: 'PDF'
    }
  ],
  flat_with_zip: [
    {
      filename: 'チャック付き平袋_テンプレート.ai',
      displayName: 'チャック付き平袋 デザインテンプレート',
      downloadUrl: '/templates/zip-flat-pouch.ai',
      fileType: 'AI'
    },
    {
      filename: 'チャック付き平袋_テンプレート.eps',
      displayName: 'チャック付き平袋 ベクターテンプレート',
      downloadUrl: '/templates/zip-flat-pouch.eps',
      fileType: 'EPS'
    }
  ],
  roll_film: [
    {
      filename: 'ロールフィルム_テンプレート.ai',
      displayName: 'ロールフィルム デザインテンプレート',
      downloadUrl: '/templates/roll-film.ai',
      fileType: 'AI'
    },
    {
      filename: 'ロールフィルム_テンプレート.pdf',
      displayName: 'ロールフィルム デザインガイドライン',
      downloadUrl: '/templates/roll-film.pdf',
      fileType: 'PDF'
    }
  ]
}

// Function to get templates for a specific category
export function getTemplatesForCategory(category: string): Template[] {
  return templateData[category] || []
}

// Function to check if a category has templates
export function hasTemplates(category: string): boolean {
  return category in templateData && templateData[category].length > 0
}