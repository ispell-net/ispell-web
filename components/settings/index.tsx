'use client';
/*
 * @Date: 2025-10-27 02:37:15
 * @LastEditTime: 2025-11-05 17:48:15
 * @Description: 单词拼写功能的设置面板组件 (已添加“隐藏例句单词”开关)
 */

import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // [!!] 导入
import { useTranslations } from 'next-intl';
import { useSpelling } from '@/contexts/spelling.context';
import { AccentType, DisplayMode, GenderType } from '@/types/word.types';
import { Settings as SettingsIcon, X } from 'lucide-react';

/**
 * 选项配置 (不变)
 */
const SPEECH_SOURCE_OPTIONS = [
  { value: 'false' as const }, // 默认发音 (API)
  { value: 'true' as const }, // 自定义发音 (Browser)
];
const ACCENT_OPTIONS = [
  { value: 'en-US' as AccentType }, // 美式
  { value: 'en-GB' as AccentType }, // 英式
];
const GENDER_OPTIONS = [
  { value: 'auto' as GenderType }, // 随机
  { value: 'male' as GenderType }, // 男声
  { value: 'female' as GenderType }, // 女声
];
const DISPLAY_MODE_OPTIONS = [
  { value: 'full' as DisplayMode }, // 默认
  { value: 'hideVowels' as DisplayMode }, // 隐藏元音
  { value: 'hideConsonants' as DisplayMode }, // 隐藏辅音
  { value: 'hideRandom' as DisplayMode }, // 随机隐藏
  { value: 'hideAll' as DisplayMode }, // 全部隐藏
];

/**
 * 设置表单
 */
const SettingsForm = () => {
  const t = useTranslations('Settings');

  const {
    speechConfig,
    setSpeechConfig,
    displayMode,
    setDisplayMode,
    isCustomSpeech,
    setIsCustomSpeech,
    showSentences,
    setShowSentences,
    showSentenceTranslation,
    setShowSentenceTranslation,
    hideWordInSentence,
    setHideWordInSentence,
  } = useSpelling();

  const handleSpeechSourceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setIsCustomSpeech(e.target.value === 'true');
  };
  const handleRateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSpeechConfig((config) => ({
      ...config,
      rate: parseFloat(e.target.value),
    }));
  };
  const handleAccentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newAccent = e.target.value as AccentType;
    setSpeechConfig((config) => ({
      ...config,
      accent: newAccent,
      lang: newAccent,
    }));
  };
  const handleGenderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSpeechConfig((config) => ({
      ...config,
      gender: e.target.value as GenderType,
    }));
  };

  const handleDisplayModeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as DisplayMode;
    setDisplayMode(newMode);

    if (newMode !== 'full') {
      setHideWordInSentence(true);
    }
  };

  return (
    <div className="flex flex-col space-y-5">
      {/* 语音设置 */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          {t('sectionTitles.speechSettings')}
        </h3>
        <div className="space-y-4">
          <SelectItem
            label={t('labels.speechSource')}
            options={SPEECH_SOURCE_OPTIONS.map((option) => ({
              value: option.value,
              label:
                option.value === 'false'
                  ? t('options.speechSource.default')
                  : t('options.speechSource.custom'),
            }))}
            selectedValue={String(isCustomSpeech)}
            onChange={handleSpeechSourceChange}
          />
          <SelectItem
            label={t('labels.accent')}
            options={ACCENT_OPTIONS.map((option) => ({
              value: option.value,
              label:
                option.value === 'en-US'
                  ? t('options.accent.american')
                  : t('options.accent.british'),
            }))}
            selectedValue={speechConfig.accent}
            onChange={handleAccentChange}
          />
          {isCustomSpeech && (
            <>
              <SliderItem
                label={t('labels.speechRate')}
                value={speechConfig.rate}
                min={0.5}
                max={1.5}
                step={0.1}
                onChange={handleRateChange}
                displayValue={speechConfig.rate.toFixed(1)}
              />
              <SelectItem
                label={t('labels.voiceGender')}
                options={GENDER_OPTIONS.map((option) => ({
                  value: option.value,
                  label:
                    option.value === 'auto'
                      ? t('options.gender.auto')
                      : option.value === 'male'
                      ? t('options.gender.male')
                      : t('options.gender.female'),
                }))}
                selectedValue={speechConfig.gender}
                onChange={handleGenderChange}
              />
            </>
          )}
        </div>
      </section>

      {/* 单词显示设置 */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          {t('sectionTitles.displaySettings')}
        </h3>
        <div className="space-y-4">
          <SelectItem
            label={t('labels.displayMode')}
            options={DISPLAY_MODE_OPTIONS.map((option) => ({
              value: option.value,
              label: t(`options.displayMode.${option.value}`),
            }))}
            selectedValue={displayMode}
            onChange={handleDisplayModeChange}
          />
          <ToggleItem
            label={t('labels.hideWordInSentence')}
            checked={hideWordInSentence}
            onChange={setHideWordInSentence}
          />
        </div>
      </section>

      {/* 内容设置 */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          {t('sectionTitles.sentenceSettings')}
        </h3>
        <div className="space-y-4">
          <ToggleItem
            label={t('labels.showSentences')}
            checked={showSentences}
            onChange={setShowSentences}
          />
          <ToggleItem
            label={t('labels.showSentenceTranslation')}
            checked={showSentenceTranslation}
            onChange={setShowSentenceTranslation}
          />
        </div>
      </section>
    </div>
  );
};

// (SliderItem, SelectItem, ToggleItem ... 辅助组件保持不变)
interface SliderItemProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  displayValue: string;
}
function SliderItem({
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayValue,
}: SliderItemProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </label>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-gray-900 dark:accent-gray-500"
      />
    </div>
  );
}

interface SelectItemProps<T extends string> {
  label: string;
  options: { label: string; value: T }[];
  selectedValue: T;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}
function SelectItem<T extends string>({
  label,
  options,
  selectedValue,
  onChange,
}: SelectItemProps<T>) {
  const lightArrow = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`;
  const darkArrow = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`;

  return (
    <div>
      <label
        htmlFor={label}
        className="text-sm font-medium text-gray-900 dark:text-white block mb-1.5"
      >
        {label}
      </label>
      <select
        id={label}
        value={selectedValue}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 py-2.5 px-3 pr-10 text-gray-900 focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-gray-600 dark:focus:ring-gray-600 appearance-none bg-no-repeat bg-right bg-[length:1.5em_1.5em]"
        style={{ backgroundImage: `var(--select-arrow, ${lightArrow})` }}
        onFocus={(e) => {
          const isDark =
            document.documentElement.getAttribute('data-theme') === 'dark';
          e.target.style.setProperty(
            '--select-arrow',
            isDark ? darkArrow : lightArrow
          );
        }}
        onClick={(e) => {
          const isDark =
            document.documentElement.getAttribute('data-theme') === 'dark';
          (e.target as HTMLSelectElement).style.setProperty(
            '--select-arrow',
            isDark ? darkArrow : lightArrow
          );
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ToggleItemProps {
  label: string;
  checked: boolean;
  onChange: Dispatch<SetStateAction<boolean>>;
}
function ToggleItem({ label, checked, onChange }: ToggleItemProps) {
  return (
    <div className="flex items-center justify-between">
      <label
        htmlFor={label}
        className="text-sm font-medium text-gray-900 dark:text-white"
      >
        {label}
      </label>
      <button
        id={label}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange((prev) => !prev)}
        className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
          checked
            ? 'bg-gray-900 dark:bg-gray-700'
            : 'bg-gray-200 dark:bg-gray-600'
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

/**
 * 设置面板主组件 (抽屉)
 */
const Settings = () => {
  const t = useTranslations('Settings');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      {/* 触发器 */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        aria-label={t('aria.openSettings')}
        className="fixed bottom-6 right-4 sm:right-6 p-3 bg-gray-900 dark:bg-gray-700 text-white rounded-full shadow-lg group transition-all duration-300  hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-600 focus:ring-offset-2 z-30"
      >
        <SettingsIcon className="transition-transform duration-300 group-hover:rotate-90" />
      </button>

      {/* 抽屉 */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              aria-hidden="true"
            />

            {/* 抽屉面板 (从右侧滑入) */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700"
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-drawer-title"
            >
              {/* 抽屉标题栏 */}
              <div className="flex items-center justify-between p-4 shrink-0">
                <h2
                  id="settings-drawer-title"
                  className="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  {t('aria.openSettings')}
                </h2>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label={t('aria.closeSettings')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 抽屉内容区 (滚动) */}
              <div className="flex-1 p-4 overflow-y-auto border-t border-gray-200 dark:border-gray-700">
                <SettingsForm />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Settings;
