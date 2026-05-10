# AI 数据助手 — 飞书多维表格字段捷径

> 用 AI 为你的多维表格注入智能分析能力。无需离开飞书，即可对文本内容进行情感分析、智能分类、摘要提取、信息提取、翻译等操作。

[![飞书字段捷径](https://img.shields.io/badge/飞书-字段捷径-blue)](https://open.feishu.cn/)

## 功能特性

| 分析模式 | 说明 | 适用场景 |
|---------|------|---------|
| 😊 情感分析 | 分析文本情感倾向（正面/负面/中性），含评分和强度 | 客户反馈、评论、投诉分析 |
| 🏷️ 内容分类 | 自动分类文本内容并打标签 | 工单分类、文档归类 |
| 📝 摘要提取 | 生成核心摘要和关键要点 | 长文本总结、周报提炼 |
| 🔍 关键信息提取 | 提取人名、地名、日期、金额等结构化信息 | 简历解析、信息录入 |
| 🌐 翻译为英文 | 将中文翻译为英文 | 国际化协作 |
| 🌐 翻译为中文 | 将外文翻译为中文 | 阅读外文资料 |
| ⚙️ 自定义分析 | 自定义 AI 分析指令 | 个性化分析需求 |

## 快速开始

### 前置条件

- 一个 [DeepSeek API Key](https://platform.deepseek.com/api_keys)
- 飞书多维表格（支持文本/数字字段）

### 配置步骤

1. 在多维表格中新增字段 → 选择「字段捷径」→ 「AI 数据助手」
2. 在字段设置中填入你的 DeepSeek API Key
3. 选择要分析的内容字段
4. 选择分析模式
5. 完成！AI 会自动分析该行数据

### 配置项说明

| 配置项 | 必填 | 说明 |
|-------|------|------|
| DeepSeek API Key | ✅ | 你的 DeepSeek API 密钥 |
| 分析内容字段 | ✅ | 要分析的多维表格字段 |
| 分析模式 | ✅ | 选择分析类型 |
| AI 模型 | ✅ | DeepSeek Chat(快速) / DeepSeek Reasoner(深度) |
| 自定义指令 | 仅自定义模式 | 你的分析要求 |

## 定价

- **付费插件**：按 API 调用量计费（用户自备 DeepSeek API Key）
- 无额外订阅费，仅需支付 DeepSeek API 使用费（约 ¥10-50/月）

## 隐私与安全

- 数据通过飞书官方加密 API 传输
- AI 分析调用 DeepSeek API，数据不会用于训练
- API Key 存储在飞书安全环境中

## 技术说明

- 开发框架：`@lark-opdev/block-basekit-server-api`
- AI 模型：DeepSeek Chat / DeepSeek Reasoner
- 运行时：飞书 FaaS 环境
- 代码开源：[GitHub](https://github.com/jufeng4081/feishu-ai-assistant)
- 问题反馈：[Issues](https://github.com/jufeng4081/feishu-ai-assistant/issues)

## 开发者

- **开发团队**：AI Data Assistant Team
- **联系邮箱**：124581351@qq.com
- **问题反馈**：[GitHub Issues](https://github.com/jufeng4081/feishu-ai-assistant/issues)

## 版本历史

- **v1.0.0**（当前）— 初始发布，支持 7 种 AI 分析模式

## 支持与反馈

如有问题或建议，请联系开发者。
