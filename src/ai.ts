export interface AIConfig {
  apiKey: string;
  model: string;
  apiBase?: string;
}

export interface AIResult {
  success: boolean;
  data?: string;
  error?: string;
}

const DEEPSEEK_BASE = 'https://api.deepseek.com';
const TIMEOUT_MS = 25000;
const MAX_TOKENS = 1000;
const MAX_TOKENS_CUSTOM = 2000;

export async function callDeepSeek(
  systemPrompt: string,
  userContent: string,
  config: AIConfig,
  isCustom = false,
): Promise<AIResult> {
  if (!config.apiKey) {
    return { success: false, error: 'API Key 未配置' };
  }
  if (!userContent) {
    return { success: false, error: '内容为空' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(
      `${config.apiBase || DEEPSEEK_BASE}/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent.slice(0, 5000) },
          ],
          temperature: 0.1,
          max_tokens: isCustom ? MAX_TOKENS_CUSTOM : MAX_TOKENS,
          stream: false,
        }),
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (resp.status === 401 || resp.status === 403) {
      return { success: false, error: 'API Key 无效，请在字段设置中更新 DeepSeek API Key' };
    }
    if (resp.status === 429) {
      return { success: false, error: '请求过于频繁，请稍后重试' };
    }
    if (!resp.ok) {
      return { success: false, error: `AI 服务错误 (HTTP ${resp.status})` };
    }

    const data = await resp.json() as any;
    if (data.error) {
      return { success: false, error: `AI API 错误: ${data.error.message || JSON.stringify(data.error)}` };
    }

    const content: string = data.choices?.[0]?.message?.content || '';
    if (!content) {
      return { success: false, error: 'AI 返回内容为空' };
    }

    return { success: true, data: content };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { success: false, error: 'AI 响应超时（25秒），请重试' };
    }
    return { success: false, error: `AI 服务连接失败: ${err.message || '未知错误'}` };
  }
}

/**
 * 从 AI 返回的文本中提取 JSON 对象。
 * 处理 ```json {...} ``` 代码块和纯 JSON 两种情况。
 */
export function extractJSON(text: string): any {
  // Try code fence first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : text.trim();

  // Find the first { or [ and last } or ]
  const start = jsonStr.indexOf('{');
  const end = jsonStr.lastIndexOf('}');
  if (start !== -1 && end > start) {
    const candidate = jsonStr.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // fall through
    }
  }

  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}
