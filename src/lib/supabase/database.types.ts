export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar_url: string | null
          neediness_level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          avatar_url?: string | null
          neediness_level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          avatar_url?: string | null
          neediness_level?: number
          created_at?: string
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          icon: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          icon?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          icon?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
      }
      needs: {
        Row: {
          id: string
          group_id: string
          created_by: string
          title: string
          description: string | null
          category: NeedCategory
          priority: NeedPriority
          is_fulfilled: boolean
          fulfilled_by: string | null
          fulfilled_at: string | null
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          created_by: string
          title: string
          description?: string | null
          category?: NeedCategory
          priority?: NeedPriority
          is_fulfilled?: boolean
          fulfilled_by?: string | null
          fulfilled_at?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          created_by?: string
          title?: string
          description?: string | null
          category?: NeedCategory
          priority?: NeedPriority
          is_fulfilled?: boolean
          fulfilled_by?: string | null
          fulfilled_at?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      need_responses: {
        Row: {
          id: string
          need_id: string
          user_id: string
          message: string | null
          is_helping: boolean
          created_at: string
        }
        Insert: {
          id?: string
          need_id: string
          user_id: string
          message?: string | null
          is_helping?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          need_id?: string
          user_id?: string
          message?: string | null
          is_helping?: boolean
          created_at?: string
        }
      }
      neediness_history: {
        Row: {
          id: string
          user_id: string
          old_level: number
          new_level: number
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          old_level: number
          new_level: number
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          old_level?: number
          new_level?: number
          reason?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string | null
          related_need_id: string | null
          related_group_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message?: string | null
          related_need_id?: string | null
          related_group_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          related_need_id?: string | null
          related_group_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      create_group_with_admin_member: {
        Args: {
          p_name: string
          p_description?: string | null
          p_color?: string | null
          p_icon?: string | null
        }
        Returns: {
          id: string
          name: string
          description: string | null
          color: string
          icon: string
          created_by: string
          created_at: string
          updated_at: string
        }
      }
      update_neediness_level: {
        Args: {
          p_user_id: string
          p_delta: number
          p_reason?: string
        }
        Returns: number
      }
    }
    Enums: {
      need_category: 'groceries' | 'chores' | 'emotional' | 'social' | 'food_craving' | 'help' | 'company' | 'other'
      need_priority: 'low' | 'medium' | 'high' | 'urgent'
    }
  }
}

export type NeedCategory = Database['public']['Enums']['need_category']
export type NeedPriority = Database['public']['Enums']['need_priority']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type Need = Database['public']['Tables']['needs']['Row']
export type NeedResponse = Database['public']['Tables']['need_responses']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']