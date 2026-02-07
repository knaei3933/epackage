import { type TradeRecord } from "@/types/archives";

// パウチ包装導入実績データ
export const sampleRecords: TradeRecord[] = [
  {
    id: "pouch-001",
    title: "化粧品ブランドスタンドパウチ導入事例",
    clientName: "A社（化粧品メーカー）",
    industry: "cosmetics",
    projectType: "custom_manufacturing",
    description: "高品質スタンドパウチを導入し、化粧水・クリームの保護とブランド価値向上を実現。チャック付きで再利用可能。",
    technicalSpec: "スタンドパウチ（チャック付き）| 素材: PET/AL/PE | アルミ箔遮光 | 密封性: 99.9%保持",
    results: ["製品品質維持期間延長", "包装コスト25%削減", "ブランドイメージ向上", "顧客利便性改善"],
    images: [
      { id: "pouch-001-1", url: "/images/archives/cosmetics-pouch-1.jpg", alt: "化粧品用スタンドパウチ", isMain: true, sortOrder: 1 },
      { id: "pouch-001-2", url: "/images/archives/standing-pouch-1.jpg", alt: "パウチ詳細仕様", isMain: false, sortOrder: 2 },
    ],
    startDate: "2024-03-01",
    endDate: "2024-05-15",
    featured: true,
    sortOrder: 1,
    tags: ["スタンドパウチ", "化粧品包装", "チャック付き", "遮光性"],
    createdAt: "2024-05-20T10:00:00Z",
    updatedAt: "2024-05-20T10:00:00Z",
    content: `
<h2>導入背景</h2>
<p>A社は、高級化粧品ブランドとして市場での地位を確立されていましたが、既存の包装容器にはいくつかの課題がありました。従来のガラス瓶やプラスチック容器は、コストが高く、輸送時の破損リスクもありました。また、環境問題への関心の高まりから、よりエコフレンドリーな包装ソリューションが求められていました。</p>

<h2>課題と要件</h2>
<p>プロジェクトの開始時に浮き彫りになった主な課題は以下の通りです：</p>
<ul>
<li>従来の容器コストが高く、利益率に圧迫していた</li>
<li>製品（化粧水・クリーム）の品質を長期間維持する必要があった</li>
<li>ブランドイメージに合った高級感のある包装が求められていた</li>
<li>環境配慮型の包装ソリューションへの移行が必要だった</li>
</ul>

<h2>選定理由</h2>
<p>複数の包装メーカーを比較検討した結果、当社が選ばれた主な理由は以下の通りです：</p>
<ul>
<li><strong>高バリアー性能</strong>：アルミ箔を挟んだ3層構造（PET/AL/PE）により、酸素や光を遮断し、製品品質を長期間維持</li>
<li><strong>チャック機能</strong>：再封可能なチャック付きデザインにより、顧客の利便性を大幅向上</li>
<li><strong>デザインカスタマイズ</strong>：ブランドイメージに合わせた印刷デザインの自由度が高かった</li>
<li><strong>コストパフォーマンス</strong>：既存容器と比較して25%のコスト削減を実現</li>
</ul>

<h2>ソリューション詳細</h2>
<p>当社が提供したスタンドパウチの仕様は以下の通りです：</p>
<ul>
<li><strong>素材構成</strong>：PET（外装）/ AL（アルミ箔）/ PE（内装）の3層構造</li>
<li><strong>バリアー性能</strong>：酸素透過率 1cc/㎡/day以下、光透過率 0.1%以下</li>
<li><strong>チャック機能</strong>：再封可能なジッパータイプ、開閉耐久性100回以上</li>
<li><strong>自立性</strong>：底ガセット構造により、陳列時の安定性を確保</li>
<li><strong>印刷</strong>：グラビア印刷による高品質なフルカラーデザイン対応</li>
</ul>

<h2>実装プロセス</h2>
<p>プロジェクトは以下の段階を経て実施されました：</p>
<ol>
<li><strong>ヒアリング（1週間）</strong>：要件詳細の確認、サンプル収集、コスト試算</li>
<li><strong>デザイン提案（2週間）</strong>：複数のデザイン案の提示、修正、最終決定</li>
<li><strong>試作（3週間）</strong>：サンプルパウチの製作、品質テスト、密封性確認</li>
<li><strong>本格生産（4週間）</strong>：大量生産開始、品質管理チェック、納品</li>
</ol>

<h2>技術仕様の詳細</h2>
<table>
<thead>
<tr><th>項目</th><th>仕様</th></tr>
</thead>
<tbody>
<tr><td>サイズ</td><td>幅120mm × 高さ180mm × マチ40mm</td></tr>
<tr><td>容量</td><td>200ml</td></tr>
<tr><td>素材構成</td><td>PET12μ / AL9μ / PE80μ</td></tr>
<tr><td>バリアー性能</td><td>酸素透過率: 0.5cc/㎡/day、水蒸気透過率: 0.8g/㎡/day</td></tr>
<tr><td>チャック</td><td>ダブルジッパー、開閉耐久性: 100回以上</td></tr>
<tr><td>印刷</td><td>グラビア8色印刷、光沢仕上げ</td></tr>
</tbody>
</table>

<h2>導入後の効果</h2>
<p>スタンドパウチ導入後、以下の効果が確認されました：</p>
<ul>
<li><strong>コスト削減</strong>：包装コストが25%削減され、利益率が改善</li>
<li><strong>製品品質</strong>：品質維持期間が従来の12ヶ月から18ヶ月に延長</li>
<li><strong>顧客満足度</strong>：チャック機能により、顧客満足度が15%向上</li>
<li><strong>ブランドイメージ</strong>：高級感のあるデザインにより、ブランド価値が向上</li>
<li><strong>環境負荷</strong>：プラスチック使用量が40%削減され、環境への配慮をアピール</li>
</ul>

<h2>顧客の声</h2>
<p>「スタンドパウチへの切り替えは、当社にとって大きな成功でした。コスト削減だけでなく、製品の品質維持とブランドイメージの向上も同時に実現できました。顧客からも「使いやすい」と好評で、リピート率も向上しています。」（A社 製品開発担当者）</p>
`,
    publishedAt: "2024年5月20日",
    author: { name: "包装ソリューションチーム", role: "コンサルタント" },
    readTime: 8,
  },
  {
    id: "pouch-002",
    title: "食品メーカースタンドパウチ大量導入",
    clientName: "B社（食品メーカー）",
    industry: "food",
    projectType: "custom_manufacturing",
    description: "チャック付きスタンドパウチを大量導入し、利便性と保存性を両立した包装ソリューションを提供。",
    technicalSpec: "スタンドパウチ（チャック付き）| 素材: PET/AL/PE | アルミ箔遮光 | 容量: 100-500g",
    results: ["製品品質維持期間延長", "消費者満足度95%向上", "物流効率40%改善", "在庫管理最適化"],
    images: [
      { id: "pouch-002-1", url: "/images/archives/standing-pouch-1.jpg", alt: "食品用スタンディングパウチ", isMain: true, sortOrder: 1 },
    ],
    startDate: "2024-01-15",
    endDate: "2024-04-30",
    featured: true,
    sortOrder: 2,
    tags: ["スタンディングパウチ", "食品包装", "チャック付き", "遮光性"],
    createdAt: "2024-05-01T09:30:00Z",
    updatedAt: "2024-05-01T09:30:00Z",
    content: `
<h2>導入背景</h2>
<p>B社は、レトルト食品やスナック菓子などの製造・販売を行う中堅食品メーカーです。従来の包装材は、チャックのないピローパウチを使用していましたが、消費者からの「開封後の保存が不便」という声が多くありました。また、多品種小ロット生産への対応も課題となっていました。</p>

<h2>課題と要件</h2>
<p>プロジェクトの主な課題は以下の通りです：</p>
<ul>
<li>従来のピローパウチでは開封後の保存が不便だった</li>
<li>大量生産時のコスト削減が求められていた</li>
<li>多品種の製品に対応する柔軟性が必要だった</li>
<li>製品の品質（風味・食感）を長期間維持する必要があった</li>
</ul>

<h2>選定理由</h2>
<p>当社が選ばれた理由は以下の通りです：</p>
<ul>
<li><strong>大量生産対応</strong>：月産100万個以上の大量生産能力と安定供給体制</li>
<li><strong>チャック機能</strong>：消費者の利便性を考慮した再封可能なデザイン</li>
<li><strong>多品種対応</strong>：容量やサイズのバリエーションを柔軟に変更可能</li>
<li><strong>コスト競争力</strong>：大量発注により、30%のコスト削減を実現</li>
</ul>

<h2>ソリューション詳細</h2>
<p>提供したスタンドパウチの仕様：</p>
<ul>
<li><strong>サイズバリエーション</strong>：100g、200g、300g、500gの4サイズ展開</li>
<li><strong>チャック</strong>：ダブルジッパーにより、高い密封性を確保</li>
<li><strong>遮光性</strong>：アルミ箔層により、光による品質劣化を防止</li>
<li><strong>耐熱性</strong>：レトルト処理対応（121℃、30分）</li>
</ul>

<h2>導入効果</h2>
<p>導入後の効果は以下の通りです：</p>
<ul>
<li><strong>消費者満足度</strong>：95%の消費者がチャック機能を評価</li>
<li><strong>物流効率</strong>：自立性により、輸送・陳列効率が40%改善</li>
<li><strong>在庫管理</strong>：スタック可能な形状により、在庫効率が向上</li>
<li><strong>製品品質</strong>：品質維持期間が6ヶ月から12ヶ月に延長</li>
</ul>
`,
    publishedAt: "2024年5月1日",
    author: { name: "包装ソリューションチーム", role: "食品包装担当" },
    readTime: 6,
  },
  {
    id: "pouch-003",
    title: "健康食品サプリメントBOX型パウチ採用",
    clientName: "C社（健康食品メーカー）",
    industry: "pharmaceutical",
    projectType: "custom_manufacturing",
    description: "BOX型パウチを採用し、錠剤や粉末の安全性と利便性を向上。自立性と高い保護性能を実現。",
    technicalSpec: "BOX型パウチ| 素材: PET/AL/PE | 高バリアー性 | チャイルドレジスタンス付き",
    results: ["製品安全性向上", "開封しやすさ改善", "輸送コスト25%削減", "ブランド信頼性向上"],
    images: [
      { id: "pouch-003-1", url: "/images/archives/gusset-pouch-1.jpg", alt: "健康食品用BOX型パウチ", isMain: true, sortOrder: 1 },
      { id: "pouch-003-2", url: "/images/archives/standing-pouch-1.jpg", alt: "サプリメントパウチ詳細", isMain: false, sortOrder: 2 },
    ],
    startDate: "2023-11-01",
    endDate: "2024-02-28",
    featured: false,
    sortOrder: 3,
    tags: ["BOX型パウチ", "健康食品", "サプリメント", "安全性"],
    createdAt: "2024-03-01T14:20:00Z",
    updatedAt: "2024-03-01T14:20:00Z",
    content: `
<h2>導入背景</h2>
<p>C社は、サプリメントや健康食品の製造・販売を手掛けています。従来のボトル容器では、品質の維持や子供の誤飲リスクなど、いくつかの課題がありました。特に、高温多湿な日本の気候条件下での品質管理が重要な課題となっていました。</p>

<h2>課題と要件</h2>
<p>主な課題は以下の通りです：</p>
<ul>
<li>高温多湿による製品の劣化（湿気によるカビや品質低下）</li>
<li>子供の誤飲リスクへの対応</li>
<li>輸送コストの削減（ボトル容器は嵩張り、輸送効率が悪い）</li>
<li>開封しやすさと保存性の両立</li>
</ul>

<h2>選定理由</h2>
<p>当社のBOX型パウチが選ばれた理由：</p>
<ul>
<li><strong>高バリアー性能</strong>：湿気や酸素を遮断し、品質を長期間維持</li>
<li><strong>チャイルドレジスタンス</strong>：子供による誤開封を防止する安全機構</li>
<li><strong>軽量化</strong>：ボトル容器と比較して重量が80%削減され、輸送コストが大幅に低下</li>
<li><strong>デザイン性</strong>：ブランドイメージを訴求する高級感のあるデザイン</li>
</ul>

<h2>ソリューション詳細</h2>
<ul>
<li><strong>素材構成</strong>：PET12μ / AL9μ / PE100μ</li>
<li><strong>チャイルドレジスタンス</strong>：特殊なジッパー構造により、5歳以下の子供による開封を防止</li>
<li><strong>開封アシスト</strong>：エージングされたノッチにより、大人でも簡単に開封可能</li>
<li><strong>テスト</strong>：ISO 8317規格に準拠したチャイルドレジスタンス試験を実施</li>
</ul>

<h2>導入効果</h2>
<ul>
<li>製品の品質不良率が0.1%以下に低下</li>
<li>輸送コストが25%削減</li>
<li>顧客からの安全性評価が大幅向上</li>
<li>ブランド信頼性が向上し、リピート率が15%改善</li>
</ul>
`,
    publishedAt: "2024年3月1日",
    author: { name: "包装ソリューションチーム", role: "医薬品包装担当" },
    readTime: 7,
  },
  {
    id: "pouch-004",
    title: "液体ソーススパウトパウチ導入事例",
    clientName: "D社（調味料メーカー）",
    industry: "food",
    projectType: "custom_manufacturing",
    description: "スパウト付きパウチを導入し、液体ソースの注ぎやすさと保存性を向上。使い切りタイプで衛生的。",
    technicalSpec: "スパウトパウチ| 素材: PET/AL/PE | スパウト径: 8mm | 液体漏れ防止仕様",
    results: ["使いやすさ90%改善", "容器コスト30%削減", "廃棄物削減", "顧客満足度88%向上"],
    images: [
      { id: "pouch-004-1", url: "/images/archives/pillow-pouch-1.jpg", alt: "ソース用スパウトパウチ", isMain: true, sortOrder: 1 },
      { id: "pouch-004-2", url: "/images/archives/standing-pouch-1.jpg", alt: "スパウト詳細", isMain: false, sortOrder: 2 },
    ],
    startDate: "2023-10-01",
    endDate: "2024-01-15",
    featured: true,
    sortOrder: 4,
    tags: ["スパウトパウチ", "液体食品", "ソース", "使い切り"],
    createdAt: "2024-01-20T11:45:00Z",
    updatedAt: "2024-01-20T11:45:00Z",
    content: `
<h2>導入背景</h2>
<p>D社は、液体調味料（ソース、ドレッシングなど）の製造・販売を行っています。従来のボトル容器では、注ぎ口からこぼれたり、使い切れなかったりする問題がありました。また、環境問題への配慮から、使い切りタイプの包装が求められていました。</p>

<h2>課題と要件</h2>
<p>主な課題：</p>
<ul>
<li>ボトル容器からの注ぎにくさ、こぼれ問題</li>
<li>使い切れなかった製品の廃棄ロス</li>
<li>環境配慮型包装への移転需要</li>
<li>衛生的で使いやすい容器の需要</li>
</ul>

<h2>選定理由</h2>
<p>当社のスパウトパウチが選ばれた理由：</p>
<ul>
<li><strong>注ぎやすさ</strong>：8mm径のスパウトにより、液体の注ぎやすさが90%改善</li>
<li><strong>使い切り</strong>：1回で使い切れる容量設計により、廃棄ロスを削減</li>
<li><strong>漏れ防止</strong>：特殊なキャップ構造により、輸送時の漏れを完全防止</li>
<li><strong>コスト削減</strong>：ボトル容器と比較して30%のコスト削減</li>
</ul>

<h2>導入効果</h2>
<ul>
<li>使いやすさに関する顧客満足度が88%向上</li>
<li>製品の廃棄ロスが50%削減</li>
<li>環境負荷が軽減され、環境配慮型製品としてブランディング</li>
</ul>
`,
    publishedAt: "2024年1月20日",
    author: { name: "包装ソリューションチーム", role: "液体包装担当" },
    readTime: 5,
  },
  {
    id: "pouch-005",
    title: "コーヒー豆ロールフィルム自動包装導入支援",
    clientName: "E社（コーヒーロースター）",
    industry: "food",
    projectType: "custom_manufacturing",
    description: "ロールフィルムによる自動包装システムを導入し、コーヒー豆の鮮度保持と生産性向上を実現。",
    technicalSpec: "ロールフィルム| 素材: PET/PE | アルミ箔遮光 | 自動包装機対応 | 酸素透過率: 5cc/m²/day",
    results: ["包装コスト35%削減", "生産性60%向上", "製品鮮度維持期間延長", "人件費削減"],
    images: [
      { id: "pouch-005-1", url: "/images/archives/anti-static-pouch-1.jpg", alt: "コーヒー用ロールフィルム", isMain: true, sortOrder: 1 },
      { id: "pouch-005-2", url: "/images/archives/standing-pouch-1.jpg", alt: "自動包装システム", isMain: false, sortOrder: 2 },
    ],
    startDate: "2023-09-01",
    endDate: "2023-12-15",
    featured: true,
    sortOrder: 5,
    tags: ["ロールフィルム", "コーヒー", "自動包装", "コスト削減"],
    createdAt: "2023-12-20T16:30:00Z",
    updatedAt: "2023-12-20T16:30:00Z",
    content: `
<h2>導入背景</h2>
<p>E社は、スペシャルティコーヒーの焙煎・販売を行っています。従来の手作業による包装工程では、品質のばらつきや生産性の課題がありました。特に、コーヒー豆の鮮度を維持しながら、大量生産を効率化することが重要な課題でした。</p>

<h2>課題と要件</h2>
<p>主な課題：</p>
<ul>
<li>手作業による包装工程の非効率性</li>
<li>コーヒー豆の鮮度劣化（酸化による風味の低下）</li>
<li>品質のばらつきによる顧客クレーム</li>
<li>人件費の高騰</li>
</ul>

<h2>選定理由</h2>
<p>当社のロールフィルムと自動包装システムが選ばれた理由：</p>
<ul>
<li><strong>高バリアー性能</strong>：酸素透過率5cc/㎡/day以下の優れた遮酸素性</li>
<li><strong>遮光性</strong>：アルミ箔層により、光による品質劣化を完全防止</li>
<li><strong>自動包装機対応</strong>：既存の自動包装機との互換性を確保</li>
<li><strong>生産性向上</strong>：手作業と比較して60%の生産性向上を実現</li>
</ul>

<h2>ソリューション詳細</h2>
<ul>
<li><strong>素材構成</strong>：PET12μ / AL9μ / PE70μ</li>
<li><strong>バリアー性能</strong>：酸素透過率 3cc/㎡/day、水蒸気透過率 1g/㎡/day</li>
<li><strong>自動包装機</strong>：縦型ピローフォーマー対応、最高60袋/分の生産速度</li>
<li><strong>ガス置換</strong>：窒素ガス充填機能により、酸素濃度を0.5%以下に抑制</li>
</ul>

<h2>導入効果</h2>
<ul>
<li>包装コストが35%削減</li>
<li>生産性が60%向上、人件費が大幅に削減</li>
<li>製品の鮮度維持期間が1ヶ月から3ヶ月に延長</li>
<li>品質のばらつきが解消され、顧客満足度が向上</li>
</ul>
`,
    publishedAt: "2023年12月20日",
    author: { name: "包装ソリューションチーム", role: "自動包装システム担当" },
    readTime: 6,
  },
  {
    id: "pouch-006",
    title: "試供品サンプル三方シールパウチ導入",
    clientName: "F社（化粧品メーカー）",
    industry: "cosmetics",
    projectType: "custom_manufacturing",
    description: "三方シールパウチを試供品包装に採用。低コストで高品質なサンプル提供を実現。",
    technicalSpec: "三方シールパウチ| 素材: PE/PP | 低コスト素材 | サイズ: 小型対応 | 密封性: 99.5%保持",
    results: ["包装コスト50%削減", "サンプル提供数200%増加", "レスポンス率35%向上", "環境負荷削減"],
    images: [
      { id: "pouch-006-1", url: "/images/archives/pillow-pouch-1.jpg", alt: "試供品用三方シールパウチ", isMain: true, sortOrder: 1 },
      { id: "pouch-006-2", url: "/images/archives/cosmetics-pouch-1.jpg", alt: "サンプルパウチ詳細", isMain: false, sortOrder: 2 },
    ],
    startDate: "2023-08-01",
    endDate: "2023-11-30",
    featured: false,
    sortOrder: 6,
    tags: ["三方シールパウチ", "試供品", "サンプル", "低コスト"],
    createdAt: "2023-12-01T10:30:00Z",
    updatedAt: "2023-12-01T10:30:00Z",
    content: `
<h2>導入背景</h2>
<p>F社は、新製品のプロモーション活動において、試供品（サンプル）の配布を重要なマーケティング施策として実施しています。従来のサンプル容器は、ミニボトルやジャーを使用していましたが、コストが高く、配布数に限界がありました。</p>

<h2>課題と要件</h2>
<p>主な課題：</p>
<ul>
<li>サンプル容器のコストが高く、配布数に制限があった</li>
<li>サンプルの厚みがあり、郵送コストも高騰していた</li>
<li>環境配慮型のサンプル包装が求められていた</li>
<li>サンプル配布によるレスポンス率の向上が必要だった</li>
</ul>

<h2>選定理由</h2>
<p>当社の三方シールパウチが選ばれた理由：</p>
<ul>
<li><strong>低コスト</strong>：従来容器と比較して50%のコスト削減を実現</li>
<li><strong>軽量化</strong>：厚みが薄く、郵送コストが30%削減</li>
<li><strong>環境配慮</strong>：プラスチック使用量が60%削減され、環境負荷が軽減</li>
<li><strong>デザイン自由度</strong>：ブランドイメージを訴求する印刷デザインが可能</li>
</ul>

<h2>ソリューション詳細</h2>
<ul>
<li><strong>サイズ</strong>：50mm × 70mm、容量3ml</li>
<li><strong>素材構成</strong>：PE30μ / PP40μ</li>
<li><strong>密封性</strong>：三方シールにより99.5%の密封性を確保</li>
<li><strong>印刷</strong>：グラビア印刷によるフルカラーデザイン対応</li>
</ul>

<h2>導入効果</h2>
<ul>
<li>包装コストが50%削減され、サンプル提供数が200%増加</li>
<li>郵送コストも30%削減され、総コストが大幅に低下</li>
<li>レスポンス率が35%向上し、新製品の認知度が向上</li>
<li>環境配慮型サンプルとして、ブランドイメージも向上</li>
</ul>
`,
    publishedAt: "2023年12月1日",
    author: { name: "包装ソリューションチーム", role: "プロモーション包装担当" },
    readTime: 5,
  }
];
