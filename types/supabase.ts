export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      event_applications: {
        Row: {
          applicant_user_id: string | null
          application_status: Database["public"]["Enums"]["application_status"]
          created_at: string
          email: string | null
          event_id: string
          full_name: string
          id: string
          instagram_handle: string | null
          notes: string | null
          phone: string | null
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          applicant_user_id?: string | null
          application_status?: Database["public"]["Enums"]["application_status"]
          created_at?: string
          email?: string | null
          event_id: string
          full_name: string
          id?: string
          instagram_handle?: string | null
          notes?: string | null
          phone?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          applicant_user_id?: string | null
          application_status?: Database["public"]["Enums"]["application_status"]
          created_at?: string
          email?: string | null
          event_id?: string
          full_name?: string
          id?: string
          instagram_handle?: string | null
          notes?: string | null
          phone?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_applications_applicant_user_id_fkey"
            columns: ["applicant_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_applications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_checkins: {
        Row: {
          created_at: string
          event_id: string
          guest_name: string | null
          id: string
          invitation_id: string
          is_holder: boolean
          scan_number: number
          scanned_by: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          guest_name?: string | null
          id?: string
          invitation_id: string
          is_holder?: boolean
          scan_number: number
          scanned_by?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          guest_name?: string | null
          id?: string
          invitation_id?: string
          is_holder?: boolean
          scan_number?: number
          scanned_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_checkins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_checkins_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "event_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_checkins_scanned_by_fkey"
            columns: ["scanned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_gift_reservations: {
        Row: {
          event_id: string
          gift_id: string
          id: string
          invitation_id: string
          reserved_at: string
        }
        Insert: {
          event_id: string
          gift_id: string
          id?: string
          invitation_id: string
          reserved_at?: string
        }
        Update: {
          event_id?: string
          gift_id?: string
          id?: string
          invitation_id?: string
          reserved_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_gift_reservations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_gift_reservations_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "event_gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_gift_reservations_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: true
            referencedRelation: "event_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_gifts: {
        Row: {
          created_at: string
          description: string | null
          desired_quantity: number
          event_id: string
          gift_status: Database["public"]["Enums"]["gift_status"]
          id: string
          image_url: string | null
          name: string
          reserved_quantity: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          desired_quantity?: number
          event_id: string
          gift_status?: Database["public"]["Enums"]["gift_status"]
          id?: string
          image_url?: string | null
          name: string
          reserved_quantity?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          desired_quantity?: number
          event_id?: string
          gift_status?: Database["public"]["Enums"]["gift_status"]
          id?: string
          image_url?: string | null
          name?: string
          reserved_quantity?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_gifts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_invitations: {
        Row: {
          application_id: string | null
          approved_at: string | null
          approved_by: string | null
          confirmed_guest_count: number | null
          created_at: string
          event_id: string
          holder_email: string | null
          holder_has_entered: boolean
          holder_must_enter_first: boolean
          holder_name: string
          holder_phone: string | null
          holder_user_id: string | null
          id: string
          invitation_status: Database["public"]["Enums"]["invitation_status"]
          invitation_url: string | null
          max_entries: number
          qr_token: string
          rsvp_status: Database["public"]["Enums"]["rsvp_status"]
          updated_at: string
          used_entries: number
        }
        Insert: {
          application_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          confirmed_guest_count?: number | null
          created_at?: string
          event_id: string
          holder_email?: string | null
          holder_has_entered?: boolean
          holder_must_enter_first?: boolean
          holder_name: string
          holder_phone?: string | null
          holder_user_id?: string | null
          id?: string
          invitation_status?: Database["public"]["Enums"]["invitation_status"]
          invitation_url?: string | null
          max_entries?: number
          qr_token: string
          rsvp_status?: Database["public"]["Enums"]["rsvp_status"]
          updated_at?: string
          used_entries?: number
        }
        Update: {
          application_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          confirmed_guest_count?: number | null
          created_at?: string
          event_id?: string
          holder_email?: string | null
          holder_has_entered?: boolean
          holder_must_enter_first?: boolean
          holder_name?: string
          holder_phone?: string | null
          holder_user_id?: string | null
          id?: string
          invitation_status?: Database["public"]["Enums"]["invitation_status"]
          invitation_url?: string | null
          max_entries?: number
          qr_token?: string
          rsvp_status?: Database["public"]["Enums"]["rsvp_status"]
          updated_at?: string
          used_entries?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_invitations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "event_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_invitations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_invitations_holder_user_id_fkey"
            columns: ["holder_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_media: {
        Row: {
          caption: string | null
          created_at: string
          event_id: string
          file_path: string
          id: string
          is_featured: boolean
          media_status: Database["public"]["Enums"]["media_status"]
          media_type: Database["public"]["Enums"]["media_type"]
          public_url: string | null
          thumbnail_url: string | null
          updated_at: string
          uploaded_by_invitation_id: string | null
          uploaded_by_user_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          event_id: string
          file_path: string
          id?: string
          is_featured?: boolean
          media_status?: Database["public"]["Enums"]["media_status"]
          media_type: Database["public"]["Enums"]["media_type"]
          public_url?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          uploaded_by_invitation_id?: string | null
          uploaded_by_user_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          event_id?: string
          file_path?: string
          id?: string
          is_featured?: boolean
          media_status?: Database["public"]["Enums"]["media_status"]
          media_type?: Database["public"]["Enums"]["media_type"]
          public_url?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          uploaded_by_invitation_id?: string | null
          uploaded_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_media_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_media_uploaded_by_invitation_id_fkey"
            columns: ["uploaded_by_invitation_id"]
            isOneToOne: false
            referencedRelation: "event_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_media_uploaded_by_user_id_fkey"
            columns: ["uploaded_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_messages: {
        Row: {
          created_at: string
          event_id: string
          id: string
          invitation_id: string | null
          message: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          invitation_id?: string | null
          message: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          invitation_id?: string | null
          message?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_messages_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "event_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_song_suggestions: {
        Row: {
          added_to_playlist_at: string | null
          apple_music_url: string | null
          artist: string | null
          cover_image_url: string | null
          created_at: string
          event_id: string
          id: string
          song_status: Database["public"]["Enums"]["song_status"]
          spotify_url: string | null
          suggested_by_invitation_id: string | null
          suggested_by_user_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          added_to_playlist_at?: string | null
          apple_music_url?: string | null
          artist?: string | null
          cover_image_url?: string | null
          created_at?: string
          event_id: string
          id?: string
          song_status?: Database["public"]["Enums"]["song_status"]
          spotify_url?: string | null
          suggested_by_invitation_id?: string | null
          suggested_by_user_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          added_to_playlist_at?: string | null
          apple_music_url?: string | null
          artist?: string | null
          cover_image_url?: string | null
          created_at?: string
          event_id?: string
          id?: string
          song_status?: Database["public"]["Enums"]["song_status"]
          spotify_url?: string | null
          suggested_by_invitation_id?: string | null
          suggested_by_user_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_song_suggestions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_song_suggestions_suggested_by_invitation_id_fkey"
            columns: ["suggested_by_invitation_id"]
            isOneToOne: false
            referencedRelation: "event_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_song_suggestions_suggested_by_user_id_fkey"
            columns: ["suggested_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_song_votes: {
        Row: {
          created_at: string
          event_id: string
          id: string
          invitation_id: string
          song_suggestion_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          invitation_id: string
          song_suggestion_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          invitation_id?: string
          song_suggestion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_song_votes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_song_votes_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "event_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_song_votes_song_suggestion_id_fkey"
            columns: ["song_suggestion_id"]
            isOneToOne: false
            referencedRelation: "event_song_suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      event_users: {
        Row: {
          created_at: string
          event_id: string
          id: string
          role: Database["public"]["Enums"]["user_role_event"]
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          role: Database["public"]["Enums"]["user_role_event"]
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role_event"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_users_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          city: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          ends_at: string | null
          event_status: Database["public"]["Enums"]["event_status"]
          id: string
          playlist_url: string | null
          reveal_location_at: string | null
          slug: string
          starts_at: string | null
          title: string
          updated_at: string
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          ends_at?: string | null
          event_status?: Database["public"]["Enums"]["event_status"]
          id?: string
          playlist_url?: string | null
          reveal_location_at?: string | null
          slug: string
          starts_at?: string | null
          title: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string | null
          event_status?: Database["public"]["Enums"]["event_status"]
          id?: string
          playlist_url?: string | null
          reveal_location_at?: string | null
          slug?: string
          starts_at?: string | null
          title?: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          instagram_handle: string | null
          phone: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          instagram_handle?: string | null
          phone?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          instagram_handle?: string | null
          phone?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_event_dashboard_counts: {
        Row: {
          applications_approved: number | null
          applications_pending: number | null
          applications_rejected: number | null
          applications_waitlist: number | null
          event_id: string | null
          invitations_confirmed: number | null
          people_checked_in: number | null
          people_expected: number | null
          title: string | null
          total_capacity_assigned: number | null
        }
        Relationships: []
      }
      v_event_song_ranking: {
        Row: {
          apple_music_url: string | null
          artist: string | null
          cover_image_url: string | null
          event_id: string | null
          id: string | null
          song_status: Database["public"]["Enums"]["song_status"] | null
          spotify_url: string | null
          title: string | null
          vote_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      bootstrap_event_demo_for_latest_user: { Args: never; Returns: string }
      consume_invitation_entry: {
        Args: {
          p_guest_name?: string
          p_is_holder?: boolean
          p_qr_token: string
          p_scanned_by?: string
        }
        Returns: {
          invitation_id: string
          max_entries: number
          message: string
          remaining_entries: number
          success: boolean
          used_entries: number
        }[]
      }
      reserve_gift: {
        Args: {
          p_gift_id: string
          p_invitation_id: string
        }
        Returns: {
          success: boolean
          message: string
          reservation_id: string | null
        }[]
      }
      approve_application: {
        Args: {
          p_application_id: string
          p_max_entries?: number
          p_holder_must_enter_first?: boolean
          p_approved_by: string
        }
        Returns: {
          success: boolean
          message: string
          invitation_id: string | null
        }[]
      }
    }
    Enums: {
      application_status: "pending" | "approved" | "rejected" | "waitlist"
      event_status: "draft" | "published" | "closed" | "cancelled"
      gift_status: "active" | "inactive" | "sold_out"
      invitation_status: "active" | "paused" | "exhausted" | "cancelled"
      media_status: "pending" | "approved" | "hidden" | "deleted"
      media_type: "image" | "video"
      rsvp_status: "pending" | "confirmed" | "declined"
      song_status: "pending" | "approved" | "rejected" | "added_to_playlist"
      user_role_event: "host" | "admin" | "staff" | "guest"
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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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

export const Constants = {
  public: {
    Enums: {
      application_status: ["pending", "approved", "rejected", "waitlist"],
      event_status: ["draft", "published", "closed", "cancelled"],
      gift_status: ["active", "inactive", "sold_out"],
      invitation_status: ["active", "paused", "exhausted", "cancelled"],
      media_status: ["pending", "approved", "hidden", "deleted"],
      media_type: ["image", "video"],
      rsvp_status: ["pending", "confirmed", "declined"],
      song_status: ["pending", "approved", "rejected", "added_to_playlist"],
      user_role_event: ["host", "admin", "staff", "guest"],
    },
  },
} as const
