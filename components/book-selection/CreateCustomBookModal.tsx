// src/components/BookSelectionDrawer/CreateCustomBookModal.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  X,
  Check,
  FileText,
  ChevronRight,
  Upload,
  Download,
  Edit,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAppContext } from '@/contexts/app.context';
import {
  validateWordsInBulk,
  createCustomWordList,
  updateCustomWordList,
} from '@/services/bookService';

import type {
  ValidationResult,
  Language,
  CommunityList,
} from '@/types/book.types';

const MAX_WORDS = 5000; // 最大上传单词数量

interface CreateCustomBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (listCode: string) => void;
  languages: Language[]; // 从数据库获取的语言列表
  isEditMode?: boolean; // 新增：是否为编辑模式
  editBook?: CommunityList | null; // 新增：当前编辑的书籍数据
}

// 步骤状态
type Step = 'upload' | 'validate' | 'form';

/**
 * 生成 5 位不重复的随机数字字符串
 */
const generateRandomSuffix = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

/**
 * 创建/修改自定义单词书的模态框
 */
const CreateCustomBookModal: React.FC<CreateCustomBookModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  languages,
  isEditMode = false, // 默认为创建模式
  editBook = null,
}) => {
  const t = useTranslations('BookSelection');
  const tCommon = useTranslations('common');
  const { accessToken } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // [关键修复] 使用 useRef 标记是否已成功提交
  const submittedRef = useRef(false);

  // 步骤和数据状态
  const [step, setStep] = useState<Step>('upload');
  const [rawWordInput, setRawWordInput] = useState('');
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [listName, setListName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // 语言代码自动取第一个可用语言
  const [languageCode, setLanguageCode] = useState(languages[0]?.code || '');

  // 示例 TXT 文件的 Data URI (单词: about, a, bird, dog)
  const exampleTxtData =
    'data:text/plain;charset=utf-8,about%0D%0Aa%0D%0Abird%0D%0Adog';

  // 初始化语言代码
  useEffect(() => {
    if (isOpen) {
      submittedRef.current = false; // 每次打开 Modal 时重置提交标记

      if (languages.length > 0) {
        if (isEditMode && editBook) {
          // 编辑模式状态初始化
          setLanguageCode(editBook.languageCode || languages[0].code);
        } else if (!languageCode) {
          // 创建模式默认语言初始化
          setLanguageCode(languages[0].code);
        }
      }

      // 编辑模式内容初始化
      if (isEditMode && editBook) {
        setStep('form');
        setListName(editBook.name);
        setDescription(editBook.description || '');
        setIsPublic(editBook.status === 'PUBLIC');
        // 模拟校验结果，只为显示匹配单词数量
        setValidationResult({
          matchedWords: Array.from({ length: editBook.totalWords }, (_, i) => ({
            id: i,
            text: 'N/A',
          })),
          unmatchedWords: [],
        });
        setRawWordInput('DISABLED'); // 禁用上传区域
      } else {
        // 确保创建模式的初始状态正确
        setStep('upload');
        setListName('');
        setDescription('');
        setIsPublic(false);
        setValidationResult(null);
        setRawWordInput('');
      }
    }
  }, [isOpen, isEditMode, editBook, languages]);

  const handleCloseModal = () => {
    // 外部关闭时，确保内部状态重置
    setStep('upload');
    setValidationResult(null);
    setRawWordInput('');
    onClose();
  };

  /**
   * 处理上传/粘贴文本
   */
  const handleWordInput = (text: string) => {
    setRawWordInput(text);
  };

  /**
   * 处理文件上传
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      file.type !== 'text/plain' &&
      file.name.split('.').pop()?.toLowerCase() !== 'txt'
    ) {
      toast.error(t('CreateCustomBookModal.errors.unsupportedFile'));
      event.target.value = ''; // 清空文件输入
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      handleWordInput(text);
      toast.success(t('CreateCustomBookModal.toast.fileLoaded'));
    };
    reader.onerror = () => {
      toast.error(t('CreateCustomBookModal.errors.fileReadFailed'));
    };
    reader.readAsText(file);
    event.target.value = ''; // 清空，以便下次选择同名文件
  };

  /**
   * 校验单词列表
   */
  const handleValidationStep = async () => {
    if (!rawWordInput.trim()) {
      toast.error(t('CreateCustomBookModal.errors.emptyWords'));
      return;
    }
    if (!languageCode) {
      toast.error(t('CreateCustomBookModal.errors.noLanguageAvailable'));
      return;
    }

    const words = rawWordInput
      .split(/\s+/) // 按空格或换行符分割
      .map((w) => w.trim())
      .filter((w) => w.length > 0)
      .slice(0, MAX_WORDS); // 限制最大数量

    if (words.length === 0) {
      toast.error(t('CreateCustomBookModal.errors.emptyWords'));
      return;
    }

    const loadingToastId = toast.loading(
      t('CreateCustomBookModal.toast.validating')
    );
    try {
      const result: ValidationResult = await validateWordsInBulk({
        words,
        languageCode, // 校验语言
      });

      setValidationResult(result);
      setStep('validate');
      toast.dismiss(loadingToastId);
    } catch (error) {
      toast.dismiss(loadingToastId);
      // 校验失败时，确保 validationResult 为 null
      setValidationResult(null);
      toast.error(t('CreateCustomBookModal.toast.validationFailed'));
      console.error('Validation failed:', error);
    }
  };

  /**
   * 创建/修改 单词书
   */
  const handleConfirmClick = async () => {
    // [关键修复] 如果已经成功提交过，则立即退出，防止严格模式下的重复调用
    if (submittedRef.current) {
      return;
    }

    if (!listName.trim()) {
      toast.error(t('CreateCustomBookModal.errors.missingDetails'));
      return;
    }

    if (!accessToken) {
      toast.error(tCommon('toast.loginRequired'));
      return;
    }

    const loadingToastId = toast.loading(
      isEditMode
        ? t('toast.updatingPlan')
        : t('CreateCustomBookModal.toast.creating')
    );

    let updatedListCode = editBook?.listCode || 'new';

    try {
      if (isEditMode && editBook) {
        // --- 编辑模式 ---
        const updateParams = {
          listCode: editBook.listCode,
          listName: listName,
          isPublic: isPublic,
          description: description || undefined,
        };

        await updateCustomWordList(accessToken!, updateParams);
        toast.dismiss(loadingToastId);
        // 移除子组件的成功 Toast
        updatedListCode = editBook.listCode;
      } else {
        // --- 创建模式 ---
        if (!validationResult || validationResult.matchedWords.length === 0) {
          toast.dismiss(loadingToastId);
          toast.error(t('CreateCustomBookModal.steps.validate.noMatchError'));
          return;
        }
        const wordIds = validationResult.matchedWords.map((w) => w.id);

        const newBook = await createCustomWordList(accessToken!, {
          listName,
          wordIds,
          isPublic,
          languageCode,
          description,
        });
        toast.dismiss(loadingToastId);
        // 移除子组件的成功 Toast
        updatedListCode = newBook.listCode;
      }

      // 标记成功提交
      submittedRef.current = true;

      // 确保只调用一次 onSuccess 和 handleCloseModal
      onSuccess(updatedListCode);
      handleCloseModal();
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error(
        isEditMode
          ? t('CreateCustomBookModal.toast.updateFailed')
          : t('CreateCustomBookModal.toast.creationFailed')
      );
      console.error('Operation failed:', error);
    }
  };

  /**
   * 渲染上传/粘贴步骤
   */
  const renderUploadStep = () => {
    // 查找当前语言名称
    const currentLanguage = languages.find((l) => l.code === languageCode);

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold">
          {t('CreateCustomBookModal.steps.upload.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('CreateCustomBookModal.steps.upload.description')}
        </p>

        {/* 语言选择 (第一步) */}
        <div className="space-y-1">
          <label htmlFor="language-upload" className="text-sm font-medium">
            {t('CreateCustomBookModal.steps.form.language')}
          </label>
          <select
            id="language-upload"
            value={languageCode}
            onChange={(e) => setLanguageCode(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {languages.length === 0 ? (
              <option disabled>
                {t('CreateCustomBookModal.errors.loadingLanguages')}
              </option>
            ) : (
              languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* 粘贴区域 */}
        <textarea
          value={rawWordInput}
          onChange={(e) => handleWordInput(e.target.value)}
          rows={10}
          placeholder={t('CreateCustomBookModal.steps.upload.placeholder')}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('CreateCustomBookModal.steps.upload.wordCount', {
            count: rawWordInput.split(/\s+/).filter((w) => w.length > 0).length,
            max: MAX_WORDS,
          })}
        </p>

        {/* 文件上传和示例下载按钮 */}
        <div className="flex justify-start space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt, text/plain"
            className="hidden"
          />
          {/* 上传文件按钮 (黑灰色调) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 px-4 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-sm hover:bg-gray-700 dark:text-gray-900 dark:bg-white dark:hover:bg-gray-300 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>{t('CreateCustomBookModal.buttons.uploadFile')}</span>
          </button>

          {/* 下载示例按钮 (次要样式) */}
          <a
            href={exampleTxtData}
            download="wordlist_example.txt"
            className="flex items-center space-x-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t('CreateCustomBookModal.buttons.downloadExample')}</span>
          </a>
        </div>

        {/* 按钮 */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleValidationStep}
            disabled={!rawWordInput.trim() || !languageCode}
            className="flex items-center space-x-2 px-6 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-300 disabled:opacity-50"
          >
            <span>{tCommon('buttons.next')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  /**
   * 渲染校验步骤
   */
  const renderValidationStep = () => {
    if (!validationResult) return null;

    const { matchedWords, unmatchedWords } = validationResult;
    const totalWords = matchedWords.length + unmatchedWords.length;
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold">
          {t('CreateCustomBookModal.steps.validate.title')}
        </h3>
        <div className="p-4 rounded-lg bg-gray-200 dark:bg-gray-700 space-y-2">
          <p className="text-base font-semibold">
            {t('CreateCustomBookModal.steps.validate.totalWords', {
              count: totalWords,
            })}
          </p>
          {/* 成功匹配数量使用中性色 */}
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('CreateCustomBookModal.steps.validate.matched', {
              count: matchedWords.length,
            })}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">
            {t('CreateCustomBookModal.steps.validate.unmatched', {
              count: unmatchedWords.length,
            })}
          </p>
        </div>

        {matchedWords.length === 0 ? (
          <p className="text-red-600 dark:text-red-400 font-medium">
            {t('CreateCustomBookModal.steps.validate.noMatchError')}
          </p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('CreateCustomBookModal.steps.validate.proceedMessage', {
              count: matchedWords.length,
            })}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 查看已匹配单词 */}
          {matchedWords.length > 0 && (
            <details className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
              <summary className="font-medium text-gray-700 dark:text-gray-300">
                {t('CreateCustomBookModal.steps.validate.matchedDetails')}
              </summary>
              <div className="mt-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto">
                {matchedWords.map((word) => word.text).join(', ')}
              </div>
            </details>
          )}

          {/* 展示未匹配单词 */}
          {unmatchedWords.length > 0 && (
            <details className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
              <summary className="font-medium text-red-500 dark:text-red-300">
                {t('CreateCustomBookModal.steps.validate.unmatchedDetails')}
              </summary>
              <div className="mt-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto">
                {unmatchedWords.join(', ')}
              </div>
            </details>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={() => setStep('upload')}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            {tCommon('buttons.back')}
          </button>
          <button
            onClick={() => {
              // 自动生成带随机数的默认名称
              const newDefaultName =
                t('CreateCustomBookModal.steps.form.defaultName') +
                '_' +
                generateRandomSuffix();
              setListName(listName || newDefaultName);
              setStep('form');
            }}
            disabled={matchedWords.length === 0}
            className="flex items-center space-x-2 px-6 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-300 disabled:opacity-50"
          >
            <span>{tCommon('buttons.next')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  /**
   * 渲染表单步骤
   */
  const renderFormStep = () => {
    if (!validationResult) return null;

    const buttonText = isEditMode
      ? tCommon('buttons.save')
      : tCommon('buttons.create');
    const titleText = isEditMode
      ? t('CreateCustomBookModal.titles.edit')
      : t('CreateCustomBookModal.steps.form.title');

    // 查找当前语言名称
    const currentLanguage = languages.find((l) => l.code === languageCode);

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold">{titleText}</h3>

        {/* 匹配单词数量提示 */}
        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
          {t('CreateCustomBookModal.steps.form.matchedCount', {
            count: validationResult.matchedWords.length || 0,
          })}
        </p>

        {/* 词表名称 */}
        <div className="space-y-1">
          <label htmlFor="listName" className="text-sm font-medium">
            {t('CreateCustomBookModal.steps.form.listName')}
          </label>
          <input
            id="listName"
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder={t('CreateCustomBookModal.steps.form.namePlaceholder')}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            maxLength={50}
          />
        </div>

        {/* 描述 (可选) */}
        <div className="space-y-1">
          <label htmlFor="description" className="text-sm font-medium">
            {t('CreateCustomBookModal.steps.form.description')}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={t('CreateCustomBookModal.steps.form.descPlaceholder')}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            maxLength={200}
          />
        </div>

        {/* 语言信息 (只读显示) */}
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {t('CreateCustomBookModal.steps.form.language')}
          </p>
          <div className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {currentLanguage ? currentLanguage.name : '未知语言'} (已锁定)
          </div>
        </div>

        {/* 公开/私有切换 */}
        <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
          <input
            id="isPublic"
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="form-checkbox h-5 w-5 text-gray-900 dark:text-gray-100 rounded"
            disabled={isEditMode && editBook?.status === 'PUBLIC'} // 公开后不能取消公开
          />
          <label htmlFor="isPublic" className="text-sm font-medium">
            {t('CreateCustomBookModal.steps.form.isPublic')}
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            {isPublic
              ? t('CreateCustomBookModal.steps.form.publicDescCommunity') // 使用新的公开文案
              : t('CreateCustomBookModal.steps.form.privateDesc')}
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={isEditMode ? handleCloseModal : () => setStep('validate')}
            // 编辑模式下不能返回校验，只能取消
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            {isEditMode ? tCommon('buttons.cancel') : tCommon('buttons.back')}
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={!listName.trim()}
            // 修正：使用黑灰色调
            className="flex items-center space-x-2 px-6 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-300 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{buttonText}</span>
          </button>
        </div>
      </div>
    );
  };

  /**
   * 渲染当前步骤内容
   */
  const renderStepContent = () => {
    // 强制跳转到 form
    if (isEditMode && step !== 'form') {
      return renderFormStep();
    }

    switch (step) {
      case 'upload':
        return renderUploadStep();
      case 'validate':
        return renderValidationStep();
      case 'form':
        return renderFormStep();
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        // 增大 Modal 宽度
        className="relative w-full max-w-xl lg:max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
      >
        {/* 头部 */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditMode
              ? t('CreateCustomBookModal.titles.edit')
              : t('CreateCustomBookModal.title')}
          </h2>
          <button
            onClick={handleCloseModal}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 步骤指示器 (编辑模式下隐藏) */}
        {!isEditMode && (
          <div className="flex items-start p-4 border-b border-gray-200 dark:border-gray-700">
            {[
              {
                id: 'upload',
                label: t('CreateCustomBookModal.stepLabels.upload'),
              },
              {
                id: 'validate',
                label: t('CreateCustomBookModal.stepLabels.validate'),
              },
              { id: 'form', label: t('CreateCustomBookModal.stepLabels.form') },
            ].map((stepItem, index) => {
              const stepOrder = ['upload', 'validate', 'form'];
              const currentStepIndex = stepOrder.indexOf(step);
              const itemStepIndex = stepOrder.indexOf(stepItem.id);
              const isCurrent = step === stepItem.id;
              const isCompleted = itemStepIndex < currentStepIndex;

              return (
                <React.Fragment key={stepItem.id}>
                  {/* 虚线连接 (第一步之前不显示) */}
                  {index > 0 && (
                    <div className="flex-grow border-t-2 border-dashed border-gray-300 dark:border-gray-600 mt-4 mx-2" />
                  )}

                  {/* 步骤 1, 2, 3 */}
                  <div
                    className="flex flex-col items-center flex-shrink-0"
                    style={{ width: '80px' }}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isCurrent
                          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 ring-4 ring-gray-300 dark:ring-gray-500'
                          : isCompleted
                          ? 'bg-gray-700 text-white dark:bg-gray-900' // 修正：已完成使用黑灰色调
                          : 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                    </div>
                    <span
                      className={`mt-1.5 text-xs text-center ${
                        isCurrent
                          ? 'text-gray-900 dark:text-white font-medium'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {stepItem.label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* 内容 */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateCustomBookModal;
