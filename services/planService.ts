/*
 * @Date: 2025-10-29 23:14:16
 * @LastEditTime: 2025-11-07 09:48:43
 * @Description: 学习计划相关 API 服务 (已添加错题集管理)
 */

import apiClient from '@/utils/api.utils';
import { handleApiError } from '@/utils/error.utils';
import type { LearningPlan, PlanDetails } from '@/types/book.types';
// 假设 Word 类型定义在 @/types/word.types
import type { Definition, Pronunciation, Word } from '@/types/word.types';

/**
 * 获取用户所有激活的学习计划
 * @returns 用户的学习计划列表
 * @throws {Error} - 接口调用失败或未认证时抛出错误
 */
export async function fetchLearningList(): Promise<LearningPlan[]> {
  const endpoint = '/plans';
  console.log(`[Plan Service] Fetching user learning plans: ${endpoint}`);

  const response = await apiClient(endpoint, { method: 'GET' });

  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch learning list.');
  }

  const data: LearningPlan[] = await response.json();
  console.log(
    `[Plan Service] Fetched learning plans successfully, total: ${data.length}`
  );

  return data;
}

/**
 * 创建或更新学习计划
 * @param listCode - 单词书编码（如 cet4_core）
 * @param plan - 学习计划详情（包含计划类型、数值、复习策略、学习顺序）
 * @returns 操作后的学习计划数据
 * @throws {Error} - 接口调用失败时抛出错误
 */
export async function savePlan(listCode: string, plan: PlanDetails) {
  const endpoint = '/plans';
  console.log(
    `[Plan Service] Saving learning plan: listCode=${listCode}, plan=${JSON.stringify(
      plan
    )}`
  );

  const response = await apiClient(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      listCode,
      planType: plan.type,
      planValue: plan.value,
      reviewStrategy: plan.reviewStrategy,
      learningOrder: plan.learningOrder,
    }),
  });

  if (!response.ok) {
    await handleApiError(response, 'Failed to save learning plan.');
  }

  const data = await response.json();
  console.log(`[Plan Service] Saved learning plan successfully`);

  return data;
}

/**
 * 删除学习计划（取消学习）
 * @param planId - 学习计划 ID
 * @returns 操作结果提示
 * @throws {Error} - 接口调用失败时抛出错误
 */
export async function deletePlan(planId: number): Promise<{ message: string }> {
  const endpoint = `/plans/${planId}`;
  console.log(`[Plan Service] Deleting learning plan: planId=${planId}`);

  const response = await apiClient(endpoint, { method: 'DELETE' });

  if (!response.ok) {
    await handleApiError(response, 'Failed to delete learning plan.');
  }

  // 处理 204 No Content 响应（无返回体）
  if (response.status === 204) {
    console.log(
      `[Plan Service] Deleted learning plan successfully: planId=${planId}`
    );
    return { message: 'Plan deleted successfully' };
  }

  const data = await response.json();
  console.log(
    `[Plan Service] Deleted learning plan successfully: planId=${planId}`
  );

  return data;
}

/**
 * 重置学习计划（清空学习进度，重新开始）
 * @param planId - 学习计划 ID
 * @returns 重置后的学习计划数据
 * @throws {Error} - 接口调用失败时抛出错误
 */
export async function resetPlan(planId: number) {
  const endpoint = `/plans/${planId}/reset`;
  console.log(`[Plan Service] Resetting learning plan: planId=${planId}`);

  const response = await apiClient(endpoint, { method: 'POST' });

  if (!response.ok) {
    await handleApiError(response, 'Failed to reset learning plan.');
  }

  const data = await response.json();
  console.log(
    `[Plan Service] Reset learning plan successfully: planId=${planId}`
  );

  return data;
}

/**
 * 激活学习计划（设置为当前正在学习的计划）
 * @param planId - 学习计划 ID
 * @returns 激活后的学习计划数据
 * @throws {Error} - 接口调用失败时抛出错误
 */
export async function activatePlan(planId: number) {
  const endpoint = `/plans/${planId}/activate`;
  console.log(`[Plan Service] Activating learning plan: planId=${planId}`);

  const response = await apiClient(endpoint, { method: 'POST' });

  if (!response.ok) {
    await handleApiError(response, 'Failed to activate learning plan.');
  }

  const data = await response.json();
  console.log(
    `[Plan Service] Activated learning plan successfully: planId=${planId}`
  );

  return data;
}

/**
 * 推进学习计划到下一天
 * @param planId - 学习计划 ID
 * @returns 推进后的学习计划数据
 * @throws {Error} - 接口调用失败时抛出错误
 */
export async function advancePlan(planId: number) {
  const endpoint = `/plans/${planId}/advance`;
  console.log(`[Plan Service] Advancing learning plan: planId=${planId}`);

  try {
    const response = await apiClient(endpoint, { method: 'POST' });

    if (!response.ok) {
      await handleApiError(response, 'Failed to advance learning plan.');
    }

    const data = await response.json();
    console.log(
      `[Plan Service] Advanced learning plan successfully: planId=${planId}`
    );

    return data;
  } catch (error) {
    console.error(
      `[Plan Service Error] Advance learning plan failed: planId=${planId}`,
      error
    );
    throw error;
  }
}

/**
 * 定义从后端获取的按天单词数据类型
 */
export type PlanDayWord = {
  id: number;
  word: string; // 后端 'text' 映射而来
  definitions: Definition[] | null; // 后端 'definitions' JSON
  pronunciation?: Pronunciation[];
};

export type PlanDayWords = {
  day: number;
  words: PlanDayWord[];
};

/**
 * 获取计划的按天单词列表
 * @param planId 计划ID
 * @returns Promise<PlanDayWords[]>
 */
export async function getPlanWordsByDay(
  planId: number
): Promise<PlanDayWords[]> {
  const endpoint = `/plans/${planId}/words`;
  console.log(`[Plan Service] Fetching word list by day for plan: ${planId}`);

  try {
    const response = await apiClient(endpoint, { method: 'GET' });

    if (!response.ok) {
      await handleApiError(response, 'Failed to fetch plan words.');
    }

    const data: PlanDayWords[] = await response.json();
    console.log(`[Plan Service] Fetched plan words successfully.`);
    return data;
  } catch (error) {
    console.error(
      `[Plan Service Error] Fetching plan words failed: planId=${planId}`,
      error
    );
    throw error;
  }
}

// --- [!! 新增 !!] 错题集服务 ---

/**
 * 错题集条目类型 (来自后端)
 */
export interface MistakeEntry {
  id: number;
  planId: number;
  wordId: number;
  mistakeCount: number;
  createdAt: string;
  updatedAt: string;
  word: Word;
}

/**
 * 1. 获取指定计划的错题集列表
 */
export const getMistakes = async (planId: number): Promise<MistakeEntry[]> => {
  const endpoint = `/plans/${planId}/mistakes`;
  console.log(`[Plan Service] Fetching mistakes for plan: ${planId}`);
  try {
    const response = await apiClient(endpoint, { method: 'GET' });
    if (!response.ok) {
      await handleApiError(response, 'Failed to fetch mistakes.');
    }
    return response.json();
  } catch (error) {
    console.error(`[Plan Service Error] Fetching mistakes failed:`, error);
    throw error;
  }
};

/**
 * 2. 获取错题集复习单词列表
 */
export const getMistakeReviewWords = async (
  planId: number
): Promise<{ words: Word[] }> => {
  const endpoint = `/plans/${planId}/mistakes/review`;
  console.log(
    `[Plan Service] Fetching mistake review words for plan: ${planId}`
  );
  try {
    const response = await apiClient(endpoint, { method: 'GET' });
    if (!response.ok) {
      await handleApiError(response, 'Failed to fetch mistake review words.');
    }
    // 后端返回 { words: [...] } 结构
    return response.json();
  } catch (error) {
    console.error(
      `[Plan Service Error] Fetching mistake review words failed:`,
      error
    );
    throw error;
  }
};

/**
 * 3. 从错题集移除单个单词
 */
export const removeMistake = async (
  planId: number,
  wordId: number
): Promise<{ message: string }> => {
  const endpoint = `/plans/${planId}/mistakes/words/${wordId}`;
  console.log(
    `[Plan Service] Removing mistake: plan=${planId}, word=${wordId}`
  );
  try {
    const response = await apiClient(endpoint, { method: 'DELETE' });
    if (!response.ok) {
      await handleApiError(response, 'Failed to remove mistake.');
    }
    return response.json();
  } catch (error) {
    console.error(`[Plan Service Error] Removing mistake failed:`, error);
    throw error;
  }
};

/**
 * 4. 清空计划的错题集
 */
export const clearMistakes = async (
  planId: number
): Promise<{ message: string }> => {
  const endpoint = `/plans/${planId}/mistakes`;
  console.log(`[Plan Service] Clearing all mistakes for plan: ${planId}`);
  try {
    const response = await apiClient(endpoint, { method: 'DELETE' });
    if (!response.ok) {
      await handleApiError(response, 'Failed to clear mistakes.');
    }
    return response.json();
  } catch (error) {
    console.error(`[Plan Service Error] Clearing mistakes failed:`, error);
    throw error;
  }
};
