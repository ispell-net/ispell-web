/*
 * @Description: 用于显示书本完整单词列表的模态框 (已添加搜索功能)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// [!! 修改 !!] 导入 Search 图标
import { X, Loader2, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { getWordsByBook } from '../../services/bookService'; // <-- 路径请核对
import DefinitionDisplay from '../common/DefinitionDisplay'; // <-- 复用 DefinitionDisplay
import { Definition, SimpleWord } from '@/types/word.types';

interface BookWordsModalProps {
  isOpen: boolean;
  listCode: string | undefined; // 对应 Book.listCode
  bookName: string | undefined; // 对应 Book.name
  onClose: () => void;
}

const BookWordsModal: React.FC<BookWordsModalProps> = ({
  isOpen,
  listCode,
  bookName,
  onClose,
}) => {
  // 复用您提供的 PlanWordsModal 的翻译键
  const t = useTranslations('BookSelection.PlanWordsModal');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // [!! 状态 1 !!] 存储从 API 获取的 *所有* 单词
  const [words, setWords] = useState<SimpleWord[]>([]);
  // [!! 状态 2 !!] 存储搜索框的输入内容
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen && listCode) {
      const fetchWords = async () => {
        setIsLoading(true);
        setError(null);
        setWords([]);
        setSearchQuery(''); // [!!] 打开时重置搜索
        try {
          const data = await getWordsByBook(listCode);
          setWords(data);
        } catch (err) {
          setError(t('error'));
        }
        setIsLoading(false);
      };
      fetchWords();
    }
  }, [isOpen, listCode, t]);

  // [!! 核心逻辑 !!]
  // 根据 searchQuery 过滤 'words' 列表
  // 仅当 searchQuery 不为空时执行过滤
  const filteredWords = searchQuery
    ? words.filter((word) =>
        word.word.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : words; // 如果搜索框为空，显示所有单词

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 m-auto w-11/12 md:w-2/3 lg:w-1/2 max-w-2xl h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 shrink-0 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('title', { bookName: bookName || '...' })}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={t('close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* [!! 新增 !!] 搜索栏区域 (固定在顶部，不滚动) */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  // [!!] (需要新翻译)
                  placeholder={t('searchPlaceholder', { count: words.length })}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
            </div>

            {/* [!! 修改 !!] 列表区域 (可滚动) */}
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
                <div className="space-y-2">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                    {/* [!! 修改 !!] 渲染 filteredWords 而不是 words */}
                    {filteredWords.map((word) => (
                      <li
                        key={word.id}
                        className="flex justify-between items-start p-3"
                      >
                        <span className="font-medium text-gray-900 dark:text-gray-100 pt-1">
                          {word.word}
                        </span>
                        <DefinitionDisplay
                          definitions={word.definitions as Definition[]}
                          mode="single-line"
                          className="text-sm text-right max-w-[70%]"
                        />
                      </li>
                    ))}
                  </ul>

                  {/* [!! 修改 !!] 区分 "列表为空" 和 "搜索无结果" */}

                  {/* 1. 原始列表为空 (API未返回数据) */}
                  {words.length === 0 && !isLoading && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-10">
                      {t('empty')}
                    </p>
                  )}

                  {/* 2. 原始列表有数据，但过滤后为空 */}
                  {words.length > 0 && filteredWords.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-10">
                      {/* [!!] (需要新翻译) */}
                      {t('noResults', { query: searchQuery })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BookWordsModal;
