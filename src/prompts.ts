export type AnalysisMode =
  | 'sentiment'
  | 'classification'
  | 'summary'
  | 'extraction'
  | 'translate_en'
  | 'translate_zh'
  | 'custom';

export interface ModeOption {
  label: string;
  value: AnalysisMode;
}

export const MODE_OPTIONS: ModeOption[] = [
  { label: '情感分析', value: 'sentiment' },
  { label: '内容分类', value: 'classification' },
  { label: '摘要提取', value: 'summary' },
  { label: '关键信息提取', value: 'extraction' },
  { label: '翻译为英文', value: 'translate_en' },
  { label: '翻译为中文', value: 'translate_zh' },
  { label: '自定义分析', value: 'custom' },
];

export const MODEL_OPTIONS = [
  { label: 'DeepSeek Chat (快速)', value: 'deepseek-chat' },
  { label: 'DeepSeek Reasoner (深度)', value: 'deepseek-reasoner' },
];

const PROMPTS: Record<Exclude<AnalysisMode, 'custom'>, string> = {
  sentiment: `你是一个文本情感分析专家。请分析以下文本的情感倾向。以JSON格式返回结果，包含以下字段：
- sentiment: "正面" | "负面" | "中性"
- score: 0-1之间的数值（0最负面，0.5中性，1最正面）
- intensity: "强烈" | "中等" | "轻微"
- keyEmotions: 情感关键词列表（如["满意","喜欢"]）
- explanation: 简短的分析说明（30字以内）

仅返回JSON，不要其他文字。`,

  classification: `你是一个文本分类专家。请分析以下文本的内容类别。以JSON格式返回结果，包含以下字段：
- category: 最匹配的分类名称
- subCategory: 更细致的子分类（如有）
- tags: 相关标签列表（3-5个）
- confidence: 分类置信度（0-1）
- explanation: 简短分类理由（20字以内）

请根据文本的实际内容判断类别，不要强行归类。仅返回JSON，不要其他文字。`,

  summary: `你是一个文本摘要专家。请对以下文本生成简洁的中文摘要。以JSON格式返回结果，包含以下字段：
- summary: 1-2句话的核心摘要（50字以内）
- keyPoints: 3-5个关键要点，每个不超过15字
- length: "短文本" | "中等文本" | "长文本"

仅返回JSON，不要其他文字。`,

  extraction: `你是一个信息提取专家。请从以下文本中提取关键的结构化信息。以JSON格式返回结果，包含以下字段：
- entities: 提取到的实体列表，每个实体包含 { name, type: "人名"|"地名"|"组织"|"日期"|"金额"|"联系方式"|"其他", value }
- structuredData: 结构化后的关键信息对象（根据文本内容动态生成字段）
- missingInfo: 文本中未明确提及但可能重要的信息列表

仅返回JSON，不要其他文字。`,

  translate_en: `你是一个专业翻译。请将以下中文文本翻译成英文。以JSON格式返回结果，包含以下字段：
- translation: 英文翻译结果
- alternatives: 2-3个备选译法（如有）
- notes: 翻译说明或需要注意的文化差异（如有）

仅返回JSON，不要其他文字。`,

  translate_zh: `你是一个专业翻译。请将以下文本翻译成简体中文。以JSON格式返回结果，包含以下字段：
- translation: 中文翻译结果
- alternatives: 2-3个备选译法（如有）
- notes: 翻译说明或需要注意的文化差异（如有）

仅返回JSON，不要其他文字。`,
};

export function getPrompt(mode: AnalysisMode, customPrompt?: string): string {
  if (mode === 'custom') {
    return `你是一个AI分析助手。请根据用户自定义的分析要求进行分析。

用户的自定义指令：${customPrompt || ''}

请分析以下文本并返回结果。以JSON格式返回：
- result: 分析结果文本
- details: 详细分析内容

仅返回JSON，不要其他文字。`;
  }
  return PROMPTS[mode];
}
