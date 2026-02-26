// Sample review data for detail pages -- used when IDs start with "sample-"

export const SAMPLE_COURSE_REVIEWS: Record<string, Array<{
  id: string; course_id: string; user_id: string; overall_rating: number;
  difficulty_rating: number; relevance_rating: number; workload_rating: number;
  review_text: string; tags: string[]; tips: string | null;
  helpful_count: number; created_at: string; updated_at: string;
}>> = {};

export const SAMPLE_EXCHANGE_REVIEWS: Record<string, Array<{
  id: string; college_id: string; user_id: string;
  academics_rating: number; living_costs_rating: number; social_life_rating: number; travel_rating: number;
  review_text: string; created_at: string; updated_at: string;
}>> = {};

export const SAMPLE_INTERNSHIP_REVIEWS: Record<string, Array<{
  id: string; company_id: string; user_id: string;
  work_culture_rating: number; learning_rating: number; mentorship_rating: number; ppo_rating: number;
  stipend: string; review_text: string; created_at: string; updated_at: string;
}>> = {};
