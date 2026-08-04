import { describe, expect, it } from "vitest";
import { claudeDesktopProviderPresets } from "@/config/claudeDesktopProviderPresets";
import { providerPresets } from "@/config/claudeProviderPresets";
import { codexProviderPresets } from "@/config/codexProviderPresets";
import { geminiProviderPresets } from "@/config/geminiProviderPresets";
import { hermesProviderPresets } from "@/config/hermesProviderPresets";
import { openclawProviderPresets } from "@/config/openclawProviderPresets";
import { opencodeProviderPresets } from "@/config/opencodeProviderPresets";

describe("curated provider visibility", () => {
  it("hides SubRouter from every provider picker", () => {
    const lists = [
      providerPresets,
      claudeDesktopProviderPresets,
      codexProviderPresets,
      geminiProviderPresets,
      hermesProviderPresets,
      openclawProviderPresets,
      opencodeProviderPresets,
    ];

    for (const presets of lists) {
      expect(presets.some((preset) => preset.name === "SubRouter")).toBe(false);
    }
  });
});
