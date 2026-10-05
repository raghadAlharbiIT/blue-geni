import OpenAI from 'openai';
import { NextResponse } from 'next/server';

function fallback(department, wish) {
  return [
    {
      title: '🔎 تحليل المشكلة',
      description: `تعذّر الوصول للذكاء الاصطناعي مؤقتًا. نقدر نبني حل يركز على مشكلة "${wish.slice(0,80)}" داخل ${department}.`,
    },
    {
      title: '⚙️ أتمتة الخطوات',
      description: 'تحويل الجزء اليدوي المتكرر من العملية إلى Workflow تلقائي مع تنبيهات واضحة عند الحاجة لتدخل الموظف.',
    },
    {
      title: '📊 متابعة ذكية',
      description: 'لوحة بسيطة تجمع الحالات المهمة وتقيس التأخير أو التكرار بدل المتابعة اليدوية المتفرقة.',
    },
  ];
}

export async function POST(req) {
  try {
    const { department, wish_text } = await req.json();
    const wish = String(wish_text || '').trim();
    const dept = String(department || 'أخرى').trim();

    if (!wish) {
      return NextResponse.json({ error: 'missing wish' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('Groq suggestion error: GROQ_API_KEY is missing');
      return NextResponse.json({
        suggestions: fallback(dept, wish),
        source: 'fallback',
      });
    }

    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    const prompt = `
أنت "المارد الأزرق"، مساعد ابتكار داخلي لموظفين في شركة سعودية.
مهمتك فهم المشكلة الفعلية التي كتبها الموظف، ثم اقتراح حلول مرتبطة بها مباشرة — لا تعطِ أفكارًا عامة يمكن استخدامها لأي مشكلة.

القسم: ${dept}
المشكلة/الأمنية كما كتبها الموظف:
"${wish}"

أنشئ بالضبط 3 حلول مختلفة.

قواعد إلزامية:
- كل حل يجب أن يعالج تفاصيل محددة وردت في نص المشكلة.
- اربط الحل بطبيعة القسم المذكور.
- اجعل الحل قابلًا للتنفيذ كمشروع AI أو Automation أو نظام رقمي داخلي.
- لا تكرر نفس الفكرة بصياغات مختلفة.
- تجنب الكلام العام مثل "استخدام الذكاء الاصطناعي لتحسين الكفاءة" بدون شرح كيف.
- اذكر في الوصف ما الذي سيتم تحليله أو مراقبته أو أتمتته تحديدًا.
- العنوان قصير جدًا مع Emoji.
- الوصف جملة أو جملتان كحد أقصى.
- العربية طبيعية، بسيطة، مهنية ومرحة قليلًا.
- لا تعد الموظف بأن الحل سيتم تنفيذه.
- لا تضف أي نص خارج JSON.

أعد JSON بهذا الشكل فقط:
{
  "suggestions": [
    {"title": "🔔 عنوان", "description": "حل محدد مرتبط بالمشكلة"},
    {"title": "📊 عنوان", "description": "حل مختلف ومحدد"},
    {"title": "🤖 عنوان", "description": "حل ثالث مختلف ومحدد"}
  ]
}
`;

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      reasoning_format: 'hidden',
      reasoning_effort: 'low',
      temperature: 0.45,
      max_completion_tokens: 1200,
    });

    const raw = response.choices?.[0]?.message?.content;
    const parsed = JSON.parse(raw || '{}');

    if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length !== 3) {
      throw new Error('Groq returned invalid suggestions shape');
    }

    const suggestions = parsed.suggestions.map((s) => ({
      title: String(s?.title || '').trim(),
      description: String(s?.description || '').trim(),
    }));

    if (suggestions.some((s) => !s.title || !s.description)) {
      throw new Error('Groq returned incomplete suggestions');
    }

    console.log('Groq suggestion success', {
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      department: dept,
    });

    return NextResponse.json({
      suggestions,
      source: 'groq',
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    });
  } catch (error) {
    console.error('Groq suggestion error:', error);
    let department = 'القسم';
    let wish = 'المشكلة';
    try {
      const cloned = await req.clone().json();
      department = String(cloned.department || department);
      wish = String(cloned.wish_text || wish);
    } catch {}
    return NextResponse.json({
      suggestions: fallback(department, wish),
      source: 'fallback',
    });
  }
}
