import type { DiscordStatus } from "./lanyard";

export type Mood = {
  name: "morning" | "day" | "evening" | "night";
  key: string;
  keyIntensity: number;
  fill: string;
  ambient: number;
};

// Scene lighting follows the visitor's local time: warm mornings and evenings,
// neutral days and a cool, dimmer night
export function moodAt(hour: number): Mood {
  if (hour >= 5 && hour < 10)
    return { name: "morning", key: "#fff1e0", keyIntensity: 1.5, fill: "#c4dcff", ambient: 0.5 };
  if (hour >= 10 && hour < 17)
    return { name: "day", key: "#ffffff", keyIntensity: 1.6, fill: "#ffffff", ambient: 0.55 };
  if (hour >= 17 && hour < 22)
    return { name: "evening", key: "#ffeadb", keyIntensity: 1.45, fill: "#ffc4d4", ambient: 0.45 };
  return { name: "night", key: "#d6deff", keyIntensity: 1.2, fill: "#8f9bff", ambient: 0.38 };
}

// A faint rim light in the colour of the Discord status dot; offline adds none
export function statusTint(status: DiscordStatus | undefined): string | null {
  switch (status) {
    case "online":
      return "#34d399";
    case "idle":
      return "#fbbf24";
    case "dnd":
      return "#f43f5e";
    default:
      return null;
  }
}
