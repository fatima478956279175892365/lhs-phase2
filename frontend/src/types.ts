export type ReactionKind = "stand_with" | "this_helped";
export type SortOption = "newest" | "most_supported" | "most_discussed";

export interface Comment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
}

export interface PostSummary {
  id: string;
  title: string | null;
  content: string;
  author_name: string;
  category: string;
  featured: boolean;
  created_at: string;
  comment_count: number;
  stand_with_count: number;
  this_helped_count: number;
  visitor_stood_with: boolean;
  visitor_marked_helped: boolean;
  preview_comments: Comment[];
}

export interface PostDetail extends PostSummary {
  comments: Comment[];
}

export interface PostListResponse {
  items: PostSummary[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface CommunityStats {
  stories: number;
  comments: number;
  stands: number;
  helped: number;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  database: "up" | "down";
  app: string;
}

export interface SafetyResource {
  title: string;
  description: string;
  url: string | null;
  region: string;
}

export interface ReactionResponse {
  kind: ReactionKind;
  active: boolean;
  stand_with_count: number;
  this_helped_count: number;
}

export const CATEGORIES = [
  { id: "all", label: "All voices" },
  { id: "seeking-advice", label: "Seeking advice" },
  { id: "work", label: "Work" },
  { id: "home-marriage", label: "Home & marriage" },
  { id: "daily-life", label: "Daily life" },
  { id: "lessons", label: "Lessons" },
  { id: "support", label: "Support" },
  { id: "other", label: "Other" },
] as const;
