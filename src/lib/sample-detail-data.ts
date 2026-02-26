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
}>> = {
  "sample-e1": [
    { id: "er-1", college_id: "sample-e1", user_id: "u-anon-10", academics_rating: 4, living_costs_rating: 3, social_life_rating: 5, travel_rating: 5, review_text: "HEC was life-changing. The finance electives are world-class, and Paris is an incredible city to explore on weekends. Housing near Jouy-en-Josas is affordable if you share. The social scene is unmatched — every week has events.", created_at: "2025-09-12T10:00:00Z", updated_at: "2025-09-12T10:00:00Z" },
    { id: "er-2", college_id: "sample-e1", user_id: "u-anon-11", academics_rating: 5, living_costs_rating: 2, social_life_rating: 5, travel_rating: 4, review_text: "Academically rigorous — the case method is intense but rewarding. Paris living costs add up fast, budget €800-1000/month minimum. The HEC network opens doors across European firms.", created_at: "2025-08-05T14:00:00Z", updated_at: "2025-08-05T14:00:00Z" },
    { id: "er-3", college_id: "sample-e1", user_id: "u-anon-12", academics_rating: 4, living_costs_rating: 3, social_life_rating: 4, travel_rating: 5, review_text: "Perfect if you love travel — I visited 9 countries in one semester using budget airlines. Campus is quiet but the exchange cohort bonds quickly. French bureaucracy is the only painful part.", created_at: "2025-07-18T09:00:00Z", updated_at: "2025-07-18T09:00:00Z" },
  ],
  "sample-e2": [
    { id: "er-4", college_id: "sample-e2", user_id: "u-anon-13", academics_rating: 5, living_costs_rating: 3, social_life_rating: 4, travel_rating: 4, review_text: "NUS is academically strong — the tech and entrepreneurship modules are fantastic. Singapore is expensive but incredibly efficient. Hawker centres keep food costs low. Weekend trips to Bali and KL are easy.", created_at: "2025-10-20T11:00:00Z", updated_at: "2025-10-20T11:00:00Z" },
    { id: "er-5", college_id: "sample-e2", user_id: "u-anon-14", academics_rating: 4, living_costs_rating: 2, social_life_rating: 4, travel_rating: 5, review_text: "Great for anyone interested in Asia markets. The consulting club is active and helped me land interviews. Housing in UTown is comfortable. Night life is pricey but the rooftop bars are worth it once in a while.", created_at: "2025-09-30T16:00:00Z", updated_at: "2025-09-30T16:00:00Z" },
  ],
  "sample-e3": [
    { id: "er-6", college_id: "sample-e3", user_id: "u-anon-15", academics_rating: 4, living_costs_rating: 4, social_life_rating: 5, travel_rating: 5, review_text: "Milan is magic — the fashion, food, and culture are unreal. Bocconi's luxury & fashion management course is unique. Rent is manageable if you share near Navigli. Italian espresso will ruin you for all other coffee.", created_at: "2025-11-05T08:30:00Z", updated_at: "2025-11-05T08:30:00Z" },
  ],
};

export const SAMPLE_INTERNSHIP_REVIEWS: Record<string, Array<{
  id: string; company_id: string; user_id: string;
  work_culture_rating: number; learning_rating: number; mentorship_rating: number; ppo_rating: number;
  stipend: string; review_text: string; created_at: string; updated_at: string;
}>> = {
  "sample-i1": [
    { id: "ir-1", company_id: "sample-i1", user_id: "u-anon-20", work_culture_rating: 4, learning_rating: 5, mentorship_rating: 5, ppo_rating: 4, stipend: "₹2.5L/mo", review_text: "Insane learning curve in the best way. My engagement manager was brilliant — structured thinking became second nature. Travel to client sites (3 cities in 8 weeks) was exhausting but eye-opening. PPO process is transparent.", created_at: "2025-10-15T10:00:00Z", updated_at: "2025-10-15T10:00:00Z" },
    { id: "ir-2", company_id: "sample-i1", user_id: "u-anon-21", work_culture_rating: 3, learning_rating: 5, mentorship_rating: 4, ppo_rating: 4, stipend: "₹2.5L/mo", review_text: "Work-life balance doesn't exist — 70-80 hour weeks are real. But the problem-solving toolkit you build is unmatched. The team dinners and offsites make up for the grind. Highly recommend if you can handle intensity.", created_at: "2025-09-22T14:00:00Z", updated_at: "2025-09-22T14:00:00Z" },
    { id: "ir-3", company_id: "sample-i1", user_id: "u-anon-22", work_culture_rating: 5, learning_rating: 4, mentorship_rating: 5, ppo_rating: 3, stipend: "₹2.5L/mo", review_text: "My project was in healthcare — niche but fascinating. The buddy system pairs you with an associate who genuinely invests in your growth. Bangalore office has great culture. PPO depends heavily on your project rating.", created_at: "2025-08-30T09:00:00Z", updated_at: "2025-08-30T09:00:00Z" },
  ],
  "sample-i2": [
    { id: "ir-4", company_id: "sample-i2", user_id: "u-anon-23", work_culture_rating: 4, learning_rating: 4, mentorship_rating: 3, ppo_rating: 4, stipend: "₹2L/mo", review_text: "IBD division — long hours but incredible exposure to live deals. Built a full pitch book from scratch. The technical training in week 1 is top-notch. Mumbai office has a competitive but collaborative culture.", created_at: "2025-11-01T11:00:00Z", updated_at: "2025-11-01T11:00:00Z" },
    { id: "ir-5", company_id: "sample-i2", user_id: "u-anon-24", work_culture_rating: 4, learning_rating: 5, mentorship_rating: 4, ppo_rating: 5, stipend: "₹2L/mo", review_text: "Asset management team was more chill than IBD. Got to work on actual portfolio strategy. The brand name opens every door. Housing allowance is a nice perk. Would recommend the securities division for better WLB.", created_at: "2025-10-10T16:00:00Z", updated_at: "2025-10-10T16:00:00Z" },
  ],
  "sample-i3": [
    { id: "ir-6", company_id: "sample-i3", user_id: "u-anon-25", work_culture_rating: 5, learning_rating: 5, mentorship_rating: 5, ppo_rating: 5, stipend: "₹1.8L/mo", review_text: "Dream internship. The APM program is structured perfectly — you own a real feature from ideation to launch. Free food, gym, and the Bangalore campus is gorgeous. Everyone is genuinely helpful. PPO conversion is high if you ship well.", created_at: "2025-12-02T10:00:00Z", updated_at: "2025-12-02T10:00:00Z" },
  ],
};
