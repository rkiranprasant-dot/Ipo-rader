import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const prompt = `Act as an elite institutional-grade financial terminal mapping real-time equity developments for today's market session.
    
    You MUST respond with a valid JSON object matching this blueprint exactly.
    {
      "confirmedIntelligence": [
        {
          "company": "Asset Name",
          "headline": "Confirmed structural market catalyst",
          "impact": "HIGH", 
          "stage": "Filed or Pricing or Live",
          "region": "us",
          "transactionType": "IPO",
          "publishedAt": "2026-05-23T12:00:00Z",
          "estimatedSize": "₹11,500 Cr",
          "actualSize": "$1.2B",
          "priceRange": "$45 - $50",
          "exchange": "NASDAQ",
          "filingLink": "https://www.sec.gov/Archives/edgar/data/1234567/000119312521123456/d123456ds1.htm",
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
      ]
    }
    
    CRITICAL RULES:
    1. CATEGORIZATION: Only place companies in "confirmedIntelligence" if they have officially filed, priced, or listed. If it is unconfirmed or a leak (e.g., Stripe confidential filing), it MUST go into "rumorMill".
    2. MEGA-UNICORNS: Any company valued over $10B cannot be placed in "confirmedIntelligence" without an actual, verified SEC or regional regulatory filing.
    3. FILING LINKS: Do NOT link to the SEC search page. Use live web search to find the exact EDGAR CIK/Accession URL (e.g., /Archives/edgar/data/...). If it is a SEBI filing, provide the direct PDF link.
    4. ACTUAL SIZE: Populate "actualSize" only if the offering has priced.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // This enables real-time Google Search grounding for accurate SEC links
          tools: [{ googleSearch: {} }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1 // Lowered temperature to heavily penalize hallucinations
          }
        })
      }
    );

    if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: res.status });

    const data = await res.json();
    const rawText = data.candidates[0].content.parts[0].text;
    
    return NextResponse.json(JSON.parse(rawText));

  } catch (error) {
    return NextResponse.json({ error: "Processing failure" }, { status: 500 });
  }
}
