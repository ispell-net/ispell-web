'use client';
/*
 * @Date: 2025-10-26 10:02:44
 * @LastEditTime: 2025-11-06 19:52:47
 * @Description: 单词拼写显示区域 (监听全局 setting)
 * [!! 已更新 !!]
 * 1. 允许用户手动输入撇号 (') 并进行校验。
 * 2. 自动跳过空格 ( )。
 * 3. 校验逻辑现在严格区分大小写。
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import DefinitionDisplay from '@/components/common/DefinitionDisplay';
import PronunciationDisplay from '@/components/common/PronunciationDisplay';
import { useSpelling } from '@/contexts/spelling.context';
import { useSpeechPlayer } from '@/hooks/useSpeechPlayer';
import {
  getAllIndices,
  getConsonantIndices,
  getRandomIndicesOverHalf,
  getVowelIndices,
} from '@/utils/word.utils';
import { SpeechOptions } from '@/utils/speech.utils';
import { AccentType } from '@/types/word.types';
import SentenceDisplay from '@/components/common/SentenceDisplay';
import { motion, AnimatePresence } from 'framer-motion';

// [!!] 定义哪些是用户必须输入的
const isInputtableChar = (char: string): boolean => {
  return /[a-zA-Z']/.test(char); // 字母 和 撇号
};

// [!!] 定义哪些是自动跳过的
const isSkippableChar = (char: string): boolean => {
  return char === ' '; // 仅空格
};

export default function WordDisplay() {
  const {
    currentWord,
    handleNext,
    speechSupported,
    incrementInputCount,
    incrementCorrectCount,
    speechConfig,
    displayMode,
    updateWordProgressInContext,
    setHasMadeMistake,
    showSentences,
    showSentenceTranslation,
  } = useSpelling();

  const { speak, isPlaying } = useSpeechPlayer();

  // ... (sfx 音效和 playSound 函数保持不变) ...
  const successSfx =
    typeof window !== 'undefined' ? new Audio('/sfx/success.mp3') : null;

  const errorSfx =
    typeof window !== 'undefined' ? new Audio('/sfx/failed.wav') : null;

  const playSound = (audio: HTMLAudioElement | null) => {
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.7;
      audio.play().catch((e) => console.error('SFX play failed:', e));
    }
  };

  // --- 状态 (不变) ---
  const [userInput, setUserInput] = useState<string[]>([]);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [isError, setIsError] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState(false);

  // --- 引用 (不变) ---
  const wordContainerRef = useRef<HTMLDivElement>(null);
  const prevWordRef = useRef<string>(currentWord?.text || '');

  // [!!] 查找下一个“可输入”的字符 (不变)
  const findNextInputtablePosition = useCallback(
    (word: string, startIndex: number): number => {
      if (!word) return 0;
      for (let i = startIndex; i < word.length; i++) {
        if (isInputtableChar(word[i])) {
          return i;
        }
      }
      return word.length;
    },
    []
  );

  // --- 核心逻辑：状态重置 (不变) ---
  const resetInputState = useCallback(
    (isWordChange = false) => {
      if (!isWordChange) incrementInputCount();
      setUserInput([]);
      setCurrentPosition(0);
      setIsError(false);
      setIsComplete(false);
      wordContainerRef.current?.classList.remove('shake');
      setIsHovering(false);
    },
    [incrementInputCount]
  );

  // --- hiddenIndices (不变) ---
  const hiddenIndices = useMemo(() => {
    if (!currentWord?.text) return [];
    switch (displayMode) {
      case 'hideVowels':
        return getVowelIndices(currentWord.text);
      case 'hideConsonants':
        return getConsonantIndices(currentWord.text);
      case 'hideRandom':
        return getRandomIndicesOverHalf(currentWord.text);
      case 'hideAll':
        return getAllIndices(currentWord.text);
      default:
        return [];
    }
  }, [currentWord?.text, displayMode]);

  // --- 各种播放函数 (不变) ---
  const playNewWordPronunciation = useCallback(() => {
    if (!speechSupported || !currentWord?.text) return;
    const configToPlay: SpeechOptions = {
      ...speechConfig,
      text: currentWord.text,
      onStart: () => console.log('播放新单词语音:', currentWord.text),
      onError: (error: SpeechSynthesisErrorEvent) => {
        console.error('新单词语音播放错误:', error.error);
      },
    };
    speak(configToPlay);
  }, [currentWord, speechConfig, speechSupported, speak]);

  const playCurrentWord = useCallback(() => {
    if (!speechSupported || isPlaying || !currentWord?.text) return;
    const configToPlay: SpeechOptions = {
      ...speechConfig,
      text: currentWord.text,
      onStart: () => console.log('播放当前单词语音:', currentWord.text),
      onError: (error) => {
        console.error('当前单词语音错误:', error.error);
      },
    };
    speak(configToPlay);
  }, [currentWord, isPlaying, speechConfig, speechSupported, speak]);

  // --- 拼写逻辑函数 (不变) ---
  const handleSuccess = useCallback(async () => {
    playSound(successSfx);
    setIsComplete(true);
    setHasMadeMistake(false);
    updateWordProgressInContext(5);
    incrementCorrectCount();
    setTimeout(() => {
      handleNext();
    }, 300);
  }, [
    successSfx,
    updateWordProgressInContext,
    incrementCorrectCount,
    handleNext,
    setHasMadeMistake,
  ]);

  const handleFailure = useCallback(async () => {
    playSound(errorSfx);
    setIsError(true);
    setHasMadeMistake(true);
    updateWordProgressInContext(1);
    wordContainerRef.current?.classList.add('shake');
    setTimeout(() => {
      resetInputState(false);
      if (currentWord?.text) {
        setCurrentPosition(findNextInputtablePosition(currentWord.text, 0));
      }
      playCurrentWord();
    }, 1000);
  }, [
    errorSfx,
    setHasMadeMistake,
    updateWordProgressInContext,
    playCurrentWord,
    resetInputState,
    currentWord?.text,
    findNextInputtablePosition,
  ]);

  // --- 键盘输入监听 (修改) ---
  const handleInputKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (
        isComplete ||
        isError ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        !currentWord?.text ||
        !/^[a-zA-Z']$/.test(e.key) // 允许字母和撇号
      )
        return;

      const inputChar = e.key; // [!!] 保持大小写
      const targetChar = currentWord.text[currentPosition]; // [!!] 目标字符

      if (!targetChar) return;

      const newInput = [...userInput];
      newInput[currentPosition] = inputChar;
      setUserInput(newInput);

      // [!! 关键修改 !!]
      // 移除所有 .toLowerCase()，进行严格的大小写匹配
      const isMatch = inputChar === targetChar;

      if (isMatch) {
        // [!!] 答对了！查找下一个 *可输入* 的位置
        const nextInputtablePos = findNextInputtablePosition(
          currentWord.text,
          currentPosition + 1
        );

        // [!!] 自动填充所有中间 *可跳过* 的字符（即空格）
        for (let i = currentPosition + 1; i < nextInputtablePos; i++) {
          newInput[i] = currentWord.text[i];
        }
        setUserInput(newInput); // 再次更新 state 以包含跳过的字符

        // [!!] 光标跳到下一个可输入的位置
        setCurrentPosition(nextInputtablePos);

        // [!!] 检查是否已完成
        if (nextInputtablePos === currentWord.text.length) {
          handleSuccess();
        }
      } else {
        handleFailure();
      }
    },
    [
      currentPosition,
      currentWord,
      handleFailure,
      handleSuccess,
      isComplete,
      isError,
      userInput,
      findNextInputtablePosition,
    ]
  );

  // --- Effect Hooks (不变) ---
  useEffect(() => {
    if (currentWord?.text && currentWord.text !== prevWordRef.current) {
      resetInputState(true);
      setCurrentPosition(findNextInputtablePosition(currentWord.text, 0));
      setHasMadeMistake(false);
      prevWordRef.current = currentWord.text;
      const shouldPlay = speechSupported;
      if (shouldPlay) {
        playNewWordPronunciation();
      }
    } else if (!currentWord?.text && prevWordRef.current) {
      prevWordRef.current = '';
    }
  }, [
    currentWord?.text,
    resetInputState,
    speechSupported,
    playNewWordPronunciation,
    setHasMadeMistake,
    findNextInputtablePosition,
  ]);

  useEffect(() => {
    const keyPressHandler = (e: KeyboardEvent) => handleInputKeyPress(e);
    window.addEventListener('keydown', keyPressHandler);
    return () => window.removeEventListener('keydown', keyPressHandler);
  }, [handleInputKeyPress]);

  // --- 渲染逻辑 (修改) ---
  const renderWord = (word: string) => {
    if (!word) return null;
    const chars = word.split('');

    return (
      <div
        ref={wordContainerRef}
        className="flex items-center justify-center gap-2 transition-all duration-300 cursor-default"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {chars.map((char, index) => {
          const isEntered = index < currentPosition;

          // [!!] 1. 如果是“可跳过”的字符 (空格)
          if (isSkippableChar(char)) {
            const displayChar = char === ' ' ? '&nbsp;' : char;

            const colorClass = isEntered
              ? 'text-green-500 dark:text-green-300' // 已跳过 -> 绿色
              : 'text-gray-400 dark:text-gray-600'; // 未到达 -> 灰色

            return (
              <span
                key={index}
                className={`text-5xl sm:text-7xl ${colorClass}`}
                dangerouslySetInnerHTML={{ __html: displayChar }}
              />
            );
          }

          // [!!] 2. 如果是“可输入”的字符 (字母或撇号)
          const isCurrent = index === currentPosition;
          const hasError = isError && isCurrent;

          // [!! 关键修改 !!]
          // 移除 .toLowerCase()，进行严格的大小写匹配
          let isCorrect = false;
          if (isEntered) {
            isCorrect = userInput[index] === char;
          }

          let colorClass = 'text-gray-400 dark:text-gray-600';
          if (isEntered)
            colorClass = isCorrect
              ? 'text-green-500 dark:text-green-300'
              : 'text-red-500 dark:text-red-300';
          else if (hasError) colorClass = 'text-red-500 dark:text-red-300';
          else if (isCurrent) colorClass = 'text-gray-900 dark:text-gray-100';

          let charToShow = char;
          if (hiddenIndices.includes(index) && !isEntered && !isHovering) {
            charToShow = '_';
          }

          return (
            <span
              key={index}
              className={`text-5xl sm:text-7xl tracking-tight ${colorClass}`}
            >
              {charToShow}
            </span>
          );
        })}
      </div>
    );
  };

  // --- 播放逻辑 (不变) ---
  const playWordPronunciation = (type: 'uk' | 'us' | null = null) => {
    if (
      !speechSupported ||
      isPlaying ||
      !currentWord?.text ||
      !currentWord?.pronunciation
    )
      return;

    let detailToPlay = null;
    let accentLang: AccentType = 'en-US';

    if (type === 'uk' && currentWord.pronunciation.uk?.phonetic) {
      detailToPlay = currentWord.pronunciation.uk;
      accentLang = 'en-GB';
    } else if (type === 'us' && currentWord.pronunciation.us?.phonetic) {
      detailToPlay = currentWord.pronunciation.us;
      accentLang = 'en-US';
    } else {
      if (currentWord.pronunciation.us?.phonetic) {
        detailToPlay = currentWord.pronunciation.us;
        accentLang = 'en-US';
      } else if (currentWord.pronunciation.uk?.phonetic) {
        detailToPlay = currentWord.pronunciation.uk;
        accentLang = 'en-GB';
      }
    }

    if (!detailToPlay) {
      console.warn(
        'No pronunciation detail found to play for:',
        currentWord.text,
        type
      );
      return;
    }

    const configToPlay: SpeechOptions = {
      ...speechConfig,
      accent: accentLang,
      text: currentWord.text,
      onStart: () =>
        console.log(`播放 [${type || 'auto'}] 语音:`, currentWord.text),
      onError: (error) => {
        console.error(`语音 [${type || 'auto'}] 播放错误:`, error.error);
      },
    };

    speak(configToPlay);
  };

  const handlePlaySelectedPronunciation = (type: 'uk' | 'us') => {
    playWordPronunciation(type);
  };

  // --- JSX 返回 (不变) ---
  return (
    <div
      className="w-full flex flex-col items-center justify-center relative"
      style={{ minHeight: '300px' }}
    >
      <div className="mb-6 h-20 flex items-center">
        {renderWord(currentWord?.text || '')}
      </div>

      <PronunciationDisplay
        pronunciation={currentWord?.pronunciation}
        onPlay={handlePlaySelectedPronunciation}
        isPlaying={isPlaying}
        speechSupported={!!speechSupported}
      />

      <DefinitionDisplay definitions={currentWord?.definitions} />

      <AnimatePresence>
        {showSentences &&
          currentWord?.examples.general &&
          currentWord.examples.general.length > 0 && (
            <motion.div
              className="w-full overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: 'auto',
              }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            >
              <div className="mt-4">
                <SentenceDisplay
                  sentences={currentWord?.examples.general}
                  showTranslation={showSentenceTranslation}
                />
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {!showSentences &&
        currentWord?.examples.general &&
        currentWord.examples.general.length > 0 && <div className="h-10" />}
    </div>
  );
}
