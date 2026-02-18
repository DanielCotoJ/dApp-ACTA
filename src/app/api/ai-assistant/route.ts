import { NextResponse } from 'next/server';
import { dappKnowledge } from '@/lib/dapp-knowledge';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    const prompt = `You are an AI assistant embedded in the ACTA dApp — a decentralized application for issuing, managing, sharing, and verifying verifiable credentials on the Stellar blockchain.

Here is the complete knowledge base about the dApp:

${dappKnowledge}

---

User question: ${query}

Instructions:
1. Answer the question based ONLY on the knowledge base provided above.
2. Be concise, friendly, and helpful.
3. When mentioning a page, use **bold** for the page name and wrap the route path in backticks like \`/dashboard/issue\`. Example: go to **Issue** (\`/dashboard/issue\`).
4. If the question is unrelated to ACTA, politely redirect to ACTA topics.
5. Answer in the SAME language the user asked in (e.g. Spanish if they ask in Spanish).
6. You can use **bold** for emphasis and \`backticks\` for technical terms.
7. At the end, suggest 1-3 relevant page slugs from this list that might help: dashboard, issue, authorize, credentials, api-keys, tutorials

Format your response as JSON:
{
  "answer": "Your helpful answer here",
  "suggestedPages": ["slug1", "slug2"]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let answer = textResponse;
    let suggestedPages: string[] = [];

    try {
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        answer = parsed.answer || textResponse;
        suggestedPages = parsed.suggestedPages || [];
      }
    } catch {
      answer = textResponse;
    }

    return NextResponse.json({ answer, suggestedPages });
  } catch (error) {
    console.error('AI assistant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
