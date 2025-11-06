'use client';
/*
 * @Date: 2025-10-30 10:24:15
 * @LastEditTime: 2025-11-06 23:44:09
 * @Description: 学习计划设置视图 ([!! 已修改 !!] 限制每日单词数最大值 + 添加单词列表)
 */

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { useAppContext } from '@/contexts/app.context';
// [!! 修改 !!] 导入 Book 和 PlanDetails (根据您的类型文件)
import type { Book, PlanDetails } from '@/types/book.types';

// [!! 1. 新增导入 !!]
import { List } from 'lucide-react'; // 导入图标
import BookWordsModal from './BookWordsModal'; // 导入新模态框 (请检查路径)

/** 预设的计划天数 */
const PRESET_DAYS = [15, 30, 45, 60, 75, 90];

/** 复习策略ID定义 */
type ReviewStrategyId = 'NONE' | 'EBBINGHAUS' | 'SM2' | 'LEITNER';

/** 复习策略配置 */
const REVIEW_STRATEGIES: Array<{ id: ReviewStrategyId; recommended: boolean }> =
  [
    { id: 'NONE', recommended: false },
    { id: 'EBBINGHAUS', recommended: true },
    { id: 'SM2', recommended: false },
    { id: 'LEITNER', recommended: false },
  ];

/** 计划设置视图的 Props */
interface PlanSetupViewProps {
  book: Book; // [!!] 此类型来自您提供的文件
  onStart: (plan: PlanDetails) => void;
  onCancel: () => void;
  initialPlan?: PlanDetails | null;
}

const PlanSetupView: React.FC<PlanSetupViewProps> = ({
  book,
  onStart,
  onCancel,
  initialPlan = null,
}) => {
  const { isLoggedIn, openLoginModal } = useAppContext();
  const t = useTranslations('BookSelection');

  // [!! 2. 新增状态 !!]
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);

  // --- 状态管理 ---
  // (这些类型 'preset' 等完全匹配您提供的 PlanDetails 类型)
  const [planType, setPlanType] = useState<
    'preset' | 'customDays' | 'customWords'
  >(initialPlan?.type || 'preset');
  const [presetDays, setPresetDays] = useState<number>(
    initialPlan?.type === 'preset' ? initialPlan.value : 60
  );
  const [customDays, setCustomDays] = useState<string>(
    initialPlan?.type === 'customDays' ? initialPlan.value.toString() : ''
  );
  const [customWords, setCustomWords] = useState<string>(
    initialPlan?.type === 'customWords' ? initialPlan.value.toString() : ''
  );
  const [reviewStrategy, setReviewStrategy] = useState<ReviewStrategyId>(
    (initialPlan?.reviewStrategy as ReviewStrategyId) || 'EBBINGHAUS'
  );
  const [learningOrder, setLearningOrder] = useState<'SEQUENTIAL' | 'RANDOM'>(
    initialPlan?.learningOrder || 'SEQUENTIAL'
  );

  const isEditing = !!initialPlan;

  // --- 当初始计划变化时重置表单 ---
  useEffect(() => {
    if (initialPlan) {
      setPlanType(initialPlan.type);
      setReviewStrategy(initialPlan.reviewStrategy as ReviewStrategyId);
      setLearningOrder(initialPlan.learningOrder);

      if (initialPlan.type === 'preset') {
        setPresetDays(initialPlan.value);
        setCustomDays('');
        setCustomWords('');
      } else if (initialPlan.type === 'customDays') {
        setCustomDays(initialPlan.value.toString());
        setPresetDays(60);
        setCustomWords('');
      } else {
        setCustomWords(initialPlan.value.toString());
        setPresetDays(60);
        setCustomDays('');
      }
    } else {
      setPlanType('preset');
      setPresetDays(60);
      setCustomDays('');
      setCustomWords('');
      setReviewStrategy('EBBINGHAUS');
      setLearningOrder('SEQUENTIAL');
    }
  }, [initialPlan]);

  // --- [!! 1. 修改 !!] 处理数字输入 (增加 max 参数) ---
  const handleNumericChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string,
    max: number | undefined = undefined // 增加可选的 max 参数
  ) => {
    if (value === '') {
      setter('');
      return;
    }
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      // 检查是否超过最大值
      if (max !== undefined && num > max) {
        setter(max.toString()); // 如果超过，则设置为最大值
      } else {
        setter(num.toString()); // 否则，设置为有效值
      }
    }
    // 忽略 0 或无效输入
  };

  // --- 计算派生数据 ---
  let wordsPerDay: number = 0;
  let totalDays: number = 0;
  if (planType === 'preset' && presetDays > 0) {
    wordsPerDay = Math.ceil(book.totalWords / presetDays);
  } else if (planType === 'customDays' && Number(customDays) > 0) {
    wordsPerDay = Math.ceil(book.totalWords / Number(customDays));
  } else if (planType === 'customWords' && Number(customWords) > 0) {
    totalDays = Math.ceil(book.totalWords / Number(customWords));
  }

  // --- 按钮点击处理（区分登录状态） ---
  const handleConfirmClick = () => {
    if (!isLoggedIn) {
      // 未登录：直接打开登录弹窗
      openLoginModal();
      return;
    }

    // 已登录：验证并提交计划
    let planBase: Omit<PlanDetails, 'reviewStrategy' | 'learningOrder'>;

    if (planType === 'preset') {
      planBase = { type: 'preset', value: presetDays };
    } else if (planType === 'customDays') {
      const daysNum = Number(customDays);
      if (isNaN(daysNum) || daysNum <= 0) {
        toast.error(t('PlanSetupView.errors.invalidCustomDays'));
        return;
      }
      planBase = { type: 'customDays', value: daysNum };
    } else {
      const wordsNum = Number(customWords);
      if (isNaN(wordsNum) || wordsNum <= 0 || wordsNum > book.totalWords) {
        // [!!] 增加校验
        toast.error(t('PlanSetupView.errors.invalidCustomWords'));
        return;
      }
      planBase = { type: 'customWords', value: wordsNum };
    }

    const plan: PlanDetails = {
      ...planBase,
      reviewStrategy: reviewStrategy as PlanDetails['reviewStrategy'],
      learningOrder: learningOrder,
    };
    onStart(plan);
  };

  // 当前选中的复习策略描述
  const currentStrategyDescription = t(
    `PlanSetupView.reviewStrategies.${reviewStrategy}.description`
  );

  // 动态按钮文本
  const confirmButtonText = isLoggedIn
    ? isEditing
      ? t('PlanSetupView.buttons.updatePlan')
      : t('PlanSetupView.buttons.createPlan')
    : t('PlanSetupView.buttons.loginToCreate');

  return (
    // [!! 3. 添加 Fragment 容器 !!]
    <>
      {/* 样式保持上一次修改的结果 (带边框和背景) */}
      <div className="flex flex-col p-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
        {/* [!! 4. 修改标题区域 !!] */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing
              ? t('PlanSetupView.titles.editPlan', { bookName: book.name })
              : t('PlanSetupView.titles.createPlan', { bookName: book.name })}
          </h3>

          {/* [!! 5. 新增按钮 !!] */}
          <button
            onClick={() => setIsWordModalOpen(true)}
            className="flex items-center px-3 py-1 text-xs rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            // 提示：您需要添加 "PlanSetupView.buttons.viewWords" 到您的语言包
            title={t('PlanSetupView.buttons.viewWords', {
              count: book.totalWords,
            })}
          >
            <List className="w-3 h-3 mr-1.5" />
            {t('PlanSetupView.buttons.viewWords', {
              count: book.totalWords, // [!!] 使用 book.totalWords
            })}
          </button>
        </div>

        {/* 预设计划选择 */}
        <section>
          <h4 className="text-base font-semibold text-gray-600 dark:text-gray-300 mb-3">
            {t('PlanSetupView.sectionTitles.generalPlan')}
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {PRESET_DAYS.map((days) => (
              <button
                key={days}
                onClick={() => {
                  setPlanType('preset');
                  setPresetDays(days);
                }}
                className={`
                p-3 rounded-lg border-2 text-center transition-colors
                ${
                  planType === 'preset' && presetDays === days
                    ? 'bg-gray-200 border-gray-400 dark:bg-gray-500 dark:border-gray-400'
                    : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  {`${days} ${t('PlanSetupView.presetPlan.dayUnit')}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {days > 0
                    ? t('PlanSetupView.presetPlan.wordsPerDay', {
                        count: Math.ceil(book.totalWords / days),
                      })
                    : '-'}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* 自定义计划设置 */}
        <section className="mt-6">
          <h4 className="text-base font-semibold text-gray-600 dark:text-gray-300 mb-3">
            {t('PlanSetupView.sectionTitles.customPlan')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 自定义天数 */}
            <div
              onClick={() => setPlanType('customDays')}
              className="p-3 rounded-lg border dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="planType"
                    readOnly
                    checked={planType === 'customDays'}
                    className="form-radio text-gray-900 dark:text-gray-100"
                  />
                  <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                    {t('PlanSetupView.customPlan.customDays')}
                  </span>
                </label>
                <input
                  type="number"
                  value={customDays}
                  onChange={(e) =>
                    // [!! 修改 !!] 不传递 max
                    handleNumericChange(setCustomDays, e.target.value)
                  }
                  onFocus={() => setPlanType('customDays')}
                  disabled={planType !== 'customDays'}
                  className="w-28 text-center p-1 rounded bg-gray-200 dark:bg-gray-600 disabled:opacity-50"
                  placeholder={t('PlanSetupView.placeholders.days')}
                  min="1"
                />
              </div>
              {planType === 'customDays' && wordsPerDay > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {t('PlanSetupView.customPlan.wordsPerDay', {
                    count: wordsPerDay,
                  })}
                </p>
              )}
            </div>

            {/* 自定义每日单词数 */}
            <div
              onClick={() => setPlanType('customWords')}
              className="p-3 rounded-lg border dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="planType"
                    readOnly
                    checked={planType === 'customWords'}
                    className="form-radio text-gray-900 dark:text-gray-100"
                  />
                  <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                    {t('PlanSetupView.customPlan.dailyWords')}
                  </span>
                </label>
                {/* [!! 2. 修改 !!] 添加 max 属性并更新 onChange */}
                <input
                  type="number"
                  value={customWords}
                  onChange={(e) =>
                    handleNumericChange(
                      setCustomWords,
                      e.target.value,
                      book.totalWords // [!!] 使用 book.totalWords
                    )
                  }
                  onFocus={() => setPlanType('customWords')}
                  disabled={planType !== 'customWords'}
                  className="w-28 text-center p-1 rounded bg-gray-200 dark:bg-gray-600 disabled:opacity-50"
                  placeholder={t('PlanSetupView.placeholders.words')}
                  min="1"
                  max={book.totalWords} // [!!] 使用 book.totalWords
                />
              </div>
              {planType === 'customWords' && totalDays > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {t('PlanSetupView.customPlan.totalDays', {
                    count: totalDays,
                  })}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 学习顺序选择 */}
        <section className="mt-6">
          <h4 className="text-base font-semibold text-gray-600 dark:text-gray-300 mb-3">
            {t('PlanSetupView.sectionTitles.learningOrder')}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLearningOrder('SEQUENTIAL')}
              className={`p-3 rounded-lg border-2 text-center transition-colors ${
                learningOrder === 'SEQUENTIAL'
                  ? 'bg-gray-200 border-gray-400 dark:bg-gray-500 dark:border-gray-400'
                  : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <p className="font-medium text-gray-900 dark:text-white">
                {t('PlanSetupView.learningOrder.sequential.name')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('PlanSetupView.learningOrder.sequential.desc')}
              </p>
            </button>
            <button
              onClick={() => setLearningOrder('RANDOM')}
              className={`p-3 rounded-lg border-2 text-center transition-colors ${
                learningOrder === 'RANDOM'
                  ? 'bg-gray-200 border-gray-400 dark:bg-gray-500 dark:border-gray-400'
                  : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <p className="font-medium text-gray-900 dark:text-white">
                {t('PlanSetupView.learningOrder.random.name')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('PlanSetupView.learningOrder.random.desc')}
              </p>
            </button>
          </div>
        </section>

        {/* 复习策略选择 */}
        <section className="mt-6 space-y-3">
          <div className="flex items-center">
            <label
              htmlFor="reviewStrategy"
              className="text-base font-semibold text-gray-600 dark:text-gray-300"
            >
              {t('PlanSetupView.sectionTitles.reviewStrategy')}
            </label>
          </div>
          <select
            id="reviewStrategy"
            value={reviewStrategy}
            onChange={(e) =>
              setReviewStrategy(e.target.value as ReviewStrategyId)
            }
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {REVIEW_STRATEGIES.map((strategy) => (
              <option key={strategy.id} value={strategy.id}>
                {strategy.recommended
                  ? `${t(
                      `PlanSetupView.reviewStrategies.${strategy.id}.name`
                    )} (${t('PlanSetupView.reviewStrategies.recommended')})`
                  : t(`PlanSetupView.reviewStrategies.${strategy.id}.name`)}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
            {currentStrategyDescription}
          </p>
        </section>

        {/* 操作按钮 */}
        <div className="pt-8 flex space-x-3">
          {/* 取消按钮 */}
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100 font-medium transition-colors hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            {t('PlanSetupView.buttons.cancel')}
          </button>
          {/* 确认/登录按钮 */}
          <button
            onClick={handleConfirmClick}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>

      {/* [!! 6. 渲染新模态框 !!] */}
      <BookWordsModal
        isOpen={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
        listCode={book.listCode} // [!!] 使用 book.listCode
        bookName={book.name} // [!!] 使用 book.name
      />
    </>
  );
};

export default PlanSetupView;
