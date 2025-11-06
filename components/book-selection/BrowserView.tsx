'use client';
/*
 * @Date: 2025-10-30 10:24:39
 * @LastEditTime: 2025-11-06 22:19:24
 * @Description: 书籍浏览视图组件 ([!! 已重构 !!] 修复响应式布局和行内展开逻辑)
 * 功能：按分类展示书籍列表，支持切换分类、标签过滤、选择书籍、创建学习计划
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type {
  Book,
  Category,
  LearningPlan,
  PlanDetails,
} from '@/types/book.types';
import BookCard from './BookCard';
import PlanSetupView from './PlanSetupView';

interface BrowserViewProps {
  currentSeriesList: Category[];
  currentSeriesData: Category | undefined;
  currentBookList: Book[];
  previewBook: Book | null;
  activeSeriesId: string;
  setActiveSeriesId: (id: string) => void;
  handleBookCardClick: (book: Book) => void;
  handleStartLearning: (plan: PlanDetails) => void;
  setPreviewBook: (book: Book | null) => void;
  learningList: LearningPlan[];
}

// [!! 1. 恢复 !!] 重新引入 chunk 函数以支持“行内展开”
function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) throw new Error('Chunk size must be greater than 0');
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const BrowserView: React.FC<BrowserViewProps> = ({
  currentSeriesList,
  currentSeriesData,
  currentBookList,
  previewBook,
  activeSeriesId,
  setActiveSeriesId,
  handleBookCardClick,
  handleStartLearning,
  setPreviewBook,
  learningList,
}) => {
  const t = useTranslations('BookSelection');

  const [activeTag, setActiveTag] = useState<string>('全部');

  useEffect(() => {
    setActiveTag('全部');
  }, [activeSeriesId]);

  // 标签排序逻辑 (保持不变)
  const uniqueTags = useMemo(() => {
    const orderedTags: string[] = [];
    currentBookList.forEach((book) => {
      if (book.tags && Array.isArray(book.tags)) {
        book.tags.forEach((tag) => {
          if (!orderedTags.includes(tag)) {
            orderedTags.push(tag);
          }
        });
      }
    });
    return ['全部', ...orderedTags];
  }, [currentBookList]);

  // 标签过滤逻辑 (保持不变)
  const filteredBookList = useMemo(() => {
    if (activeTag === '全部') {
      return currentBookList;
    }
    return currentBookList.filter(
      (book) => book.tags && book.tags.includes(activeTag)
    );
  }, [currentBookList, activeTag]);

  // [!! 2. 恢复 !!] 基于最大列数(3)来对行进行分块
  const bookRows = useMemo(
    () => chunk(filteredBookList, 3),
    [filteredBookList]
  );

  return (
    <motion.div
      key="browser"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex-1 flex flex-col overflow-hidden"
    >
      {/* 1. 分类 Tabs (保持不变) */}
      <div className="shrink-0 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4 p-4 pb-0 overflow-x-auto whitespace-nowrap">
          {currentSeriesList.map((series) => (
            <button
              key={series.id}
              onClick={() => setActiveSeriesId(series.id.toString())}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeSeriesId === series.id.toString()
                  ? 'border-b-2 border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              role="tab"
              aria-selected={activeSeriesId === series.id.toString()}
              aria-label={t('BrowserView.aria.tabLabel', {
                categoryName: series.name,
              })}
            >
              {series.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 2. Tag 栏 (保持不变) */}
      {uniqueTags.length > 1 && (
        <div className="shrink-0">
          <nav className="flex space-x-2 px-4 pt-3 pb-2 sm:pb-1  overflow-x-auto whitespace-nowrap">
            {uniqueTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-150 ease-in-out border ${
                  activeTag === tag
                    ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100 shadow-sm'
                    : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500'
                }`}
                role="tab"
                aria-selected={activeTag === tag}
              >
                {tag}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* [!! 3. 布局重构 !!] */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {currentSeriesData ? (
          <section>
            {/* [!! 修改 !!] 
                - 恢复 'space-y-3' 用于行间距
                - 恢复 'bookRows.map'
            */}
            <div className="space-y-3">
              {filteredBookList.length > 0 ? (
                bookRows.map((row, rowIndex) => (
                  <div key={rowIndex}>
                    {/* [!! 核心修复 !!]
                        - 移除了 'md:grid-cols-2' (这导致了 2,1,2,1 布局错误)
                        - 将 'lg:grid-cols-3' 改为 'md:grid-cols-3'
                        - 布局现在从 1 列 (sm) 直接跳到 3 列 (md)
                        - 这确保了 JS chunk(3) 和 CSS grid-cols-3 始终匹配
                    */}
                    <div
                      className="grid grid-cols-1 md:grid-cols-3 gap-3"
                      role="radiogroup"
                      aria-label={t('BrowserView.aria.bookRadiogroupLabel')}
                    >
                      {row.map((book) => (
                        <BookCard
                          key={book.listCode}
                          book={book}
                          isActive={previewBook?.listCode === book.listCode}
                          onSelect={handleBookCardClick}
                        />
                      ))}
                    </div>

                    {/* [!! 恢复 !!] 恢复行内展开逻辑 */}
                    <AnimatePresence>
                      {previewBook &&
                        row.some(
                          (book) => book.listCode === previewBook.listCode
                        ) && (
                          <motion.div
                            key="plan-setup-inline"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              type: 'spring',
                              damping: 25,
                              stiffness: 180,
                            }}
                            className="overflow-hidden"
                          >
                            {/* [!! 4. 恢复 !!] 恢复 pt-3 间隙 */}
                            <div className="pt-3">
                              <PlanSetupView
                                book={previewBook}
                                initialPlan={
                                  learningList.find(
                                    (p) => p.listCode === previewBook.listCode
                                  )?.plan
                                }
                                onStart={handleStartLearning}
                                onCancel={() => setPreviewBook(null)}
                              />
                            </div>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                // 空状态 (保持不变)
                <p className="text-gray-500 dark:text-gray-400 text-center py-10">
                  {t('BrowserView.noBooksInCategory')}
                </p>
              )}
            </div>
          </section>
        ) : (
          // 空状态 (保持不变)
          <p className="text-gray-500 dark:text-gray-400 text-center py-10">
            {t('BrowserView.noBooksInCategory')}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default BrowserView;
