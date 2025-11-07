'use client';
/*
 * @Date: 2025-10-26 10:02:25
 * @LastEditTime: 2025-11-07 17:15:42
 * @Description: 单词导航 (已在移动端隐藏释义并优化间距)
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import DefinitionDisplay from '../common/DefinitionDisplay';
import { useSpelling } from '@/contexts/spelling.context';

export default function WordNavigation() {
  const { currentIndex, words, displayMode, handlePrev, handleNext } =
    useSpelling();

  const totalWords = words.length;
  const prevWord = words[currentIndex - 1];
  const nextWord = words[currentIndex + 1];

  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex === totalWords - 1;

  let nextWordDisplay = '';
  if (nextWord) {
    if (displayMode === 'full') {
      nextWordDisplay = nextWord.text;
    } else {
      nextWordDisplay = nextWord.text.replace(/./g, '_');
    }
  }

  return (
    // [!! 1. 优化 !!] 减小了移动端的边距 (mb-4, mt-4, space-x-2)
    <div className="w-full max-w-7xl flex justify-between items-center mb-4 sm:mb-12 mt-4 sm:mt-10 space-x-2 sm:space-x-8">
      {/* 上一个单词 */}
      <button
        onClick={handlePrev}
        disabled={isPrevDisabled}
        // [!! 2. 优化 !!] 减小了移动端的图标和文字间距 (space-x-1)
        className={`flex-1 min-w-0 flex items-center space-x-1 sm:space-x-2 transition-all duration-300 ${
          isPrevDisabled
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:text-blue-500 dark:hover:text-blue-300'
        }`}
      >
        {/* [!! 3. 优化 !!] 减小了移动端的图标大小 (w-4 h-4) */}
        <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        <div className="text-left flex-1 min-w-0">
          {' '}
          <p className="text-base sm:text-2xl font-medium text-gray-500 dark:text-gray-300 truncate">
            {prevWord ? prevWord.text : ''}
          </p>
          {/* (释义在移动端保持隐藏) */}
          <DefinitionDisplay
            definitions={prevWord?.definitions}
            mode="single-line"
            className="truncate hidden sm:block"
          />
        </div>
      </button>

      {/* 下一个单词 */}
      <button
        onClick={handleNext}
        disabled={isNextDisabled}
        // [!! 2. 优化 !!] 减小了移动端的图标和文字间距 (space-x-1)
        className={`flex-1 min-w-0 flex items-center space-x-1 sm:space-x-2 transition-all duration-300 ${
          isNextDisabled
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:text-blue-500 dark:hover:text-blue-300'
        }`}
      >
        <div className="text-right flex-1 min-w-0">
          <p className="text-base sm:text-2xl font-medium text-gray-500 dark:text-gray-300 truncate">
            {nextWordDisplay}
          </p>
          {/* (释义在移动端保持隐藏) */}
          <DefinitionDisplay
            definitions={nextWord?.definitions}
            mode="single-line"
            className="truncate hidden sm:block"
          />
        </div>
        {/* [!! 3. 优化 !!] 减小了移动端的图标大小 (w-4 h-4) */}
        <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
      </button>
    </div>
  );
}