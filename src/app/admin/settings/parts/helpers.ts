/**
 * Admin Settings Helper Functions
 */

import { tabConfig } from './tab-config';
import type { CategoryData, TabKey } from './types';

export function cleanDescription(description: string): string {
  return description
    .replace(/\s*\(CONSTANCES\.[^)]+\)\s*/g, '')
    .replace(/\s*\(CONSTANTS\.[^)]+\)\s*/g, '')
    .replace(/\s*\([^)]*CONSTANTS[^)]*\)\s*/g, '')
    .trim();
}

export function groupSettingsByCategory(settings: CategoryData, category: TabKey): Map<string, CategoryData> {
  const groups = new Map<string, CategoryData>();
  const config = tabConfig[category];

  config.groups.forEach(group => {
    groups.set(group.title, {});
  });

  const ungrouped: CategoryData = {};

  Object.entries(settings).forEach(([key, data]) => {
    const cleanDesc = cleanDescription(data.description || key).toLowerCase();
    let grouped = false;

    for (const group of config.groups) {
      if (group.settingKeys && group.settingKeys.includes(key)) {
        groups.set(group.title, {
          ...groups.get(group.title),
          [key]: data
        });
        grouped = true;
        break;
      }

      const matchesKeyword = group.keywords.some(keyword =>
        cleanDesc.includes(keyword.toLowerCase()) ||
        key.toLowerCase().includes(keyword.toLowerCase())
      );

      if (matchesKeyword) {
        groups.set(group.title, {
          ...groups.get(group.title),
          [key]: data
        });
        grouped = true;
        break;
      }
    }

    if (!grouped) {
      ungrouped[key] = data;
    }
  });

  if (Object.keys(ungrouped).length > 0) {
    const firstGroup = config.groups[0];
    groups.set(firstGroup.title, {
      ...groups.get(firstGroup.title),
      ...ungrouped
    });
  }

  config.groups.forEach(group => {
    if (group.settingKeys) {
      const existing = groups.get(group.title);
      if (existing) {
        const ordered: CategoryData = {};
        group.settingKeys.forEach(sk => {
          if (existing[sk] !== undefined) {
            ordered[sk] = existing[sk];
          }
        });
        Object.entries(existing).forEach(([k, v]) => {
          if (ordered[k] === undefined) ordered[k] = v;
        });
        groups.set(group.title, ordered);
      }
    }
  });

  return groups;
}
