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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      contracts: {
        Row: {
          contract_file_url: string | null
          contract_number: number
          created_at: string
          deleted_at: string | null
          deposit_amount: number | null
          end_date: string
          id: string
          owner_id: string
          payment_cycle: Database["public"]["Enums"]["payment_cycle"]
          renewed_from_contract_id: string | null
          rent_amount: number
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          tenant_id: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          contract_file_url?: string | null
          contract_number?: number
          created_at?: string
          deleted_at?: string | null
          deposit_amount?: number | null
          end_date: string
          id?: string
          owner_id: string
          payment_cycle?: Database["public"]["Enums"]["payment_cycle"]
          renewed_from_contract_id?: string | null
          rent_amount: number
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"]
          tenant_id: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          contract_file_url?: string | null
          contract_number?: number
          created_at?: string
          deleted_at?: string | null
          deposit_amount?: number | null
          end_date?: string
          id?: string
          owner_id?: string
          payment_cycle?: Database["public"]["Enums"]["payment_cycle"]
          renewed_from_contract_id?: string | null
          rent_amount?: number
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          tenant_id?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_renewed_from_contract_id_fkey"
            columns: ["renewed_from_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          created_at: string
          device_type: Database["public"]["Enums"]["device_type"] | null
          fcm_token: string
          id: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_type?: Database["public"]["Enums"]["device_type"] | null
          fcm_token: string
          id?: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_type?: Database["public"]["Enums"]["device_type"] | null
          fcm_token?: string
          id?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          expense_date: string
          expense_type: Database["public"]["Enums"]["expense_type"]
          id: string
          owner_id: string
          property_id: string
          receipt_url: string | null
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          expense_date: string
          expense_type?: Database["public"]["Enums"]["expense_type"]
          id?: string
          owner_id: string
          property_id: string
          receipt_url?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          expense_date?: string
          expense_type?: Database["public"]["Enums"]["expense_type"]
          id?: string
          owner_id?: string
          property_id?: string
          receipt_url?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          closed_at: string | null
          cost: number | null
          created_at: string
          description: string
          id: string
          images: string[] | null
          issue_type: Database["public"]["Enums"]["maintenance_issue_type"]
          owner_id: string
          priority: Database["public"]["Enums"]["maintenance_priority"]
          property_id: string
          status: Database["public"]["Enums"]["maintenance_status"]
          technician_name: string | null
          tenant_id: string | null
          unit_id: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          cost?: number | null
          created_at?: string
          description: string
          id?: string
          images?: string[] | null
          issue_type?: Database["public"]["Enums"]["maintenance_issue_type"]
          owner_id: string
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          property_id: string
          status?: Database["public"]["Enums"]["maintenance_status"]
          technician_name?: string | null
          tenant_id?: string | null
          unit_id: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          cost?: number | null
          created_at?: string
          description?: string
          id?: string
          images?: string[] | null
          issue_type?: Database["public"]["Enums"]["maintenance_issue_type"]
          owner_id?: string
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          property_id?: string
          status?: Database["public"]["Enums"]["maintenance_status"]
          technician_name?: string | null
          tenant_id?: string | null
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
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
          owner_id: string
          push_sent: boolean
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          owner_id: string
          push_sent?: boolean
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          owner_id?: string
          push_sent?: boolean
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          contract_id: string
          created_at: string
          due_date: string
          id: string
          notes: string | null
          owner_id: string
          paid_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          receipt_url: string | null
          status: Database["public"]["Enums"]["payment_status"]
          tenant_id: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          contract_id: string
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          owner_id: string
          paid_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenant_id: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          contract_id?: string
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          owner_id?: string
          paid_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenant_id?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          deleted_at: string | null
          district: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          owner_id: string
          type: Database["public"]["Enums"]["property_type"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          deleted_at?: string | null
          district?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_id: string
          type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          deleted_at?: string | null
          district?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_id?: string
          type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string | null
          full_name: string
          id: string
          id_document_url: string | null
          is_verified: boolean | null
          national_id: string | null
          nationality: string | null
          nationality_code: string | null
          owner_id: string
          phone: string | null
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          id_document_url?: string | null
          is_verified?: boolean | null
          national_id?: string | null
          nationality?: string | null
          nationality_code?: string | null
          owner_id: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          id_document_url?: string | null
          is_verified?: boolean | null
          national_id?: string | null
          nationality?: string | null
          nationality_code?: string | null
          owner_id?: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          amenities: string[] | null
          annual_rent: number | null
          area: number | null
          bathrooms: number | null
          created_at: string
          deleted_at: string | null
          floor: number | null
          id: string
          images: string[] | null
          owner_id: string
          property_id: string
          rent_amount: number
          rent_period: Database["public"]["Enums"]["rent_period"]
          rooms: number | null
          status: Database["public"]["Enums"]["unit_status"]
          unit_number: string
          unit_type: Database["public"]["Enums"]["unit_type"]
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          annual_rent?: number | null
          area?: number | null
          bathrooms?: number | null
          created_at?: string
          deleted_at?: string | null
          floor?: number | null
          id?: string
          images?: string[] | null
          owner_id: string
          property_id: string
          rent_amount?: number
          rent_period?: Database["public"]["Enums"]["rent_period"]
          rooms?: number | null
          status?: Database["public"]["Enums"]["unit_status"]
          unit_number: string
          unit_type?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          annual_rent?: number | null
          area?: number | null
          bathrooms?: number | null
          created_at?: string
          deleted_at?: string | null
          floor?: number | null
          id?: string
          images?: string[] | null
          owner_id?: string
          property_id?: string
          rent_amount?: number
          rent_period?: Database["public"]["Enums"]["rent_period"]
          rooms?: number | null
          status?: Database["public"]["Enums"]["unit_status"]
          unit_number?: string
          unit_type?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_status: Database["public"]["Enums"]["owner_account_status"]
          avatar_url: string | null
          city: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          full_name: string
          id: string
          id_document_url: string | null
          is_active: boolean
          job_title: string | null
          national_id: string | null
          notes: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          settings: Json
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["owner_account_status"]
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name: string
          id: string
          id_document_url?: string | null
          is_active?: boolean
          job_title?: string | null
          national_id?: string | null
          notes?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          settings?: Json
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          account_status?: Database["public"]["Enums"]["owner_account_status"]
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          id_document_url?: string | null
          is_active?: boolean
          job_title?: string | null
          national_id?: string | null
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          settings?: Json
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
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
      contract_status:
        | "active"
        | "expiring_soon"
        | "expired"
        | "terminated"
        | "renewed"
      device_type: "android" | "ios"
      expense_type:
        | "maintenance"
        | "water"
        | "electricity"
        | "other"
        | "cleaning"
        | "services"
      maintenance_issue_type:
        | "plumbing"
        | "electrical"
        | "ac"
        | "other"
        | "appliances"
        | "doors_locks"
        | "paint"
        | "water_leak"
      maintenance_priority: "low" | "medium" | "high"
      maintenance_status: "new_request" | "in_progress" | "completed"
      notification_type:
        | "overdue_payment"
        | "contract_expiring"
        | "payment_recorded"
        | "maintenance_update"
      owner_account_status: "active" | "inactive" | "pending"
      payment_cycle: "monthly" | "quarterly" | "yearly"
      payment_method:
        | "cash"
        | "bank_transfer"
        | "card"
        | "mada"
        | "sadad"
        | "other"
      payment_status: "due" | "paid" | "overdue"
      property_type: "residential" | "commercial" | "mixed_use"
      rent_period: "monthly" | "annually"
      unit_status: "available" | "rented" | "maintenance"
      unit_type:
        | "apartment"
        | "shop"
        | "office"
        | "other"
        | "studio"
        | "villa"
        | "warehouse"
      user_role: "master_admin" | "owner"
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
      contract_status: [
        "active",
        "expiring_soon",
        "expired",
        "terminated",
        "renewed",
      ],
      device_type: ["android", "ios"],
      expense_type: [
        "maintenance",
        "water",
        "electricity",
        "other",
        "cleaning",
        "services",
      ],
      maintenance_issue_type: [
        "plumbing",
        "electrical",
        "ac",
        "other",
        "appliances",
        "doors_locks",
        "paint",
        "water_leak",
      ],
      maintenance_priority: ["low", "medium", "high"],
      maintenance_status: ["new_request", "in_progress", "completed"],
      notification_type: [
        "overdue_payment",
        "contract_expiring",
        "payment_recorded",
        "maintenance_update",
      ],
      owner_account_status: ["active", "inactive", "pending"],
      payment_cycle: ["monthly", "quarterly", "yearly"],
      payment_method: [
        "cash",
        "bank_transfer",
        "card",
        "mada",
        "sadad",
        "other",
      ],
      payment_status: ["due", "paid", "overdue"],
      property_type: ["residential", "commercial", "mixed_use"],
      rent_period: ["monthly", "annually"],
      unit_status: ["available", "rented", "maintenance"],
      unit_type: [
        "apartment",
        "shop",
        "office",
        "other",
        "studio",
        "villa",
        "warehouse",
      ],
      user_role: ["master_admin", "owner"],
    },
  },
} as const
