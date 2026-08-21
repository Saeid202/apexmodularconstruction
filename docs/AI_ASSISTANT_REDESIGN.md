# Apex AI Assistant Redesign - Implementation Guide

## New Architecture

### 1. **Unified Chat Assistant** (`/ai-assistant`)
- **Location**: `/app/(public)/ai-assistant/page.tsx`
- **Component**: `components/ai-assistant/ApexAIAssistant.tsx`
- **API**: `/api/ai-assistant/chat`
- **Purpose**: General questions about products, pricing, shipping, installation, customization
- **Features**:
  - Landing page with suggested prompts
  - Clean single-chat interface (like ChatGPT)
  - WhatsApp as secondary contact option
  - Smart routing to Property Feasibility tool when Canadian property is mentioned
  - Mobile-friendly responsive design

### 2. **Property Feasibility Analysis** (`/property-feasibility`)
- **Location**: `/app/(public)/property-feasibility/page.tsx`
- **Component**: `components/adu/ADUChatbot.tsx` (rebranded)
- **Purpose**: Specialized tool for zoning, permits, bylaws, setbacks, coverage, FSI, height restrictions
- **Features**:
  - Property address input with Mapbox autocomplete
  - Site plan/design drawing upload with AI vision analysis
  - Detailed feasibility report
  - Product recommendations based on analysis
  - Follow-up Q&A chat

---

## System Prompts

### General Apex AI Assistant
- Answers questions about products, models, pricing
- Handles shipping, delivery, installation inquiries
- Responds to customization and international order questions
- Automatically detects when property analysis might be needed
- Suggests Property Feasibility tool for Canadian property questions

### Property Feasibility Specialist (ADU Chatbot)
- Analyzes zoning regulations
- Permits and bylaw requirements
- Lot analysis (setbacks, coverage, FSI, height)
- Product fit recommendations
- Construction feasibility assessment

---

## User Flows

### Flow 1: General User (No Property Analysis Needed)
1. Land on `/ai-assistant`
2. See suggested prompts
3. Ask question about products/pricing/shipping
4. Get answer from Apex AI Assistant
5. Continue conversation

### Flow 2: Canadian Property Owner
1. Land on `/ai-assistant`
2. Ask about building on their Ontario property
3. AI recognizes the location
4. AI offers: "I can also help analyze your property's zoning and permit requirements"
5. User clicks "Analyze My Property" button
6. Redirected to `/property-feasibility`
7. Enter property details and get full feasibility report

### Flow 3: Non-Canadian User
1. Land on `/ai-assistant`
2. Ask about Texas property
3. AI responds: "Property analysis for your region is coming soon. I can explain our modular buildings, shipping, and project planning."
4. Conversation continues without routing

---

## Integration Checklist

- [ ] Add link to `/ai-assistant` in main navigation
- [ ] Add link to `/ai-assistant` in header/footer
- [ ] Update WhatsApp button links to new URL
- [ ] Consider replacing or enhancing floating widget with link to `/ai-assistant`
- [ ] Add breadcrumbs/navigation between `/ai-assistant` and `/property-feasibility`
- [ ] Test API endpoint with Gemini API key configured
- [ ] Update sitemap with new pages
- [ ] Add to robots.txt if needed
- [ ] Create meta descriptions for SEO

---

## API Configuration

The `/api/ai-assistant/chat` endpoint requires:
- `NEXT_PUBLIC_GEMINI_API_KEY` environment variable
- Accepts POST requests with:
  - `message`: string
  - `conversationHistory`: array of { role, content }
- Returns: `{ message: string, success: boolean }`

---

## Future Enhancements

Once this system is in place, you can easily add specialized tools:
- **Product Expert**: Deep dive into model specifications
- **Cost Estimator**: Calculate project budgets
- **Shipping Planner**: Estimate delivery and logistics
- **Financing Assistant**: Payment options and financing
- **Project Timeline**: Construction timeline calculator
- **Installation Guide**: Step-by-step setup instructions

The routing logic can be expanded in the `ApexAIAssistant` component to detect user intent and offer these tools.

---

## Branding

- **Title**: "Apex AI Assistant"
- **Tagline**: "Your modular construction expert"
- **Colors**:
  - Primary Purple: `#4B1D8F`
  - Gold Accent: `#D4AF37`
- **Tone**: Friendly, professional, helpful
