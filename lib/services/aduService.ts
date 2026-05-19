import { getZoningAnalysis } from "@/app/actions/adu-ai";
import { getProducts } from "@/app/actions/products";

export interface ADUCheckInputs {
  address: string;
  intendedUse: string;
  designImage?: string;
}

export interface ADUReportData {
  reportId: string;
  status: 'Likely Allowed' | 'Likely Compatible' | 'Restrictions Detected';
  statusColor: 'green' | 'yellow' | 'red';
  generalAllowance: string[];
  explanation: string;
  requiredApprovals: string[];
  nextSteps: string[];
  recommendedModels?: string[]; // New: recommendation field
}

export const aduService = {
  async checkFeasibility(inputs: ADUCheckInputs): Promise<ADUReportData> {
    const municipality = this.detectMunicipality(inputs.address);
    const reportId = `CP-ADU-${municipality.substring(0,3).toUpperCase()}-${Math.random().toString(36).substring(2,5).toUpperCase()}`;

    // 1. Fetch relevant Apex Modular Construction products
    const { data: products } = await getProducts({ categorySlug: 'pre-fabricated', limit: 10 });
    const productContext = products ? products.map(p => `- ${p.name}: ${p.description} (Specs: ${JSON.stringify(p.specifications)})`).join('\n') : "No specific products currently available.";

    const systemPrompt = `
      You are a Senior Planning Navigator at Apex Modular Construction. 
      Your goal is to tell the user if they can build an ADU AND which Apex Modular Construction products fit their site.
      
      CARGOPLUS PRODUCT CATALOG:
      ${productContext}

      Return a ultra-concise "Level 1" ADU Feasibility Report in JSON format.
      
      IF A DESIGN DRAWING IS PROVIDED:
      - Inspect the drawing for setbacks, lot coverage, and architectural fit.
      - Identify any obvious permitting hurdles based on the visual layout.
      - Suggest if a Apex Modular Construction model fits better than the drawn design.

      Structure:
      {
        "status": "Likely Allowed / Likely Compatible / Restrictions Detected",
        "statusColor": "green / yellow / red",
        "generalAllowance": ["Max 4 short sentences about zoning here"],
        "explanation": "One short sentence about prefab compatibility based on design drawing analysis if present",
        "requiredApprovals": ["Checklist of 3-4 items"],
        "nextSteps": ["3-4 clear action items"],
        "recommendedModels": ["Exact names of 1-2 Apex Modular Construction products from the catalog above that fit this site"]
      }
    `;

    const userMessage = `Address: ${inputs.address}, Use: ${inputs.intendedUse}`;

    try {
      const result = await getZoningAnalysis(userMessage, systemPrompt, inputs.designImage);
      if (result.success && result.response) {
        const jsonMatch = result.response.match(/\{[\s\S]*\}/);
        const data = JSON.parse(jsonMatch ? jsonMatch[0] : result.response);
        
        // Safety: Ensure all list fields are actually arrays
        const ensureArray = (val: any) => Array.isArray(val) ? val : (val ? [val.toString()] : []);
        
        return { 
          reportId, 
          status: data.status || 'Likely Compatible',
          statusColor: data.statusColor || 'yellow',
          generalAllowance: ensureArray(data.generalAllowance),
          explanation: data.explanation || "Project requires site-specific review.",
          requiredApprovals: ensureArray(data.requiredApprovals),
          nextSteps: ensureArray(data.nextSteps),
          recommendedModels: ensureArray(data.recommendedModels)
        };
      }
      throw new Error("AI Fallback");
    } catch (error) {
      return this.generateHeuristicReport(inputs, reportId);
    }
  },

  async chatFollowUp(question: string, context?: ADUReportData): Promise<string> {
    console.log("--- CHAT DEBUG START ---");
    try {
      // Fetch products with slugs for direct linking
      const { data: products } = await getProducts({ categorySlug: 'pre-fabricated', limit: 10 });
      const productContext = products ? products.map(p => `- ${p.name}: ${p.description} (Slug: ${p.slug}, Specs: ${JSON.stringify(p.specifications)})`).join('\n') : "No specific products currently available.";

      const systemPrompt = `
        You are a Apex Modular Construction Sales Specialist. 
        
        CARGOPLUS PRODUCT CATALOG:
        ${productContext}

        ${context ? `USER'S PROPERTY REPORT: ${JSON.stringify(context)}` : ""}

        STRICT RULES:
        1. RESPONSE LIMIT: Max 2 sentences total.
        2. LAND SIZE MATCH: If the user mentions SQM, tell them exactly which product fits that size.
        3. PRODUCT CARDS: You MUST provide a product card trigger using this format: [PRODUCT: slug]
        
        EXAMPLE RESPONSE:
        "For an 80sqm lot, I recommend our Zen Cabin which fits perfectly in compact spaces. [PRODUCT: zen-cabin]"
      `;
      
      const result = await getZoningAnalysis(question, systemPrompt);
      if (!result.success) throw new Error(result.error);
      return result.response || "No response generated.";
    } catch (err: any) {
      console.error("Chat Error:", err.message);
      return "I'm having trouble connecting to our product database. Please try again.";
    }
  },

  detectMunicipality(address: string): string {
    const addr = address.toLowerCase();
    if (addr.includes('brampton')) return 'Brampton';
    if (addr.includes('toronto')) return 'Toronto';
    return 'Ontario';
  },

  generateHeuristicReport(inputs: ADUCheckInputs, id: string): ADUReportData {
    return {
      reportId: id,
      status: 'Likely Compatible',
      statusColor: 'yellow',
      generalAllowance: [
        "Detached ADUs are generally permitted in this zone.",
        "Garden suites are commonly allowed on residential lots.",
        "Final approval depends on site-specific setbacks."
      ],
      explanation: "Your selected prefab model appears generally compatible with local regulations.",
      requiredApprovals: ["Building Permit", "Electrical Permit (ESA)", "Utility Connection Approval"],
      nextSteps: ["Confirm measurements", "Prepare site plan", "Submit permit application"]
    };
  }
};
