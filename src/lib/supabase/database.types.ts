/**
 * Hand-written to match supabase/migrations/001_initial_schema.sql.
 * Regenerate with `supabase gen types typescript --project-id <ref> --schema public`
 * once the Supabase CLI is linked, to replace this file with the authoritative version.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_goals: {
        Row: {
          id: string;
          user_id: string;
          daily_calories: number;
          protein_grams: number;
          carbs_grams: number;
          fat_grams: number;
          weight_kg: number;
          height_cm: number;
          age: number;
          sex: "male" | "female";
          activity_level:
            | "sedentary"
            | "light"
            | "moderate"
            | "active"
            | "very_active";
          goal_type: "lose" | "maintain" | "gain";
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          daily_calories: number;
          protein_grams: number;
          carbs_grams: number;
          fat_grams: number;
          weight_kg: number;
          height_cm: number;
          age: number;
          sex: "male" | "female";
          activity_level:
            | "sedentary"
            | "light"
            | "moderate"
            | "active"
            | "very_active";
          goal_type: "lose" | "maintain" | "gain";
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          daily_calories?: number;
          protein_grams?: number;
          carbs_grams?: number;
          fat_grams?: number;
          weight_kg?: number;
          height_cm?: number;
          age?: number;
          sex?: "male" | "female";
          activity_level?:
            | "sedentary"
            | "light"
            | "moderate"
            | "active"
            | "very_active";
          goal_type?: "lose" | "maintain" | "gain";
          updated_at?: string;
        };
        Relationships: [];
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          meal_type: "breakfast" | "lunch" | "dinner" | "snack";
          photo_url: string | null;
          total_calories: number;
          total_protein: number;
          total_carbs: number;
          total_fat: number;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_type: "breakfast" | "lunch" | "dinner" | "snack";
          photo_url?: string | null;
          total_calories?: number;
          total_protein?: number;
          total_carbs?: number;
          total_fat?: number;
          logged_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meal_type?: "breakfast" | "lunch" | "dinner" | "snack";
          photo_url?: string | null;
          total_calories?: number;
          total_protein?: number;
          total_carbs?: number;
          total_fat?: number;
          logged_at?: string;
        };
        Relationships: [];
      };
      meal_items: {
        Row: {
          id: string;
          meal_id: string;
          item_name: string;
          weight_grams: number;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        };
        Insert: {
          id?: string;
          meal_id: string;
          item_name: string;
          weight_grams: number;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        };
        Update: {
          id?: string;
          meal_id?: string;
          item_name?: string;
          weight_grams?: number;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
        };
        Relationships: [];
      };
      weekly_reports: {
        Row: {
          id: string;
          user_id: string;
          week_start_date: string;
          quality_score: number;
          ai_advice_markdown: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start_date: string;
          quality_score: number;
          ai_advice_markdown?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start_date?: string;
          quality_score?: number;
          ai_advice_markdown?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      sports_activities: {
        Row: {
          id: string;
          user_id: string;
          activity_name: string;
          met_value: number;
          duration_minutes: number;
          calories_burned: number;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_name: string;
          met_value: number;
          duration_minutes: number;
          calories_burned: number;
          logged_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_name?: string;
          met_value?: number;
          duration_minutes?: number;
          calories_burned?: number;
          logged_at?: string;
        };
        Relationships: [];
      };
      weight_logs: {
        Row: {
          id: string;
          user_id: string;
          weight_kg: number;
          note: string | null;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight_kg: number;
          note?: string | null;
          logged_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          weight_kg?: number;
          note?: string | null;
          logged_at?: string;
        };
        Relationships: [];
      };
      hydration_logs: {
        Row: {
          id: string;
          user_id: string;
          amount_ml: number;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount_ml: number;
          logged_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount_ml?: number;
          logged_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
