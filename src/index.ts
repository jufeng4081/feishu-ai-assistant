import {
  basekit,
  FieldType,
  FieldComponent,
  FieldCode,
} from '@lark-opdev/block-basekit-server-api';
import { callDeepSeek, extractJSON } from './ai';
import { MODE_OPTIONS, MODEL_OPTIONS, getPrompt, AnalysisMode } from './prompts';

basekit.addDomainList(['api.deepseek.com']);

basekit.addField({
  i18n: {
    messages: {
      'zh-CN': {
        field_name: 'AI 数据助手',
        api_key: 'DeepSeek API Key',
        api_key_placeholder: '请输入你的 DeepSeek API Key',
        source_field: '分析内容字段',
        analysis_mode: '分析模式',
        model: 'AI 模型',
        custom_prompt: '自定义分析指令',
        custom_prompt_placeholder: '请输入你的分析要求，例如：提取文本中的产品名称和价格',
        no_api_key: '请先配置 DeepSeek API Key',
        no_input: '（请先输入内容）',
        ai_error: 'AI 分析出错',
        result_sentiment: '情感',
        result_score: '评分',
        result_keywords: '关键词',
        result_category: '类别',
        result_tags: '标签',
        result_confidence: '置信度',
        result_summary: '摘要',
        result_points: '要点',
        result_translation: '翻译',
        result_extraction: '提取信息',
        result_custom: '分析结果',
        text_too_long: '内容过长（已截断至5000字）',
      },
      'en-US': {
        field_name: 'AI Data Assistant',
        api_key: 'DeepSeek API Key',
        api_key_placeholder: 'Enter your DeepSeek API Key',
        source_field: 'Content Field',
        analysis_mode: 'Analysis Mode',
        model: 'AI Model',
        custom_prompt: 'Custom Analysis Prompt',
        custom_prompt_placeholder: 'Describe what to analyze, e.g.: extract product names and prices',
        no_api_key: 'Please configure your DeepSeek API Key',
        no_input: '(Please enter content)',
        ai_error: 'AI Analysis Error',
        result_sentiment: 'Sentiment',
        result_score: 'Score',
        result_keywords: 'Keywords',
        result_category: 'Category',
        result_tags: 'Tags',
        result_confidence: 'Confidence',
        result_summary: 'Summary',
        result_points: 'Key Points',
        result_translation: 'Translation',
        result_extraction: 'Extracted Info',
        result_custom: 'Result',
        text_too_long: 'Content truncated to 5000 characters',
      },
    },
  },
  formItems: [
    {
      key: 'apiKey',
      label: 'api_key',
      component: FieldComponent.Input,
      props: {
        placeholder: 'api_key_placeholder',
      },
      validator: { required: true },
    },
    {
      key: 'sourceField',
      label: 'source_field',
      component: FieldComponent.FieldSelect,
      props: { supportType: [FieldType.Text, FieldType.Number] },
      validator: { required: true },
    },
    {
      key: 'analysisMode',
      label: 'analysis_mode',
      component: FieldComponent.SingleSelect,
      props: { options: MODE_OPTIONS },
      validator: { required: true },
    },
    {
      key: 'model',
      label: 'model',
      component: FieldComponent.SingleSelect,
      props: { options: MODEL_OPTIONS },
      validator: { required: true },
    },
    {
      key: 'customPrompt',
      label: 'custom_prompt',
      component: FieldComponent.Input,
      props: {
        placeholder: 'custom_prompt_placeholder',
      },
    },
  ],
  resultType: {
    type: FieldType.Text,
  },
  execute: async (formItemParams: Record<string, any>, context: any) => {
    const logID = context?.logID || '未知';

    try {
      const apiKey: string = formItemParams.apiKey || '';
      const sourceValue: string = formItemParams.sourceField ?? '';
      const mode: AnalysisMode = formItemParams.analysisMode || 'sentiment';
      const model: string = formItemParams.model || 'deepseek-chat';
      const customPrompt: string = formItemParams.customPrompt || '';

      // Validate API Key
      if (!apiKey) {
        return { code: FieldCode.Success, data: '⚠️ 请先配置 DeepSeek API Key' };
      }

      // Validate input
      if (sourceValue === '' || sourceValue === null || sourceValue === undefined) {
        return { code: FieldCode.Success, data: '（请先输入内容）' };
      }

      const inputStr = String(sourceValue);
      const displayStr = inputStr.length > 5000 ? `${inputStr.slice(0, 5000)}...（内容已截断）` : inputStr;

      // Get system prompt for the selected mode
      const systemPrompt = getPrompt(mode, customPrompt);
      const isCustom = mode === 'custom';

      // Call DeepSeek
      const result = await callDeepSeek(systemPrompt, inputStr, { apiKey, model }, isCustom);

      if (!result.success) {
        console.log(JSON.stringify({ msg: 'AI call failed', error: result.error, logID }));
        return { code: FieldCode.Error, data: `⚠️ ${result.error}` };
      }

      // Parse and format the result
      const parsed = extractJSON(result.data!);
      const formatted = formatResult(parsed, mode, result.data!, isCustom);
      console.log(JSON.stringify({ msg: 'AI analysis success', mode, logID }));
      return { code: FieldCode.Success, data: formatted };

    } catch (err: any) {
      console.log(JSON.stringify({ msg: 'execute error', error: String(err), logID }));
      return { code: FieldCode.Error, data: `⚠️ 分析异常: ${err.message || '未知错误'}` };
    }
  },
});

function formatResult(parsed: any, mode: string, rawText: string, isCustom: boolean): string {
  // If JSON parsing failed, return raw text
  if (!parsed) {
    return rawText.trim();
  }

  if (isCustom) {
    const lines: string[] = [];
    if (parsed.result) lines.push(`📋 ${parsed.result}`);
    if (parsed.details) lines.push(`\n${parsed.details}`);
    return lines.join('\n') || rawText.trim();
  }

  switch (mode) {
    case 'sentiment': {
      const s = parsed.sentiment || '未知';
      const score = parsed.score != null ? ` | 评分: ${Number(parsed.score).toFixed(2)}` : '';
      const intensity = parsed.intensity ? `(${parsed.intensity})` : '';
      const keywords = parsed.keyEmotions?.length ? ` | 关键词: ${parsed.keyEmotions.slice(0, 5).join('、')}` : '';
      const exp = parsed.explanation ? `\n${parsed.explanation}` : '';
      return `情感: ${s}${intensity}${score}${keywords}${exp}`;
    }

    case 'classification': {
      const cat = parsed.category || '未分类';
      const sub = parsed.subCategory ? ` > ${parsed.subCategory}` : '';
      const tags = parsed.tags?.length ? `\n标签: ${parsed.tags.slice(0, 5).map((t: string) => `#${t}`).join(' ')}` : '';
      const conf = parsed.confidence != null ? ` | 置信度: ${(Number(parsed.confidence) * 100).toFixed(0)}%` : '';
      const exp = parsed.explanation ? `\n${parsed.explanation}` : '';
      return `类别: ${cat}${sub}${conf}${tags}${exp}`;
    }

    case 'summary': {
      const summary = parsed.summary || '';
      const points = parsed.keyPoints?.length
        ? `\n要点:\n${parsed.keyPoints.map((p: string, i: number) => `  ${i + 1}. ${p}`).join('\n')}`
        : '';
      const len = parsed.length ? `\n[${parsed.length}]` : '';
      return `${summary}${points}${len}`.trim() || rawText.trim();
    }

    case 'extraction': {
      const lines: string[] = [];
      if (parsed.entities?.length) {
        lines.push('提取信息:');
        parsed.entities.slice(0, 10).forEach((e: any) => {
          lines.push(`  ${e.type || '其他'}: ${e.value || e.name || '-'}`);
        });
      }
      if (parsed.structuredData && typeof parsed.structuredData === 'object') {
        lines.push('结构化数据:');
        Object.entries(parsed.structuredData).slice(0, 8).forEach(([k, v]) => {
          lines.push(`  ${k}: ${v}`);
        });
      }
      if (parsed.missingInfo?.length) {
        lines.push(`\n缺少信息: ${parsed.missingInfo.slice(0, 3).join('、')}`);
      }
      return lines.join('\n') || rawText.trim();
    }

    case 'translate_en':
    case 'translate_zh': {
      const trans = parsed.translation || '';
      const alts = parsed.alternatives?.length
        ? `\n备选: ${parsed.alternatives.join('; ')}`
        : '';
      const notes = parsed.notes ? `\n说明: ${parsed.notes}` : '';
      return `${trans}${alts}${notes}`.trim() || rawText.trim();
    }

    default:
      return rawText.trim();
  }
}

export default basekit;
