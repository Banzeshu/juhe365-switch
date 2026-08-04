import type { ProviderCategory } from "../types";

interface PresetVisibilityFields {
  name: string;
  category?: ProviderCategory;
  isCustomTemplate?: boolean;
  isOfficial?: boolean;
}

const ALWAYS_VISIBLE_CATEGORIES = new Set<ProviderCategory>([
  "official",
  "custom",
  "omo",
  "omo-slim",
]);

const VISIBLE_PRESET_NAMES = new Set([
  "Juhe365",
  "Azure OpenAI",
  "AWS Bedrock",
  "AWS Bedrock (AKSK)",
  "AWS Bedrock (API Key)",
  "Baidu Qianfan Coding Plan",
  "Bailian",
  "Bailian For Coding",
  "BytePlus",
  "Codex",
  "DeepSeek",
  "DouBaoSeed",
  "Gemini Native",
  "GitHub Copilot",
  "Google Official",
  "Kimi",
  "Kimi For Coding",
  "Kimi K2.7 Code",
  "Longcat",
  "MiniMax",
  "MiniMax en",
  "ModelScope",
  "Nvidia",
  "OpenAI Official",
  "OpenRouter",
  "Qwen Coder",
  "StepFun",
  "StepFun en",
  "Xiaomi MiMo",
  "Xiaomi MiMo Token Plan (China)",
  "Grok Official",
  "xAI (Grok)",
  "xAI (Grok) OAuth",
  "Zhipu GLM",
  "Zhipu GLM en",
  "火山Agentplan",
]);

export function filterVisibleProviderPresets<T extends PresetVisibilityFields>(
  presets: T[],
): T[] {
  return presets.filter(
    (preset) =>
      preset.isOfficial === true ||
      preset.isCustomTemplate === true ||
      VISIBLE_PRESET_NAMES.has(preset.name) ||
      (preset.category !== undefined &&
        ALWAYS_VISIBLE_CATEGORIES.has(preset.category)),
  );
}
