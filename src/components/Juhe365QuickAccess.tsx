import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, KeyRound, Loader2, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import type { Provider } from "@/types";
import { providersApi, type AppId } from "@/lib/api";
import { openclawKeys } from "@/hooks/useOpenClaw";
import { invalidateHermesProviderCaches } from "@/hooks/useHermes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const JUHE365_BASE_URL = "https://api.juhe365.vip/v1";
const JUHE365_HOME_URL = "https://api.juhe365.vip";
const BRAND_COLOR = "#4052d6";
const DEFAULT_MODEL = "gpt-5.4";

const QUICK_ACCESS_APP_IDS: AppId[] = [
  "claude",
  "claude-desktop",
  "codex",
  "gemini",
  "opencode",
  "openclaw",
  "hermes",
];

const APP_LABELS: Record<AppId, string> = {
  claude: "Claude",
  "claude-desktop": "Claude Desktop",
  codex: "Codex",
  gemini: "Gemini",
  opencode: "OpenCode",
  openclaw: "OpenClaw",
  hermes: "Hermes",
};

type ProviderFactory = (apiKey: string) => Provider;

interface QuickAccessTarget {
  appId: AppId;
  addToLive?: boolean;
  createProvider: ProviderFactory;
}

function createBaseProvider(id: string, settingsConfig: Provider["settingsConfig"]): Provider {
  return {
    id,
    name: "Juhe365",
    settingsConfig,
    websiteUrl: JUHE365_HOME_URL,
    category: "aggregator",
    createdAt: Date.now(),
    icon: "generic",
    iconColor: BRAND_COLOR,
    isPartner: true,
    meta: {
      isPartner: true,
      custom_endpoints: {
        [JUHE365_BASE_URL]: {
          url: JUHE365_BASE_URL,
          addedAt: Date.now(),
          lastUsed: Date.now(),
        },
      },
    },
  };
}

function createCodexConfig(): string {
  return [
    `model_provider = "juhe365"`,
    `model = "${DEFAULT_MODEL}"`,
    `model_reasoning_effort = "high"`,
    `disable_response_storage = true`,
    "",
    `[model_providers.juhe365]`,
    `name = "juhe365"`,
    `base_url = "${JUHE365_BASE_URL}"`,
    `wire_api = "responses"`,
    `requires_openai_auth = true`,
    "",
  ].join("\n");
}

const QUICK_ACCESS_TARGETS: QuickAccessTarget[] = [
  {
    appId: "claude",
    createProvider: (apiKey) => ({
      ...createBaseProvider("juhe365-claude", {
        env: {
          ANTHROPIC_BASE_URL: JUHE365_BASE_URL,
          ANTHROPIC_AUTH_TOKEN: apiKey,
        },
      }),
      meta: {
        ...createBaseProvider("juhe365-claude", {}).meta,
        apiFormat: "anthropic",
        apiKeyField: "ANTHROPIC_AUTH_TOKEN",
        promptCacheKey: "juhe365",
      },
    }),
  },
  {
    appId: "claude-desktop",
    createProvider: (apiKey) => ({
      ...createBaseProvider("juhe365-claude-desktop", {
        env: {
          ANTHROPIC_BASE_URL: JUHE365_BASE_URL,
          ANTHROPIC_AUTH_TOKEN: apiKey,
        },
      }),
      meta: {
        ...createBaseProvider("juhe365-claude-desktop", {}).meta,
        claudeDesktopMode: "direct",
        apiFormat: "anthropic",
        apiKeyField: "ANTHROPIC_AUTH_TOKEN",
        promptCacheKey: "juhe365",
      },
    }),
  },
  {
    appId: "codex",
    createProvider: (apiKey) =>
      createBaseProvider("juhe365-codex", {
        auth: {
          OPENAI_API_KEY: apiKey,
        },
        config: createCodexConfig(),
      }),
  },
  {
    appId: "gemini",
    createProvider: (apiKey) =>
      createBaseProvider("juhe365-gemini", {
        env: {
          GOOGLE_GEMINI_BASE_URL: JUHE365_BASE_URL,
          GEMINI_API_KEY: apiKey,
          GEMINI_MODEL: "gemini-3.1-pro",
        },
      }),
  },
  {
    appId: "opencode",
    addToLive: true,
    createProvider: (apiKey) =>
      createBaseProvider("juhe365-opencode", {
        npm: "@ai-sdk/openai-compatible",
        name: "Juhe365",
        options: {
          baseURL: JUHE365_BASE_URL,
          apiKey,
          setCacheKey: true,
        },
        models: {
          [DEFAULT_MODEL]: {
            name: "GPT-5.4",
          },
        },
      }),
  },
  {
    appId: "openclaw",
    addToLive: true,
    createProvider: (apiKey) =>
      createBaseProvider("juhe365-openclaw", {
        baseUrl: JUHE365_BASE_URL,
        apiKey,
        api: "openai-responses",
        models: [
          {
            id: DEFAULT_MODEL,
            name: "GPT-5.4",
            contextWindow: 400000,
          },
        ],
      }),
  },
  {
    appId: "hermes",
    addToLive: true,
    createProvider: (apiKey) =>
      createBaseProvider("juhe365-hermes", {
        name: "juhe365",
        base_url: JUHE365_BASE_URL,
        api_key: apiKey,
        api_mode: "chat_completions",
        models: [
          {
            id: `openai/${DEFAULT_MODEL}`,
            name: "GPT-5.4",
          },
        ],
      }),
  },
];

async function upsertAndSwitchProvider(target: QuickAccessTarget, apiKey: string) {
  const provider = target.createProvider(apiKey);
  const existingProviders = await providersApi.getAll(target.appId);
  const existing = existingProviders[provider.id];

  if (existing) {
    await providersApi.update(
      {
        ...existing,
        ...provider,
        createdAt: existing.createdAt ?? provider.createdAt,
        sortIndex: existing.sortIndex,
      },
      target.appId,
      provider.id,
    );
  } else {
    await providersApi.add(provider, target.appId, target.addToLive);
  }

  await providersApi.switch(provider.id, target.appId);
}

export function Juhe365QuickAccess() {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const targetSummary = useMemo(
    () => QUICK_ACCESS_APP_IDS.map((appId) => APP_LABELS[appId]).join(" / "),
    [],
  );


  const handleApply = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      toast.error("请输入 Juhe365 API Key");
      return;
    }

    setIsApplying(true);
    const succeeded: AppId[] = [];
    const failed: string[] = [];

    for (const target of QUICK_ACCESS_TARGETS) {
      try {
        await upsertAndSwitchProvider(target, trimmedKey);
        succeeded.push(target.appId);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failed.push(`${APP_LABELS[target.appId]}：${message}`);
      }
    }

    await Promise.all([
      ...QUICK_ACCESS_APP_IDS.map((appId) =>
        queryClient.invalidateQueries({ queryKey: ["providers", appId] }),
      ),
      queryClient.invalidateQueries({ queryKey: ["opencodeLiveProviderIds"] }),
      queryClient.invalidateQueries({ queryKey: openclawKeys.liveProviderIds }),
      queryClient.invalidateQueries({ queryKey: openclawKeys.defaultModel }),
      queryClient.invalidateQueries({ queryKey: openclawKeys.health }),
      invalidateHermesProviderCaches(queryClient),
    ]);

    try {
      await providersApi.updateTrayMenu();
    } catch {
      // Tray refresh is best-effort; the provider configs have already been saved.
    }

    setIsApplying(false);

    if (succeeded.length > 0) {
      toast.success(`已配置 ${succeeded.length} 个 Juhe365 入口`, {
        description: succeeded.map((appId) => APP_LABELS[appId]).join("、"),
      });
    }

    if (failed.length > 0) {
      toast.warning("部分客户端未配置成功", {
        description: failed.slice(0, 3).join("；"),
      });
    }
  };

  return (
    <section className="overflow-hidden rounded-lg border border-[#4052d6]/20 bg-gradient-to-br from-[#f7f9ff] via-white to-[#eef2ff] p-4 shadow-sm dark:border-[#8ea0ff]/25 dark:from-[#13172a] dark:via-[#0e111b] dark:to-[#171b33]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#4052d6] text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold leading-tight text-slate-950 dark:text-white">
                Juhe365 快速接入
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                输入一次 Key，自动创建并切换 {targetSummary}。
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-xl">
          <div className="relative min-w-0 flex-1">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Juhe365 API Key"
              className="h-10 rounded-md pl-9"
              autoComplete="off"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleApply}
              disabled={isApplying}
              className={cn(
                "h-10 shrink-0 rounded-md bg-[#4052d6] text-white hover:bg-[#3344bf]",
                "disabled:opacity-70",
              )}
            >
              {isApplying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              一键配置
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 shrink-0 rounded-md"
              onClick={() => window.open(JUHE365_HOME_URL, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
