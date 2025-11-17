/*
 * @Date: 2025-10-29 21:17:59
 * @LastEditTime: 2025-11-12 12:40:23
 * @Description: 书籍相关 API 服务，提供书籍层级结构和单词列表的获取功能
 */

import apiClient from '@/utils/api.utils';
import { handleApiError, ApiError } from '@/utils/error.utils';
import type {
  Language,
  CommunityList,
  ValidationResult,
  CreateCustomWordListParams,
  UpdateCustomWordListParams, // 导入 Update 类型
} from '@/types/book.types'; // 导入新类型
import { SimpleWord } from '@/types/word.types';

/**
 * 获取完整的三级书籍层级结构（语言→书籍→章节）
 * @returns 语言列表，每个语言包含其下的书籍及章节信息
 * @throws {ApiError} 接口调用失败或业务逻辑错误时抛出
 */
export async function fetchBookHierarchy(): Promise<Language[]> {
  const endpoint = '/books/hierarchy';
  console.log(`[书籍服务] 获取书籍层级结构: ${endpoint}`);

  try {
    const response = await apiClient(endpoint, { method: 'GET' }, false);

    // 先检查HTTP响应状态
    if (!response.ok) {
      await handleApiError(response, '获取书籍层级结构失败');
    }

    // 状态正常时解析响应数据
    const data = await response.json();

    // 检查业务逻辑状态码
    if (data.code === 0) {
      return data.data; // 返回语言层级结构数组
    } else {
      throw new ApiError(data.message, data.code, response.status);
    }
  } catch (error) {
    console.error(`[书籍服务错误] 获取书籍层级结构失败:`, error);
    throw error; // 向上传递错误（可能是ApiError）
  }
}

/**
 * 获取指定书本（通过listCode标识）的完整单词列表
 * @param listCode 书本唯一标识编码
 * @returns 单词列表（SimpleWord类型数组）
 * @throws {ApiError} 接口调用失败、书本不存在或业务逻辑错误时抛出
 */
export async function getWordsByBook(listCode: string): Promise<SimpleWord[]> {
  const endpoint = `/books/${listCode}/words`;
  console.log(`[书籍服务] 获取书本单词列表: ${endpoint}`);

  try {
    const response = await apiClient(endpoint, { method: 'GET' }, false);

    // 检查HTTP响应状态
    if (!response.ok) {
      await handleApiError(response, '获取书本单词列表失败');
    }

    // 解析响应数据
    const data = await response.json();

    // 检查业务逻辑状态
    if (data.code === 0) {
      // 后端返回格式为 { data: { words: [...] } }
      return data.data.words; // 返回单词数组
    } else {
      throw new ApiError(data.message, data.code, response.status);
    }
  } catch (error) {
    console.error(`[书籍服务错误] 获取书本单词列表失败:`, error);
    throw error; // 向上传递错误
  }
}

/**
 * 批量校验用户上传的单词列表在数据库中是否存在
 * @param params 包含单词数组和语言代码
 * @returns 校验结果：匹配的单词ID和未匹配的单词文本
 * @throws {ApiError} 接口调用失败或业务逻辑错误时抛出
 */
export async function validateWordsInBulk(params: {
  words: string[];
  languageCode: string;
}): Promise<ValidationResult> {
  const endpoint = '/books/validate-words';
  console.log(`[书籍服务] 批量校验单词: ${endpoint}`);

  try {
    const response = await apiClient(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(params),
        headers: { 'Content-Type': 'application/json' },
      },
      false
    ); // 此接口无需认证

    if (!response.ok) {
      await handleApiError(response, '单词批量校验失败');
    }

    const data = await response.json();

    if (data.code === 0) {
      return data.data;
    } else {
      throw new ApiError(data.message, data.code, response.status);
    }
  } catch (error) {
    console.error(`[书籍服务错误] 批量校验单词失败:`, error);
    throw error;
  }
}

/**
 * 创建用户自定义单词书
 * @param accessToken 用户访问令牌
 * @param params 包含词表名称、单词ID、公开状态、语言代码和描述
 * @returns 创建成功的词表信息
 * @throws {ApiError} 接口调用失败或业务逻辑错误时抛出
 */
export async function createCustomWordList(
  accessToken: string,
  params: CreateCustomWordListParams
): Promise<CommunityList> {
  const endpoint = '/books/custom';
  console.log(`[书籍服务] 创建自定义单词书: ${endpoint}`);

  try {
    // 接受 accessToken 以匹配调用端签名，但依赖 apiClient 的 true 标志处理授权头
    const response = await apiClient(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(params),
        headers: { 'Content-Type': 'application/json' },
      },
      true
    ); // 确保认证标志为 true，让 apiClient 自动处理 token

    if (!response.ok) {
      await handleApiError(response, '创建自定义单词书失败');
    }

    const data = await response.json();

    if (data.code === 0) {
      return data.data;
    } else {
      throw new ApiError(data.message, data.code, response.status);
    }
  } catch (error) {
    console.error(`[书籍服务错误] 创建自定义单词书失败:`, error);
    throw error;
  }
}

/**
 * 修改用户自定义单词书 (名称/描述/公开状态)
 * @param accessToken 用户访问令牌
 * @param params 包含 listCode 和要修改的字段
 * @returns 更新后的词表信息
 * @throws {ApiError}
 */
export async function updateCustomWordList(
  accessToken: string,
  params: UpdateCustomWordListParams
): Promise<CommunityList> {
  const { listCode, ...updateData } = params;
  const endpoint = `/books/custom/${listCode}`;
  console.log(`[书籍服务] 修改自定义单词书: ${endpoint}`);

  try {
    const response = await apiClient(
      endpoint,
      {
        method: 'PUT', // 使用 PUT 或 PATCH
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      },
      true
    ); // 确保认证标志为 true

    if (!response.ok) {
      await handleApiError(response, '修改自定义单词书失败');
    }

    const data = await response.json();

    if (data.code === 0) {
      return data.data;
    } else {
      throw new ApiError(data.message, data.code, response.status);
    }
  } catch (error) {
    console.error(`[书籍服务错误] 修改自定义单词书失败:`, error);
    throw error;
  }
}

/**
 * 获取社区和用户创建的单词书列表
 * @returns 单词书列表
 * @throws {ApiError} 接口调用失败或业务逻辑错误时抛出
 */
export async function getCommunityAndCustomLists(): Promise<CommunityList[]> {
  const endpoint = '/books/community';
  console.log(`[书籍服务] 获取社区和自定义词表列表: ${endpoint}`);

  try {
    // 可选认证，设置为 true 确保登录时携带 token，用于区分用户创建的词表
    const response = await apiClient(endpoint, { method: 'GET' }, true);

    if (!response.ok) {
      await handleApiError(response, '获取社区和自定义词表列表失败');
    }

    const data = await response.json();

    if (data.code === 0) {
      return data.data;
    } else {
      throw new ApiError(data.message, data.code, response.status);
    }
  } catch (error) {
    console.error(`[书籍服务错误] 获取社区和自定义词表列表失败:`, error);
    throw error;
  }
}

/**
 * 删除用户创建的自定义单词书（软删除）
 * @param listCode 词表唯一标识编码
 * @throws {ApiError} 接口调用失败或业务逻辑错误时抛出
 */
export async function deleteCustomWordList(listCode: string): Promise<void> {
  const endpoint = `/books/custom/${listCode}`;
  console.log(`[书籍服务] 删除自定义单词书: ${endpoint}`);

  try {
    const response = await apiClient(endpoint, { method: 'DELETE' }, true); // 需要认证

    if (!response.ok) {
      await handleApiError(response, '删除自定义单词书失败');
    }

    const data = await response.json();

    if (data.code !== 0) {
      throw new ApiError(data.message, data.code, response.status);
    }
  } catch (error) {
    console.error(`[书籍服务错误] 删除自定义单词书失败:`, error);
    throw error;
  }
}

/**
 * 获取所有语言列表 (用于创建自定义词表)
 * @returns {Promise<Language[]>} Language 数组
 * @throws {ApiError}
 * @description 此函数复用 /books/hierarchy 接口来获取语言列表，以提高效率。
 */
export async function fetchAllLanguages(): Promise<Language[]> {
  const endpoint = '/books/hierarchy';
  console.log(`[书籍服务] 获取所有语言列表: ${endpoint}`);

  try {
    // 复用 fetchBookHierarchy 的逻辑
    const response = await apiClient(endpoint, { method: 'GET' }, false);

    if (!response.ok) {
      await handleApiError(response, '获取语言列表失败');
    }

    const data = await response.json();

    if (data.code === 0) {
      // hierarchy 的顶层就是 Language 数组
      return data.data;
    } else {
      throw new ApiError(data.message, data.code, response.status);
    }
  } catch (error) {
    console.error(`[书籍服务错误] 获取语言列表失败:`, error);
    throw error;
  }
}
