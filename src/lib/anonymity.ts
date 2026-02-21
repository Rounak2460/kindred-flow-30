// Anonymity utility - generates consistent anonymous handles from user IDs
// Same user_id always maps to the same handle, ensuring consistency

const ADJECTIVES = [
  "Swift", "Clever", "Silent", "Bold", "Bright", "Calm", "Keen", "Wise",
  "Noble", "Brave", "Quick", "Sharp", "Witty", "Eager", "Proud", "Chill",
  "Sly", "Deft", "Warm", "Cool", "Vivid", "Apt", "Fair", "Grand",
  "Neat", "Pure", "Rare", "Sage", "True", "Vast", "Zen", "Epic",
];

const ANIMALS = [
  "Falcon", "Panther", "Owl", "Fox", "Wolf", "Eagle", "Hawk", "Tiger",
  "Bear", "Lynx", "Crane", "Raven", "Otter", "Stag", "Cobra", "Heron",
  "Puma", "Bison", "Viper", "Dove", "Moose", "Pike", "Shark", "Manta",
  "Gecko", "Ibis", "Kite", "Newt", "Quail", "Swan", "Wren", "Yak",
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a consistent anonymous handle for a user.
 * Same userId always produces the same handle.
 * Optional salt (like post_id) can make it per-context unique.
 */
export function generateAnonHandle(userId: string, _salt?: string): string {
  const hash = hashCode(userId);
  const adj = ADJECTIVES[hash % ADJECTIVES.length];
  const animal = ANIMALS[(hash >> 5) % ANIMALS.length];
  const num = (hash % 900) + 100; // 3-digit number
  return `${adj}${animal}${num}`;
}

/**
 * Generate a short anonymous display for comments
 */
export function generateAnonShort(userId: string): string {
  return generateAnonHandle(userId);
}

/**
 * Generate a per-post unique anonymous handle for gossip.
 * Uses both userId and postId so the same user gets different handles per post.
 */
export function generateGossipHandle(userId: string, postId: string): string {
  const hash = hashCode(userId + ":" + postId);
  const adj = ADJECTIVES[hash % ADJECTIVES.length];
  const animal = ANIMALS[(hash >> 5) % ANIMALS.length];
  const num = (hash % 900) + 100;
  return `${adj}${animal}${num}`;
}
