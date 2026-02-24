export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      campus_tip_votes: {
        Row: {
          created_at: string
          id: string
          tip_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tip_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campus_tip_votes_tip_id_fkey"
            columns: ["tip_id"]
            isOneToOne: false
            referencedRelation: "campus_tips"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_tips: {
        Row: {
          category: Database["public"]["Enums"]["campus_category"]
          created_at: string
          id: string
          is_anonymous: boolean
          name: string
          rating: number
          tip_text: string
          updated_at: string
          useful_count: number
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["campus_category"]
          created_at?: string
          id?: string
          is_anonymous?: boolean
          name: string
          rating: number
          tip_text: string
          updated_at?: string
          useful_count?: number
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["campus_category"]
          created_at?: string
          id?: string
          is_anonymous?: boolean
          name?: string
          rating?: number
          tip_text?: string
          updated_at?: string
          useful_count?: number
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          body: string
          created_at: string
          downvote_count: number
          id: string
          is_anonymous: boolean
          moderation_reason: string | null
          moderation_status: string
          parent_id: string | null
          post_id: string
          updated_at: string
          upvote_count: number
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          downvote_count?: number
          id?: string
          is_anonymous?: boolean
          moderation_reason?: string | null
          moderation_status?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
          upvote_count?: number
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          downvote_count?: number
          id?: string
          is_anonymous?: boolean
          moderation_reason?: string | null
          moderation_status?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          upvote_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_views: {
        Row: {
          content_id: string
          content_type: Database["public"]["Enums"]["contribution_type"]
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: Database["public"]["Enums"]["contribution_type"]
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: Database["public"]["Enums"]["contribution_type"]
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          last_read_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_review_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "course_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          course_id: string
          created_at: string
          difficulty_rating: number
          helpful_count: number
          id: string
          is_anonymous: boolean
          overall_rating: number
          relevance_rating: number
          review_text: string
          tags: string[]
          tips: string | null
          updated_at: string
          user_id: string
          workload_rating: number
        }
        Insert: {
          course_id: string
          created_at?: string
          difficulty_rating: number
          helpful_count?: number
          id?: string
          is_anonymous?: boolean
          overall_rating: number
          relevance_rating: number
          review_text: string
          tags?: string[]
          tips?: string | null
          updated_at?: string
          user_id: string
          workload_rating: number
        }
        Update: {
          course_id?: string
          created_at?: string
          difficulty_rating?: number
          helpful_count?: number
          id?: string
          is_anonymous?: boolean
          overall_rating?: number
          relevance_rating?: number
          review_text?: string
          tags?: string[]
          tips?: string | null
          updated_at?: string
          user_id?: string
          workload_rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          avg_rating: number
          category: Database["public"]["Enums"]["course_category"]
          code: string
          created_at: string
          created_by: string
          description: string
          domain: Database["public"]["Enums"]["course_domain"]
          id: string
          name: string
          professor: string
          review_count: number
          term: string
          updated_at: string
        }
        Insert: {
          avg_rating?: number
          category?: Database["public"]["Enums"]["course_category"]
          code?: string
          created_at?: string
          created_by: string
          description?: string
          domain?: Database["public"]["Enums"]["course_domain"]
          id?: string
          name: string
          professor?: string
          review_count?: number
          term?: string
          updated_at?: string
        }
        Update: {
          avg_rating?: number
          category?: Database["public"]["Enums"]["course_category"]
          code?: string
          created_at?: string
          created_by?: string
          description?: string
          domain?: Database["public"]["Enums"]["course_domain"]
          id?: string
          name?: string
          professor?: string
          review_count?: number
          term?: string
          updated_at?: string
        }
        Relationships: []
      }
      exam_paper_votes: {
        Row: {
          created_at: string
          id: string
          paper_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          paper_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          paper_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_paper_votes_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "exam_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_papers: {
        Row: {
          course_id: string
          created_at: string
          exam_type: Database["public"]["Enums"]["exam_type"]
          file_url: string
          id: string
          title: string
          user_id: string
          vote_count: number
          year: number
        }
        Insert: {
          course_id: string
          created_at?: string
          exam_type: Database["public"]["Enums"]["exam_type"]
          file_url: string
          id?: string
          title: string
          user_id: string
          vote_count?: number
          year: number
        }
        Update: {
          course_id?: string
          created_at?: string
          exam_type?: Database["public"]["Enums"]["exam_type"]
          file_url?: string
          id?: string
          title?: string
          user_id?: string
          vote_count?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_papers_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_colleges: {
        Row: {
          avg_rating: number
          country: string
          created_at: string
          created_by: string
          description: string
          highlights: string[]
          id: string
          name: string
          region: Database["public"]["Enums"]["exchange_region"]
          review_count: number
          updated_at: string
        }
        Insert: {
          avg_rating?: number
          country: string
          created_at?: string
          created_by: string
          description?: string
          highlights?: string[]
          id?: string
          name: string
          region: Database["public"]["Enums"]["exchange_region"]
          review_count?: number
          updated_at?: string
        }
        Update: {
          avg_rating?: number
          country?: string
          created_at?: string
          created_by?: string
          description?: string
          highlights?: string[]
          id?: string
          name?: string
          region?: Database["public"]["Enums"]["exchange_region"]
          review_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      exchange_reviews: {
        Row: {
          academics_rating: number
          college_id: string
          created_at: string
          id: string
          is_anonymous: boolean
          living_costs_rating: number
          review_text: string
          social_life_rating: number
          travel_rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          academics_rating: number
          college_id: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          living_costs_rating: number
          review_text: string
          social_life_rating: number
          travel_rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          academics_rating?: number
          college_id?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          living_costs_rating?: number
          review_text?: string
          social_life_rating?: number
          travel_rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exchange_reviews_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "exchange_colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      gossip_comments: {
        Row: {
          body: string
          created_at: string
          downvote_count: number
          gossip_id: string
          id: string
          moderation_reason: string | null
          moderation_status: string
          parent_id: string | null
          upvote_count: number
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          downvote_count?: number
          gossip_id: string
          id?: string
          moderation_reason?: string | null
          moderation_status?: string
          parent_id?: string | null
          upvote_count?: number
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          downvote_count?: number
          gossip_id?: string
          id?: string
          moderation_reason?: string | null
          moderation_status?: string
          parent_id?: string | null
          upvote_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gossip_comments_gossip_id_fkey"
            columns: ["gossip_id"]
            isOneToOne: false
            referencedRelation: "gossip_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gossip_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "gossip_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      gossip_posts: {
        Row: {
          body: string
          comment_count: number
          created_at: string
          downvote_count: number
          id: string
          moderation_reason: string | null
          moderation_status: string
          upvote_count: number
          user_id: string
        }
        Insert: {
          body: string
          comment_count?: number
          created_at?: string
          downvote_count?: number
          id?: string
          moderation_reason?: string | null
          moderation_status?: string
          upvote_count?: number
          user_id: string
        }
        Update: {
          body?: string
          comment_count?: number
          created_at?: string
          downvote_count?: number
          id?: string
          moderation_reason?: string | null
          moderation_status?: string
          upvote_count?: number
          user_id?: string
        }
        Relationships: []
      }
      internship_companies: {
        Row: {
          avg_rating: number
          avg_stipend: string
          created_at: string
          created_by: string
          description: string
          domain: Database["public"]["Enums"]["internship_domain"]
          highlights: string[]
          id: string
          name: string
          review_count: number
          updated_at: string
        }
        Insert: {
          avg_rating?: number
          avg_stipend?: string
          created_at?: string
          created_by: string
          description?: string
          domain: Database["public"]["Enums"]["internship_domain"]
          highlights?: string[]
          id?: string
          name: string
          review_count?: number
          updated_at?: string
        }
        Update: {
          avg_rating?: number
          avg_stipend?: string
          created_at?: string
          created_by?: string
          description?: string
          domain?: Database["public"]["Enums"]["internship_domain"]
          highlights?: string[]
          id?: string
          name?: string
          review_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      internship_reviews: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_anonymous: boolean
          learning_rating: number
          mentorship_rating: number
          ppo_rating: number
          review_text: string
          stipend: string
          updated_at: string
          user_id: string
          work_culture_rating: number
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          learning_rating: number
          mentorship_rating: number
          ppo_rating: number
          review_text: string
          stipend?: string
          updated_at?: string
          user_id: string
          work_culture_rating: number
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          learning_rating?: number
          mentorship_rating?: number
          ppo_rating?: number
          review_text?: string
          stipend?: string
          updated_at?: string
          user_id?: string
          work_culture_rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "internship_reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "internship_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          post_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          post_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          post_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          body: string
          category: string
          college_name: string | null
          comment_count: number
          company_name: string | null
          course_code: string | null
          course_name: string | null
          created_at: string
          downvote_count: number
          file_url: string | null
          flair: string | null
          id: string
          is_anonymous: boolean
          moderation_reason: string | null
          moderation_status: string
          pinned: boolean
          title: string
          updated_at: string
          upvote_count: number
          user_id: string
        }
        Insert: {
          body: string
          category: string
          college_name?: string | null
          comment_count?: number
          company_name?: string | null
          course_code?: string | null
          course_name?: string | null
          created_at?: string
          downvote_count?: number
          file_url?: string | null
          flair?: string | null
          id?: string
          is_anonymous?: boolean
          moderation_reason?: string | null
          moderation_status?: string
          pinned?: boolean
          title: string
          updated_at?: string
          upvote_count?: number
          user_id: string
        }
        Update: {
          body?: string
          category?: string
          college_name?: string | null
          comment_count?: number
          company_name?: string | null
          course_code?: string | null
          course_name?: string | null
          created_at?: string
          downvote_count?: number
          file_url?: string | null
          flair?: string | null
          id?: string
          is_anonymous?: boolean
          moderation_reason?: string | null
          moderation_status?: string
          pinned?: boolean
          title?: string
          updated_at?: string
          upvote_count?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          batch: string
          bio: string
          created_at: string
          credits: number
          founding_contributor: boolean
          free_views_used: number
          gossip_member: boolean
          id: string
          name: string
          section: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          batch?: string
          bio?: string
          created_at?: string
          credits?: number
          founding_contributor?: boolean
          free_views_used?: number
          gossip_member?: boolean
          id?: string
          name?: string
          section?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          batch?: string
          bio?: string
          created_at?: string
          credits?: number
          founding_contributor?: boolean
          free_views_used?: number
          gossip_member?: boolean
          id?: string
          name?: string
          section?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: string
          target_id: string
          target_type: string
          user_id: string
          vote_type: number
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          target_type: string
          user_id: string
          vote_type: number
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
          vote_type?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      campus_category:
        | "food_cafes"
        | "study_spots"
        | "weekend_getaways"
        | "gyms_sports"
        | "transport"
        | "shopping"
      contribution_type:
        | "course_review"
        | "exam_paper"
        | "exchange_review"
        | "internship_review"
        | "campus_tip"
      course_category: "core" | "elective"
      course_domain:
        | "finance"
        | "marketing"
        | "strategy"
        | "operations"
        | "economics"
        | "analytics"
        | "hr"
        | "general"
        | "public_policy"
        | "interdisciplinary"
        | "information_systems"
        | "language"
        | "communication"
        | "entrepreneurship"
      exam_type: "end_term" | "mid_term" | "quiz" | "case_analysis"
      exchange_region:
        | "europe"
        | "asia"
        | "north_america"
        | "oceania"
        | "south_america"
      internship_domain:
        | "consulting"
        | "finance"
        | "pm"
        | "strategy_ops"
        | "marketing"
        | "tech"
        | "gm"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      campus_category: [
        "food_cafes",
        "study_spots",
        "weekend_getaways",
        "gyms_sports",
        "transport",
        "shopping",
      ],
      contribution_type: [
        "course_review",
        "exam_paper",
        "exchange_review",
        "internship_review",
        "campus_tip",
      ],
      course_category: ["core", "elective"],
      course_domain: [
        "finance",
        "marketing",
        "strategy",
        "operations",
        "economics",
        "analytics",
        "hr",
        "general",
        "public_policy",
        "interdisciplinary",
        "information_systems",
        "language",
        "communication",
        "entrepreneurship",
      ],
      exam_type: ["end_term", "mid_term", "quiz", "case_analysis"],
      exchange_region: [
        "europe",
        "asia",
        "north_america",
        "oceania",
        "south_america",
      ],
      internship_domain: [
        "consulting",
        "finance",
        "pm",
        "strategy_ops",
        "marketing",
        "tech",
        "gm",
      ],
    },
  },
} as const
