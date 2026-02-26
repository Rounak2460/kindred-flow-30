import { type MockPost, type MockComment } from "./types";

export const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "academics", label: "Academics" },
  { key: "exchange", label: "Exchange" },
  { key: "internships", label: "Internships" },
  { key: "campus", label: "Campus Life" },
  { key: "papers", label: "Exam Papers" },
] as const;

export const FLAIRS: Record<string, string[]> = {
  academics: ["Course Review", "Professor Insight", "Study Tips", "Elective Advice", "Core Course", "Question"],
  exchange: ["Experience Diary", "Application Tips", "Living Abroad", "Academics Abroad", "Question"],
  internships: ["Company Review", "Interview Prep", "Stipend Info", "PPO Experience", "Question"],
  campus: ["Food & Cafes", "Study Spots", "Weekend Getaways", "Gyms & Sports", "Transport", "Pro Tip"],
  papers: ["End Term", "Mid Term", "Quiz", "Case Analysis", "Study Material"],
};

export const MOCK_POSTS: MockPost[] = [];

export const MOCK_COMMENTS: Record<string, MockComment[]> = {};

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString();
}
