import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const fallback = () => [
  { title: '🔔 تنبيه ذكي', description: 'يراقب الحالة ويرسل تنبيهًا تلقائيًا عند وجود تأخير أو حالة تحتاج تدخل.' },
  { title: '📊 لوحة متابعة', description: 'تجمع الحالات المهمة والمؤشرات في مكان واحد بدل المتابعة اليدوية.' },
  { title: '🤖 مساعد ذكي', description: 'يحلل الطلب أو المهمة ويقترح الإجراء التالي للشخص المسؤول.' },
];

export async function POST(req) {
  try {
    const { department, wish_text } = await req.json();
    if (!wish_text?.trim()) return NextResponse.json({ error: 'missing wish' }, { status: 400 });
    if (!process.env.GROQ_API_KEY) return NextResponse.json({ suggestions: fallback(), demo: true });

    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
    const prompt = `أنت المارد الأزرق، مساعد ابتكار داخلي في بيئة عمل سعودية.
القسم: ${department}
المشكلة: ${wish_text}
اقترح 3 حلول فقط، قصيرة وعملية وقابلة للتحويل إلى AI أو Automation أو تحسين رقمي. استخدم عربية طبيعية مرحة ومهنية، ولا تعد بالتنفيذ. أعد JSON فقط بالشكل: {"suggestions":[{"title":"emoji + عنوان قصير","description":"جملة واحدة"}]}`;
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.6,
    });
    const parsed = JSON.parse(response.choices[0].message.content);
    if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length !== 3) throw new Error('invalid suggestions');
    return NextResponse.json({ suggestions: parsed.suggestions.slice(0, 3) });
  } catch (error) {
    console.error('Groq suggestion error:', error);
    return NextResponse.json({ suggestions: fallback(), fallback: true });
  }
}
