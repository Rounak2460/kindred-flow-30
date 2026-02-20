export interface MockPost {
  id: string;
  user_id: string;
  category: string;
  title: string;
  body: string;
  flair: string | null;
  upvote_count: number;
  downvote_count: number;
  comment_count: number;
  pinned: boolean;
  course_code?: string | null;
  course_name?: string | null;
  company_name?: string | null;
  college_name?: string | null;
  file_url?: string | null;
  created_at: string;
  author_name?: string;
  author_batch?: string;
}

export interface MockComment {
  id: string;
  post_id: string;
  parent_id: string | null;
  user_id: string;
  body: string;
  upvote_count: number;
  downvote_count: number;
  created_at: string;
  author_name?: string;
  author_batch?: string;
  replies: MockComment[];
}
