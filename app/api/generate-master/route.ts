import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildMockMasterSermon } from '@/lib/mockGenerator';
import { MasterSermonSchema } from '@/types/sermon';

const BodySchema = z.object({
  rawNotes: z.any(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const { rawNotes } = parsed.data;

  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || !process.env.OPENAI_API_KEY;

  if (useMock) {
    const master = await buildMockMasterSermon(rawNotes);
    const validated = MasterSermonSchema.parse(master);
    return NextResponse.json({ master: validated });
  }

  // If OPENAI_API_KEY present, call OpenAI. We attempt a simple structured generation.
  try {
    // Importing at runtime to avoid breaking environments where OpenAI isn't installed.
    // The OpenAI SDK surface may vary; a direct fetch is used for compatibility.
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const prompt = `
You are a structured-output assistant that converts pastor notes into a MasterSermon JSON object with the shape:
{ "title": string, "bigIdea": string, "desiredResponse": string, "movements": [{ "title": string, "content": string, "priority": "must"|"normal"|"optional", "locked": boolean, "order": number }] }

Respond with only valid JSON.

Input notes:
${JSON.stringify(rawNotes || {})}
`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.2,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('OpenAI error', text);
      // fallback to mock
      const master = await buildMockMasterSermon(rawNotes);
      const validated = MasterSermonSchema.parse(master);
      return NextResponse.json({ master: validated });
    }

    const payload = await resp.json();
    const raw = payload?.choices?.[0]?.message?.content;
    if (!raw) throw new Error('no content from model');

    // Attempt to parse JSON from the model output
    let parsedJson: any = null;
    try {
      parsedJson = JSON.parse(raw);
    } catch (err) {
      // Try to extract a JSON substring
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) parsedJson = JSON.parse(match[0]);
      else throw err;
    }

    const validated = MasterSermonSchema.parse(parsedJson);
    return NextResponse.json({ master: validated });
  } catch (err) {
    console.error('generation error', err);
    const master = await buildMockMasterSermon(rawNotes);
    const validated = MasterSermonSchema.parse(master);
    return NextResponse.json({ master: validated });
  }
}
