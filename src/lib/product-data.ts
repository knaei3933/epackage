
export const PRODUCT_CATEGORIES = {
    flat_3_side: {
        name_ja: '平袋',
        name_en: 'Three-Side Seal Bag',
        description_ja: 'シンプルでコストパフォーマンスに優れた定番パッケージ。小物や試供品、サンプル配布に最適。',
        description_en: 'Simple and cost-effective standard packaging. Ideal for small items, samples, and trial products.',
        icon: 'package',
        features: ['低コスト', 'シンプル設計', '多用途対応']
    },
    stand_up: {
        name_ja: 'スタンドパウチ',
        name_en: 'Stand Pouch',
        description_ja: '自立型で陳列性に優れ、チャック付きで再封可能。食品・健康食品・化粧品まで幅広く対応。',
        description_en: 'Self-standing with excellent display properties, resealable with zipper. Wide support for food, health products, and cosmetics.',
        icon: 'shopping-bag',
        features: ['自立設計', '再封可能', '陳列性に優れる']
    },
    box: {
        name_ja: 'BOX型パウチ',
        name_en: 'Box Pouch',
        description_ja: '箱型形状で自立性が高く、内容物の保護性に優れた立体パッケージ。',
        description_en: 'Box-shaped pouch with excellent self-standing properties and superior protection for contents.',
        icon: 'package',
        features: ['自立性', '保護性', '立体設計']
    },
    spout_pouch: {
        name_ja: 'スパウトパウチ',
        name_en: 'Spout Pouch',
        description_ja: '液体食品・化粧品・健康食品に最適なスパウト付きパウチ。軽量で持ち運びやすく、使いやすいスパウトで注ぎやすさを実現。',
        description_en: 'Spout pouch optimal for liquid foods, cosmetics, and health products. Lightweight and portable with easy-to-use spout for pouring.',
        icon: 'package-2',
        features: ['液体対応', '注ぎやすさ', '持ち運び便利']
    },
    roll_film: {
        name_ja: 'ロールフィルム',
        name_en: 'Roll Film',
        description_ja: '自動包装機に対応。大量生産に最適で、コスト削減を実現します。',
        description_en: 'Compatible with automatic packaging machines. Optimal for mass production, achieving cost reduction.',
        icon: 'archive',
        features: ['大量生産対応', '自動包装機対応', 'コスト削減']
    },
    // Additional categories (sorted alphabetically)
    flat_with_zip: {
        name_ja: 'チャック付き平袋',
        name_en: 'Flat Bag with Zip',
        description_ja: 'チャック付きで再封可能なフラットタイプのパウチ。保管効率が良く、省スペース設計。',
        description_en: 'Flat pouch with zipper for resealability. Space-efficient design with excellent storage properties.',
        icon: 'file',
        features: ['再封可能', '省スペース', 'チャック付き']
    },
    gusset: {
        name_ja: 'ガゼット袋',
        name_en: 'Gusset Bag',
        description_ja: 'マチ付きで容量たっぷり。コーヒー豆や茶葉、プレミアム商品の包装に最適な高級パッケージ。',
        description_en: 'Generous capacity with gusset bottom. Premium packaging ideal for coffee beans, tea leaves, and premium products.',
        icon: 'box',
        features: ['大容量対応', '高級感', '底部拡張']
    },
    soft_pouch: {
        name_ja: 'ソフトパウチ',
        name_en: 'Soft Pouch',
        description_ja: '柔らかな素材で作られたソフトな質感のパウチ。高級感と優れた触感を実現。',
        description_en: 'Soft pouch made from flexible materials for a soft texture. Premium feel and excellent tactile experience.',
        icon: 'shopping-bag',
        features: ['柔らかな質感', '高級感', '優れた触感']
    },
    special: {
        name_ja: '特殊仕様パウチ',
        name_en: 'Special Specification Pouch',
        description_ja: '特殊な機能や仕様を備えたカスタマイズパッケージ。お客様のニーズに合わせて設計可能。',
        description_en: 'Custom packaging with special features and specifications. Design available to meet customer requirements.',
        icon: 'settings',
        features: ['カスタマイズ', '特殊機能', '設計対応']
    }
} as const

// Package-Lab actual product data
export function getAllProducts(categoryFilter?: string | null, locale: string = 'ja') {
    const allProducts = [
        // 1. 3방실 파우치 (Three-Side Seal Pouch) - 平袋
        {
            id: 'three-seal-001',
            category: 'flat_3_side' as const,
            name_ja: '平袋',
            name_en: 'Three-Side Seal Pouch',
            name_ko: '3방실 파우치',
            description_ja: '3面シールのシンプルでコストパフォーマンスに優れた定番パッケージ。小物や試供品、サンプル配布に最適。',
            description_en: 'Simple three-side seal packaging with excellent cost performance. Ideal for small items, samples, and trial products.',
            description_ko: '3면 실링의 간단하고 비용 대비 효율이 뛰어난 기본 패키지. 소품이나 시험품, 샘플 배포에 최적.',
            specifications: {
                width_range: '50-300mm',
                height_range: '80-500mm',
                thickness_range: '50-150μm',
                materials: ['PE', 'PP', 'PET', '알루미늄 라미네이트']
            },
            materials: ['PE', 'PP', 'PET', 'ALUMINUM'],
            image: '/images/real-products/3sealpouch.png',
            pricing_formula: {
                base_cost: 8000,
                per_unit_cost: 8,
                min_quantity: 500
            },
            min_order_quantity: 500,
            lead_time_days: 5,
            sort_order: 1,
            is_active: true,
            tags: locale === 'ja'
                ? ['低コスト', '最安値', '超低コスト印刷', '試し印刷に最適']
                : ['Low Cost', 'Best Price', 'Ultra-Low Cost Print', 'Optimal for Trial Prints'],
            applications: locale === 'ja'
                ? ['試供品', 'サンプル', '小物包装', '試験印刷']
                : ['Trial Products', 'Samples', 'Small Item Packaging', 'Test Printing'],
            features: locale === 'ja'
                ? ['低コスト', 'シンプル設計', '多用途対応', '迅速生産']
                : ['Low Cost', 'Simple Design', 'Multi-Purpose', 'Quick Production']
        },

        // 2. 스탠드파우치 (Stand Pouch) - スタンドパウチ
        {
            id: 'stand-pouch-001',
            category: 'stand_up' as const,
            name_ja: 'スタンドパウチ',
            name_en: 'Stand Pouch',
            name_ko: '스탠드파우치',
            description_ja: '自立型で陳列性に優れ、チャック付きで再封可能。食品・健康食品・化粧品まで幅広く対応。',
            description_en: 'Self-standing with excellent display properties, resealable with zipper. Wide support for food, health products, and cosmetics.',
            description_ko: '자립형으로 전시성이 뛰어나며, 지퍼로 재밀봉 가능. 식품, 건강식품, 화장품까지 폭넓게 지원.',
            specifications: {
                width_range: '80-250mm',
                height_range: '120-350mm',
                thickness_range: '60-180μm',
                materials: ['PE', 'PP', 'PET', '알루미늄 라미네이트']
            },
            materials: ['PE', 'PP', 'PET', 'ALUMINUM'],
            image: '/images/portfolio/granola-standpouch-real.jpg',
            pricing_formula: {
                base_cost: 18000,
                per_unit_cost: 12,
                min_quantity: 500
            },
            min_order_quantity: 500,
            lead_time_days: 7,
            sort_order: 2,
            is_active: true,
            tags: locale === 'ja'
                ? ['人気No.1', 'デジタル印刷', '版代不要', '1枚から印刷']
                : ['Popular No.1', 'Digital Printing', 'No Plate Cost', 'Print from 1 piece'],
            applications: locale === 'ja'
                ? ['食品包装', '健康食品', '化粧品', 'ペットフード']
                : ['Food Packaging', 'Health Food', 'Cosmetics', 'Pet Food'],
            features: locale === 'ja'
                ? ['自立設計', '再封可能', '陳列性に優れる', 'デジタル印刷対応']
                : ['Self-Standing', 'Resealable', 'Excellent Display', 'Digital Print Ready']
        },

        // 3. 가젯 파우치 (Box Pouch) - 박스파우치
        {
            id: 'box-pouch-001',
            category: 'box' as const,
            name_ja: 'BOX型パウチ',
            name_en: 'Box Pouch',
            name_ko: '가젯 파우치',
            description_ja: '箱型形状で自立性が高く、内容物の保護性に優れた立体パッケージ。',
            description_en: 'Box-shaped pouch with excellent self-standing properties and superior protection for contents.',
            description_ko: '박스 형상으로 자립성이 높고, 내용물 보호성이 뛰어난 입체 패키지.',
            specifications: {
                width_range: '100-250mm',
                height_range: '150-300mm',
                depth_range: '40-80mm',
                thickness_range: '100-200μm',
                materials: ['PET', '알루미늄 라미네이트', 'PE']
            },
            materials: ['PET', 'ALUMINUM', 'PE'],
            image: '/images/products/gusset-bag-coffee.webp',
            pricing_formula: {
                base_cost: 28000,
                per_unit_cost: 16,
                min_quantity: 800
            },
            min_order_quantity: 800,
            lead_time_days: 10,
            sort_order: 3,
            is_active: true,
            tags: locale === 'ja'
                ? ['高級感', '自立性', '保護性', '立体設計']
                : ['Premium Feel', 'Self-Standing', 'Protective', '3D Design'],
            applications: locale === 'ja'
                ? ['高級食品', 'プレミアム製品', 'ギフト包装', '化粧品']
                : ['Premium Food', 'Premium Products', 'Gift Packaging', 'Cosmetics'],
            features: locale === 'ja'
                ? ['自立性', '保護性', '立体設計', '高級感']
                : ['Self-Standing', 'Protective', '3D Design', 'Premium Feel']
        },

        // 4. 스파우트파우치 (Spout Pouch) - スパウトパウチ
        {
            id: 'spout-pouch-001',
            category: 'spout_pouch' as const,
            name_ja: 'スパウトパウチ',
            name_en: 'Spout Pouch',
            name_ko: '스파우트파우치',
            description_ja: '液体食品・化粧品・健康食品に最適なスパウト付きパウチ。軽量で持ち運びやすく、使いやすいスパウトで注ぎやすさを実現。',
            description_en: 'Spout pouch optimal for liquid foods, cosmetics, and health products. Lightweight and portable with easy-to-use spout for pouring.',
            description_ko: '액체 식품, 화장품, 건강식품에 최적화된 스파우트 파우치. 가볍고 휴대가 간편하며, 사용하기 쉬운 스파우트로 붓기 편리.',
            specifications: {
                width_range: '120-300mm',
                height_range: '200-400mm',
                capacity_range: '100-1000ml',
                thickness_range: '120-250μm',
                materials: ['PET', '알루미늄 라미네이트', 'PE', '나일론']
            },
            materials: ['PET', 'ALUMINUM', 'PE', 'NYLON'],
            image: '/images/products/spout-pouch-1.png',
            pricing_formula: {
                base_cost: 30000,
                per_unit_cost: 18,
                min_quantity: 1000
            },
            min_order_quantity: 1000,
            lead_time_days: 12,
            sort_order: 4,
            is_active: true,
            tags: locale === 'ja'
                ? ['NEW', '液体対応', '注ぎやすさ', '高品質']
                : ['NEW', 'Liquid Compatible', 'Easy to Pour', 'High Quality'],
            applications: locale === 'ja'
                ? ['液体食品', '化粧品', '健康食品', '飲料', 'ソース']
                : ['Liquid Food', 'Cosmetics', 'Health Food', 'Beverages', 'Sauces'],
            features: locale === 'ja'
                ? ['液体対応', '注ぎやすさ', '持ち運び便利', '耐水性']
                : ['Liquid Compatible', 'Easy to Pour', 'Portable', 'Water Resistant']
        },

        // 5. 롤 필름 (Roll Film) - ロールフィルム
        {
            id: 'roll-film-001',
            category: 'roll_film' as const,
            name_ja: 'ロールフィルム',
            name_en: 'Roll Film',
            name_ko: '롤 필름',
            description_ja: '自動包装機に対応。大量生産に最適で、コスト削減を実現します。',
            description_en: 'Compatible with automatic packaging machines. Optimal for mass production, achieving cost reduction.',
            description_ko: '자동 포장기 호환. 대량 생산에 최적화되어 비용 절감을 실현.',
            specifications: {
                width_range: '200-1200mm',
                length_range: '100-1000m',
                thickness_range: '30-150μm',
                materials: ['PE', 'PP', 'PET', '알루미늄 라미네이트']
            },
            materials: ['PE', 'PP', 'PET', 'ALUMINUM'],
            image: '/images/auto-roll-real.jpg',
            pricing_formula: {
                base_cost: 5000,
                per_unit_cost: 5,
                min_quantity: 1000,
                unit_type: 'meter'
            },
            min_order_quantity: 1000,
            lead_time_days: 7,
            sort_order: 5,
            is_active: true,
            tags: locale === 'ja'
                ? ['大量生産対応', '必要分だけ', '在庫リスクゼロ', '自動包装機対応']
                : ['Mass Production', 'Only What You Need', 'Zero Inventory Risk', 'Auto Packaging Compatible'],
            applications: locale === 'ja'
                ? ['自動包装', '大量生産', '食品工場', '包装機械']
                : ['Automatic Packaging', 'Mass Production', 'Food Factory', 'Packaging Machinery'],
            features: locale === 'ja'
                ? ['大量生産対応', '自動包装機対応', 'コスト削減', '必要分だけ']
                : ['Mass Production Compatible', 'Auto Packaging Ready', 'Cost Reduction', 'On-Demand']
        }
    ]

    // Filter by category if specified
    if (categoryFilter && categoryFilter !== 'all') {
        return allProducts.filter(product => product.category === categoryFilter)
    }

    return allProducts
}
