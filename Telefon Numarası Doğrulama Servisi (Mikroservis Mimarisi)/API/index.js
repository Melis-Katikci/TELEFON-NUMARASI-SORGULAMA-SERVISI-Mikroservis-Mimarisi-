const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors'); 

const app = express();
const PORT = process.env.API_PORT || 3000;

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log('MySQL bağlantı havuzu başarıyla oluşturuldu.');
} catch (error) {
    console.error('MySQL bağlantı hatası:', error.message);
    process.exit(1);
}

app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['POST', 'GET'],
}));


/**
 * 
 * @param {string} number
 * @returns {object} 
 */

const validatePhoneNumber = (number) => {
    if (typeof number !== 'string' || !/^\d{6}$/.test(number)) {
        return { isValid: false, message: "Telefon numarası 6 basamaklı sayı olmalıdır." };
    }

    const digits = number.split('').map(Number);
    const [a1, a2, a3, a4, a5, a6] = digits;

    const results = {
        hasNonZeroDigit: digits.some(d => d !== 0),
        sumFirstEqualsLast: (a1 + a2 + a3) === (a4 + a5 + a6),
        sumOddEqualsEven: (a1 + a3 + a5) === (a2 + a4 + a6)
    };
    
    results.isValid = results.hasNonZeroDigit && results.sumFirstEqualsLast && results.sumOddEqualsEven;
    
    return results;
};


app.post('/api/phone/validate', (req, res) => {
    const { number } = req.body;
    if (typeof number !== 'string' || !/^\d{6}$/.test(number)) {
        return res.status(400).json({ status: "error", message: "Hatalı format. Telefon numarası 6 basamaklı sayı olmalıdır." });
    }

    const validation = validatePhoneNumber(number);
    return res.json({
        number,
        rules: {
            hasNonZeroDigit: validation.hasNonZeroDigit,
            sumFirstEqualsLast: validation.sumFirstEqualsLast,
            sumOddEqualsEven: validation.sumOddEqualsEven
        },
        isValid: validation.isValid
    });
});


app.post('/api/registration', async (req, res) => {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
        return res.status(400).json({ status: "error", message: "Tüm alanlar (name, email, phone) zorunludur." });
    }
    const validation = validatePhoneNumber(phone);
    if (!validation.isValid) {
        return res.status(422).json({ 
            status: "denied", 
            message: "Geçersiz telefon numarası. Lütfen yeni bir numara deneyin.",
            isValid: false 
        });
    }

    try {
        const [result] = await pool.query(
            "INSERT INTO registrations (name, email, phone) VALUES (?, ?, ?)",
            [name, email, phone]
        );
        
        return res.status(201).json({
            status: "accepted",
            message: "Telefon numarası geçerli, kayıt başarıyla oluşturuldu.",
            data: {
                id: result.insertId,
                name,
                email,
                phone,
                createdAt: new Date().toISOString()
            }
        });

    } catch (error) {
        if (error.errno === 1062) {
             return res.status(409).json({ 
                status: "error", 
                message: "Bu telefon numarası zaten kayıtlı.",
                isValid: true 
            });
        }
        console.error("Veritabanı kayıt hatası:", error);
        return res.status(500).json({ status: "error", message: "Sunucu hatası. Kayıt yapılamadı." });
    }
});

app.get('/api/kayitliSayisi', async (req, res) => {
    try {
        const [satirlar] = await pool.query("SELECT COUNT(*) AS toplam_kayit_sayisi FROM registrations");
        const toplamKayitSayisi = satirlar[0].toplam_kayit_sayisi;
        
        return res.json({ 
            toplamKayitSayisi: toplamKayitSayisi,
            kaynak: "Veritabanı (registrations tablosu)"
        });
        
    } catch (hata) {
        console.error("Toplam kayıtlı kullanıcı sayısı çekilirken hata:", hata);
        return res.status(500).json({ status: "hata", message: "Sunucu hatası. Kayıt sayısı çekilemedi." });
    }
});

app.get('/api/registrations', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, name, email, phone, created_at FROM registrations ORDER BY created_at DESC LIMIT 3");
        return res.json({ data: rows });
    } catch (error) {
        console.error("Kayıt listeleme hatası:", error);
        return res.status(500).json({ status: "error", message: "Sunucu hatası." });
    }
});

app.listen(PORT, () => {
    console.log(`Backend API servisi http://localhost:${PORT} adresinde çalışıyor`);
});