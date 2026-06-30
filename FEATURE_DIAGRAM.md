# Product Detail Page Layout - Inclusions & Certificates Feature

## Desktop View (Two Column)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCT DETAIL PAGE                          │
├─────────────────────────────────────┬───────────────────────────┤
│                                     │                           │
│  LEFT COLUMN (STICKY)               │ RIGHT COLUMN (SCROLLS)    │
│  ─────────────────────────          │ ─────────────────────────  │
│                                     │                           │
│  ┌─────────────────────────────┐    │ ┌──────────────────────┐  │
│  │  Product Image Gallery      │    │ │ Product Name         │  │
│  │  (Thumbnails + Main)        │    │ │ Price                │  │
│  │                             │    │ │ Seller Info          │  │
│  │                             │    │ │ Category & Stock     │  │
│  │                             │    │ │                      │  │
│  │ [STICKY: top-[90px]]        │    │ │ Description          │  │
│  │                             │    │ │ (RichTextRenderer)   │  │
│  └─────────────────────────────┘    │ │                      │  │
│                                     │ ├──────────────────────┤  │
│  ┌─────────────────────────────┐    │ │ Customization Tabs   │  │
│  │ Tabs:                       │    │ │ - Ready Made         │  │
│  │ ┌──────┐ ┌──────────────────┤    │ │ - Customize Now      │  │
│  │ │What's│ │Certificates & St │    │ │                      │  │
│  │ │Incl. │ │andards          │    │ │ [Content scrolls]    │  │
│  │ └──────┘ └──────────────────┤    │ │                      │  │
│  │ ─────────────────────────────┤    │ ├──────────────────────┤  │
│  │ • High-quality insulation   │    │ │ Documents            │  │
│  │ • Triple-glazed windows     │    │ │ - PDFs               │  │
│  │ • Hardwood flooring         │    │ │ - Excel sheets       │  │
│  │ • Financing options         │    │ │                      │  │
│  │                             │    │ ├──────────────────────┤  │
│  │ [STICKY: displays below     │    │ │ Actions              │  │
│  │  image, doesn't scroll]     │    │ │ - Add to Cart        │  │
│  │                             │    │ │ - Buy Now            │  │
│  └─────────────────────────────┘    │ │ - Request Quote      │  │
│                                     │ │ - WhatsApp Link      │  │
│  [Empty space]                      │ └──────────────────────┘  │
│                                     │                           │
│ (All content in left column         │                           │
│  stays fixed while user scrolls     └───────────────────────────┘
│  through right column content)
│
└─────────────────────────────────────────────────────────────────┘
```

## Inclusions Panel - Tab View 1: "What's Included in the Unit?"

```
┌────────────────────────────────────────────┐
│ What's Included  │ Certificates & Standards│
├────────────────────────────────────────────┤
│                                            │
│ • High-quality insulation                  │
│ • Triple-glazed windows                    │
│ • Hardwood flooring                        │
│ • Integrated smart home system             │
│ • Structural certification                 │
│ • 25-year warranty included                │
│                                            │
└────────────────────────────────────────────┘
```

## Inclusions Panel - Tab View 2: "Certificates & Standards"

```
┌────────────────────────────────────────────┐
│ What's Included  │ Certificates & Standards│
├────────────────────────────────────────────┤
│                                            │
│ ISO 9001:2015                              │
│ Quality Management System certification    │
│ [📄 Download Certificate]                  │
│                                            │
│ Energy Star Certification                  │
│ Environmental protection and energy        │
│ efficiency standards compliance            │
│ [📄 Download Certificate]                  │
│                                            │
│ CSA Certified                              │
│ Canadian Standards Association             │
│ Product safety and quality certification   │
│ [📄 Download Certificate]                  │
│                                            │
└────────────────────────────────────────────┘
```

## Mobile View (Single Column)

```
┌──────────────────────────────────────┐
│   PRODUCT DETAIL PAGE (MOBILE)       │
├──────────────────────────────────────┤
│                                      │
│ Product Name                         │
│ Price                                │
│                                      │
│ ┌────────────────────────────────┐   │
│ │ Product Image Gallery          │   │
│ │ (Thumbnails below main image)  │   │
│ └────────────────────────────────┘   │
│                                      │
│ ┌────────────────────────────────┐   │
│ │ Inclusions Panel               │   │
│ │ - What's Included tab          │   │
│ │ - Certificates & Standards tab │   │
│ └────────────────────────────────┘   │
│                                      │
│ Seller Info                          │
│ Category & Stock                     │
│                                      │
│ Description                          │
│ (RichTextRenderer)                   │
│                                      │
│ Customization Tabs                   │
│ - Ready Made                         │
│ - Customize Now                      │
│                                      │
│ [Content continues to scroll...]     │
│                                      │
│ Documents                            │
│ Actions                              │
│ - Add to Cart                        │
│ - Buy Now                            │
│ - Request Quote                      │
│                                      │
└──────────────────────────────────────┘
```

## Data Flow

### Seller Center (Product Edit)
```
EditProductForm
├── "What's Included" Section
│   ├── Dynamic Input List
│   │   └── Text inputs for bullet items
│   └── Add/Remove buttons
│
├── "Certificates & Standards" Section
│   ├── Dynamic Table
│   │   ├── Title (text input)
│   │   ├── Description (textarea)
│   │   ├── File (upload to 'certificates' bucket)
│   │   └── Remove button
│   └── "Add Certificate" button
│
└── handleSubmit
    ├── Filter empty items
    ├── Upload files to Supabase storage
    ├── Parse JSON data
    └── Call updateProduct action
         └── Update products table
```

### Frontend Display
```
Product Page (SSR)
├── getProductBySlug (fetch from DB)
├── transformProduct (map DB fields to types)
│   └── whatIsIncluded, certificatesStandards
└── ProductDetailClient (render)
    └── ProductInclusionsPanel
        ├── Check if data exists
        ├── Render tabs (only if data)
        └── Show content with styling
```

## Component Structure

```
app/products/[slug]/
├── page.tsx (Server Component)
│   ├── getProductBySlug
│   ├── transformProduct
│   └── ProductDetailWrapper
│       └── ProductDetailClient
│           ├── Left Column
│           │   ├── Image Gallery
│           │   └── ProductInclusionsPanel ← NEW
│           │       ├── What's Included Tab
│           │       └── Certificates Tab
│           └── Right Column
│               ├── Product Name & Price
│               ├── Description
│               ├── Customization
│               ├── Documents
│               └── Actions

app/seller/products/[id]/edit/
├── page.tsx
└── EditProductForm ← UPDATED
    ├── Image Upload
    ├── Basic Info
    ├── Specifications
    ├── What's Included Section ← NEW
    ├── Certificates Section ← NEW
    ├── Customizations
    └── Submit
```

## Database Schema

```
products table
├── id (UUID)
├── name
├── description
├── price
├── ... (existing fields)
├── what_is_included ← NEW (JSONB array of strings)
│   └── ["item1", "item2", "item3"]
│
└── certificates_standards ← NEW (JSONB array of objects)
    └── [
          {
            "id": "cert-1",
            "title": "ISO 9001",
            "description": "...",
            "file_url": "https://..."
          },
          ...
        ]

Storage Buckets
└── certificates ← NEW (public bucket)
    ├── Policies (public read, seller write/delete)
    └── Path: {seller_id}/{product_id}/{filename}
```

## Color Scheme

- **Primary Purple:** `#4B1D8F`
  - Headings, active tabs, primary actions
  
- **Accent Gold:** `#D4AF37`
  - Borders, bullets, highlights, tab underline
  
- **Text:** `#4B1D8F` (titles), `#666666` (inactive tabs), `#999999` (descriptions)

## Sticky Behavior

### Desktop (md: breakpoint and up)
- **Left Column:** `md:sticky md:top-[90px] h-fit`
  - Image gallery: Stays fixed at top-90px from viewport
  - Inclusions Panel: Sits below image, also sticky
  - Both remain visible while user scrolls right column

### Mobile
- Normal scroll behavior
- All content stacks vertically
- Left/right distinction removed
- Image on top, inclusions below, details follow

## Responsive Breakpoints

```
Mobile:    < 768px  (md:)
Tablet:    768px+   (md:)
Desktop:   1024px+  (lg:)

EditProductForm inputs:
- Full width on mobile
- Multi-column on tablet/desktop
```
