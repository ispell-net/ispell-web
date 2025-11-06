/*
 * @Date: 2025-10-26 10:03:34
 * @LastEditTime: 2025-11-05 08:45:09
 * @Description: 单词学习统计卡片组件（支持国际化，已替换为剩余单词数）
 */
import { useTranslations } from 'next-intl';
import { useSpelling } from '@/contexts/spelling.context';

export default function StatsCard() {
  const t = useTranslations('Words'); // 关联到Words命名空间
  // 新增获取words数组（本次练习的总单词列表）
  const { stats, words } = useSpelling();
  const { time, inputCount, correctCount, accuracy } = stats;

  // 计算剩余单词数：总单词数 - 已正确拼写数，确保不小于0
  const remainingWords = Math.max(0, words.length - correctCount);

  return (
    <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-6 transform transition-all duration-300 hover:shadow-xl mb-6">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
        {/* 1. 计时 */}
        <div className="text-center p-1 sm:p-2">
          <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
            {time}
          </p>
          <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400">
            {t('statsCard.timing')}
          </p>
        </div>
        {/* 2. 尝试次数 */}
        <div className="text-center p-1 sm:p-2">
          <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
            {inputCount}
          </p>
          <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400">
            {t('statsCard.attempts')}
          </p>
        </div>
        {/* 3. 正确拼写 */}
        <div className="text-center p-1 sm:p-2">
          <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
            {correctCount}
          </p>
          <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400">
            {t('statsCard.correctSpelling')}
          </p>
        </div>
        {/* 4. 剩余单词（替换原“已掌握”） */}
        <div className="text-center p-1 sm:p-2">
          <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
            {remainingWords}
          </p>
          <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400">
            {t('statsCard.remainingWords')} {/* 新增国际化key */}
          </p>
        </div>
        {/* 5. 正确率 */}
        <div className="text-center p-1 sm:p-2">
          <p className="text-lg sm:text-2xl font-semibold text-green-500 dark:text-green-400 mb-0.5 sm:mb-1">
            {accuracy}%
          </p>
          <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400">
            {t('statsCard.accuracy')}
          </p>
        </div>
      </div>
    </div>
  );
}
