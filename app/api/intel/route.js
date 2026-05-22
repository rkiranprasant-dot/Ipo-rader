import { NextResponse } from "next/server";

// CRITICAL FIX: Forces Vercel to run this API dynamically on every request 
// instead of caching the first result.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing in configuration parameters" }, { status: 500 });
    }

    const prompt = `Act as an elite institutional-grade financial terminal mapping real-time equity developments. 
    Synthesize exactly 4 highly distinct, highly detailed, realistic corporate catalyst events occurring globally for today's market session.
    
    You MUST respond with a valid JSON object matching this blueprint syntax exactly. Do not wrap code blocks in backticks, do not include markdown, and write zero conversational text. Just return pure valid JSON:
    {
      "breakingIntelligence": [
        {
          "company": "Institutional Asset Name (e.g. Swiggy, Hyundai India, Starlink)",
          "headline": "Actionable major structural market catalyst description",
          "detail": "Deep professional briefing mapping specific compliance targets, valuation adjustments, regulatory review criteria, and lead desk indicators.",
          "impact": "HIGH", 
          "stage": "Pricing",
          "region": "india",
          "transactionType": "IPO",
          "source": "SEBI Terminal / Reuters",
          "publishedAt": "2026-05-22T12:00:00Z",
          "estimatedSize": "₹11,500 Cr",
          "estimatedValuation": "₹83,000 Cr",
          "priceRange": "₹375 - ₹390",
          "exchange": "NSE · BSE",
          "sector": "Consumer / Technology",
          "keyDate": "May 25"
        }
      ],
      "latestNews": [
        { "headline": "Fast tape transaction alert string summary", "impact": "MEDIUM", "region": "us", "source": "Bloomberg" },
        { "headline": "Cross-border secondary market distribution executed via institutional blocks", "impact": "LOW", "region": "eu", "source": "Euronext" }
      ],
      "regionSummary": {
        "us": { "active": 3, "totalPipeline": "42 Draft Registration Statements Pending", "hot": "Sustained high tech sector pricing volume" },
        "india": { "active": 5, "totalPipeline": "24 DRHP Filings Pending Under Review", "hot": "Unprecedented retail capitalization momentum peaks" },
        "eu": { "active": 1, "totalPipeline": "11 Prospectus Files Issued", "hot": "Renewed luxury sector capitalization activity" }
      },
      "stagePipeline": {
        "rumored": ["Ola Electric (₹6,200Cr)", "Zepto ($4B Spinoff)"],
        "confidential": ["Stripe Inc ($55B Flagship Filing)"],
        "filed": ["NTPC Green Energy (₹10,000Cr)"],
        "roadshow": ["Affirm Europe Block"],
        "pricing": ["Swiggy Institutional Tranche"],
        "live": ["Hyundai Motor India Trade Book"]
      }
    }
    Ensure your generated macro elements mix fields cleanly across:
    - regions: us, india, eu, uk, me, asia, latam
    - stages: Rumored, Confidential, Filed, Roadshow, Pricing, 424B4/Live, Listed
    - transactionTypes: IPO, SPAC, Direct Listing, Spin-off, Secondary
    - impacts: HIGH, MEDIUM, LOW`;

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
      let errorMessage = `Upstream connection returned exception status ${res.status}`;
      if (res.status === 404) {
        errorMessage = "Gemini API endpoint not found (404). Check API URL and service availability.";
      } else if (res.status === 401 || res.status === 403) {
        errorMessage = "Authentication failed. Verify GEMINI_API_KEY is valid.";
      } else if (res.status === 429) {
        errorMessage = "Rate limit exceeded. Please try again later.";
      } else if (res.status >= 500) {
        errorMessage = "Gemini API service error. Please try again later.";
      }
      console.error(`API Error ${res.status}:`, errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: res.status });
    }

    const data = await res.json();
    
    // Validate response structure
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      return NextResponse.json({ error: "Invalid API response structure: no candidates found" }, { status: 500 });
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
      return NextResponse.json({ error: "Invalid API response structure: no content parts found" }, { status: 500 });
    }

    const rawText = candidate.content.parts[0].text;
    if (!rawText) {
      return NextResponse.json({ error: "Invalid API response: empty text content" }, { status: 500 });
    }

    // Parse and validate JSON
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Raw text:", rawText);
      return NextResponse.json({ error: "Failed to parse API response as JSON" }, { status: 500 });
    }
    
    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("API Gateway processing failure:", error);
    return NextResponse.json({ error: "System failed to unpack pipeline stream data parameters" }, { status: 500 });
  }
}
