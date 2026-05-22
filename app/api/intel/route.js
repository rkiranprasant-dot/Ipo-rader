import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing in Vercel settings" }, { status: 500 });
    }

    // This is the clean prompt structure the AI expects
    const prompt = `Provide global IPO intelligence. Return a valid JSON object matching this structure exactly:
    {
      "breakingIntelligence": [
        {
          "company": "Example Corp",
          "headline": "Filing officially submitted",
          "detail": "Detailed market breakdown",
          "impact": "HIGH",
          "stage": "Filed",
          "region": "us",
          "transactionType": "IPO",
          "source": "SEC EDGAR",
          "publishedAt": "Just now"
        }
      ],
      "latestNews": [],
      "regionSummary": {
        "us": { "active": 0, "hot": "summary" }
      },
      "stagePipeline": {
        "rumored": [], "confidential": [], "filed": [], "roadshow": [], "pricing": [], "live": []
      }
    }`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        })
      }
    );

    if (!res.ok) {
      throw new Error(`Google API responded with status ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text;
    
    return NextResponse.json(JSON.parse(text));

  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to generate intelligence data" }, { status: 500 });
  }
}
  }
        }
