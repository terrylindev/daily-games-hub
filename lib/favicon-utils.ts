/**
 * Utility functions for working with favicons
 */

/**
 * Extract the domain from a URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    console.error("Invalid URL:", url, error);
    return "";
  }
}

/**
 * Get the favicon URL for a domain using multiple services for better results
 */
export function getFaviconUrl(url: string): string {
  const domain = extractDomain(url);
  if (!domain) return "";
  
  // Use Google's favicon service which provides good quality icons
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  
  // Alternative services if needed:
  // return `https://icon.horse/icon/${domain}`;
  // return `https://www.duckduckgo.com/favicon/${domain}`;
  // return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=32`;
}

/**
 * Get a fallback icon based on the game category
 */
export function getFallbackIcon(category: string): string {
  const icons: Record<string, string> = {
    word: "📝",
    geography: "🌍",
    music: "🎵",
    movies: "🎬",
    gaming: "🎮",
    sports: "⚽",
    math: "🔢",
    other: "🎯",
  };

  return icons[category] || "🎲";
} 