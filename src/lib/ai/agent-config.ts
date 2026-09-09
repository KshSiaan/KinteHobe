export interface AgentConfig {
  language: "english" | "bangla";
  responseType: "concise" | "detailed" | "balanced" | "creative";
  showProductImage: "show" | "dont_show";
  includeProductLinks: "yes" | "dont";
  confirmBeforeAction: "yes" | "dont";
}

export const STORAGE_KEY = "agent_configuration";

export const defaultConfig: AgentConfig = {
  language: "english",
  responseType: "balanced",
  showProductImage: "show",
  includeProductLinks: "yes",
  confirmBeforeAction: "yes",
};

export function getStoredAgentConfig(): AgentConfig {
  if (typeof window === "undefined") return defaultConfig;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultConfig;

    const parsed = JSON.parse(saved) as Partial<AgentConfig>;
    return { ...defaultConfig, ...parsed };
  } catch {
    return defaultConfig;
  }
}
