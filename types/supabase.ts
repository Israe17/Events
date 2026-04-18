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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
      approve_application: {
        Args: {
          p_application_id: string
          p_approved_by?: string
          p_holder_must_enter_first?: boolean
          p_max_entries?: number
        }
        Returns: { invitation_id: string; message: string; success: boolean }[]
      }
      bootstrap_event_demo_for_latest_user: { Args: never; Returns: string }
      cancel_gift_reservation: {
        Args: { p_invitation_id: string; p_reservation_id: string }
        Returns: { message: string; success: boolean }[]
      }
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
      reject_application: {
        Args: { p_application_id: string; p_notes?: string; p_rejected_by?: string }
        Returns: { message: string; success: boolean }[]
      }
      reserve_gift: {
        Args: { p_gift_id: string; p_invitation_id: string }
        Returns: { message: string; reservation_id: string; success: boolean }[]
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
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]),
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never

export type Enums<T extends keyof DefaultSchema["Enums"]> = DefaultSchema["Enums"][T]

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
