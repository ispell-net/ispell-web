'use client';
/*
 * @Date: 2025-10-28 22:05:53
 * @LastEditTime: 2025-11-05 17:48:00
 * @Description: SpellingContext (已添加本地持久化，并更新默认值)
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import { useAppContext, type LearningAction } from '@/contexts/app.context';
import { fetchLearningWords, updateWordProgress } from '@/services/wordService';
import { advancePlan } from '@/services/planService';
import { DisplayMode, SpeechConfig, Stats, Word } from '@/types/word.types';
import toast from 'react-hot-toast';
import { PlanDetails } from '@/types/book.types';

// [!! 关键新增 !!] 1. 定义本地存储的 Key
const SETTINGS_KEYS = {
  SPEECH_CONFIG: 'ispell_speechConfig',
  IS_CUSTOM_SPEECH: 'ispell_isCustomSpeech',
  DISPLAY_MODE: 'ispell_displayMode',
  HIDE_WORD_IN_SENTENCE: 'ispell_hideWordInSentence',
  SHOW_SENTENCES: 'ispell_showSentences',
  SHOW_SENTENCE_TRANSLATION: 'ispell_showSentenceTranslation',
};

// [!! 关键新增 !!] 2. 定义一个安全的加载函数
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  // 仅在客户端（浏览器）执行
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    // 如果有存储的值，则解析它；否则返回默认值
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

// 时间格式化工具函数 (不变)
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export interface SpellingContextType {
  words: Word[];
  currentIndex: number;
  currentWord: Word | undefined;
  stats: Stats;
  displayMode: DisplayMode;
  speechConfig: SpeechConfig;
  speechSupported: boolean;
  isCustomSpeech: boolean;
  showSentences: boolean;
  isSessionComplete: boolean;
  showSentenceTranslation: boolean;
  hideWordInSentence: boolean;
  handleNext: () => void;
  handlePrev: () => void;
  startTimer: () => void;
  incrementInputCount: () => void;
  incrementCorrectCount: () => void;
  setSpeechConfig: React.Dispatch<React.SetStateAction<SpeechConfig>>;
  setDisplayMode: React.Dispatch<React.SetStateAction<DisplayMode>>;
  setIsCustomSpeech: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSentences: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSentenceTranslation: React.Dispatch<React.SetStateAction<boolean>>;
  setHideWordInSentence: React.Dispatch<React.SetStateAction<boolean>>;
  updateWordProgressInContext: (quality: number) => void;
  handleWordFailure: () => void;
  handleAdvanceToNextChapter: () => Promise<void>;
  handleReturnToHome: () => Promise<void>;
  setHasMadeMistake: (value: boolean) => void;
}

const SpellingContext = createContext<SpellingContextType | undefined>(
  undefined
);

interface SpellingProviderProps {
  children: ReactNode;
}

export const SpellingProvider = ({ children }: SpellingProviderProps) => {
  const {
    currentBookId,
    learningTrigger,
    learningList,
    endLearningSession,
    isLearningSessionActive,
    refreshAllData,
    mistakeReviewTrigger,
  } = useAppContext();

  // 核心状态管理
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // [!! 关键修改 !!] 3. 使用 lazy initializer 从 localStorage 加载所有设置
  const [showSentences, setShowSentences] = useState<boolean>(() =>
    loadFromLocalStorage<boolean>(SETTINGS_KEYS.SHOW_SENTENCES, false)
  );

  const [showSentenceTranslation, setShowSentenceTranslation] =
    useState<boolean>(() =>
      loadFromLocalStorage<boolean>(
        SETTINGS_KEYS.SHOW_SENTENCE_TRANSLATION,
        true
      )
    );

  // [!!] 默认值设为 'hideRandom'
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() =>
    loadFromLocalStorage<DisplayMode>(SETTINGS_KEYS.DISPLAY_MODE, 'hideRandom')
  );

  // [!!] 默认值设为 true (因为模式不再是 'full')
  const [hideWordInSentence, setHideWordInSentence] = useState<boolean>(() =>
    loadFromLocalStorage<boolean>(SETTINGS_KEYS.HIDE_WORD_IN_SENTENCE, true)
  );

  const defaultSpeechConfig: SpeechConfig = {
    lang: 'en-GB',
    rate: 0.8,
    volume: 1,
    pitch: 1,
    accent: 'en-GB',
    gender: 'auto',
  };

  const [speechConfig, setSpeechConfig] = useState<SpeechConfig>(() => {
    const savedConfig = loadFromLocalStorage<Partial<SpeechConfig>>(
      SETTINGS_KEYS.SPEECH_CONFIG,
      {}
    );
    // 合并默认配置和已存配置，确保所有字段都存在
    return { ...defaultSpeechConfig, ...savedConfig };
  });

  const [isCustomSpeech, setIsCustomSpeech] = useState<boolean>(() =>
    loadFromLocalStorage<boolean>(SETTINGS_KEYS.IS_CUSTOM_SPEECH, false)
  );

  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(false);

  // (统计... 状态不变)
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [failCount, setFailCount] = useState<number>(0);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [failedWordsInSession, setFailedWordsInSession] = useState<Word[]>([]);

  // (hasMadeMistake... 状态不变)
  const [hasMadeMistake, _setHasMadeMistake] = useState<boolean>(false);
  const hasMadeMistakeRef = useRef<boolean>(false);

  const setHasMadeMistake = useCallback((value: boolean) => {
    _setHasMadeMistake(value);
    hasMadeMistakeRef.current = value;
  }, []);

  // [!! 关键新增 !!] 4. 添加 useEffects 以便在状态更改时保存到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          SETTINGS_KEYS.SPEECH_CONFIG,
          JSON.stringify(speechConfig)
        );
      } catch (error) {
        console.warn(`Error writing speechConfig to localStorage:`, error);
      }
    }
  }, [speechConfig]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          SETTINGS_KEYS.IS_CUSTOM_SPEECH,
          JSON.stringify(isCustomSpeech)
        );
      } catch (error) {
        console.warn(`Error writing isCustomSpeech to localStorage:`, error);
      }
    }
  }, [isCustomSpeech]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          SETTINGS_KEYS.DISPLAY_MODE,
          JSON.stringify(displayMode)
        );
      } catch (error) {
        console.warn(`Error writing displayMode to localStorage:`, error);
      }
    }
  }, [displayMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          SETTINGS_KEYS.HIDE_WORD_IN_SENTENCE,
          JSON.stringify(hideWordInSentence)
        );
      } catch (error) {
        console.warn(
          `Error writing hideWordInSentence to localStorage:`,
          error
        );
      }
    }
  }, [hideWordInSentence]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          SETTINGS_KEYS.SHOW_SENTENCES,
          JSON.stringify(showSentences)
        );
      } catch (error) {
        console.warn(`Error writing showSentences to localStorage:`, error);
      }
    }
  }, [showSentences]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          SETTINGS_KEYS.SHOW_SENTENCE_TRANSLATION,
          JSON.stringify(showSentenceTranslation)
        );
      } catch (error) {
        console.warn(
          `Error writing showSentenceTranslation to localStorage:`,
          error
        );
      }
    }
  }, [showSentenceTranslation]);

  // (startTimer, resetSession, loadWordsForSession, ... 其他函数保持不变)
  const startTimer = useCallback(() => {
    setStartTime((prevStartTime) => {
      if (prevStartTime === null) {
        return Date.now();
      }
      return prevStartTime;
    });
  }, []);

  const resetSession = useCallback(
    (wordsToLoad: Word[]) => {
      setWords(wordsToLoad);
      setCurrentIndex(0);
      setStartTime(null);
      setTimeElapsed(0);
      setFailCount(0);
      setSuccessCount(0);
      startTimer();
      setFailedWordsInSession([]);
      setHasMadeMistake(false);
      setIsSessionComplete(false);
    },
    [startTimer, setHasMadeMistake]
  );

  const loadWordsForSession = useCallback(
    async (listCode: string, action: LearningAction) => {
      if (!listCode) return;

      const currentLearningList = learningList;
      const currentPlan = currentLearningList.find(
        (p) => p.listCode === listCode
      );

      if (!currentPlan) {
        console.warn(
          '[Spelling Context] loadWordsForSession: 未找到计划。 learningList 可能尚未刷新。'
        );
        toast.error('未找到当前书籍的学习计划。');
        endLearningSession();
        return;
      }

      let dueNewCount = 0;
      let dueReviewCount = 0;
      const totalDueNew = currentPlan.progress.dueNewCount || 0;
      const totalDueReview = currentPlan.progress.dueReviewCount || 0;
      const learnedToday = currentPlan.progress.learnedTodayCount || 0;

      if (action === 'activate') {
        dueNewCount = Math.max(0, totalDueNew - learnedToday);
        dueReviewCount = totalDueReview;
      } else if (
        action === 'reset' ||
        (typeof action === 'object' && action !== null)
      ) {
        const plan =
          action === 'reset' ? currentPlan.plan : (action as PlanDetails);
        const totalWords = currentPlan.book.totalWords;
        const remainingNewWords = 0 || totalWords;

        if (plan.type === 'customWords' && plan.value > 0) {
          dueNewCount = Math.min(plan.value, remainingNewWords);
        } else if (
          (plan.type === 'preset' || plan.type === 'customDays') &&
          plan.value > 0
        ) {
          const dailyQuota = Math.ceil(totalWords / plan.value);
          dueNewCount = Math.min(dailyQuota, remainingNewWords);
        } else {
          dueNewCount = Math.min(20, remainingNewWords);
        }
        dueReviewCount = action === 'reset' ? 0 : totalDueReview;
      }

      if (currentPlan.plan.reviewStrategy === 'NONE') {
        dueReviewCount = 0;
      }

      console.log(
        `[Spelling Context] 计算配额: new=${dueNewCount}, review=${dueReviewCount}`
      );

      if (dueNewCount === 0 && dueReviewCount === 0) {
        // toast('今天没有学习或复习任务！', { icon: '🎉' });
        setIsSessionComplete(true);
        return;
      }

      try {
        const data = await fetchLearningWords(
          listCode,
          dueNewCount,
          dueReviewCount
        );

        if (data.length === 0) {
          toast('今天没有学习或复习任务！', { icon: '🎉' });
          setIsSessionComplete(true);
          return;
        }

        resetSession(data);
        console.log(
          `[Spelling Context] Loaded ${data.length} words for session.`
        );
      } catch (error: unknown) {
        console.error('加载学习单词失败:', error);
        endLearningSession();
        toast.error((error as Error).message || '加载今日单词列表失败。');
      }
    },
    [learningList, endLearningSession, resetSession]
  );

  useEffect(() => {
    if (!isLearningSessionActive) {
      return;
    }

    if (mistakeReviewTrigger && mistakeReviewTrigger.words.length > 0) {
      console.log(
        `[Spelling Context] 监听到 mistakeReviewTrigger，加载 ${mistakeReviewTrigger.words.length} 个错题...`
      );
      resetSession(mistakeReviewTrigger.words);
    } else if (learningTrigger && learningTrigger.listCode) {
      const { listCode, action } = learningTrigger;
      console.log(
        '[Spelling Context] 监听到 learningTrigger:',
        listCode,
        action
      );
      if (action !== null) {
        loadWordsForSession(listCode, action);
      }
    }
  }, [
    isLearningSessionActive,
    mistakeReviewTrigger,
    learningTrigger,
    loadWordsForSession,
    resetSession,
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSupported(!!window.speechSynthesis);
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (startTime && isLearningSessionActive) {
      timer = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, isLearningSessionActive]);

  const handleWordFailure = useCallback(() => {
    const word = words[currentIndex];
    if (!word) return;
    setFailedWordsInSession((prevFailed) => {
      if (prevFailed.find((w) => w.progressId === word.progressId)) {
        return prevFailed;
      }
      console.log(`[Spelling Context] 将 "${word.text}" 加入本轮错题`);
      return [...prevFailed, word];
    });
  }, [words, currentIndex]);

  const handleNext = useCallback(() => {
    if (hasMadeMistakeRef.current) {
      handleWordFailure();
    }
    setHasMadeMistake(false);
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      if (failedWordsInSession.length > 0) {
        toast('开始复习本轮错题...', { icon: '🔁' });
        setWords((prevWords) => [...prevWords, ...failedWordsInSession]);
        setFailedWordsInSession([]);
        setCurrentIndex((prev) => prev + 1);
      } else {
        toast.success('任务已完成！');
        setIsSessionComplete(true);
      }
    }
  }, [
    words,
    currentIndex,
    failedWordsInSession,
    handleWordFailure,
    setHasMadeMistake,
  ]);

  const handlePrev = useCallback(() => {
    if (hasMadeMistakeRef.current) {
      handleWordFailure();
    }
    setHasMadeMistake(false);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, [handleWordFailure, setHasMadeMistake]);

  const incrementInputCount = useCallback(() => {
    setFailCount((prev) => prev + 1);
  }, []);

  const incrementCorrectCount = useCallback(() => {
    setSuccessCount((prev) => prev + 1);
  }, []);

  const updateWordProgressInContext = useCallback(
    async (quality: number) => {
      const word = words[currentIndex];
      if (!word || !word.progressId) {
        console.error('无法更新进度：缺少 word 或 progressId');
        return;
      }
      const progressId = word.progressId as number;
      try {
        console.log(
          `[Spelling Context] Updating progress for ID ${progressId}, quality ${quality}`
        );
        await updateWordProgress(progressId, quality);
      } catch (error: unknown) {
        console.error('后台同步单词进度失败:', error);
        toast.error(`同步进度失败: ${(error as Error).message}`, {
          duration: 2000,
        });
      }
    },
    [words, currentIndex]
  );

  const handleAdvanceToNextChapter = useCallback(async () => {
    const currentPlan = learningList.find((p) => p.listCode === currentBookId);
    if (!currentPlan) {
      toast.error('未找到当前计划。');
      return;
    }
    try {
      console.log(`[Spelling Context] Advancing plan ${currentPlan.planId}`);
      await advancePlan(currentPlan.planId);
      toast.success('已开启新章节！');

      if (refreshAllData) {
        await refreshAllData();
      }
    } catch (error: unknown) {
      console.error('推进章节失败:', error);
      toast.error((error as Error).message || '开启新章节失败。');
    }
  }, [currentBookId, refreshAllData, learningList]);

  const handleReturnToHome = useCallback(async () => {
    endLearningSession();
    setWords([]);
    setIsSessionComplete(false);
  }, [endLearningSession]);

  const stats = useMemo<Stats>(() => {
    const totalAttempts = failCount + successCount;
    const accuracyNum =
      totalAttempts === 0 ? 0 : (successCount / totalAttempts) * 100;
    const accuracy = Math.round(accuracyNum * 10) / 10;
    const currentPlan = learningList.find((p) => p.listCode === currentBookId);
    const masteredCount = currentPlan?.progress.masteredCount || 0;

    return {
      time: formatTime(timeElapsed),
      inputCount: totalAttempts,
      correctCount: successCount,
      masteredCount: masteredCount,
      accuracy,
    };
  }, [timeElapsed, failCount, successCount, currentBookId, learningList]);

  const currentWord = useMemo<Word | undefined>(() => {
    return words[currentIndex];
  }, [words, currentIndex]);

  const contextValue: SpellingContextType = {
    words,
    currentIndex,
    currentWord,
    stats,
    displayMode,
    speechConfig,
    speechSupported,
    isCustomSpeech,
    showSentences,
    isSessionComplete,
    showSentenceTranslation,
    hideWordInSentence,
    handleNext,
    handlePrev,
    startTimer,
    incrementInputCount,
    incrementCorrectCount,
    setSpeechConfig,
    setDisplayMode,
    setIsCustomSpeech,
    setShowSentences,
    setShowSentenceTranslation,
    setHideWordInSentence,
    updateWordProgressInContext,
    handleWordFailure,
    handleAdvanceToNextChapter,
    handleReturnToHome,
    setHasMadeMistake,
  };

  return (
    <SpellingContext.Provider value={contextValue}>
      {children}
    </SpellingContext.Provider>
  );
};

export const useSpelling = (): SpellingContextType => {
  const context = useContext(SpellingContext);
  if (context === undefined) {
    throw new Error('useSpelling 必须在 SpellingProvider 内部使用');
  }
  return context;
};
