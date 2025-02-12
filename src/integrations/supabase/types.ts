export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      code_analysis_expected_output: {
        Row: {
          created_at: string
          expected_output: string
          id: string
          input_case: string | null
          question_id: string
        }
        Insert: {
          created_at?: string
          expected_output: string
          id?: string
          input_case?: string | null
          question_id: string
        }
        Update: {
          created_at?: string
          expected_output?: string
          id?: string
          input_case?: string | null
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_analysis_expected_output_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      external_resources: {
        Row: {
          created_at: string
          db_url: string
          id: string
          question_id: string
          tables_used: string[]
          test_url: string
        }
        Insert: {
          created_at?: string
          db_url: string
          id?: string
          question_id: string
          tables_used: string[]
          test_url: string
        }
        Update: {
          created_at?: string
          db_url?: string
          id?: string
          question_id?: string
          tables_used?: string[]
          test_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_resources_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      fill_in_blank_answers: {
        Row: {
          blank_position: number
          correct_answer: string
          created_at: string
          expected_output: string | null
          id: string
          question_id: string
        }
        Insert: {
          blank_position: number
          correct_answer: string
          created_at?: string
          expected_output?: string | null
          id?: string
          question_id: string
        }
        Update: {
          blank_position?: number
          correct_answer?: string
          created_at?: string
          expected_output?: string | null
          id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fill_in_blank_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      options: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          option_order: number
          option_text: string
          question_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          option_order: number
          option_text: string
          question_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          option_order?: number
          option_text?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      programming_languages: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      prompts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_default: boolean | null
          language_id: string | null
          type: Database["public"]["Enums"]["prompt_type"]
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          language_id?: string | null
          type: Database["public"]["Enums"]["prompt_type"]
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          language_id?: string | null
          type?: Database["public"]["Enums"]["prompt_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "programming_languages"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          base_question_keys: string | null
          bloom_level: string
          code: string | null
          code_language: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          explanation: string | null
          id: string
          learning_outcome: string
          question_key: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          unit_id: string
          updated_at: string
        }
        Insert: {
          base_question_keys?: string | null
          bloom_level: string
          code?: string | null
          code_language?: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string
          explanation?: string | null
          id?: string
          learning_outcome: string
          question_key: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          unit_id: string
          updated_at?: string
        }
        Update: {
          base_question_keys?: string | null
          bloom_level?: string
          code?: string | null
          code_language?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          explanation?: string | null
          id?: string
          learning_outcome?: string
          question_key?: string
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      rearrangement_steps: {
        Row: {
          correct_order: number
          created_at: string
          display_order: number
          id: string
          question_id: string
          step_text: string
        }
        Insert: {
          correct_order: number
          created_at?: string
          display_order: number
          id?: string
          question_id: string
          step_text: string
        }
        Update: {
          correct_order?: number
          created_at?: string
          display_order?: number
          id?: string
          question_id?: string
          step_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "rearrangement_steps_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          course_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
      content_type: "HTML" | "MARKDOWN"
      prompt_type: "topics" | "questions"
      question_type:
        | "MULTIPLE_CHOICE"
        | "MORE_THAN_ONE_MULTIPLE_CHOICE"
        | "CODE_ANALYSIS_MULTIPLE_CHOICE"
        | "CODE_ANALYSIS_MORE_THAN_ONE_MULTIPLE_CHOICE"
        | "CODE_ANALYSIS_TEXTUAL"
        | "FIB_CODING"
        | "FIB_SQL_CODING"
        | "REARRANGE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
