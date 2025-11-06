/*
 * @Date: 2025-10-29 21:17:59
 * @LastEditTime: 2025-11-06 23:46:02
 * @Description: 书籍相关 API 服务
 */

import apiClient from '@/utils/api.utils';
import { handleApiError } from '@/utils/error.utils';
import type { Language } from '@/types/book.types';
import { SimpleWord } from '@/types/word.types';

/**
 * 获取完整的三级书籍层级结构（语言→书籍→章节）
 * @returns 书籍层级数据数组（按语言分组）
 * @throws {Error} - 接口调用失败时抛出错误
 */
export async function fetchBookHierarchy(): Promise<Language[]> {
  const endpoint = '/books/hierarchy';
  console.log(`[Book Service] Fetching book hierarchy: ${endpoint}`);

  try {
    // 无需认证，公开访问接口
    const response = await apiClient(endpoint, { method: 'GET' }, false);

    if (!response.ok) {
      await handleApiError(response, 'Failed to fetch book hierarchy.');
    }

    const data: Language[] = await response.json();
    console.log(
      `[Book Service] Fetched book hierarchy successfully, total languages: ${data.length}`
    );

    return data;
  } catch (error) {
    console.error(`[Book Service Error] Fetch book hierarchy failed:`, error);
    throw error;
  }
}

/**
 * [!! 新增函数 !!]
 * 获取指定书本（listCode）的完整单词列表
 * @param listCode - 单词书的唯一标识
 * @returns 单词列表
 * @throws {Error} - 接口调用失败时抛出错误
 */
export async function getWordsByBook(listCode: string): Promise<SimpleWord[]> {
  const endpoint = `/books/${listCode}/words`;
  console.log(`[Book Service] Fetching words for book: ${endpoint}`);

  try {
    // 无需认证，公开访问接口
    const response = await apiClient(endpoint, { method: 'GET' }, false);

    if (!response.ok) {
      await handleApiError(response, 'Failed to fetch book words.');
    }

    // 后端返回 { words: [...] } 结构
    const data: { words: SimpleWord[] } = await response.json();
    console.log(
      `[Book Service] Fetched ${data.words.length} words for ${listCode}.`
    );

    return data.words; // 返回单词数组
  } catch (error) {
    console.error(`[Book Service Error] Fetch book words failed:`, error);
    throw error;
  }
}