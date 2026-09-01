const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "#0A66C2",
  instagram: "#E1306C",
  twitter: "#1DA1F2",
  x: "#000000",
  facebook: "#1877F2",
  youtube: "#FF0000",
  tiktok: "#FE2C55",
  threads: "#000000",
  pinterest: "#E60023",
};

export function platformColor(platform: string): string {
  return PLATFORM_COLORS[platform.trim().toLowerCase()] ?? "#8A8A86";
}
