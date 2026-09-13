// ============================================================
// chatbot.js — วิดเจ็ตแชทบอทแนะนำเกม (GAMEZONE)
// เชื่อมกับ Cloudflare Worker + Gemini API
// ============================================================
//
// วิธีติดตั้ง:
// 1. Deploy ไฟล์ worker/chat-worker.js ขึ้น Cloudflare Workers (ฟรี)
//    แล้วเอา URL ที่ได้มาใส่ตรง CHAT_API_URL ด้านล่าง
// ============================================================

const CHAT_API_URL = "https://gameteerapong.suwarojggez.workers.dev";

const SERVER_CONTEXT = `
คุณคือ "GameZone Bot" ผู้ช่วยแนะนำเกมประจำเว็บไซต์ GAMEZONE
เว็บไซต์นี้รวมข้อมูลเกมมือถือและเกม PC พร้อมระบบจัดอันดับเกมยอดนิยม

หน้าที่ของคุณ:
1. แนะนำเกมมือถือหรือเกม PC ตามความสนใจของผู้ใช้ (แนวเกม เช่น RPG, FPS, แนวผจญภัย, แนวสร้างเมือง ฯลฯ)
2. ให้ข้อมูลทั่วไปเกี่ยวกับเกมต่างๆ ที่ผู้ใช้ถามถึง (เนื้อเรื่องคร่าวๆ, แนวเกม, จุดเด่น)
3. ช่วยเปรียบเทียบเกมให้ผู้ใช้ตัดสินใจเลือกเล่น
4. ตอบคำถามเกี่ยวกับสเปกคอมที่แนะนำสำหรับเล่นเกม PC ทั่วไป (ให้คำแนะนำกว้างๆ ได้)
5. ถ้าผู้ใช้ถามเรื่องอื่นที่ไม่เกี่ยวกับเกม ให้ตอบอย่างสุภาพว่าคุณเชี่ยวชาญเรื่องเกมเป็นหลัก

กฎการตอบ:
- ตอบเป็นภาษาไทย เป็นกันเอง กระชับ ตรงประเด็น
- ถ้าแนะนำเกมหลายเกม ให้จัดเป็นรายการสั้นๆ อ่านง่าย
- ห้ามใช้สัญลักษณ์ Markdown เช่น **ตัวหนา**, ### หัวข้อ เพราะข้อความจะแสดงผลเป็นตัวอักษรธรรมดา
- หากไม่แน่ใจข้อมูลเกมใดเกมหนึ่งจริงๆ ให้บอกตามตรงว่าไม่แน่ใจ ไม่เดาข้อมูลมั่ว
`.trim();

document.addEventListener("DOMContentLoaded", () => {
    injectWidget();

    const toggleBtn = document.getElementById("gz-chat-toggle");
    const chatWindow = document.getElementById("gz-chat-window");
    const closeBtn = document.getElementById("gz-chat-close");
    const sendBtn = document.getElementById("gz-chat-send");
    const input = document.getElementById("gz-chat-input");
    const messages = document.getElementById("gz-chat-messages");

    let history = [];

    toggleBtn.addEventListener("click", () => {
        chatWindow.classList.toggle("open");
    });
    closeBtn.addEventListener("click", () => {
        chatWindow.classList.remove("open");
    });

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addBubble(text, "user");

        // เก็บ history ที่ "มีอยู่ก่อนหน้า" เท่านั้น ป้องกันส่งข้อความซ้ำซ้อนไปให้ AI
        const historyToSend = history.slice(-10);
        input.value = "";

        const typingEl = addBubble("กำลังพิมพ์...", "bot typing");

        try {
            const res = await fetch(CHAT_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    history: historyToSend,
                    serverContext: SERVER_CONTEXT
                })
            });

            if (!res.ok) throw new Error("API error " + res.status);
            const data = await res.json();
            const reply = data.reply || "ขออภัย ไม่สามารถตอบคำถามได้ในขณะนี้";

            typingEl.remove();
            addBubble(reply, "bot");

            history.push({ role: "user", content: text });
            history.push({ role: "assistant", content: reply });

        } catch (err) {
            typingEl.remove();
            addBubble("⚠️ เชื่อมต่อระบบแชทบอทไม่สำเร็จ ลองใหม่อีกครั้งนะ", "bot");
            console.error("Chatbot error:", err);
        }
    }

    function addBubble(text, cls) {
        const el = document.createElement("div");
        el.className = "gz-msg " + cls;
        el.textContent = text;
        messages.appendChild(el);
        messages.scrollTop = messages.scrollHeight;
        return el;
    }

    function injectWidget() {
        const toggle = document.createElement("button");
        toggle.id = "gz-chat-toggle";
        toggle.innerHTML = "🎮";
        toggle.setAttribute("aria-label", "เปิดแชทบอทแนะนำเกม");

        const win = document.createElement("div");
        win.id = "gz-chat-window";
        win.innerHTML = `
            <div class="gz-chat-header">
                <div>
                    <h4>🎮 GameZone Bot</h4>
                    <span>ผู้ช่วยแนะนำเกม</span>
                </div>
                <button id="gz-chat-close">✕</button>
            </div>
            <div id="gz-chat-messages">
                <div class="gz-msg bot">สวัสดีครับ! อยากได้เกมแนวไหนดี บอกมาได้เลย จะแนะนำให้ 🎮</div>
            </div>
            <div id="gz-chat-input-row">
                <textarea id="gz-chat-input" rows="1" placeholder="พิมพ์คำถาม..."></textarea>
                <button id="gz-chat-send">➤</button>
            </div>
        `;

        document.body.appendChild(toggle);
        document.body.appendChild(win);
    }
});
