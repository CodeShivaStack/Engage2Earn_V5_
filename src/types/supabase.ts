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
          wallet_address: string
          username: string
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          username: string
          bio?: string | null
        }
        Update: {
          wallet_address?: string
          username?: string
          bio?: string | null
        }
      }
      social_accounts: {
        Row: {
          id: string
          profile_id: string
          platform: string
          username: string
          verified: boolean
          verification_post_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          platform: string
          username: string
          verified?: boolean
          verification_post_url?: string | null
        }
        Update: {
          platform?: string
          username?: string
          verified?: boolean
          verification_post_url?: string | null
        }
      }
    }
  }
}