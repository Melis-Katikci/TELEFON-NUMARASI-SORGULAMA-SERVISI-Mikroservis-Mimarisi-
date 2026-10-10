document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm'); 
    const messageDiv = document.getElementById('message');
    const tableBody = document.querySelector('#kayit tbody'); 
    const API_URL = 'http://localhost:3001/api/registration';
    const REGISTRATIONS_URL = 'http://localhost:3001/api/registrations'; 

    const displayMessage = (status, text) => {
        messageDiv.textContent = text;
        messageDiv.className = `message ${status}`;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        displayMessage('', 'Gönderiliyor...');

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value; 
        const payload = { name, email, phone };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            
            const statusCode = response.status; 
            const data = await response.json();
            
            if (data.status === 'accepted') {
                displayMessage('success', `[${statusCode}] Kayıt başarılı! ${data.message}`);
                form.reset(); 
                loadRecentRegistrations();
            } else if (data.status === 'denied') {
                const deniedMessage = `[${statusCode}] Geçersiz numara: ${data.message}`;
                displayMessage('error', deniedMessage);
            } else {
                displayMessage('error', `[${statusCode}] Hata: ${data.message}`);
            }

        } catch (error) {
            console.error('API isteği başarısız:', error);
            displayMessage('error', 'Sunucuya bağlanılamadı. Lütfen API servisini kontrol edin.');
        }
    });

    const loadRecentRegistrations = async () => {
        try {
            const response = await fetch(REGISTRATIONS_URL);
            if (!response.ok) {
                console.error('Kayıtlar API isteği başarısız:', response.statusText);
                tableBody.innerHTML = '<tr><td colspan="4">Kayıtlar yüklenemedi.</td></tr>';
                return;
            }
            
            const { data } = await response.json();
            
            tableBody.innerHTML = ''; 
             data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            const latestThree = data.slice(0, 3); 
            latestThree.forEach(reg => { 
                const row = tableBody.insertRow(); 
                const date = new Date(reg.created_at).toLocaleString('tr-TR'); 
                
                row.insertCell().textContent = reg.name;
                row.insertCell().textContent = reg.email;
                row.insertCell().textContent = reg.phone;
                row.insertCell().textContent = date;
            });

        } catch (error) {
            console.error('Kayıtlar yüklenirken hata (Genel Ağ Hatası):', error);
            tableBody.innerHTML = '<tr><td colspan="4">API erişiminde genel hata oluştu.</td></tr>';
        }
    };

    loadRecentRegistrations();
    setInterval(loadRecentRegistrations, 10000); 
});