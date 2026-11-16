const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const WHATSAPP_TOKEN = 'EAAeqtJAQcc4BTESuqXVAmZA3PqEM4bdCLjadzhBQkbFXwfxQkCjwNpzIc8IkSFo6XekNtHjZAfkZBZCfZBVqVBFHgshGQH2gaugkrPFrMsCVZB0Lh526r2uGtLyW0zwixff29DOeQ8o5eZAOPX43ODNvgKOC5UsytPKVPy6hBNx9buVoE8awWYMPC4oZAKGzuwZDZD';
const PHONE_NUMBER_ID = '627534530447292';

const userSessions = {};

// 1. Webhook Verification (Untuk Meta sahkan URL anda)
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = "dimatasecrettoken";
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// 2. Terima Mesej Masuk (Incoming Messages)
app.post('/webhook', async (req, res) => {
    try {
        const body = req.body;
        if (body.object === 'whatsapp_business_account') {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;

            if (value?.messages) {
                const message = value.messages[0];
                const senderID = message.from;
                const textUser = message.text?.body?.trim();

                if (!userSessions[senderID]) {
                    userSessions[senderID] = { step: 'LANG_SELECT' };
                    await sendWhatsAppMessage(senderID, "Welcome! Sila pilih bahasa / Please choose your language:\n\n1️⃣ Bahasa Melayu\n2️⃣ English\n\n*(Balas 1 atau 2 / Reply 1 or 2)*");
                    return res.sendStatus(200);
                }

                let session = userSessions[senderID];

                if (session.step === 'LANG_SELECT') {
                    if (textUser === '1') {
                        userSessions[senderID] = { step: 'COMPANY_SELECT', lang: 'BM' };
                        await sendWhatsAppMessage(senderID, "Sila pilih perkhidmatan / syarikat kami:\n\n1️⃣ DIMATA HUB\n2️⃣ DIMATA Creative House\n3️⃣ DIMATA Gamers House\n\n*(Balas 1, 2 atau 3)*");
                    } else if (textUser === '2') {
                        userSessions[senderID] = { step: 'COMPANY_SELECT', lang: 'EN' };
                        await sendWhatsAppMessage(senderID, "Please select our service / company:\n\n1️⃣ DIMATA HUB\n2️⃣ DIMATA Creative House\n3️⃣ DIMATA Gamers House\n\n*(Reply 1, 2 or 3)*");
                    } else {
                        await sendWhatsAppMessage(senderID, "Welcome! Sila pilih bahasa / Please choose your language:\n\n1️⃣ Bahasa Melayu\n2️⃣ English\n\n*(Balas 1 atau 2 / Reply 1 or 2)*");
                    }
                } 
                else if (session.step === 'COMPANY_SELECT') {
                    const lang = session.lang;

                    if (textUser === '1') {
                        userSessions[senderID] = { step: 'HUB_FAQ', lang: lang };
                        if (lang === 'BM') {
                            await sendWhatsAppMessage(senderID, "📌 *DIMATA HUB* (POS, B2B Invoicing & Workforce)\n\nSila pilih soalan anda:\n\n1️⃣ Macam mana nak tengok info & layari website?\n2️⃣ Macam mana nak daftar pakej percuma?\n3️⃣ Adakah selamat dan stabil?\n4️⃣ Adakah perlu download di Appstore/Playstore?");
                        } else {
                            await sendWhatsAppMessage(senderID, "📌 *DIMATA HUB* (POS, B2B Invoicing & Workforce)\n\nPlease choose your question:\n\n1️⃣ How to view info & visit website?\n2️⃣ How to register for a free package?\n3️⃣ Is it safe and stable?\n4️⃣ Do I need to download from Appstore/Playstore?");
                        }
                    } else if (textUser === '2') {
                        userSessions[senderID] = { step: 'CREATIVE_FAQ', lang: lang };
                        if (lang === 'BM') {
                            await sendWhatsAppMessage(senderID, "📌 *DIMATA Creative House*\n\nSila pilih soalan anda:\n\n1️⃣ Apa fokus servis yang disediakan?\n2️⃣ Di mana nak layari website sistem creative?\n3️⃣ Berapakah anggaran harga?\n4️⃣ Dimanakah lokasi anda?");
                        } else {
                            await sendWhatsAppMessage(senderID, "📌 *DIMATA Creative House*\n\nPlease choose your question:\n\n1️⃣ What are the focus services provided?\n2️⃣ Where to visit the creative system website?\n3️⃣ What is the estimated price?\n4️⃣ Where is your location?");
                        }
                    } else if (textUser === '3') {
                        userSessions[senderID] = { step: 'GAMERS_FAQ', lang: lang };
                        if (lang === 'BM') {
                            await sendWhatsAppMessage(senderID, "📌 *DIMATA Gamers House* (Esports & Gaming Lounge)\n\nSila pilih soalan anda:\n\n1️⃣ Apa permainan yang ada di lounge?\n2️⃣ Di mana nak layari website gamers?\n3️⃣ Bagaimanakah cara untuk membuat tempahan?\n4️⃣ Berapakah harga untuk 1 jam?");
                        } else {
                            await sendWhatsAppMessage(senderID, "📌 *DIMATA Gamers House* (Esports & Gaming Lounge)\n\nPlease choose your question:\n\n1️⃣ What games are available at the lounge?\n2️⃣ Where to visit the gamers website?\n3️⃣ How to make a booking?\n4️⃣ What is the price per hour?");
                        }
                    } else {
                        await sendWhatsAppMessage(senderID, lang === 'BM' ? "Sila pilih nombor yang sah (1, 2 atau 3)." : "Please select a valid number (1, 2 or 3).");
                    }
                } 
                else if (session.step === 'HUB_FAQ') {
                    const lang = session.lang;
                    if (textUser === '1') {
                        await sendWhatsAppMessage(senderID, lang === 'BM' ? "👉 Anda boleh terus layari laman web rasmi kami di *www.dimatahub.com*." : "👉 You can visit our official website at *www.dimatahub.com*.");
                    } else if (textUser === '2') {
                        await sendWhatsAppMessage(senderID, lang === 'BM' ? "👉 Nak daftar pakej percuma? Sila ke: *app.dimatahub.com/register*" : "👉 Want to register for a free package? Go to: *app.dimatahub.com/register*");
                    } else if (textUser === '3') {
                        await sendWhatsAppMessage(senderID, lang === 'BM' ? "👉 Ya, sistem kami sangat selamat dan stabil kerana menggunakan VPS cloud." : "👉 Yes, our system is very safe and stable using VPS cloud.");
                    } else if (textUser === '4') {
                        await sendWhatsAppMessage(senderID, lang === 'BM' ? "👉 Tidak perlu! Selagi ada Google Chrome, anda boleh guna terus dan pilih 'Add to Home Screen' untuk guna seperti web app." : "👉 No need! As long as you have Google Chrome, you can use it and select 'Add to Home' to use it like a web app.");
                    } else {
                        await sendWhatsAppMessage(senderID, lang === 'BM' ? "Sila balas nombor 1 hingga 4." : "Please reply number 1 to 4.");
                    }
                }
                else if (session.step === 'CREATIVE_FAQ') {
                    const lang = session.lang;
                    if (textUser === '1') {
                        await sendWhatsAppMessage(senderID, lang === 'BM' ? "👉 Fokus kami adalah Graphic Design, Social Media, Website, dan pembinaan sistem website." : "👉 We focus on Graphic Design, Social Media, Website, and website systems development.");
                    } else if (textUser === '2') {
                        await sendWhatsAppMessage(senderID, lang === 'BM' ? "👉 Anda boleh layari website kami di: *creative.dimatalabs.com*" : "👉 You can visit our website at: *creative.dimatalabs.com*");
                    } else if (textUser === '3') {
                        await sendWhatsAppMessage(senderID, lang === 'BM' ? "👉 Harga tertakluk kepada permintaan pelanggan dan kita akan berikan quotation selepas itu." : "👉 Price is subject to customer request and we will provide a quotation afterwards.");
                    } else if (textUser === '4') {
                        await sendWhatsAppMessage(senderID, lang === 'BM' ? "👉 Kami berada di Sentul, Kuala Lumpur dan boleh juga arrange perjumpaan di sekitar Lembah Klang/Selangor." : "👉 We are located in Sentul, Kuala Lumpur and can also arrange meetings around Klang Valley/Selangor.");
                    } else {
                        await sendWhatsAppMessage(senderID, lang === 'BM' ? "Sila balas nombor 1 hingga 4." : "Please reply number 1 to 4.");
                    }
                }
                else if (session.step === 'GAMERS_FAQ') {
                    const lang = session.lang;
                    if (textUser === '1') {
                        await sendWhatsAppMessage(senderID, lang === 'BM' ? "👉 Lounge kami hanya khusus untuk pengalaman bermain PS5 sahaja!" : "👉 Our lounge is exclusively for playing PS5!");
                    } else if (textUser === '2') {
                        await sendWhatsAppMessage(senderID, lang === 'BM' ? "👉 Anda boleh layari website kami di: *gamers.dimatalabs.com*" : "👉 You can visit our website at: *gamers.dimatalabs.com*");
                    } else if (textUser === '3') {
                        await sendWhatsAppMessage(senderID, lang === 'BM' ? "👉 Boleh buat tempahan melalui group WhatsApp: https://chat.whatsapp.com/CAJ5TUFXjXoGMW00ghIm8e?mode=gi_t ataupun di website kami." : "👉 You can make a booking via WhatsApp group: https://chat.whatsapp.com/CAJ5TUFXjXoGMW00ghIm8e?mode=gi_t or on our website.");
                    } else if (textUser === '4') {
                        await sendWhatsAppMessage(senderID, lang === 'BM' ? "👉 Harga untuk ahli berdaftar ialah RM10/jam dan bukan ahli berdaftar ialah RM12/jam." : "👉 The price for registered members is RM10/hour and non-registered members is RM12/hour.");
                    } else {
                        await sendWhatsAppMessage(senderID, lang === 'BM' ? "Sila balas nombor 1 hingga 4." : "Please reply number 1 to 4.");
                    }
                }
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error("Error:", error);
        res.sendStatus(500);
    }
});

async function sendWhatsAppMessage(recipientPhone, messageText) {
    try {
        await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: recipientPhone,
                type: "text",
                text: { body: messageText }
            })
        });
    } catch (err) {
        console.error("Gagal hantar mesej:", err);
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Bot server sedang berjalan di port ${PORT}`);
});
