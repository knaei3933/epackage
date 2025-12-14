'use client';

import React, { useState } from 'react';
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  StatusBadge,
  CurrencyBadge,
  TagBadge,
  Container,
  Grid,
  GridItem,
  Flex,
} from '@/components/ui';
import { Search, Download, Star, Trash2, Mail, Phone, User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeProvider';

export default function DesignSystemPage() {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sampleOptions = [
    { value: 'option1', label: '選択肢 1' },
    { value: 'option2', label: '選択肢 2' },
    { value: 'option3', label: '選択肢 3' },
    { value: 'option4', label: '選択肢 4', disabled: true },
  ];

  return (
    <div className="min-h-screen bg-bg-secondary py-8">
      <Container size="6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Flex justify="center" className="gap-4 mb-4">
            <h1 className="text-4xl font-bold text-text-primary">
              Epackage Lab デザインシステム
            </h1>
            <ThemeToggle />
          </Flex>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            このページは、Epackage LabのデザインシステムとUIコンポーネントを検証するためのものです。
            すべてのコンポーネントが日本語のタイポグラフィと金属的なアクセントデザインに最適化されています。
          </p>
        </div>

        {/* Buttons Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>ボタンコンポーネント</CardTitle>
            <CardDescription>
              すべてのバリエーションと状態のボタン
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Button Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-4">バリエーション</h3>
              <Flex wrap="wrap" gap="md">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="info">Info</Button>
                <Button variant="metallic">Metallic</Button>
                <Button variant="brixa-gradient">Brixa Gradient</Button>
              </Flex>
            </div>

            {/* Button Sizes */}
            <div>
              <h3 className="text-lg font-semibold mb-4">サイズ</h3>
              <Flex align="center" gap="md">
                <Button size="xs">XS</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
                <Button size="icon">
                  <Star className="h-4 w-4" />
                </Button>
              </Flex>
            </div>

            {/* Button States */}
            <div>
              <h3 className="text-lg font-semibold mb-4">状態</h3>
              <Flex wrap="wrap" gap="md">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
                <Button
                  loading={isLoading}
                  loadingText="読み込み中..."
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => setIsLoading(false), 2000);
                  }}
                >
                  Click to Load
                </Button>
                <Button fullWidth>Full Width</Button>
              </Flex>
            </div>

            {/* Buttons with Icons */}
            <div>
              <h3 className="text-lg font-semibold mb-4">アイコン付き</h3>
              <Flex wrap="wrap" gap="md">
                <Button icon={<Search className="h-4 w-4" />} iconPosition="left">
                  検索
                </Button>
                <Button icon={<Download className="h-4 w-4" />} iconPosition="right">
                  ダウンロード
                </Button>
                <Button variant="outline" icon={<Trash2 className="h-4 w-4" />}>
                  削除
                </Button>
              </Flex>
            </div>

            {/* Button with Badge */}
            <div>
              <h3 className="text-lg font-semibold mb-4">バッジ付き</h3>
              <Flex wrap="wrap" gap="md">
                <Button
                  badge={<Badge size="sm" variant="error">New</Badge>}
                  badgePosition="top-right"
                >
                  Notifications
                </Button>
                <Button
                  variant="outline"
                  badge={<Badge size="sm" variant="success">3</Badge>}
                  badgePosition="top-right"
                >
                  Messages
                </Button>
              </Flex>
            </div>
          </CardContent>
        </Card>

        {/* Input Components */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>入力コンポーネント</CardTitle>
            <CardDescription>
              すべてのバリエーションの入力フィールド
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Grid xs={1} md={2} gap="lg">
              {/* Basic Inputs */}
              <GridItem>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">基本入力</h3>

                  <Input
                    label="標準入力"
                    placeholder="テキストを入力してください"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />

                  <Input
                    label="必須項目"
                    placeholder="これは必須項目です"
                    required
                    helperText="この項目は必須です"
                  />

                  <Input
                    label="エラー状態"
                    variant="error"
                    placeholder="エラーがあります"
                    error="この入力は無効です"
                  />

                  <Input
                    label="成功状態"
                    variant="success"
                    placeholder="有効な入力"
                    helperText="入力が検証されました"
                  />
                </div>
              </GridItem>

              {/* Inputs with Icons */}
              <GridItem>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">アイコン付き入力</h3>

                  <Input
                    label="名前"
                    placeholder="山田 太郎"
                    leftIcon={<User className="h-4 w-4" />}
                  />

                  <Input
                    label="メールアドレス"
                    placeholder="example@company.com"
                    leftIcon={<Mail className="h-4 w-4" />}
                  />

                  <Input
                    label="電話番号"
                    placeholder="03-1234-5678"
                    leftIcon={<Phone className="h-4 w-4" />}
                  />

                  <Input
                    label="検索"
                    placeholder="検索キーワード"
                    leftIcon={<Search className="h-4 w-4" />}
                    rightElement={
                      <Button size="sm" variant="ghost">
                        検索
                      </Button>
                    }
                  />
                </div>
              </GridItem>
            </Grid>

            {/* Input Sizes */}
            <div>
              <h3 className="text-lg font-semibold mb-4">サイズ</h3>
              <Flex direction="col" gap="md">
                <Input size="xs" placeholder="Extra Small size" />
                <Input size="sm" placeholder="Small size" />
                <Input size="md" placeholder="Medium size" />
                <Input size="lg" placeholder="Large size" />
                <Input size="xl" placeholder="Extra Large size" />
              </Flex>
            </div>

            {/* Advanced Input Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4">高度な機能</h3>
              <Grid xs={1} md={2} gap="lg">
                <GridItem>
                  <Input
                    label="文字数カウント付き"
                    placeholder="最大100文字"
                    showCharCount
                    maxLength={100}
                  />
                </GridItem>
                <GridItem>
                  <Input
                    label="読み込み状態"
                    placeholder="読み込み中..."
                    loading
                  />
                </GridItem>
              </Grid>
            </div>
          </CardContent>
        </Card>

        {/* Select Components */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>選択コンポーネント</CardTitle>
            <CardDescription>
              すべてのバリエーションの選択フィールド
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">基本選択</h3>

                <Select
                  label="標準選択"
                  options={sampleOptions}
                  value={selectValue}
                  onChange={setSelectValue}
                  placeholder="選択してください"
                />

                <Select
                  label="必須選択"
                  options={sampleOptions}
                  required
                  placeholder="必須項目です"
                />

                <Select
                  label="エラー状態"
                  options={sampleOptions}
                  variant="error"
                  error="有効な選択肢を選択してください"
                />

                <Select
                  label="成功状態"
                  options={sampleOptions}
                  variant="success"
                  helperText="選択が完了しました"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">高度な機能</h3>

                <Select
                  label="検索可能"
                  options={[
                    { value: 'japan', label: '日本' },
                    { value: 'korea', label: '韓国' },
                    { value: 'china', label: '中国' },
                    { value: 'usa', label: 'アメリカ' },
                  ]}
                  searchable
                  placeholder="国を検索・選択"
                />

                <Select
                  label="クリア可能"
                  options={sampleOptions}
                  clearable
                  placeholder="選択肢を選択"
                />

                <Select
                  label="サイズ選択"
                  options={sampleOptions}
                  size="sm"
                  placeholder="Small size"
                />

                <Select
                  label="ラージ選択"
                  options={sampleOptions}
                  size="lg"
                  placeholder="Large size"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badge Components */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>バッジコンポーネント</CardTitle>
            <CardDescription>
              すべてのバリエーションのバッジ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Badge Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-4">バリエーション</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="metallic">Metallic</Badge>
              </div>
            </div>

            {/* Badge Sizes */}
            <div>
              <h3 className="text-lg font-semibold mb-4">サイズ</h3>
              <div className="flex items-center gap-3">
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </div>
            </div>

            {/* Badge with Dots */}
            <div>
              <h3 className="text-lg font-semibold mb-4">ドット付き</h3>
              <div className="flex flex-wrap gap-3">
                <Badge dot variant="success">完了</Badge>
                <Badge dot variant="warning">処理中</Badge>
                <Badge dot variant="error">エラー</Badge>
                <Badge dot variant="info">新規</Badge>
              </div>
            </div>

            {/* Status Badges */}
            <div>
              <h3 className="text-lg font-semibold mb-4">ステータスバッジ</h3>
              <div className="flex flex-wrap gap-3">
                <StatusBadge.New />
                <StatusBadge.Processing />
                <StatusBadge.Completed />
                <StatusBadge.Error />
                <StatusBadge.Draft />
              </div>
            </div>

            {/* Special Badges */}
            <div>
              <h3 className="text-lg font-semibold mb-4">特殊バッジ</h3>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <CurrencyBadge amount={50000} currency="JPY" />
                  <CurrencyBadge amount={1000} currency="USD" />
                  <CurrencyBadge amount={25000} currency="KRW" />
                </div>

                <div className="flex flex-wrap gap-3">
                  <TagBadge removable onRemove={() => console.log('Removed')}>
                    包装材料
                  </TagBadge>
                  <TagBadge removable onRemove={() => console.log('Removed')}>
                    アルミ箔
                  </TagBadge>
                  <TagBadge removable onRemove={() => console.log('Removed')}>
                    食品対応
                  </TagBadge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Components */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>カードコンポーネント</CardTitle>
            <CardDescription>
              すべてのバリエーションのカード
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Default Card */}
              <Card>
                <CardHeader>
                  <CardTitle>標準カード</CardTitle>
                  <CardDescription>
                    これは基本的なカードコンポーネントです
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-[var(--text-secondary)]">
                    カードのコンテンツがここに入ります。テキスト、画像、その他の要素を含めることができます。
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" className="w-full">
                    アクション
                  </Button>
                </CardFooter>
              </Card>

              {/* Elevated Card */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>浮き上がりカード</CardTitle>
                  <CardDescription>
                    影付きのカードデザイン
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-[var(--text-secondary)]">
                    このカードはホバー時により強い影を表示します。
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    詳細を見る
                  </Button>
                </CardFooter>
              </Card>

              {/* Metallic Card */}
              <Card variant="metallic">
                <CardHeader>
                  <CardTitle>メタリックカード</CardTitle>
                  <CardDescription>
                    金属的なアクセント付き
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-[var(--text-secondary)]">
                    プレミアム感のあるメタリックデザインのカードです。
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="metallic" size="sm" className="w-full">
                    プレミアム
                  </Button>
                </CardFooter>
              </Card>

              {/* Interactive Card */}
              <Card variant="interactive" className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle>インタラクティブカード</CardTitle>
                  <CardDescription>
                    ホバー効果付きの大きなカード
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-[var(--text-secondary)]">
                      このカードはホバー時にアニメーション効果を持ち、ユーザーのインタラクションを促します。
                      クリック可能な要素としても機能します。
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="info">新機能</Badge>
                      <Badge variant="success">利用可能</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-3">
                  <Button>主要アクション</Button>
                  <Button variant="outline">二次アクション</Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Typography Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>タイポグラフィ</CardTitle>
            <CardDescription>
              日本語と韓国語に最適化されたタイポグラフィシステム
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Headings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">見出し</h3>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold">見出し 1 - H1</h1>
                <h2 className="text-3xl font-bold">見出し 2 - H2</h2>
                <h3 className="text-2xl font-semibold">見出し 3 - H3</h3>
                <h4 className="text-xl font-semibold">見出し 4 - H4</h4>
              </div>
            </div>

            {/* Body Text */}
            <div>
              <h3 className="text-lg font-semibold mb-4">本文</h3>
              <div className="space-y-4">
                <p className="text-lg">これは大きい本文テキストです。</p>
                <p>これは標準的な本文テキストです。日本語と韓国語のフォントが最適化され、読みやすさが向上しています。</p>
                <p className="text-sm text-[var(--text-secondary)]">これは小さい本文テキストです。補足情報に適しています。</p>
              </div>
            </div>

            {/* Japanese Optimized Text */}
            <div>
              <h3 className="text-lg font-semibold mb-4">日本語最適化テキスト</h3>
              <div className="japanese-text space-y-2">
                <p className="japanese-heading">日本語見出しテキスト</p>
                <p>これは日本語テキストの例です。文字間隔と行間が日本語の読書習慣に合わせて最適化されています。特に長文の場合に読みやすさの違いが明確にわかります。</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>カラーパレット</CardTitle>
            <CardDescription>
              Epackage Labのブランドカラーシステム
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Primary Colors */}
              <div className="space-y-2">
                <div className="w-full h-16 rounded-md bg-[var(--brixa-primary-600)]"></div>
                <p className="text-xs font-medium">Primary 600</p>
                <p className="text-xs text-[var(--text-tertiary)]">#0284C7</p>
              </div>

              <div className="space-y-2">
                <div className="w-full h-16 rounded-md bg-[var(--brixa-primary-500)]"></div>
                <p className="text-xs font-medium">Primary 500</p>
                <p className="text-xs text-[var(--text-tertiary)]">#0EA5E9</p>
              </div>

              <div className="space-y-2">
                <div className="w-full h-16 rounded-md bg-[var(--brixa-primary-100)]"></div>
                <p className="text-xs font-medium">Primary 100</p>
                <p className="text-xs text-[var(--text-tertiary)]">#E0F2FE</p>
              </div>

              <div className="space-y-2">
                <div className="w-full h-16 rounded-md bg-[var(--brixa-primary-50)]"></div>
                <p className="text-xs font-medium">Primary 50</p>
                <p className="text-xs text-[var(--text-tertiary)]">#F0F9FF</p>
              </div>

              {/* Metallic Colors */}
              <div className="space-y-2">
                <div className="w-full h-16 rounded-md bg-[var(--metallic-silver)]"></div>
                <p className="text-xs font-medium">Metallic Silver</p>
                <p className="text-xs text-[var(--text-tertiary)]">#C0C0C0</p>
              </div>

              <div className="space-y-2">
                <div className="w-full h-16 rounded-md bg-[var(--metallic-gold)]"></div>
                <p className="text-xs font-medium">Metallic Gold</p>
                <p className="text-xs text-[var(--text-tertiary)]">#B8860B</p>
              </div>

              {/* Semantic Colors */}
              <div className="space-y-2">
                <div className="w-full h-16 rounded-md bg-[var(--success-500)]"></div>
                <p className="text-xs font-medium">Success</p>
                <p className="text-xs text-[var(--text-tertiary)]">#10B981</p>
              </div>

              <div className="space-y-2">
                <div className="w-full h-16 rounded-md bg-[var(--warning-500)]"></div>
                <p className="text-xs font-medium">Warning</p>
                <p className="text-xs text-[var(--text-tertiary)]">#F59E0B</p>
              </div>

              <div className="space-y-2">
                <div className="w-full h-16 rounded-md bg-[var(--error-500)]"></div>
                <p className="text-xs font-medium">Error</p>
                <p className="text-xs text-[var(--text-tertiary)]">#EF4444</p>
              </div>

              <div className="space-y-2">
                <div className="w-full h-16 rounded-md bg-[var(--info-500)]"></div>
                <p className="text-xs font-medium">Info</p>
                <p className="text-xs text-[var(--text-tertiary)]">#3B82F6</p>
              </div>

              {/* Neutral Colors */}
              <div className="space-y-2">
                <div className="w-full h-16 rounded-md bg-[var(--text-primary)]"></div>
                <p className="text-xs font-medium">Text Primary</p>
                <p className="text-xs text-[var(--text-tertiary)]">#111827</p>
              </div>

              <div className="space-y-2">
                <div className="w-full h-16 rounded-md bg-[var(--text-secondary)]"></div>
                <p className="text-xs font-medium">Text Secondary</p>
                <p className="text-xs text-[var(--text-tertiary)]">#6B7280</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}