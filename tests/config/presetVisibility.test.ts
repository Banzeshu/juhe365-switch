import { describe, expect, it } from "vitest";
import { providerPresets } from "@/config/claudeProviderPresets";
import { codexProviderPresets } from "@/config/codexProviderPresets";
import { geminiProviderPresets } from "@/config/geminiProviderPresets";
import { claudeDesktopProviderPresets } from "@/config/claudeDesktopProviderPresets";
import { opencodeProviderPresets } from "@/config/opencodeProviderPresets";
import { openclawProviderPresets } from "@/config/openclawProviderPresets";
import { hermesProviderPresets } from "@/config/hermesProviderPresets";
import { universalProviderPresets } from "@/config/universalProviderPresets";

const hiddenSmallProviderNames = [
  "LemonData",
  "TheRouter",
  "PackyCode",
  "APIKEY.FUN",
  "RunAPI",
  "ClaudeCN",
  "Unity2.ai",
  "CCSub",
  "Shengsuanyun",
];

describe("preset visibility", () => {
  it("keeps Juhe365, official, major brand, and custom presets visible", () => {
    expect(providerPresets.map((preset) => preset.name)).toEqual(
      expect.arrayContaining([
        "Juhe365",
        "Claude Official",
        "Gemini Native",
        "GitHub Copilot",
        "Xiaomi MiMo",
        "AWS Bedrock (AKSK)",
      ]),
    );
    expect(codexProviderPresets.map((preset) => preset.name)).toEqual(
      expect.arrayContaining([
        "Juhe365",
        "OpenAI Official",
        "Azure OpenAI",
        "DeepSeek",
        "Xiaomi MiMo",
        "OpenRouter",
      ]),
    );
    expect(geminiProviderPresets.map((preset) => preset.name)).toEqual(
      expect.arrayContaining(["Juhe365", "Google Official", "OpenRouter", "自定义"]),
    );
    expect(claudeDesktopProviderPresets.map((preset) => preset.name)).toEqual(
      expect.arrayContaining([
        "Juhe365",
        "Claude Desktop Official",
        "Xiaomi MiMo",
      ]),
    );
    expect(opencodeProviderPresets.map((preset) => preset.name)).toEqual(
      expect.arrayContaining([
        "Juhe365",
        "AWS Bedrock",
        "OpenAI Compatible",
        "Oh My OpenCode",
      ]),
    );
    expect(openclawProviderPresets.map((preset) => preset.name)).toEqual(
      expect.arrayContaining([
        "Juhe365",
        "DeepSeek",
        "Xiaomi MiMo",
        "AWS Bedrock",
        "OpenAI Compatible",
      ]),
    );
    expect(hermesProviderPresets.map((preset) => preset.name)).toEqual(
      expect.arrayContaining(["Juhe365", "DeepSeek", "Xiaomi MiMo"]),
    );
    expect(universalProviderPresets.map((preset) => preset.name)).toEqual([
      "自定义网关",
    ]);
  });

  it("hides smaller third-party and partner presets from exported preset lists", () => {
    const visibleNames = [
      ...providerPresets,
      ...codexProviderPresets,
      ...geminiProviderPresets,
      ...claudeDesktopProviderPresets,
      ...opencodeProviderPresets,
      ...openclawProviderPresets,
      ...hermesProviderPresets,
      ...universalProviderPresets,
    ].map((preset) => preset.name);

    for (const hiddenName of hiddenSmallProviderNames) {
      expect(visibleNames).not.toContain(hiddenName);
    }
  });
});
