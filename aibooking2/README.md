# AI 驅動租用場地系統

本專案提供一個可快速部署的 Express + SQLite API，用於管理場地預訂。系統透過 DeepSeek LLM 解析使用者的自然語言指令，自動建立單次或規律性的預訂。

## 特點

1. 🧠 DeepSeek Chat 智能解析：直接輸入「我想 7月1日 下午 3 點到 5 點預訂音樂室」，系統即建立預訂。
2. 🔁 支援 RRULE 規律預訂，例如「逢星期一 15:00-17:00 音樂室」。
3. 🌏 香港時區：所有日期時間自動使用 Asia/Hong_Kong。
4. 🔒 簡易 Admin 驗證 (`X-ADMIN-TOKEN`) 允許管理者查詢 / 編輯 / 刪除預訂。
5. 📜 RESTful API，可輕鬆接入前端（建議搭配 FullCalendar 顯示）。

## 安裝

```bash
npm install
cp .env.example .env # 並填入 DEEPSEEK_API_KEY & ADMIN_TOKEN
npm start
```

啟動後，伺服器預設監聽 `http://localhost:3000`。

## 主要 API

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | /api/booking/nlp | `{"message": "7 月 1 日下午 3 點到 5 點預訂音樂室"}` 由 LLM 解析並建立預訂 |
| GET  | /api/bookings | 取得所有預訂 |
| GET  | /api/admin/bookings/:id | 取得單筆預訂（需 `X-ADMIN-TOKEN`） |
| PUT  | /api/admin/bookings/:id | 更新預訂 |
| DELETE | /api/admin/bookings/:id | 刪除預訂 |

## 資料表

- `venues`：場地清單
- `bookings`：實際預訂記錄
- `recurrences`：RRULE 字串，供產生週期性預訂

## 常見擴充

- 加入前端，採用 React + FullCalendar 顯示時間表（列表或表格模式）。
- 以 Cron 定時將 RRULE 產生未來預訂，或即時計算。
- 使用 JWT 或 OAuth2 提升權限管理。

---

MIT License 