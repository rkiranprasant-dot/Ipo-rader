import { NextResponse } from 'next/server';

export async function GET() {
  const ts = new Date().toISOString();
  const today = ts.split("T")[0];

  const prompt = `You are a global IPO intelligence terminal. Search the web RIGHT NOW (${ts}) for the most current, market-moving IPO & deal flow intelligence from EVERY region of the globe.
  Search for these topics:
  1. "IPO filing SEC EDGAR S-1 ${today} 2026" 
  2. "confidential IPO filing 2026 unicorn private company"
  3. "India IPO DRHP SEBI filing ${today} 2026"
  4. "IPO roadshow pricing this week 2026"
  
  Return ONLY a raw JSON object with this EXACT structure (no markdown, no backticks):
  {
    "generatedAt": "${ts}",
    "marketPulse": "one sentence global IPO market summary",
    "marketSentiment": "bullish|bearish|neutral|mixed",
    "breakingIntelligence": [
      {
        "id": "unique-slug",
        "company": "Company Name",
        "isPrivate": true,
        "country": "US",
        "region": "us|india|eu|uk|me|asia|latam|africa",
        "transactionType": "IPO|SPAC|Direct Listing|Spin-off|Secondary|ADR",
        "stage": "Rumored|Confidential|Filed|Amended|Roadshow|Pricing|424B4/Live|Listed|Withdrawn",
        "formFiled": "S-1|DRHP|etc",
        "filedAt": "YYYY-MM-DD",
        "exchange": "NYSE|NASDAQ|NSE|BSE|etc",
        "sector": "Sector",
        "estimatedSize": "$5B or TBD",
        "estimatedValuation": "$50B or TBD",
        "priceRange": "$18-$20 or TBD",
        "impact": "HIGH|MEDIUM|LOW",
        "headline": "Short punchy headline",
        "detail": "2-3 sentences of context",
        "marketSignificance": "Why it matters",
        "source": "News source",
        "publishedAt": "2h ago",
        "url": "link if available"
      }
    ],
    "stagePipeline": {
      "rumored": ["Company A ($10B, US)"],
      "live": ["Company B (₹1200Cr, NSE)"]
    },
    "latestNews": [],
    "regionSummary": {
      "us": { "active": 0, "hot": "summary", "totalPipeline": "$XXB" }
    }
  }
  CRITICAL: Make sure the response is valid JSON.`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.2
        }
      })
    });

    if (!res.ok) throw new Error("API Request Failed");

    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text;
    
    return NextResponse.json(JSON.parse(text));

  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to generate data" }, { status: 500 });
  }
        }
