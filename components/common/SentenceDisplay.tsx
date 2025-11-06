'use client';
/*
 * @Date: 2025-10-28 09:30:00
 * @LastEditTime: 2025-11-05 17:35:22
 * @Description: 例句显示组件 (已调整间距)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// [!!] 导入 useSpelling 和 findWordIndices
import { useSpelling } from '@/contexts/spelling.context';
import { findWordIndices } from '@/utils/word.utils';

/**
 * 例句的数据结构
 */
interface Sentence {
  cn: string;
  en: string; // [!!] 我们将使用这个原始英文句子
  en_highlighted: string;
  speechUrl?: string;
}

interface SentenceDisplayProps {
  sentences: Sentence[] | null | undefined;
  className?: string;
  showTranslation: boolean;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 30 : -30,
    opacity: 0,
  }),
};

/**
 * [!!] 辅助组件：用于渲染隐藏或高亮的句子
 */
const SentenceRenderer: React.FC<{
  sentence: Sentence;
  targetWord: string;
  isHiding: boolean;
}> = ({ sentence, targetWord, isHiding }) => {
  const sentenceText = sentence.en;

  // 使用 useMemo 缓存计算结果，提高性能
  const content = useMemo(() => {
    if (isHiding) {
      // 1. 隐藏模式：使用 findWordIndices 替换
      const indicesToHide = new Set(
        findWordIndices(targetWord, sentenceText, [])
      );
      return (
        <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-base italic">
          {sentenceText.split('').map((char, index) => {
            // [!!] 匹配到的索引替换为下划线
            return indicesToHide.has(index) ? '_' : char;
          })}
        </p>
      );
    }

    // 2. 默认模式：使用高亮 HTML
    return (
      <p
        className="text-gray-700 dark:text-gray-300 text-xs sm:text-base italic"
        dangerouslySetInnerHTML={{
          __html: sentence.en_highlighted,
        }}
      />
    );
  }, [isHiding, targetWord, sentenceText, sentence.en_highlighted]);

  return content;
};

const SentenceDisplay: React.FC<SentenceDisplayProps> = ({
  sentences,
  className = '',
  showTranslation,
}) => {
  const t = useTranslations('Words.Sentence');
  // [!!] 从全局 Context 获取状态
  const { currentWord, hideWordInSentence } = useSpelling();

  const [[page, direction], setPage] = useState([0, 0]);

  useEffect(() => {
    setPage([0, 0]);
  }, [sentences]);

  if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
    return null;
  }

  const currentSentenceIndex =
    ((page % sentences.length) + sentences.length) % sentences.length;
  const currentSentence = sentences[currentSentenceIndex];

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const isTranslationVisible = showTranslation;
  const isHidingWord = hideWordInSentence; // [!!]
  const targetWord = currentWord?.text || ''; // [!!]

  return (
    // [!! 关键修改 2 !!] 在根元素上添加 mb-4 (margin-bottom)
    <div
      className={`w-full max-w-lg mx-auto flex flex-col items-center mb-4 ${className}`}
    >
      <div className="relative w-full flex items-center justify-center min-h-[80px]">
        {/* 上一页按钮 (不变) */}
        {sentences.length > 1 && (
          <button
            onClick={() => paginate(-1)}
            className="absolute left-0 z-10 p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-full bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={t('aria.prevSentence')}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* 中间卡片区域 */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.15 },
            }}
            className="w-full px-10"
          >
            <div className="text-center">
              <div className="flex items-center justify-center">
                <SentenceRenderer
                  sentence={currentSentence}
                  targetWord={targetWord}
                  isHiding={isHidingWord}
                />
              </div>

              <AnimatePresence>
                {isTranslationVisible && (
                  // [!! 关键修改 1 !!] 将 mt-1 改为 mt-2 (增加空隙)
                  // 并且同步上一版的样式修改（颜色）
                  <motion.p
                    className="text-gray-700 dark:text-gray-300 text-xs sm:text-base mt-2"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentSentence.cn}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 下一页按钮 (不变) */}
        {sentences.length > 1 && (
          <button
            onClick={() => paginate(1)}
            className="absolute right-0 z-10 p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-full bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={t('aria.nextSentence')}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 分页圆点 (不变) */}
      {sentences.length > 1 && (
        <div className="flex justify-center space-x-1.5 mt-3">
          {sentences.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const currentIndex =
                  ((page % sentences.length) + sentences.length) %
                  sentences.length;
                if (index === currentIndex) return;
                setPage([index, index > currentIndex ? 1 : -1]);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSentenceIndex
                  ? 'bg-gray-800 dark:bg-gray-200'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to sentence ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SentenceDisplay;
