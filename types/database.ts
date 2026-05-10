/**
 * Supabase Database Types
 * 
 * Generated from Supabase schema for CargoPlus E-Commerce Platform
 * Requirements: 1.1
 * 
 * To regenerate these types:
 * 1. Install Supabase CLI: `npm install -g supabase`
 * 2. Run: `npm run types:generate`
 * 
 * Or generate from the Supabase Dashboard:
 * 1. Go to your project settings > API
 * 2. Click "Generate TypeScript types"
 */

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
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'customer' | 'seller' | 'admin' | 'partner'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'seller' | 'admin' | 'partner'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'seller' | 'admin' | 'partner'
          created_at?: string
          updated_at?: string
        }
      }
      sellers: {
        Row: {
          id: string
          business_name: string
          business_email: string
          business_phone: string | null
          business_address: string | null
          description: string | null
          logo_url: string | null
          status: 'pending' | 'active' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          business_name: string
          business_email: string
          business_phone?: string | null
          business_address?: string | null
          description?: string | null
          logo_url?: string | null
          status?: 'pending' | 'active' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          business_email?: string
          business_phone?: string | null
          business_address?: string | null
          description?: string | null
          logo_url?: string | null
          status?: 'pending' | 'active' | 'suspended'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          compare_at_price: number | null
          stock_quantity: number
          category_id: string
          seller_id: string
          status: 'pending' | 'active' | 'rejected' | 'archived'
          specifications: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price: number
          compare_at_price?: number | null
          stock_quantity?: number
          category_id: string
          seller_id: string
          status?: 'pending' | 'active' | 'rejected' | 'archived'
          specifications?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          price?: number
          compare_at_price?: number | null
          stock_quantity?: number
          category_id?: string
          seller_id?: string
          status?: 'pending' | 'active' | 'rejected' | 'archived'
          specifications?: Json
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          position: number
          variant_code: string | null
          variant_price: number | null
          is_master: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          position?: number
          variant_code?: string | null
          variant_price?: number | null
          is_master?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          alt_text?: string | null
          position?: number
          variant_code?: string | null
          variant_price?: number | null
          is_master?: boolean
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal: number
          tax_amount: number
          total: number
          shipping_address: Json
          billing_address: Json | null
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string | null
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal: number
          tax_amount?: number
          total: number
          shipping_address: Json
          billing_address?: Json | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal?: number
          tax_amount?: number
          total?: number
          shipping_address?: Json
          billing_address?: Json | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
          line_total: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_price: number
          quantity: number
          line_total: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
          line_total?: number
          created_at?: string
        }
      }
      inquiries: {
        Row: {
          id: string
          name: string
          email: string
          subject: string
          message: string
          status: 'new' | 'in_progress' | 'resolved'
          response: string | null
          responded_at: string | null
          responded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          subject: string
          message: string
          status?: 'new' | 'in_progress' | 'resolved'
          response?: string | null
          responded_at?: string | null
          responded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          subject?: string
          message?: string
          status?: 'new' | 'in_progress' | 'resolved'
          response?: string | null
          responded_at?: string | null
          responded_by?: string | null
          created_at?: string
        }
      }
      hero_slides: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          image_url: string
          cta_text: string | null
          cta_link: string | null
          position: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          image_url: string
          cta_text?: string | null
          cta_link?: string | null
          position?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          image_url?: string
          cta_text?: string | null
          cta_link?: string | null
          position?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
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
  }
}

// Convenience types for table rows
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Seller = Database['public']['Tables']['sellers']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Inquiry = Database['public']['Tables']['inquiries']['Row']
export type HeroSlide = Database['public']['Tables']['hero_slides']['Row']

// Insert types
export type InsertProfile = Database['public']['Tables']['profiles']['Insert']
export type InsertSeller = Database['public']['Tables']['sellers']['Insert']
export type InsertCategory = Database['public']['Tables']['categories']['Insert']
export type InsertProduct = Database['public']['Tables']['products']['Insert']
export type InsertProductImage = Database['public']['Tables']['product_images']['Insert']
export type InsertCartItem = Database['public']['Tables']['cart_items']['Insert']
export type InsertOrder = Database['public']['Tables']['orders']['Insert']
export type InsertOrderItem = Database['public']['Tables']['order_items']['Insert']
export type InsertInquiry = Database['public']['Tables']['inquiries']['Insert']
export type InsertHeroSlide = Database['public']['Tables']['hero_slides']['Insert']

// Update types
export type UpdateProfile = Database['public']['Tables']['profiles']['Update']
export type UpdateSeller = Database['public']['Tables']['sellers']['Update']
export type UpdateCategory = Database['public']['Tables']['categories']['Update']
export type UpdateProduct = Database['public']['Tables']['products']['Update']
export type UpdateProductImage = Database['public']['Tables']['product_images']['Update']
export type UpdateCartItem = Database['public']['Tables']['cart_items']['Update']
export type UpdateOrder = Database['public']['Tables']['orders']['Update']
export type UpdateOrderItem = Database['public']['Tables']['order_items']['Update']
export type UpdateInquiry = Database['public']['Tables']['inquiries']['Update']
export type UpdateHeroSlide = Database['public']['Tables']['hero_slides']['Update']

// Generic table types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Partner types
export interface Partner {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  country: string;
  status: 'active' | 'suspended';
  created_at: string;
}

export interface EngineeringQuote {
  id: string;
  project_id: string;
  partner_id: string;
  price_cad: number;
  timeline_weeks: number;
  validity_days: number;
  notes: string | null;
  status: string;
  created_at: string;
}

export interface EngineeringQuoteFile {
  id: string;
  quote_id: string;
  file_name: string;
  storage_path: string;
  uploaded_at: string;
}

// Engineering types
export interface EngineeringProject {
  id: string;
  user_id: string | null;
  project_name: string;
  project_location_city: string;
  project_location_province: string;
  project_type: "residential" | "commercial" | "industrial";
  total_area: number;
  number_of_floors: number;
  building_length: number;
  building_width: number;
  building_height: number | null;
  structure_type: string;
  no_drawings_flag: boolean;
  delivery_location: string;
  budget_range: "under_100k" | "100k_300k" | "300k_plus";
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  project_description: string | null;
  status: string;
  created_at: string;
}

export interface EngineeringProjectDrawing {
  id: string;
  project_id: string;
  file_name: string;
  storage_path: string;
  uploaded_at: string;
}
