/*
 * @Date: 2025-11-06
 * @Description: 用户反馈 API 服务
 */

import apiClient from '@/utils/api.utils';
import { handleApiError } from '@/utils/error.utils';

// 定义反馈类型，与后端和 i18n 保持一致
export type FeedbackType = 'WORD' | 'FUNCTION' | 'BUG' | 'SUGGESTION';

// [!! 新增 !!] 为 API 请求体定义一个强类型接口
interface FeedbackPayload {
  type: FeedbackType;
  content: string;
  contactEmail?: string; // 联系邮箱是可选的
}

/**
 * 提交新的用户反馈
 * [!! 修改 !!] 此接口现在是公开的 (auth not required)
 * @param type 反馈类型
 * @param content 反馈内容
 * @param contactEmail (可选) 匿名用户的联系邮箱
 */
export async function submitFeedback(
  type: FeedbackType,
  content: string,
  contactEmail?: string
): Promise<{ message: string }> {
  const endpoint = '/feedback';
  console.log(`[Feedback Service] 提交反馈: ${type}`);

  // [!! 修改 !!] 使用强类型接口构建请求体
  // 使用展开运算符有条件地添加 contactEmail
  const bodyPayload: FeedbackPayload = {
    type,
    content,
    ...(contactEmail && { contactEmail }),
  };

  try {
    // [!! 修改 !!]
    // 假设 apiClient 第三个参数 `false` 表示这是一个公开接口，不需要强制 token
    const response = await apiClient(
      endpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      },
      true // [!!] 标记为公开访问
    );

    if (!response.ok) {
      await handleApiError(response, 'Failed to submit feedback.');
    }

    return response.json();
  } catch (error) {
    console.error(`[Feedback Service Error] 提交反馈失败:`, error);
    throw error;
  }
}
