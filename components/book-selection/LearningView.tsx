/*
 * @Date: 2025-10-30 10:25:00
 * @LastEditTime: 2025-11-06 21:48:53
 * @Description: 学习计划列表组件 (已优化空状态)
 */

import React, { RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  MoreHorizontal,
  RotateCcw,
  Trash2,
  ListTree,
  SlidersHorizontal,
  ArchiveX,
} from 'lucide-react';
import type { Book, LearningPlan, PlanDetails } from '@/types/book.types';
import PlanSetupView from './PlanSetupView';
// [!! 1. 新增导入 !!] 导入 Next.js Image 组件
import Image from 'next/image';

interface LearningViewProps {
  learningList: LearningPlan[];
  currentBookId: string | null;
  previewBook: Book | null;
  openMenu: number | null;
  menuRef: RefObject<HTMLDivElement | null>;
  getPlanDescription: (book: Book, plan: PlanDetails) => string;
  reviewStrategyNames: { [key: string]: string };
  handleActivateLearning: (planId: number, listCode: string) => void;
  handleAdjustPlanClick: (book: Book) => void;
  setOpenMenu: (id: number | null) => void;
  openResetModal: (planId: number, bookName: string) => void;
  openCancelModal: (planId: number, bookName: string) => void;
  setPreviewBook: (book: Book | null) => void;
  handleUpdatePlan: (planId: number, book: Book, plan: PlanDetails) => void;
  handleViewPlanWords?: (planId: number, bookName: string) => void;
  handleViewMistakes?: (planId: number, bookName: string) => void;
}

const LearningView: React.FC<LearningViewProps> = ({
  learningList,
  currentBookId,
  previewBook,
  openMenu,
  menuRef,
  getPlanDescription,
  reviewStrategyNames,
  handleActivateLearning,
  handleAdjustPlanClick,
  setOpenMenu,
  openResetModal,
  openCancelModal,
  setPreviewBook,
  handleUpdatePlan,
  handleViewPlanWords,
  handleViewMistakes,
}) => {
  const t = useTranslations('BookSelection');

  return (
    <motion.div
      key="learning"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex-1 flex flex-col overflow-y-auto"
    >
      <div className="p-4 space-y-3">
        {learningList.length > 0 ? (
          learningList.map((learningItem) => {
            const { planId, listCode, book, series, plan } = learningItem;
            const isPreviewingThis = previewBook?.listCode === listCode;
            const isActuallyCurrent = currentBookId === listCode;

            const learningOrderText =
              plan.learningOrder === 'SEQUENTIAL'
                ? t('LearningView.learningOrder.sequential')
                : t('LearningView.learningOrder.random');

            return (
              <div key={planId}>
                <div
                  onClick={() => handleActivateLearning(planId, listCode)}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer ${
                    isActuallyCurrent
                      ? 'border-gray-900 dark:border-gray-100'
                      : 'border-gray-200 dark:border-gray-700'
                  } bg-white dark:bg-gray-800`}
                >
                  {/* --- 按钮组 --- */}
                  <div className="absolute top-3 right-3 flex space-x-2">
                    {/* 按钮 1: 查看方案 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPlanWords?.(planId, book.name);
                      }}
                      className="flex items-center space-x-1.5 rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      aria-label={t('LearningView.buttons.viewPlanWords')}
                    >
                      <ListTree className="w-4 h-4" />
                      <span>{t('LearningView.buttons.viewPlanWords')}</span>
                    </button>

                    {/* 按钮 2: 错题集 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMistakes?.(planId, book.name);
                      }}
                      className="flex items-center space-x-1.5 rounded-full bg-red-100 dark:bg-red-900/50 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/80 transition-colors"
                      aria-label={t('LearningView.buttons.viewMistakes')}
                    >
                      <ArchiveX className="w-4 h-4" />
                      <span>{t('LearningView.buttons.viewMistakes')}</span>
                    </button>
                  </div>

                  {isActuallyCurrent && (
                    <div className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                      {t('LearningView.currentActive')}
                    </div>
                  )}
                  {/* 标题 (为按钮腾出空间) */}
                  <h5 className="font-semibold text-gray-900 dark:text-white pr-40">
                    {book.name}
                  </h5>
                  <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">
                    {series.description}
                    {book.description && ` / ${book.description}`}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    {getPlanDescription(book, plan)}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {t('LearningView.learningOrder.label')}:{' '}
                      {learningOrderText}
                    </span>
                    <span>
                      {t('LearningView.reviewStrategy.label')}:{' '}
                      {reviewStrategyNames[plan.reviewStrategy] ||
                        plan.reviewStrategy}
                    </span>
                  </div>

                  {/* --- 按钮布局 (保持不变) --- */}
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivateLearning(planId, listCode);
                      }}
                      disabled={isActuallyCurrent}
                      className="flex-1 py-2 px-4 rounded-lg bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isActuallyCurrent
                        ? t('LearningView.buttons.active')
                        : t('LearningView.buttons.setAsCurrent')}{' '}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdjustPlanClick(book);
                      }}
                      className="hidden md:flex flex-1 py-2 px-4 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium flex items-center justify-center"
                    >
                      {t('LearningView.buttons.adjustPlan')}{' '}
                    </button>

                    <div className="relative shrink-0" ref={menuRef}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu === planId ? null : planId);
                        }}
                        className="py-2 px-3 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        aria-haspopup="true"
                        aria-expanded={openMenu === planId}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      <AnimatePresence>
                        {openMenu === planId && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute right-0 top-full mt-2 w-48 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700"
                          >
                            <ul className="p-1">
                              <li className="md:hidden">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAdjustPlanClick(book);
                                  }}
                                  className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <SlidersHorizontal className="w-4 h-4" />
                                  <span>
                                    {t('LearningView.buttons.adjustPlan')}
                                  </span>{' '}
                                </button>
                              </li>

                              <li>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openResetModal(planId, book.name);
                                  }}
                                  className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  <span>
                                    {t('LearningView.buttons.resetProgress')}
                                  </span>{' '}
                                </button>
                              </li>

                              <li>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openCancelModal(planId, book.name);
                                  }}
                                  className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>
                                    {t('LearningView.buttons.cancelLearning')}
                                  </span>{' '}
                                </button>
                              </li>
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                <AnimatePresence>
                  {isPreviewingThis && previewBook && (
                    <motion.div
                      key="plan-setup-inline-learning"
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
                      <div className="pt-3">
                        <PlanSetupView
                          book={previewBook}
                          initialPlan={plan}
                          onStart={(updatedPlan) =>
                            handleUpdatePlan(planId, book, updatedPlan)
                          }
                          onCancel={() => setPreviewBook(null)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          // [!! 2. 已修改的空状态 !!]
          <div className="flex flex-col items-center justify-center text-center py-10 px-4">
            {/* 插图容器 */}
            <div
              className="w-40 h-40 sm:w-48 sm:h-48 mb-6 relative"
              aria-hidden="true"
            >
              {/* 亮色模式插图 */}
              <Image
                src="/images/illustrations/power.svg"
                alt={t('LearningView.empty.alt')}
                width={192} // 192px = 12rem = w-48
                height={192} // 192px = 12rem = h-48
                className="block dark:hidden w-full h-full object-contain"
                priority={false} // 非首屏，无需优先加载
              />
              {/* 暗色模式插图 */}
              <Image
                src="/images/illustrations/power-dark.svg"
                alt={t('LearningView.empty.alt')}
                width={192}
                height={192}
                className="hidden dark:block w-full h-full object-contain"
                priority={false}
              />
            </div>

            {/* 优化后的文案 (标题) */}
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {t('LearningView.empty.title')}
            </h3>

            {/* 优化后的文案 (描述) */}
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              {t('LearningView.noLearningBooks')}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LearningView;
