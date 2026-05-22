import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing in configuration parameters" }, { status: 500 });
    }

    const prompt = `Act as an elite institutional-grade financial terminal mapping global equity developments.
    
    Synthesize exactly 6 realistic, high-profile global IPOs (Recent, Upcoming, or Live), 2 rumored filings, and 3 major IPO market news items.
    
    You MUST respond with a valid JSON object matching this blueprint exactly.
    {
      "confirmedIntelligence": [
        {
          "company": "Asset Name",
          "headline": "Brief update on the IPO status",
          "impact": "HIGH", 
          "stage": "Filed or Pricing or Listed",
          "region": "us",
          "transactionType": "IPO",
          "publishedAt": "2026-05-23T12:00:00Z",
          "estimatedSize": "₹11,500 Cr",
          "actualSize": "$1.2B",
          "priceRange": "$45 - $50",
          "exchange": "NASDAQ",
          "sector": "Technology",
          "filingLink": "https://www.sec.gov/edgar/searchedgar/companysearch.html",
          "isSpecialFocus": true
        }
      ],
      "rumorMill": [
        {
          "company": "Stripe",
          "headline": "Rumored confidential S-1 filing",
          "source": "Bloomberg Unnamed Sources",
          "impact": "MEDIUM"
        }
      ],
      "latestNews": [
        {
          "headline": "Global IPO market sees massive surge in tech listings this quarter",
          "source": "Reuters",
          "impact": "HIGH"
        }
      ]
    }
    
    CRITICAL RULES:
    1. BROADEN SCOPE: Include recent IPOs, upcoming roadshows, and major filings from the past 6 months. Do not restrict to just "today".
    2. CATEGORIZATION: Only place companies in "confirmedIntelligence" if they have officially filed, priced, or listed. If it is unconfirmed or a leak, it MUST go into "rumorMill".
    3. DATA POPULATION: You MUST return exactly 6 items in confirmedIntelligence, 2 in rumorMill, and 3 in latestNews so the dashboard is never empty.
    4. ACTUAL SIZE: Populate "actualSize" if the offering has priced or completed.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.4 
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
