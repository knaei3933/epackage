import React from 'react';
import PostProcessingGroups from './PostProcessingGroups';

/**
 * Demo/Storybook for PostProcessingGroups component
 *
 * This demonstrates the new mutually exclusive groups UI
 *
 * Usage:
 * 1. Import this component in a test page
 * 2. Render with different states to see behavior
 * 3. Test mutual exclusivity by clicking options
 */

const demoGroups = [
  {
    id: 'zipper',
    name: 'ジッパー',
    icon: '🔒',
    description: '再封性の選択',
    options: [
      {
        id: 'zipper-yes',
        name: 'ジッパー付き',
        multiplier: 1.15,
        description: '再利用可能なジッパー付き',
        detailedDescription: '開閉が容易なジッパーを装着。内容物の新鮮度保持と再利用性を向上させます。',
        previewImage: '/images/post-processing/1.ジッパーあり.png',
        features: ['再利用可能', '気密性維持', '開閉簡単']
      },
      {
        id: 'zipper-no',
        name: 'ジッパーなし',
        multiplier: 1.0,
        description: '一回使用のシールトップ',
        detailedDescription: 'シンプルなシール構造でコスト効率に優れています。',
        previewImage: '/images/post-processing/1.ジッパーなし.png',
        features: ['コスト効率', 'シンプル構造', '安全閉鎖']
      }
    ]
  },
  {
    id: 'finish',
    name: '表面仕上げ',
    icon: '✨',
    description: '光沢感の選択',
    options: [
      {
        id: 'glossy',
        name: '光沢仕上げ',
        multiplier: 1.08,
        description: '高光沢のプレミアム仕上げ',
        detailedDescription: '高光沢表面処理で視覚的な魅力と色彩の鮮やかさを高めます。',
        previewImage: '/images/post-processing/2.光沢.png',
        features: ['プレミアム外観', '色彩強化', 'プロの見た目']
      },
      {
        id: 'matte',
        name: 'マット仕上げ',
        multiplier: 1.05,
        description: '光沢のないエレガントな表面',
        detailedDescription: '高級感のあるマット調表面処理。光沢を抑え、指紋が目立ちにくくなります。',
        previewImage: '/images/post-processing/2.マット.png',
        features: ['エレガント外観', 'グレア軽減', '指紋防止']
      }
    ]
  }
];

export const PostProcessingGroupsDemo: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [totalMultiplier, setTotalMultiplier] = React.useState(1.0);

  const handleToggle = (optionId: string, multiplier: number) => {
    console.log('Toggle:', optionId, 'Multiplier:', multiplier);

    // Simple toggle logic for demo
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions([]);
      setTotalMultiplier(1.0);
    } else {
      setSelectedOptions([optionId]);
      setTotalMultiplier(multiplier);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Post-Processing Groups Demo
        </h1>
        <p className="text-gray-600 mb-8">
          This demonstrates the new mutually exclusive groups UI.
          Try clicking options to see the mutual exclusivity in action.
        </p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Current State</h2>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Selected Options:</span>{' '}
              <span className="text-navy-600">
                {selectedOptions.length > 0 ? selectedOptions.join(', ') : 'None'}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Total Multiplier:</span>{' '}
              <span className="text-green-600 font-bold">×{totalMultiplier.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <PostProcessingGroups
          groups={demoGroups}
          selectedOptions={selectedOptions}
          onToggleOption={handleToggle}
          totalMultiplier={totalMultiplier}
        />

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Demo Notes</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click an option to select it (green highlight)</li>
            <li>• Click the opposite option to switch (auto-deselects the first)</li>
            <li>• Conflicting options show amber warning before selection</li>
            <li>• Total multiplier appears in sticky footer when options are selected</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PostProcessingGroupsDemo;
