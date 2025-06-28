import fetch from 'node-fetch';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault('Asia/Hong_Kong');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

export async function parseBookingFromText(text) {
  const systemPrompt = `你是一個場地預訂助理，請根據用戶輸入的中文或英文語句，解析出場地預訂資料，並以 JSON 返回。\n若用戶只是詢問，而非明確預訂，也請返回 \"action: query\"。\n格式範例：\n{\n  \"type\": \"single\" | \"recurring\",\n  \"venue\": \"音樂室\",\n  \"start\": \"2025-07-01T09:00:00+08:00\", // 單次預訂開始 (Hong Kong)\n  \"end\":   \"2025-07-01T11:00:00+08:00\", // 單次預訂結束\n  // 若為 recurring\n  \"rrule\": \"FREQ=WEEKLY;BYDAY=MO;DTSTART=20250630T150000Z;UNTIL=20260629T000000Z;\",\n  \"durationMinutes\": 120 // 每次持續時間，以分鐘計\n}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: text },
  ];

  const body = {
    model: 'deepseek-chat',
    messages,
    temperature: 0,
  };

  const res = await fetch(DEEPSEEK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`DeepSeek API error: ${res.status}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    console.error('Failed to parse LLM JSON', content);
    throw new Error('LLM returned invalid JSON');
  }

  // Post-process defaults: if year missing, add current year
  if (parsed.type === 'single') {
    parsed.start = ensureYear(parsed.start);
    parsed.end = ensureYear(parsed.end);
  }

  return parsed;
}

function ensureYear(dtStr) {
  if (!dtStr) return dtStr;
  const date = dayjs(dtStr);
  if (!date.year() || isNaN(date.year())) {
    // LLM 沒有返回年份，使用當前年份
    const nowYear = dayjs().year();
    return date.year(nowYear).toISOString();
  }
  return date.toISOString();
} 