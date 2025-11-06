import React from 'react';
import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import {
  changelogData,
  type ChangeType,
} from '@/app/[locale]/changelog/changelog.data'; // 假设 changelog.data.ts 位于同一目录

// 动态生成元数据 (SEO)
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Changelog' });

  return {
    title: `${t('title')} - iSpell 爱拼词`,
    description: t('description'),
  };
}

/**
 * [!! 已更新 !!]
 * 根据变更类型获取对应的徽章样式 (黑白灰色调)
 * @param type 变更类型
 * @returns Tailwind CSS 类名
 */
const getBadgeStyle = (type: ChangeType): string => {
  switch (type) {
    // 1. 新增: 最高对比度 (填充)
    case 'new':
      return 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900';

    // 2. 修复: 中暗对比度 (填充)
    case 'fix':
      return 'bg-gray-600 text-white dark:bg-gray-500 dark:text-white';

    // 3. 性能: 中亮对比度 (填充)
    case 'perf':
      return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100';

    // 4. 重构: 中等对比度 (边框) - 解决不可见问题
    case 'refactor':
      return 'border border-gray-400 text-gray-600 dark:border-gray-600 dark:text-gray-400';

    // 5. 文档: 低对比度 (边框) - 解决不可见问题
    case 'docs':
    default:
      return 'border border-gray-300 text-gray-500 dark:border-gray-700 dark:text-gray-500';
  }
};

/**
 * 更新日志页面
 * 路径: /changelog
 */
export default function ChangelogPage() {
  const t = useTranslations('Changelog');

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">{t('description')}</p>
      </div>

      <div className="relative border-l border-gray-300 dark:border-gray-700 ml-3">
        {/* 遍历 changelogData 数据 */}
        {changelogData.map((entry) => (
          <section key={entry.version} className="mb-12 ml-8 relative">
            {/* 时间线上的“点”
                - 偏移量 -left-[38.5px] = 32px(ml-8) + 6px(圆点半径) + 0.5px(父border半径)
              */}
            <span
              className="absolute -left-[38.5px] mt-1.5 h-3 w-3 rounded-full bg-gray-500 dark:bg-gray-400 border-2 border-white dark:border-gray-900"
              aria-hidden="true"
            />

            {/* 日期和版本号 */}
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {entry.date}
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 mb-4">
              {entry.version}
            </h2>

            {/* 变更列表 */}
            <ul className="space-y-4">
              {entry.changes.map((change, index) => (
                <li
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-3"
                >
                  {/* 类型徽章 (使用更新后的 getBadgeStyle) */}
                  <span
                    className={`inline-flex flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getBadgeStyle(
                      change.type
                    )}`}
                  >
                    {t(`types.${change.type}`)}
                  </span>
                  {/* 变更描述 */}
                  <span className="text-base text-gray-700 dark:text-gray-300 pt-px">
                    {t(change.descriptionKey)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
