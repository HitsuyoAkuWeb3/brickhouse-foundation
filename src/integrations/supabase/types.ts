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
      brick_affirmations: {
        Row: {
          affirmation: string
          brick_id: number
          category: string | null
          created_at: string
          id: string
        }
        Insert: {
          affirmation: string
          brick_id: number
          category?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          affirmation?: string
          brick_id?: number
          category?: string | null
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      daily_rituals: {
        Row: {
          created_at: string
          evening_reflection: boolean
          gratitude_note: string | null
          id: string
          joy_moment: string | null
          midday_checkin: boolean
          morning_affirmation: boolean
          ritual_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evening_reflection?: boolean
          gratitude_note?: string | null
          id?: string
          joy_moment?: string | null
          midday_checkin?: boolean
          morning_affirmation?: boolean
          ritual_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          evening_reflection?: boolean
          gratitude_note?: string | null
          id?: string
          joy_moment?: string | null
          midday_checkin?: boolean
          morning_affirmation?: boolean
          ritual_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goddess_prescriptions: {
        Row: {
          colors: Json
          created_at: string
          crystals: Json
          element: string | null
          id: string
          mantra: string | null
          ruling_planet: string | null
          spiritual_tools: Json
          updated_at: string
          user_id: string
          zodiac_sign: string
        }
        Insert: {
          colors?: Json
          created_at?: string
          crystals?: Json
          element?: string | null
          id?: string
          mantra?: string | null
          ruling_planet?: string | null
          spiritual_tools?: Json
          updated_at?: string
          user_id: string
          zodiac_sign: string
        }
        Update: {
          colors?: Json
          created_at?: string
          crystals?: Json
          element?: string | null
          id?: string
          mantra?: string | null
          ruling_planet?: string | null
          spiritual_tools?: Json
          updated_at?: string
          user_id?: string
          zodiac_sign?: string
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
      lead_transfers: {
        Row: {
          audit_scores: Json
          claimed: boolean
          created_at: string
          id: string
          transfer_token: string
        }
        Insert: {
          audit_scores: Json
          claimed?: boolean
          created_at?: string
          id?: string
          transfer_token?: string
        }
        Update: {
          audit_scores?: Json
          claimed?: boolean
          created_at?: string
          id?: string
          transfer_token?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          brick_id: number
          completed_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          brick_id: number
          completed_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          brick_id?: number
          completed_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: []
      }
      passion_picks: {
        Row: {
          affirmation: string | null
          created_at: string
          goal_text: string | null
          id: string
          photo_url: string | null
          song_title: string | null
          song_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          affirmation?: string | null
          created_at?: string
          goal_text?: string | null
          id?: string
          photo_url?: string | null
          song_title?: string | null
          song_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          affirmation?: string | null
          created_at?: string
          goal_text?: string | null
          id?: string
          photo_url?: string | null
          song_title?: string | null
          song_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          audit_scores: Json | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          email: string | null
          goals: string[] | null
          id: string
          name: string | null
          transformation_choice: string | null
          updated_at: string
        }
        Insert: {
          audit_scores?: Json | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          goals?: string[] | null
          id: string
          name?: string | null
          transformation_choice?: string | null
          updated_at?: string
        }
        Update: {
          audit_scores?: Json | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          goals?: string[] | null
          id?: string
          name?: string | null
          transformation_choice?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          category: string
          created_at: string
          days_of_week: number[]
          id: string
          is_active: boolean
          reminder_type: string
          time_of_day: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          days_of_week?: number[]
          id?: string
          is_active?: boolean
          reminder_type?: string
          time_of_day?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          days_of_week?: number[]
          id?: string
          is_active?: boolean
          reminder_type?: string
          time_of_day?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_affirmations: {
        Row: {
          affirmation: string
          brick_id: number | null
          created_at: string
          id: string
          is_favorite: boolean | null
          user_id: string
        }
        Insert: {
          affirmation: string
          brick_id?: number | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          user_id: string
        }
        Update: {
          affirmation?: string
          brick_id?: number | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          user_id?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
