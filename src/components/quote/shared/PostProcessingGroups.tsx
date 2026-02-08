import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface PostProcessingOption {
  id: string;
  name: string;
  multiplier: number;
  previewImage: string;
}

interface PostProcessingGroup {
  id: string;
  name: string;
  icon: string;
  options: PostProcessingOption[];
}

interface PostProcessingGroupsProps {
  groups: PostProcessingGroup[];
  selectedOptions: string[];
  onToggleOption: (optionId: string, multiplier: number) => void;
  totalMultiplier: number;
  bagTypeId?: string;  // 롤 필름 후가공 옵션 숨기기용
}

const OptionCard: React.FC<{
  option: PostProcessingOption;
  isSelected: boolean;
  isConflicting: boolean;
  onSelect: () => void;
}> = ({ option, isSelected, isConflicting, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-3 rounded-xl border-2 transition-all duration-200 relative ${
        isSelected
          ? 'border-green-500 bg-green-50 shadow-md'
          : isConflicting
          ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400'
          : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
      }`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      )}

      {/* Conflict Indicator */}
      {isConflicting && !isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center animate-pulse shadow-sm">
            <AlertCircle className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      )}

      {/* Image + Name Only - Centered */}
      <div className="flex flex-col items-center justify-center gap-3 py-2">
        {/* Preview Image - 150px */}
        <div className="w-[150px] h-[150px] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <img
            src={option.previewImage}
            alt={option.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/pouch.png';
            }}
          />
        </div>

        {/* Option Name */}
        <span className="text-sm font-medium text-gray-900 text-center">
          {option.name}
        </span>
      </div>
    </button>
  );
};

export const PostProcessingGroups: React.FC<PostProcessingGroupsProps> = ({
  groups,
  selectedOptions,
  onToggleOption,
  totalMultiplier,
  bagTypeId,
}) => {
  // 롤 필름(roll_film)인 경우: 表面処理(マット/光沢)のみ表示
  // その他の後加工オプション(ジッパー、ノッチなど)は非表示
  const visibleGroups = bagTypeId === 'roll_film'
    ? groups.filter(group => group.id === 'finish') // 表面処理のみ表示
    : groups;

  // Build exclusive groups mapping
  const exclusiveGroups: Record<string, string[]> = {};
  groups.forEach(group => {
    const optionIds = group.options.map(opt => opt.id);
    group.options.forEach(option => {
      exclusiveGroups[option.id] = optionIds.filter(id => id !== option.id);
    });
  });

  const getConflictingOptions = (optionId: string): string[] => {
    const currentOptions = selectedOptions || [];
    return (exclusiveGroups[optionId] || []).filter(opt => currentOptions.includes(opt));
  };

  return (
    <div className="space-y-6">
      {/* Groups */}
      <div className="space-y-6">
        {visibleGroups.map(group => {
          const hasSelectedOption = group.options.some(opt => selectedOptions.includes(opt.id));

          return (
            <div
              key={group.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                hasSelectedOption
                  ? 'border-navy-300 bg-navy-50/50 shadow-md'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Group Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center text-xl shadow-sm">
                  {group.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">{group.name}</h3>
                </div>
                {hasSelectedOption && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* Options - Grid Layout (4 columns on desktop) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {group.options.map(option => {
                  const isSelected = selectedOptions.includes(option.id);
                  const conflictingOptions = getConflictingOptions(option.id);
                  const isConflicting = conflictingOptions.length > 0;

                  return (
                    <OptionCard
                      key={option.id}
                      option={option}
                      isSelected={isSelected}
                      isConflicting={isConflicting}
                      onSelect={() => onToggleOption(option.id, option.multiplier)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PostProcessingGroups;
