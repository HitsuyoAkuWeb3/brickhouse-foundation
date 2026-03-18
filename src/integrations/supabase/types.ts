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
    PostgrestVersion: "14.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      affirmations: {
        Row: {
          affirmation_type: string | null
          astrological_tag: string | null
          audio_url: string | null
          brick_id: string | null
          category: string | null
          created_at: string | null
          id: string
          text: string
          tier_required: string | null
        }
        Insert: {
          affirmation_type?: string | null
          astrological_tag?: string | null
          audio_url?: string | null
          brick_id?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          text: string
          tier_required?: string | null
        }
        Update: {
          affirmation_type?: string | null
          astrological_tag?: string | null
          audio_url?: string | null
          brick_id?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          text?: string
          tier_required?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affirmations_brick_id_fkey"
            columns: ["brick_id"]
            isOneToOne: false
            referencedRelation: "bricks"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          brick_id: string | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          brick_id?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          brick_id?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_brick_id_fkey"
            columns: ["brick_id"]
            isOneToOne: false
            referencedRelation: "bricks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_results: {
        Row: {
          created_at: string
          id: string
          lead_id: string | null
          scores: Json
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id?: string | null
          scores: Json
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string | null
          scores?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_results_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_waitlist: {
        Row: {
          company_name: string
          company_size: string | null
          contact_name: string | null
          created_at: string | null
          email: string
          id: string
          role: string | null
        }
        Insert: {
          company_name: string
          company_size?: string | null
          contact_name?: string | null
          created_at?: string | null
          email: string
          id?: string
          role?: string | null
        }
        Update: {
          company_name?: string
          company_size?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      bricks: {
        Row: {
          brick_number: number | null
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          lesson_count: number | null
          order_index: number
          slug: string
          title: string
        }
        Insert: {
          brick_number?: number | null
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          lesson_count?: number | null
          order_index: number
          slug: string
          title: string
        }
        Update: {
          brick_number?: number | null
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          lesson_count?: number | null
          order_index?: number
          slug?: string
          title?: string
        }
        Relationships: []
      }
      daily_rituals: {
        Row: {
          completed_habits: Json | null
          created_at: string | null
          date: string
          evening_completed: boolean | null
          id: string
          joy_completed: boolean | null
          joy_scheduled: string | null
          midday_completed: boolean | null
          mood_score: number | null
          morning_affirmation_id: string | null
          morning_completed: boolean | null
          profile_id: string | null
          reflection_text: string | null
          ritual_data: Json | null
          streak_count: number | null
        }
        Insert: {
          completed_habits?: Json | null
          created_at?: string | null
          date?: string
          evening_completed?: boolean | null
          id?: string
          joy_completed?: boolean | null
          joy_scheduled?: string | null
          midday_completed?: boolean | null
          mood_score?: number | null
          morning_affirmation_id?: string | null
          morning_completed?: boolean | null
          profile_id?: string | null
          reflection_text?: string | null
          ritual_data?: Json | null
          streak_count?: number | null
        }
        Update: {
          completed_habits?: Json | null
          created_at?: string | null
          date?: string
          evening_completed?: boolean | null
          id?: string
          joy_completed?: boolean | null
          joy_scheduled?: string | null
          midday_completed?: boolean | null
          mood_score?: number | null
          morning_affirmation_id?: string | null
          morning_completed?: boolean | null
          profile_id?: string | null
          reflection_text?: string | null
          ritual_data?: Json | null
          streak_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_rituals_morning_affirmation_id_fkey"
            columns: ["morning_affirmation_id"]
            isOneToOne: false
            referencedRelation: "affirmations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_rituals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goddess_prescriptions: {
        Row: {
          created_at: string | null
          generated_at: string | null
          id: string
          prescription_data: Json
          profile_id: string | null
        }
        Insert: {
          created_at?: string | null
          generated_at?: string | null
          id?: string
          prescription_data: Json
          profile_id?: string | null
        }
        Update: {
          created_at?: string | null
          generated_at?: string | null
          id?: string
          prescription_data?: Json
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goddess_prescriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_captures: {
        Row: {
          audit_scores: Json | null
          converted_to_user: boolean | null
          created_at: string | null
          email: string
          entry_point: string | null
          id: string
          name: string | null
          phone: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          audit_scores?: Json | null
          converted_to_user?: boolean | null
          created_at?: string | null
          email: string
          entry_point?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          audit_scores?: Json | null
          converted_to_user?: boolean | null
          created_at?: string | null
          email?: string
          entry_point?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      lead_transfers: {
        Row: {
          audit_scores: Json
          claimed_at: string | null
          created_at: string
          transfer_token: string
        }
        Insert: {
          audit_scores: Json
          claimed_at?: string | null
          created_at?: string
          transfer_token?: string
        }
        Update: {
          audit_scores?: Json
          claimed_at?: string | null
          created_at?: string
          transfer_token?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          variant: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          variant: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          variant?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          brick_id: string | null
          content: string | null
          content_body: string | null
          content_type: Database["public"]["Enums"]["content_type_enum"] | null
          content_url: string | null
          created_at: string | null
          id: string
          is_premium: boolean | null
          order_index: number
          sign_tags: string[] | null
          sort_order: number | null
          summary: string | null
          tier_required: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          brick_id?: string | null
          content?: string | null
          content_body?: string | null
          content_type?: Database["public"]["Enums"]["content_type_enum"] | null
          content_url?: string | null
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          order_index: number
          sign_tags?: string[] | null
          sort_order?: number | null
          summary?: string | null
          tier_required?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          brick_id?: string | null
          content?: string | null
          content_body?: string | null
          content_type?: Database["public"]["Enums"]["content_type_enum"] | null
          content_url?: string | null
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          order_index?: number
          sign_tags?: string[] | null
          sort_order?: number | null
          summary?: string | null
          tier_required?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_brick_id_fkey"
            columns: ["brick_id"]
            isOneToOne: false
            referencedRelation: "bricks"
            referencedColumns: ["id"]
          },
        ]
      }
      passion_picks: {
        Row: {
          affirmation_text: string | null
          created_at: string | null
          id: string
          image_url: string | null
          song_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          affirmation_text?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          song_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          affirmation_text?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          song_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          audit_scores: Json | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string | null
          email: string
          full_name: string | null
          goals: string[] | null
          id: string
          life_goals: Json | null
          onboarding_complete: boolean | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          phone: string | null
          shopify_customer_id: string | null
          stripe_customer_id: string | null
          subscription_tier:
            | Database["public"]["Enums"]["user_subscription_tier"]
            | null
          transformation_choice:
            | Database["public"]["Enums"]["transformation_track"]
            | null
          transformation_track:
            | Database["public"]["Enums"]["transformation_track_enum"]
            | null
          updated_at: string | null
          zodiac_sign: string | null
        }
        Insert: {
          audit_scores?: Json | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          goals?: string[] | null
          id: string
          life_goals?: Json | null
          onboarding_complete?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          shopify_customer_id?: string | null
          stripe_customer_id?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["user_subscription_tier"]
            | null
          transformation_choice?:
            | Database["public"]["Enums"]["transformation_track"]
            | null
          transformation_track?:
            | Database["public"]["Enums"]["transformation_track_enum"]
            | null
          updated_at?: string | null
          zodiac_sign?: string | null
        }
        Update: {
          audit_scores?: Json | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          goals?: string[] | null
          id?: string
          life_goals?: Json | null
          onboarding_complete?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          shopify_customer_id?: string | null
          stripe_customer_id?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["user_subscription_tier"]
            | null
          transformation_choice?:
            | Database["public"]["Enums"]["transformation_track"]
            | null
          transformation_track?:
            | Database["public"]["Enums"]["transformation_track_enum"]
            | null
          updated_at?: string | null
          zodiac_sign?: string | null
        }
        Relationships: []
      }
      user_brick_progress: {
        Row: {
          brick_id: string | null
          completed_at: string | null
          id: string
          is_active: boolean | null
          is_unlocked: boolean | null
          lessons_completed: number | null
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          brick_id?: string | null
          completed_at?: string | null
          id?: string
          is_active?: boolean | null
          is_unlocked?: boolean | null
          lessons_completed?: number | null
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          brick_id?: string | null
          completed_at?: string | null
          id?: string
          is_active?: boolean | null
          is_unlocked?: boolean | null
          lessons_completed?: number | null
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_brick_progress_brick_id_fkey"
            columns: ["brick_id"]
            isOneToOne: false
            referencedRelation: "bricks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_brick_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          completed_at: string | null
          homework_response: Json | null
          id: string
          lesson_id: string | null
          status: Database["public"]["Enums"]["lesson_status_enum"] | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          homework_response?: Json | null
          id?: string
          lesson_id?: string | null
          status?: Database["public"]["Enums"]["lesson_status_enum"] | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          homework_response?: Json | null
          id?: string
          lesson_id?: string | null
          status?: Database["public"]["Enums"]["lesson_status_enum"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      category_enum: "build_it" | "feed_it" | "live_it"
      content_type: "audio_lesson" | "video_course" | "meditation" | "workbook"
      content_type_enum: "text" | "video" | "audio" | "exercise" | "homework"
      lesson_status_enum: "not_started" | "in_progress" | "completed"
      phase_enum:
        | "tomorrow"
        | "this_week"
        | "this_month"
        | "3_months"
        | "6_months"
        | "9_months"
      tier_enum: "free" | "foundation" | "brickhouse" | "goddess" | "coaching"
      transformation_track:
        | "spiritual"
        | "business"
        | "wellness"
        | "relationships"
      transformation_track_enum:
        | "badbody_to_brickhouse"
        | "drowning_to_building"
        | "crumbs_to_adoration"
      user_subscription_tier:
        | "free"
        | "foundation"
        | "brickhouse"
        | "goddess"
        | "coaching"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      category_enum: ["build_it", "feed_it", "live_it"],
      content_type: ["audio_lesson", "video_course", "meditation", "workbook"],
      content_type_enum: ["text", "video", "audio", "exercise", "homework"],
      lesson_status_enum: ["not_started", "in_progress", "completed"],
      phase_enum: [
        "tomorrow",
        "this_week",
        "this_month",
        "3_months",
        "6_months",
        "9_months",
      ],
      tier_enum: ["free", "foundation", "brickhouse", "goddess", "coaching"],
      transformation_track: [
        "spiritual",
        "business",
        "wellness",
        "relationships",
      ],
      transformation_track_enum: [
        "badbody_to_brickhouse",
        "drowning_to_building",
        "crumbs_to_adoration",
      ],
      user_subscription_tier: [
        "free",
        "foundation",
        "brickhouse",
        "goddess",
        "coaching",
      ],
    },
  },
} as const
