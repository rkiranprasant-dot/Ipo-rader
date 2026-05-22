import { NextResponse } from "next/server";

// CRITICAL FIX: Forces Vercel to run this API dynamically on every request
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing in configuration parameters" }, { status: 500 });
    }

    const prompt = `Act as an elite institutional-grade financial terminal mapping real-time equity developments. 
    Synthesize exactly 5 highly distinct, highly detailed, realistic corporate catalyst events occurring globally for today's market session. 
    Include at least one massive market mover (e.g., SpaceX, Stripe, or a major Indian PSU) and set its "isSpecialFocus" to true.
    
    You MUST respond with a valid JSON object matching this blueprint syntax exactly. Do not wrap code blocks in backticks, do not include markdown, and write zero conversational text. Just return pure parseable JSON text matching this exact layout structure:
    {
      "breakingIntelligence": [
        {
          "company": "Institutional Asset Name (e.g. SpaceX, Swiggy, Hyundai India)",
          "headline": "Actionable major structural market catalyst description",
          "detail": "Deep professional briefing mapping specific compliance targets, valuation adjustments, regulatory review criteria, and lead desk indicators.",
          "impact": "HIGH", 
          "stage": "Pricing",
          "region": "us",
          "transactionType": "IPO",
          "source": "SEBI Terminal / Reuters",
          "publishedAt": "2026-05-23T12:00:00Z",
          "estimatedSize": "₹11,500 Cr",
          "actualSize": "$1.2B",
          "priceRange": "$45 - $50",
          "exchange": "NASDAQ",
          "sector": "Space Technology",
          "filingLink": "https://www.sec.gov/edgar/search/",
          "isSpecialFocus": true
        }
      ],
      "latestNews": [
        { "headline": "Fast tape transaction alert string summary", "impact": "MEDIUM", "region": "us", "source": "Bloomberg" },
        { "headline": "Cross-border secondary market distribution executed via institutional blocks", "impact": "LOW", "region": "eu", "source": "Euronext" }
      ],
      "regionSummary": {
        "us": { "active": 3, "totalPipeline": "42 Draft Registration Statements Pending", "hot": "Sustained high tech sector pricing volume" }
      }
    }
    
    RULES for Data:
    - regions: us, india, eu, uk, me, asia, latam
    - stages: Rumored, Confidential, Filed, Roadshow, Pricing, 424B4/Live, Listed
    - transactionTypes: IPO, SPAC, Direct Listing, Spin-off, Secondary
    - impacts: HIGH, MEDIUM, LOW
    - actualSize: populate if it is a live filing or priced. Otherwise, leave as null.
    - filingLink: provide a realistic SEC EDGAR, SEBI, or equivalent regional registry link if Filed/Pricing/Live. If Rumored, leave null.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7
          }
        })
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream connection returned exception status ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    const rawText = data.candidates[0].content.parts[0].text;
    
    return NextResponse.json(JSON.parse(rawText));

  } catch (error) {
    console.error("API Gateway processing failure:", error);
    return NextResponse.json({ error: "System failed to unpack pipeline stream data parameters" }, { status: 500 });
  }
}
