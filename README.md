# Teke Tek Backend

Teke Tek Backend, Teke Tek Android münazara uygulamasının Node.js tabanlı backend servisidir.

Kullanıcıların yapay zekâ ile münazara başlatmasına, devam ettirmesine ve sonunda tartışma özetini almasına olanak sağlar.

BTK AI Hackathon 2025 kapsamında geliştirilmiştir.

## Özellikler
- Münazara başlatma (konu belirleyerek oturum oluşturma)
- AI ile karşı argüman üretme (Gemini API kullanarak)
- Münazara sonunda güçlü ve zayıf yönleri analiz eden özet raporu
- Express.js tabanlı REST API
- Bellek tabanlı oturum yönetimi

## Teknolojiler
- Node.js
- Express.js
- Axios
- uuid
- dotenv
- CORS
- Google Gemini API

## API Uç Noktaları

### 1. Münazara Başlat
**POST** `/debate/start`

Konu belirterek yeni bir münazara başlatılır. Başarılı istek sonrası benzersiz bir `debateId` döner.

---

### 2. Sıradaki Argüman
**POST** `/debate/next`

Mevcut münazaraya kullanıcıdan argüman alınır ve yapay zekâdan karşı argüman üretilir.

---

### 3. Münazara Sonlandır ve Özet Al
**POST** `/debate/end`

Münazara sonlandırılır, tüm konuşma geçmişine göre güçlü ve zayıf yönler ile genel özet döndürülür.

---

## Çalışma Mantığı
- Her münazara için benzersiz `debateId` üretilir.
- Konuşma geçmişi RAM üzerinde tutulur.
- AI cevapları Google Gemini API üzerinden alınır.
- JSON formatında özetleme ve güçlü/zayıf yön analizi yapılır.

## Lisans
Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

## İletişim
- LinkedIn: [linkedin.com/in/cusufcan](https://linkedin.com/in/cusufcan)
- E-posta: [yusufcanmercan.info@gmail.com](mailto:yusufcanmercan.info@gmail.com)
