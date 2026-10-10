# Telefon Numarası Doğrulama Servisi (Mikroservis Mimarisi)

Bu proje, **Node.js (Express)** tabanlı bir backend API, **MySQL** veritabanı ve **HTML/CSS/JavaScript** tabanlı bir frontend içeren, **Docker ile containerize edilmiş mikroservis mimarisi** örneğidir.

Kullanıcıdan alınan **6 haneli telefon numarasının** belirli kurallara göre doğrulanmasını sağlar ve geçerli olan kayıtları veritabanına kaydeder.

---

## Projenin Amacı

Bu projenin amacı, **mikroservis mimarisi** yaklaşımı kullanılarak geliştirilen bir web uygulamasında, kullanıcıdan alınan **6 haneli telefon numaralarının belirli matematiksel ve mantıksal kurallara göre doğrulanmasını** sağlamak ve geçerli verileri güvenli bir şekilde veritabanında saklamaktır.

Proje kapsamında, backend, frontend ve veritabanı katmanlarının birbirinden bağımsız servisler olarak tasarlanması hedeflenmiş; bu servislerin **Docker ve Docker Compose** yardımıyla birlikte çalışabilirliği sağlanmıştır.

---

## Projenin Kapsamı

Bu proje aşağıdaki bileşenleri ve işlevleri kapsamaktadır:

- Telefon numarası doğrulama işlemlerinin RESTful API üzerinden gerçekleştirilmesi
- Doğrulama kurallarına uyan kullanıcı bilgilerinin MySQL veritabanına kaydedilmesi
- Kullanıcıların web arayüzü üzerinden kayıt oluşturabilmesi
- Kayıtların listelenmesi ve son kayıtların görüntülenmesi
- Backend, frontend ve veritabanı servislerinin Docker container’ları içerisinde çalıştırılması
- Servisler arası iletişimin Docker ağı üzerinden sağlanması

---

## Proje Mimarisi

- **Backend API:** Telefon numarası doğrulama ve kayıt işlemleri
- **Veritabanı:** MySQL
- **Frontend:** Kullanıcı arayüzü
- **Containerization:** Docker & Docker Compose

---

## Proje Dosya Yapısı

```text
project-root/
├── API/
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
├── DB/
│   └── init.sql
├── FRONTEND/
│   ├── Dockerfile
│   ├── index.html
│   ├── app.js
│   └── style.css
├── docker-compose.yml
└── README.md
```

---

## Kullanılan Teknolojiler

- Node.js (Express)
- MySQL 8.0
- HTML5 / CSS3 / JavaScript (Vanilla)
- Docker & Docker Compose
- Nginx (Frontend servisi için)

---

## Kurulum ve Çalıştırma

### Gereksinimler

- Docker
- Docker Compose

### Uygulamayı Başlatma

Proje ana dizininde aşağıdaki komutu çalıştırın:

```bash
docker-compose up --build
```

Servisler ayağa kalktıktan sonra:

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3001
- **MySQL:** localhost:3306

---

## Telefon Numarası Doğrulama Kuralları

Girilen telefon numarası **6 haneli** olmalı ve aşağıdaki şartları sağlamalıdır:

1. En az bir rakam **0’dan farklı** olmalı
2. İlk üç hanenin toplamı = Son üç hanenin toplamı
3. Tek pozisyondaki rakamların toplamı = Çift pozisyondaki rakamların toplamı

Bu koşullar sağlanmazsa kayıt reddedilir.

---

## API Endpoint’leri

### Telefon Numarası Doğrulama

```http
POST /api/phone/validate
```

**Request Body:**
```json
{
  "number": "123321"
}
```

---

### Kayıt Oluşturma

```http
POST /api/registration
```

**Request Body:**
```json
{
  "name": "Melis Katıkcı",
  "email": "melis@example.com",
  "phone": "123321"
}
```

---

### Toplam Kayıt Sayısı

```http
GET /api/kayitliSayisi
```

---

### Son 3 Kayıt

```http
GET /api/registrations
```

---

## Frontend Özellikleri

- Kullanıcı kayıt formu
- Anlık doğrulama mesajları
- Son 3 kaydın otomatik listelenmesi
- 10 saniyede bir otomatik güncelleme

---

## Veritabanına Erişim ve Kontrol

MySQL veritabanı, Docker container’ı içerisinde çalışmaktadır. Veritabanına erişim tarayıcı üzerinden değil; Docker terminali veya bir veritabanı istemcisi (MySQL Workbench, DBeaver vb.) aracılığıyla sağlanır.

### Docker Üzerinden MySQL’e Bağlanma

Terminal veya Git Bash üzerinde aşağıdaki komut çalıştırılır:

```bash
docker exec -it mysql_db mysql -u user -p
```

Şifre istendiğinde aşağıdaki parola girilir:

```text
password
```

Bağlantı başarılı olduğunda MySQL monitor ekranı açılır.

---

### Veritabanını Seçme

```sql
USE registration_db;
```

---

### Tabloları Listeleme

```sql
SHOW TABLES;
```

Beklenen çıktı:
```text
registrations
```

---

### Kayıtları Görüntüleme

```sql
SELECT * FROM registrations;
```

Bu sorgu ile frontend üzerinden oluşturulan kayıtların veritabanına başarıyla eklendiği doğrulanır.

---

### Tablo Yapısını İnceleme

```sql
DESCRIBE registrations;
```

---

### MySQL’den Çıkış

```sql
EXIT;
```

veya

```sql
\\q
```

---

## Veritabanı Yapısı

```sql
CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone CHAR(6) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
---

## Sonuç

Bu proje ile birlikte, mikroservis mimarisine uygun bir web uygulaması geliştirilmiş ve modern yazılım geliştirme araçları kullanılarak container tabanlı bir yapı oluşturulmuştur. Telefon numarası doğrulama senaryosu üzerinden; backend API geliştirme, veritabanı işlemleri, frontend entegrasyonu ve Docker kullanımı uygulamalı olarak gösterilmiştir.

Geliştirilen sistem, ölçeklenebilir ve modüler bir yapıya sahip olup, farklı doğrulama kuralları veya ek servisler eklenerek genişletilebilir niteliktedir.

---

## Geliştirici

- **Ad Soyad:** Melis Katıkcı
- **Proje Türü:** Mikroservis Uygulaması
- **Amaç:** Docker ve mikroservis mimarisini telefon numarası doğrulama servisinde uygulamalı olarak göstermek