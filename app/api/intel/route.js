import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // 🛡️ FALLBACK DATA: Ensures the dashboard is NEVER blank if the AI API fails, rate-limits, or hallucinates.
  const fallbackData = {
    confirmedIntelligence: [
      { company: "Reddit, Inc.", headline: "Priced at top of range, strong retail demand heavily oversubscribed.", impact: "HIGH", stage: "Listed", region: "us", transactionType: "IPO", publishedAt: new Date().toISOString(), estimatedSize: "$748M", actualSize: "$748M", priceRange: "$31 - $34", exchange: "NYSE", sector: "Technology", filingLink: "https://www.sec.gov/edgar/browse/?CIK=1713445", isSpecialFocus: true },
      { company: "Hyundai Motor India", headline: "Largest Indian IPO in history files draft red herring prospectus.", impact: "HIGH", stage: "Filed", region: "india", transactionType: "IPO", publishedAt: new Date().toISOString(), estimatedSize: "₹25,000 Cr", actualSize: null, priceRange: "TBD", exchange: "NSE", sector: "Automotive", filingLink: "https://www.sebi.gov.in/", isSpecialFocus: true },
      { company: "Rubrik", headline: "SoftBank-backed data security firm prices IPO above target range.", impact: "MEDIUM", stage: "Pricing / Live", region: "us", transactionType: "IPO", publishedAt: new Date().toISOString(), estimatedSize: "$713M", actualSize: "$752M", priceRange: "$32", exchange: "NYSE", sector: "Cybersecurity", filingLink: "https://www.sec.gov/edgar/searchedgar/companysearch.html", isSpecialFocus: false },
      { company: "CVC Capital Partners", headline: "European buyout firm launches highly anticipated Amsterdam listing.", impact: "HIGH", stage: "Listed", region: "eu", transactionType: "IPO", publishedAt: new Date().toISOString(), estimatedSize: "€2.0B", actualSize: "€2.3B", priceRange: "€14", exchange: "Euronext", sector: "Private Equity", filingLink: null, isSpecialFocus: false },
      { company: "Bain Capital (Asia)", headline: "Exploring dual-listing strategies for major tech asset spin-offs.", impact: "LOW", stage: "Roadshow", region: "asia", transactionType: "Spin-off", publishedAt: new Date().toISOString(), estimatedSize: "$500M", actualSize: null, priceRange: "TBD", exchange: "HKEX", sector: "Finance", filingLink: null, isSpecialFocus: false },
      { company: "Waystar", headline: "Data protection firm files S-1, targeting aggressive growth valuation.", impact: "MEDIUM", stage: "Filed", region: "us", transactionType: "IPO", publishedAt: new Date().toISOString(), estimatedSize: "$500M", actualSize: null, priceRange: "TBD", exchange: "NASDAQ", sector: "Software", filingLink: "https://www.sec.gov/", isSpecialFocus: false }
    ],
    rumorMill: [
      { company: "Stripe", headline: "Rumored confidential S-1 filing continues to circulate amongst primary dealers.", source: "Bloomberg Sources", impact: "HIGH" },
      { company: "SpaceX (Starlink)", headline: "Spin-off talks re-emerge for late 2026 listing.", source: "WSJ Unconfirmed", impact: "HIGH" }
    ],
    latestNews: [
      { headline: "Global IPO market sees massive 32% surge in tech listings this quarter", source: "Reuters", impact: "HIGH" },
      { headline: "SEBI tightens disclosure norms for SME segment listings", source: "Financial Times", impact: "MEDIUM" },
      { headline: "European exchanges report highest pipeline backlog since 2021", source: "Euronext Updates", impact: "LOW" }
    ]
  };

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json(fallbackData); // Use fallback if no key

    const prompt = `Act as an elite institutional-grade financial terminal mapping global equity developments.
    Synthesize exactly 6 realistic, high-profile global IPOs (Recent, Upcoming, or Live), 2 rumored filings, and 3 major IPO market news items. Use real companies from 2024-2026.
    
    You MUST respond with a valid JSON object matching this blueprint exactly.
    {
      "confirmedIntelligence": [
        {
          "company": "Asset Name",
          "headline": "Brief update on the IPO status",
          "impact": "HIGH", 
          "stage": "Filed, Roadshow, Pricing, Live, or Listed",
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
      "rumorMill": [ { "company": "Stripe", "headline": "Rumor details", "source": "Bloomberg", "impact": "MEDIUM" } ],
      "latestNews": [ { "headline": "News detail", "source": "Reuters", "impact": "HIGH" } ]
    }
    
    CRITICAL RULES:
    1. The "region" field MUST be strictly one of these exact lowercase words: "us", "india", "eu", "asia", "latam".
    2. You MUST return exactly 6 items in confirmedIntelligence. Never return an empty array.
    3. Make the data highly realistic based on recent global market events.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.5 }
        })
      }
    );

    if (!res.ok) throw new Error("API Failed");

    const data = await res.json();
    const rawText = data.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(rawText);

    // Safety check: If the AI returns an empty array, force the fallback data
    if (!parsedData.confirmedIntelligence || parsedData.confirmedIntelligence.length === 0) {
      return NextResponse.json(fallbackData);
    }

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("Using Fallback. Error:", error);
    // If ANY error occurs (parsing, rate limit, fetch fail), return the beautiful fallback data
    return NextResponse.json(fallbackData);
  }
}
