/*
 * @Date: 2025-11-04
 * @LastEditTime: 2025-11-07 09:19:04
 * @Description: 错题集模态框组件 (已修复语法错误并添加底部提示栏)
 * 功能：显示计划的错题列表，支持复习、移除单个、清空全部
 */
'use client';

// [!!] 确保所有 React 钩子都已导入
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// [!!] 确保所有图标都已导入
import { X, Loader2, Trash2, ArchiveX, Play, PartyPopper } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

// [!!] 路径假设 (请根据您的项目结构核对)
import {
  getMistakes,
  removeMistake,
  clearMistakes,
  MistakeEntry,
} from '../../services/planService';
import { useAppContext } from '../../contexts/app.context';
import DefinitionDisplay from '../common/DefinitionDisplay';
import ConfirmationModal from '../common/ConfirmationModal';
import type { Definition } from '../../types/word.types';

// Props 接口 (不变)
interface MistakeModalProps {
  isOpen: boolean;
  planId: number | undefined;
  bookName: string | undefined;
  onClose: () => void;
  onStartReview: (planId: number) => void;
}

const MistakeModal: React.FC<MistakeModalProps> = ({
  isOpen,
  planId,
  bookName,
  onClose,
  onStartReview,
}) => {
  const t = useTranslations('BookSelection.MistakeModal');
  const { accessToken } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [isClearing, setIsClearing] = useState<'single' | 'all' | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  // 获取数据 (逻辑不变)
  const fetchMistakes = useCallback(async () => {
    if (!isOpen || !planId || !accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMistakes(planId);
      setMistakes(data);
    } catch (err) {
      setError(t('error'));
    }
    setIsLoading(false);
  }, [isOpen, planId, accessToken, t]);

  // Effect (逻辑不变)
  useEffect(() => {
    if (isOpen) {
      fetchMistakes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, planId, accessToken]);

  // 处理：移除单个错题 (逻辑不变)
  const handleRemove = async (wordId: number) => {
    if (!planId) return;
    setIsClearing('single');
    try {
      await removeMistake(planId, wordId);
      setMistakes((prev) => prev.filter((m) => m.word.id !== wordId));
      toast.success(t('removeSuccess'));
    } catch (err) {
      toast.error(t('removeError'));
    }
    setIsClearing(null);
  };

  // [!! 关键修复 !!]
  // 修正了 `catch (err)` 后面丢失的 `{}` 语法错误
  const handleClearAll = async () => {
    if (!planId) return;
    setIsClearing('all');
    try {
      await clearMistakes(planId);
      setMistakes([]);
      toast.success(t('clearAllSuccess'));
    } catch (err) {
      // <--- 此处添加了 {
      toast.error(t('clearAllError'));
    } // <--- 此处添加了 }
    setIsClearing(null);
    setConfirmClearAll(false);
  };

  // 处理：开始复习 (逻辑不变)
  const handleReview = () => {
    if (!planId) return;
    if (mistakes.length === 0) {
      toast.error(t('emptyReview'));
      return;
    }
    onStartReview(planId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 (z-50) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* 弹窗面板 (z-[51]) */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 m-auto w-11/12 md:w-2/3 lg:w-1/2 max-w-2xl h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-[51] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* 头部 (无问号) */}
            <div className="flex items-center justify-between p-4 pl-5 shrink-0 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-red-100 dark:bg-red-900/50 rounded-full">
                  <ArchiveX className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('title', { bookName: bookName || '...' })}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={t('close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 内容区 (不变) */}
            <div className="flex-1 p-4 overflow-y-auto">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                  <span className="ml-2 text-gray-500">{t('loading')}</span>
                </div>
              )}
              {error && (
                <div className="flex items-center justify-center h-full text-red-600">
                  {error}
                </div>
              )}
              {!isLoading && !error && (
                <>
                  {mistakes.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {mistakes.map((mistake) => (
                        <li
                          key={mistake.id}
                          className="flex justify-between items-center py-4 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {mistake.word.text}
                              </span>
                              <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded">
                                {t('mistakeCount', {
                                  count: mistake.mistakeCount,
                                })}
                              </span>
                            </div>
                            <DefinitionDisplay
                              definitions={
                                mistake.word.definitions as Definition[]
                              }
                              mode="single-line"
                              className="text-sm text-gray-500 dark:text-gray-400 mt-1"
                            />
                          </div>
                          <button
                            onClick={() => handleRemove(mistake.word.id)}
                            disabled={isClearing === 'single'}
                            className="ml-4 p-1.5 rounded-full text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                            aria-label={t('removeAria')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <PartyPopper className="w-16 h-16 stroke-1 text-gray-300 dark:text-gray-600" />
                      <p className="mt-4 text-center">{t('empty')}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 底部操作栏 (带提示) */}
            <div className="p-4 shrink-0 border-t border-gray-200 dark:border-gray-700">
              {/* 提示栏 (小 bar + 小字) */}
              <div className="pb-3 mb-3 border-b border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('strategyHint')}
                </p>
              </div>

              {/* 按钮行 */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setConfirmClearAll(true)}
                  disabled={mistakes.length === 0 || isClearing === 'all'}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-md disabled:opacity-50"
                >
                  {isClearing === 'all' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>{t('clearAll')}</span>
                </button>
                <button
                  onClick={handleReview}
                  disabled={mistakes.length === 0 || isLoading}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg shadow-sm hover:bg-gray-700 dark:hover:bg-gray-300 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  <span>{t('reviewAll', { count: mistakes.length || 0 })}</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* 清空确认弹窗 (不变) */}
          <ConfirmationModal
            isOpen={confirmClearAll}
            title={t('clearAllConfirmTitle')}
            description={t('clearAllConfirmDesc', {
              bookName: bookName || '...',
            })}
            confirmText={t('clearAllConfirmBtn')}
            isDestructive={true}
            onConfirm={handleClearAll}
            onCancel={() => setConfirmClearAll(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default MistakeModal;
