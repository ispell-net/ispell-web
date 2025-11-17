/*
 * @Date: 2025-11-11 14:26:26
 * @LastEditTime: 2025-11-12 19:27:51
 * @Description: 社区词表浏览组件
 */

'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { PlusCircle, Trash2, Globe, Lock, Edit, MoreHorizontal } from 'lucide-react';
import type { Book, LearningPlan, PlanDetails, Language, CommunityList } from '@/types/book.types'; 
import { useAppContext } from '@/contexts/app.context'; 
import toast from 'react-hot-toast';

// 子组件
import BookCard from './BookCard';
import PlanSetupView from './PlanSetupView';
import CreateCustomBookModal from './CreateCustomBookModal'; 

interface CommunityViewProps {
  communityLists: CommunityList[];
  previewBook: Book | null;
  handleBookCardClick: (book: Book) => void;
  handleStartLearning: (plan: PlanDetails) => void;
  setPreviewBook: (book: Book | null) => void;
  learningList: LearningPlan[];
  handleCreateCustomList: () => void;
  handleDeleteCustomList: (listCode: string) => void;
}

/** 数组分块工具函数 */
function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) throw new Error('分块大小必须大于0');
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const CommunityView: React.FC<CommunityViewProps> = ({
  communityLists,
  previewBook,
  handleBookCardClick,
  handleStartLearning,
  setPreviewBook,
  learningList,
  handleCreateCustomList,
  handleDeleteCustomList,
}) => {
  const t = useTranslations('BookSelection');
  const tCommon = useTranslations('common');
  const { user, isLoggedIn, hierarchy } = useAppContext(); 

  const userId = user?.id;
  const [editModalState, setEditModalState] = useState<{
    isOpen: boolean;
    book: CommunityList | null;
  }>({
    isOpen: false,
    book: null,
  });
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // 筛选列表
  const userCreatedLists = useMemo(
    () => communityLists.filter((list) => list.creatorId === userId),
    [communityLists, userId]
  );
  const publicCommunityLists = useMemo(
    () =>
      communityLists.filter(
        (list) => list.creatorId !== userId && list.status === 'PUBLIC'
      ),
    [communityLists, userId]
  );

  // 响应式调整分块大小
  const getChunkSize = () => {
    if (typeof window === 'undefined') return 3;
    return 3; 
  };

  const chunkedUserLists = useMemo(
    () => chunk(userCreatedLists, getChunkSize()),
    [userCreatedLists]
  );
  const chunkedPublicLists = useMemo(
    () => chunk(publicCommunityLists, getChunkSize()),
    [publicCommunityLists]
  );

  /** 处理编辑操作 */
  const handleEditClick = (list: CommunityList) => {
    setEditModalState({ isOpen: true, book: list });
    setOpenMenu(null);
  };

  /** 编辑成功回调 */
  const handleEditSuccess = () => {
    setEditModalState({ isOpen: false, book: null });
    // 触发全局刷新以获取最新列表
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  /** 点击外部关闭菜单 */
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const currentMenuElement = document.getElementById(`menu-${openMenu}`);

      if (
        openMenu &&
        currentMenuElement &&
        !currentMenuElement.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

  /** 渲染书籍网格 (用于上下结构) */
  const renderBookGrid = (
    chunkedLists: CommunityList[][],
    sectionTitle: string,
    isUserCreated: boolean = false
  ) => {
    const lists = chunkedLists.flat();
    const isEmpty = lists.length === 0;

    // 空状态处理
    if (isEmpty && isUserCreated && isLoggedIn) {
      return (
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">
            {sectionTitle}
          </h3>
          <div className="p-6 md:p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              {t('CommunityView.emptyUserList')}
            </p>
          </div>
        </div>
      );
    }

    if (isEmpty && !isUserCreated && communityLists.length > 0) return null; 
    if (isEmpty && !isUserCreated && communityLists.length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">
            {sectionTitle}
        </h3>

        <section>
          <div className="space-y-3">
            {chunkedLists.map((row, rowIndex) => (
              <div key={rowIndex}>
                {/* 1. 书籍卡片网格 */}
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" 
                  role="radiogroup"
                  aria-label={t('BrowserView.aria.bookRadiogroupLabel')}
                >
                  {row.map((list) => {
                    const isPreviewingThis = previewBook?.listCode === list.listCode; 
                    const isOwned = list.creatorId === userId;
                    const isPrivate = list.status === 'HIDDEN';
                    const isPublic = list.status === 'PUBLIC';

                    const canPerformActions = isOwned && isPrivate;
                    const showMoreMenu = isOwned; 

                    return (
                      <BookCard
                        key={list.listCode} 
                        book={list as Book}
                        isActive={isPreviewingThis}
                        onSelect={handleBookCardClick}
                      >
                        {/* --- [FIX] 移除 h-full，高度自适应 --- */}
                        <div className="flex flex-col">

                          {/* 1. 顶部可伸缩区域 (flex-1) */}
                          <div className="flex-1">
                            {/* Line 1: 标题 */}
                            <p
                              className={`font-medium leading-tight ${
                                isPreviewingThis
                                  ? 'text-gray-900 dark:text-gray-100'
                                  : 'text-gray-800 dark:text-gray-100'
                              }`}
                            >
                              {list.name}
                            </p>

                            {/* Line 2: 描述 (为空时回退到标题) */}
                            <p
                              className={`text-xs mt-0.5 leading-snug ${
                                isPreviewingThis
                                  ? 'text-gray-600 dark:text-gray-400'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {list.description || list.name}
                            </p>
                          </div>

                          {/* 2. 底部固定区域 (flex-shrink-0) */}
                          <div className="shrink-0 flex justify-between items-center mt-1">
                            
                            {/* 左侧：[Tag] + [Total Words] */}
                            <div className="flex items-center space-x-2">
                              {/* 状态 Tag (仅在我创建的词表显示) */}
                              {isOwned && (
                                <div className="flex-shrink-0">
                                  {isPublic ? (
                                    <span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                      {tCommon('status.public')}
                                    </span>
                                  ) : (
                                    <span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                      {tCommon('status.private')}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* 单词总数 */}
                              <span className={`text-sm font-medium ${
                                  isPreviewingThis
                                    ? 'text-gray-700 dark:text-gray-300'
                                    : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                  {t('BookCard.totalWords', { count: list.totalWords })}
                              </span>
                            </div>


                            {/* 右侧：[Menu] 或 [Creator] */}
                            <div className="flex items-center space-x-2">
                                {/* 更多操作菜单 (仅在我创建的词表显示) */}
                                {showMoreMenu && (
                                    <div className="relative" id={`menu-${list.listCode}`}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenu(openMenu === list.listCode ? null : list.listCode);
                                            }}
                                            className="p-1.5 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            aria-haspopup="true"
                                            aria-expanded={openMenu === list.listCode}
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>

                                        <AnimatePresence>
                                            {openMenu === list.listCode && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute right-0 bottom-full mb-2 w-40 z-30 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <ul className="p-1">
                                                        {canPerformActions && (
                                                            <li>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditClick(list);
                                                                    }}
                                                                    className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                    >
                                                                    <Edit className="w-4 h-4" />
                                                                    <span>{tCommon('buttons.modify')}</span>
                                                                </button>
                                                            </li>
                                                        )}
                                                        {canPerformActions && (
                                                            <li>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteCustomList(list.listCode);
                                                                        setOpenMenu(null);
                                                                    }}
                                                                    className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    <span>{tCommon('buttons.delete')}</span>
                                                                </button>
                                                            </li>
                                                        )}
                                                        {list.status === 'PUBLIC' && isOwned && (
                                                            <li>
                                                                <div className="w-full text-left px-3 py-2 rounded text-xs text-yellow-600 dark:text-yellow-400">
                                                                    {t('CommunityView.publicCannotEdit')}
                                                                </div>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* 创建者 (仅在社区词表显示) */}
                                {!isOwned && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate" title={t('CommunityView.createdByUser', { name: list.creatorNickname })}>
                                    {t('CommunityView.byUserPrefix', { name: list.creatorNickname })}
                                  </span>
                                )}
                            </div>
                          </div> 
                        </div>
                        {/* --- 结束 flex-col 布局 --- */}
                      </BookCard>
                    );
                  })}
                </div> 

                {/* 计划设置视图 (移到 grid 外部) */}
                <AnimatePresence>
                  {previewBook && row.some(list => list.listCode === previewBook.listCode) && (
                    <motion.div
                      key="plan-setup-inline-community"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        type: 'spring',
                        damping: 25,
                        stiffness: 180,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3"> 
                        <PlanSetupView
                          book={previewBook as Book} 
                          initialPlan={
                            learningList.find(
                              (p) => p.listCode === previewBook.listCode
                            )?.plan
                          }
                          onStart={handleStartLearning}
                          onCancel={() => setPreviewBook(null)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  return (
    <motion.div
      key="community"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex-1 flex flex-col overflow-y-auto p-4"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 shrink-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('CommunityView.title')}
        </h2>
        {isLoggedIn && (
          <button
            onClick={handleCreateCustomList}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm hover:bg-gray-700 dark:text-gray-900 dark:bg-white dark:hover:bg-gray-300 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t('CommunityView.createCustomBook')}</span>
          </button>
        )}
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto py-4">
        {/* 用户创建的词表 (上部) */}
        {isLoggedIn &&
          renderBookGrid(
            chunkedUserLists,
            t('CommunityView.userCreatedSection'),
            true
          )}

        {/* 社区公开词表 (下部) */}
        {renderBookGrid(
          chunkedPublicLists,
          t('CommunityView.publicCommunitySection'),
          false
        )}

        {/* 统一处理总空状态 */}
        {communityLists.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {t('CommunityView.noCommunityBooks')}
            </p> 
          </div>
        )}
      </div>
      
      {/* 编辑 Modal */}
      <CreateCustomBookModal
          isOpen={editModalState.isOpen}
          onClose={() => setEditModalState({ isOpen: false, book: null })}
          onSuccess={handleEditSuccess}
          languages={hierarchy} 
          isEditMode={true}
          editBook={editModalState.book}
      />
    </motion.div>
  );
};

export default CommunityView;