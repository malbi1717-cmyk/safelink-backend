const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Database sementara (array)
const databaseLinks = [];

// 1. Halaman Utama (Frontend Sederhana untuk Bulk Shortlink)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bulk SafeLink Generator - addvance.site</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; background: #f4f4f9; }
                .container { background: white; padding: 30px; border-radius: 8px; display: inline-block; box-shadow: 0px 0px 10px rgba(0,0,0,0.1); width: 450px; max-width: 90%; }
                textarea { padding: 10px; width: 100%; height: 120px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; resize: vertical; }
                button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%; font-size: 16px; }
                button:hover { background: #0056b3; }
                #result { margin-top: 20px; text-align: left; word-break: break-all; font-size: 14px; max-height: 200px; overflow-y: auto; background: #f8f9fa; padding: 10px; border-radius: 4px; }
                .result-item { margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Bulk SafeLink Generator</h2>
                <p style="font-size: 12px; color: #666;">Masukkan beberapa URL (1 URL per baris, bisa langsung 5 link atau lebih):</p>
                <textarea id="urlInput" placeholder="https://google.com&#10;https://github.com&#10;https://youtube.com"></textarea>
                <button onclick="buatBulkShortLink()">Buat SafeLink Massal</button>
                <div id="result"></div>
            </div>

            <script>
                async function buatBulkShortLink() {
                    const rawInput = document.getElementById('urlInput').value;
                    const resultDiv = document.getElementById('result');
                    
                    const urls = rawInput.split('\\n').map(u => u.trim()).filter(u => u.length > 0);

                    if (urls.length === 0) {
                        alert('Masukkan minimal 1 URL!');
                        return;
                    }

                    const response = await fetch('/api/bulk-shorten', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ urls })
                    });

                    const data = await response.json();
                    if (data.success) {
                        let html = '<b>Hasil Shortlink:</b><br><br>';
                        data.data.forEach((item, index) => {
                            html += '<div class="result-item">' + (index + 1) + '. <a href="' + item.shortUrl + '" target="_blank">' + item.shortUrl + '</a></div>';
                        });
                        resultDiv.innerHTML = html;
                    } else {
                        resultDiv.innerText = 'Terjadi kesalahan!';
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// 2. Endpoint untuk Membuat Banyak Short Link Sekaligus (Bulk POST)
app.post('/api/bulk-shorten', (req, res) => {
    const { urls } = req.body;
    
    if (!Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: 'Array URL wajib diisi!' });
    }

    const customDomain = 'addvance.site';
    const results = [];

    urls.forEach(originalUrl => {
        const shortCode = Math.random().toString(36).substring(2, 8);
        databaseLinks.push({ shortCode, originalUrl });
        results.push({
            originalUrl,
            shortCode,
            shortUrl: `https://${customDomain}/${shortCode}`
        });
    });

    res.json({
        success: true,
        data: results
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

// 4. Endpoint Halaman Transisi SafeLink (Hitungan Bilangan Bulat 3, 2, 1 tapi Cepat)
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
                    <p class="info-text">Pengalihan kilat otomatis sedang diproses.</p>
                </div>
            </div>

            <script>
                // Mulai dari angka bulat 3
                let timeLeft = 3; 
                const countdownEl = document.getElementById('countdown');
                const targetUrl = "${found.originalUrl}";

                // Setiap angka (3 ke 2, lalu 2 ke 1) diproses dalam waktu cepat (misal setiap 400ms / 0.4 detik)
                const timer = setInterval(() => {
                    timeLeft--;
                    if (timeLeft <= 0) {
                        countdownEl.innerText = "0";
                        clearInterval(timer);
                        window.location.href = targetUrl;
                    } else {
                        countdownEl.innerText = timeLeft;
                    }
                }, 400); 
            </script>
        </body>
        </html>
    `);
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server backend berjalan di http://localhost:${PORT}`);
});
