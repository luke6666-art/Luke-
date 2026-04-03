export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: { message: 'Method not allowed' } }); return; }
 
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: { message: '请在 Vercel 环境变量中设置 GEMINI_API_KEY' } });
      return;
    }
 
    const { system, messages } = req.body;
 
    const contents = [];
    if (messages && messages.length > 0) {
      for (const m of messages) {
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        });
      }
    }
 
    const reqBody = {
      contents,
      generationConfig: { maxOutputTokens: 1000 }
    };
 
    if (system) {
      reqBody.systemInstruction = { parts: [{ text: system }] };
    }
 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
 
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody)
    });
 
    const data = await response.json();
 
    if (data.error) {
      res.status(400).json({ error: { message: data.error.message } });
      return;
    }
 
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '暂无回复';
    res.status(200).json({ content: [{ type: 'text', text }] });
 
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
}
 
