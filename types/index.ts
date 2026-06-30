/**
 * Application Types
 *
 * These types extend the database types with application-specific shapes
 * and are used throughout the Apex Modular Construction platform.
 */

// Re-export database types
import type {
  Database,
  Json,
  Profile,
  Seller,
  Category,
  Product,
  ProductImage,
  CartItem,
  Order,
  OrderItem,
  Inquiry,
  HeroSlide,
  InsertProfile,
  InsertSeller,
  InsertCategory,
  InsertProduct,
  InsertProductImage,
  InsertCartItem,
  InsertOrder,
  InsertOrderItem,
  InsertInquiry,
  InsertHeroSlide,
  UpdateProfile,
  UpdateSeller,
  UpdateCategory,
  UpdateProduct,
  UpdateProductImage,
  UpdateCartItem,
  UpdateOrder,
  UpdateOrderItem,
  UpdateInquiry,
  UpdateHeroSlide,
  Tables,
  InsertTables,
  UpdateTables,
  product_customization_groups,
  product_customization_options,
} from './database'

export * from './configurator'

export type {
  Database,
  Json,
  Profile,
  Seller,
  Category,
  Product,
  ProductImage,
  CartItem,
  Order,
  OrderItem,
  Inquiry,
  HeroSlide,
  InsertProfile,
  InsertSeller,
  InsertCategory,
  InsertProduct,
  InsertProductImage,
  InsertCartItem,
  InsertOrder,
  InsertOrderItem,
  InsertInquiry,
  InsertHeroSlide,
  UpdateProfile,
  UpdateSeller,
  UpdateCategory,
  UpdateProduct,
  UpdateProductImage,
  UpdateCartItem,
  UpdateOrder,
  UpdateOrderItem,
  UpdateInquiry,
  UpdateHeroSlide,
  Tables,
  InsertTables,
  UpdateTables,
  product_customization_groups,
  product_customization_options,
}

export type CustomizationGroup = product_customization_groups
export type CustomizationOption = product_customization_options

// Application-specific types that extend database types

/**
 * Product with related data (images, category, seller)
 */
export interface CertificateStandard {
  id: string
  title: string
  description: string
  file_url?: string
}

export interface ProductWithRelations {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  priceType: 'unit' | 'sqm' | 'sqf'
  compareAtPrice: number | null
  stockQuantity: number
  categoryId: string
  sellerId: string
  status: 'pending' | 'active' | 'rejected' | 'archived'
  configurator_type: 'house' | 'door' | 'window' | 'wall-material' | 'none'
  specifications: Record<string, string>
  requireOrderRequest: boolean
  showStock: boolean
  youtubeUrl: string | null
  whatIsIncluded?: string[] | null
  certificatesStandards?: CertificateStandard[] | null
  createdAt: string
  updatedAt: string
  images: ProductImageData[]
  category: CategoryData
  seller: SellerData
  documents: ProductDocumentData[]
  hasCustomization: boolean
  customizationGroups?: CustomizationGroupWithRelations[]
}

// CustomizationGroup already contains target_anchor_id and visual_type from the DB type.
// We re-declare them here only to ensure TypeScript resolves them as part of this interface.
export interface CustomizationGroupWithRelations extends CustomizationGroup {
  options: CustomizationOption[]
  target_anchor_id: string | null
  visual_type: 'door' | 'window' | 'wall-color' | 'generic' | null
}

export interface ProductDocumentData {
  id: string
  name: string
  url: string
  fileType: 'pdf' | 'excel' | 'word' | 'other'
  position: number
}

export interface ProductImageData {
  id: string
  productId: string
  url: string
  altText: string | null
  position: number
  variantCode: string | null
  variantPrice: number | null
  isMaster: boolean
}

export interface CategoryData {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
}

export interface SellerData {
  id: string
  businessName: string
  businessEmail: string
  logoUrl: string | null
  status: 'pending' | 'active' | 'suspended'
}

/**
 * Cart item with product details
 */
export interface CartItemWithProduct {
  id: string
  userId: string
  productId: string
  quantity: number
  product: ProductWithRelations
}

/**
 * Order with items and shipping details
 */
export interface OrderWithItems {
  id: string
  orderNumber: string
  userId: string | null
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  subtotal: number
  taxAmount: number
  total: number
  shippingAddress: ShippingAddress
  billingAddress: ShippingAddress | null
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentId: string | null
  createdAt: string
  updatedAt: string
  items: OrderItemData[]
}

export interface OrderItemData {
  id: string
  orderId: string
  productId: string | null
  productName: string
  productPrice: number
  quantity: number
  lineTotal: number
}

/**
 * Shipping address structure
 */
export interface ShippingAddress {
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  province: string
  postalCode: string
  country: string
  phone: string
}

/**
 * Canadian province codes for tax calculation
 */
export type CanadianProvince =
  | 'AB' // Alberta (GST only)
  | 'BC' // British Columbia (GST + PST)
  | 'MB' // Manitoba (GST + PST)
  | 'NB' // New Brunswick (HST)
  | 'NL' // Newfoundland and Labrador (HST)
  | 'NS' // Nova Scotia (HST)
  | 'NT' // Northwest Territories (GST only)
  | 'NU' // Nunavut (GST only)
  | 'ON' // Ontario (HST)
  | 'PE' // Prince Edward Island (HST)
  | 'QC' // Quebec (GST + QST)
  | 'SK' // Saskatchewan (GST + PST)
  | 'YT' // Yukon (GST only)

/**
 * Tax rates by province
 */
export interface TaxRate {
  province: CanadianProvince
  provinceName: string
  gst: number
  pst: number
  hst: number
  total: number
}

/**
 * User authentication state
 */
export interface AuthUser {
  id: string
  email: string
  fullName: string | null
  role: 'customer' | 'seller' | 'admin'
  avatarUrl: string | null
}

/**
 * Hero slide for landing page
 */
export interface HeroSlideData {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  ctaEnabled: boolean
  ctaText: string | null
  ctaLink: string | null
  position: number
  isActive: boolean
  // New fields for enhanced hero section
  headline?: string | null
  subtext?: string | null
  benefits?: string[]
  ctaSecondaryText?: string | null
  ctaSecondaryLink?: string | null
  layoutType?: 'split' | 'centered' | 'image-only'
  backgroundOverlay?: boolean
  trustLine?: string | null
}
