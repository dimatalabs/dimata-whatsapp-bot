const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Tetapan Token dan ID Nombor Rasmi Anda
const WHATSAPP_TOKEN = 'EAAeqtJAQcc4BTESuqXVAmZA3PqEM4bdCLjadzhBQkbFXwfxQkCjwNpzIc8IkSFo6XekNtHjZAfkZBZCfZBVqVBFHgshGQH2gaugkrPFrMsCVZB0Lh526r2uGtLyW0zwixff29DOeQ8o5eZAOPX43ODNvgKOC5UsytPKVPy6hBNx9buVoE8awWYMPC4oZAKGzuwZDZD';
const PHONE_NUMBER_ID = '627534530447292';
const VERIFY_TOKEN = 'dimatasecrettoken';

// 1. Endpoint untuk Pengesahan Webhook (GET oleh Meta)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

// 2. Endpoint untuk Menerima Mesej Masuk (POST oleh Meta)
app.post('/webhook', async (req, res) => {
    try {
        const body = req.body;

        if (body.object === 'whatsapp_business_account') {
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {
                const messageObj = body.entry[0].changes[0].value.messages[0];
                const from = messageObj.from; // Nombor pengirim (pengguna)
                const msgBody = messageObj.text ? messageObj.text.body : '';

                console.log(`Mesej diterima daripada ${from}: ${msgBody}`);

                // Balas mesej secara automatik kepada pengguna
                await axios.post(
                    `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
                    {
                        messaging_product: 'whatsapp',
                        to: from,
                        text: { 
                            body: "Welcome! Sila pilih bahasa / Please choose your language:\n1️⃣ Bahasa Melayu\n2️⃣ English" 
                        },
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }
            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Ralat menghantar mesej:', error.response ? error.response.data : error.message);
        res.sendStatus(500);
    }
});

// Jalankan Pelayan pada Port Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Bot server sedang berjalan di port ${PORT}`);
});
