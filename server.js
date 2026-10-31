const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Database sementara (array)
const databaseLinks = [];

// 1. Halaman Utama (Frontend Sederhana untuk membuat link)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SafeLink Generator - addvance.site</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; background: #f4f4f9; }
                .container { background: white; padding: 30px; border-radius: 8px; display: inline-block; box-shadow: 0px 0px 10px rgba(0,0,0,0.1); }
                input { padding: 10px; width: 300px; margin-right: 10px; border: 1px solid #ccc; border-radius: 4px; }
                button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
                button:hover { background: #0056b3; }
                #result { margin-top: 20px; font-weight: bold; word-break: break-all; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Pembuat SafeLink (addvance.site)</h2>
                <input type="text" id="urlInput" placeholder="Masukkan URL panjang (contoh: https://google.com)">
                <button onclick="buatShortLink()">Buat SafeLink</button>
                <div id="result"></div>
            </div>

            <script>
                async function buatShortLink() {
                    const originalUrl = document.getElementById('urlInput').value;
                    const resultDiv = document.getElementById('result');
                    
                    if (!originalUrl) {
                        alert('URL tidak boleh kosong!');
                        return;
                    }

                    const response = await fetch('/api/shorten', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ originalUrl })
                    });

                    const data = await response.json();
                    if (data.success) {
                        resultDiv.innerHTML = 'Link Berhasil Dibuat: <a href="' + data.shortUrl + '" target="_blank">' + data.shortUrl + '</a>';
                    } else {
                        resultDiv.innerText = 'Terjadi kesalahan!';
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// 2. Endpoint untuk membuat Short Link (POST)
app.post('/api/shorten', (req, res) => {
    const { originalUrl } = req.body;
    
    if (!originalUrl) {
        return res.status(400).json({ error: 'URL asli wajib diisi!' });
    }

    const shortCode = Math.random().toString(36).substring(2, 8);
    databaseLinks.push({ shortCode, originalUrl });

    // Domain kustom Anda
    const customDomain = 'addvance.site'; 
    
    res.json({
        success: true,
        shortCode: shortCode,
        shortUrl: `https://${customDomain}/${shortCode}`
    });
});

// 3. Endpoint untuk mengambil URL asli berdasarkan kode (GET API)
app.get('/api/link/:code', (req, res) => {
    const found = databaseLinks.find(item => item.shortCode === req.params.code);

    if (!found) {
        return res.status(404).json({ error: 'Link tidak ditemukan!' });
    }

    res.json({ originalUrl: found.originalUrl });
});

// 4. Endpoint Halaman Transisi SafeLink (Artikel + Auto Redirect 3 Detik)
app.get('/:code', (req, res) => {
    const shortCode = req.params.code;
    const found = databaseLinks.find(item => item.shortCode === shortCode);

    if (!found) {
        return res.status(404).send('<h3>Link tidak ditemukan atau sudah kadaluarsa!</h3>');
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Best Independent Films - SafeLink</title>
            <style>
                body { font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; display: flex; justify-content: center; }
                .main-container { width: 100%; max-width: 650px; margin-top: 30px; }
                .article-box { background: #1e293b; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); margin-bottom: 20px; }
                .category { background: #065f46; color: #34d399; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 15px; }
                h1 { font-size: 22px; margin-bottom: 15px; color: #ffffff; }
                p { color: #94a3b8; line-height: 1.6; font-size: 14px; }
                
                /* Widget SafeLink di bagian bawah artikel */
                .safelink-widget { background: #1e293b; border: 1px solid #334155; padding: 20px; border-radius: 10px; text-align: center; }
                #countdown { font-size: 32px; font-weight: bold; color: #38bdf8; margin: 10px 0; }
                .info-text { color: #64748b; font-size: 13px; }
            </style>
        </head>
        <body>
            <div class="main-container">
                <div class="article-box">
                    <span class="category">ENTERTAINMENT</span>
                    <h1>Best Independent Films of 2025 That Deserve Your Attention</h1>
                    <p>A curated selection of the most compelling independent films released this year that showcase exceptional storytelling, brilliant cinematography, and deep emotional resonance.</p>
                </div>

                <div class="safelink-widget">
                    <p style="margin: 0; color: #cbd5e1;">Mempersiapkan tautan tujuan Anda...</p>
                    <div id="countdown">3</div>
                    <p class="info-text">Anda akan dialihkan secara otomatis tanpa perlu klik tombol.</p>
                </div>
            </div>

            <script>
                let seconds = 2; // Hitung mundur 3 detik
                const countdownEl = document.getElementById('countdown');
                const targetUrl = "${found.originalUrl}";

                const timer = setInterval(() => {
                    seconds--;
                    countdownEl.innerText = seconds;
                    if (seconds <= 0) {
                        clearInterval(timer);
                        // Langsung melempar pengguna ke URL asli
                        window.location.href = targetUrl;
                    }
                }, 1000);
            </script>
        </body>
        </html>
    `);
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server backend berjalan di http://localhost:${PORT}`);
});