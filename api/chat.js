export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: { message: 'Method not allowed' } }); return; }
 
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: { message: '请在 Vercel 环境变量中设置 DEEPSEEK_API_KEY' } });
      return;
    }
 
    const { system, messages, max_tokens } = req.body;
 
    const dsMessages = [];
    if (system) dsMessages.push({ role: 'system', content: system });
    if (messages) dsMessages.push(...messages);
 
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: dsMessages,
        max_tokens: max_tokens || 1000
      })
    });
 
    const data = await response.json();
 
    if (data.error) {
      res.status(400).json({ error: { message: data.error.message } });
      return;
    }
 
    const text = data.choices?.[0]?.message?.content || '暂无回复';
    res.status(200).json({ content: [{ type: 'text', text }] });
 
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
}
 
