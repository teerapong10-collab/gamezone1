# คู่มือติดตั้งแชทบอท — GAMEZONE

เว็บของนายเป็น Static Website (HTML/CSS ล้วนๆ) ผมเลยเลือกวิธีเดียวกับที่ทำให้เว็บ DUSK:
- แชทบอท AI → หน้าเว็บเรียก **Cloudflare Worker** (ฟรี) ซึ่งเป็นตัวกลางไปเรียก **Gemini API** (ฟรี ไม่ต้องผูกบัตร) อีกที

ไฟล์ที่เพิ่มเข้ามาใหม่:
```
gameteerapong/
├── chatbot.css          ← สไตล์วิดเจ็ตแชทบอท (ธีมแดง-ดำ ตรงกับเว็บ)
├── chatbot.js            ← วิดเจ็ตแชทบอทลอยมุมขวาล่าง ทุกหน้า
└── worker/chat-worker.js ← โค้ด deploy ขึ้น Cloudflare Worker
```
ทุกหน้า (index, pc-games, mobile-games, game-detail, ranking) ถูกแก้ให้โหลดไฟล์ข้างบนแล้ว

---

## ขั้นตอนที่ 1: ขอ Gemini API Key (ฟรี ไม่ต้องผูกบัตร)
1. ไปที่ https://aistudio.google.com/apikey ล็อกอินด้วย Gmail
2. กด "Create API Key" เลือก "Create API key in new project"
3. คัดลอก Key ที่ได้ (ขึ้นต้นด้วย `AIzaSy...`) เก็บไว้

## ขั้นตอนที่ 2: Deploy ตัวกลาง (Cloudflare Worker)
1. ไปที่ https://dash.cloudflare.com สมัครฟรี
2. เมนู **Workers & Pages > Create > "Start with Hello World!"** ตั้งชื่อ เช่น `gamezone-chatbot` กด Deploy
3. กด **"Edit code"** ลบโค้ดเดิมทั้งหมด เปิดไฟล์ `worker/chat-worker.js` คัดลอกโค้ดทั้งหมดมาวางแทน แล้วกด **Deploy**
4. ไปที่ **Settings > Variables and Secrets** → กด Add variable → เลือกประเภท **Secret** → ตั้งชื่อ `GEMINI_API_KEY` → ใส่ค่า Key จากขั้นตอนที่ 1 → Save
5. คัดลอก URL ของ Worker (รูปแบบ `https://gamezone-chatbot.xxxx.workers.dev`)

## ขั้นตอนที่ 3: เชื่อมหน้าเว็บเข้ากับ Worker
1. เปิดไฟล์ `chatbot.js`
2. แก้บรรทัด
   ```js
   const CHAT_API_URL = "https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev";
   ```
   ใส่ URL จริงจากขั้นตอนที่ 2
3. เปิดเว็บ จะเห็นปุ่มแชทลอยมุมขวาล่างทุกหน้า (ไอคอน 🎮) กดแล้วคุยกับบอทได้เลย

## (แนะนำ) ล็อกความปลอดภัย
พอเว็บมีโดเมนจริงแล้ว เปิดไฟล์ `worker/chat-worker.js` แก้บรรทัด
```js
const CORS_ALLOW_ORIGIN = "*";
```
เป็นโดเมนจริงของเว็บ แล้ว deploy worker ใหม่ กันไม่ให้เว็บอื่นแอบใช้ Worker/โควต้า Gemini ของนาย
