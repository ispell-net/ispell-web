/*
 * @Date: 2025-11-06 21:11:15
 * @LastEditTime: 2025-11-06 21:36:06
 * @Description:
 */
/** 变更类型：新增, 修复, 重构, 性能, 文档 */
export type ChangeType = 'new' | 'fix' | 'refactor' | 'perf' | 'docs';

/** 单条变更记录 */
export interface Change {
  type: ChangeType;
  /** 对应 i18n JSON 文件中的翻译 Key */
  descriptionKey: string;
}

/** 单个版本（一条日志） */
export interface ChangelogEntry {
  version: string;
  /** ISO 日期格式: YYYY-MM-DD */
  date: string;
  changes: Change[];
}

/**
 * 更新日志数据
 * @description 按时间倒序排列，最新的在最上面
 */
export const changelogData: ChangelogEntry[] = [
  {
    version: 'v1.0.0',
    date: '2025-11-06',
    changes: [
      {
        type: 'new',
        descriptionKey: 'v1_0_0.new1',
      },
      {
        type: 'new',
        descriptionKey: 'v1_0_0.new2',
      },
      {
        type: 'new',
        descriptionKey: 'v1_0_0.new3',
      },
      {
        type: 'docs',
        descriptionKey: 'v1_0_0.docs1',
      },
    ],
  },
];
