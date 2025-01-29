# SitWatch NPM Modülü

SitWatch API'si için resmi Node.js istemci kütüphanesi. Bu modül, SitWatch platformunun tüm API özelliklerine kolay erişim sağlar.

## 📦 Kurulum

```bash
npm install sitwatch-npm
```

## 🚀 Hızlı Başlangıç

```javascript
const SitWatch = require('sitwatch-npm');

// İstemciyi oluştur
const client = new SitWatch();

// Async/await ile kullanım
async function main() {
    try {
        // Giriş yap
        const login = await client.login('username', 'password');
        console.log('Giriş başarılı:', login.user.username);

        // Video bilgisi al
        const video = await client.getVideoInfo(123);
        console.log('Video başlığı:', video.title);
    } catch (error) {
        console.error('Hata:', error.message);
    }
}

main();
```

## 📋 Özellikler

### 🔐 Kimlik Doğrulama İşlemleri

#### Giriş (Login)
```javascript
const response = await client.login('username', 'password');
```
- Kullanıcı girişi yapar
- Başarılı girişte otomatik olarak token ayarlanır
- Dönüş değeri:
```javascript
{
  success: true,
  user: {
    id: number,
    username: string,
    email: string,
    profile_image: string,
    is_admin: boolean
  },
  tokens: {
    access_token: string,
    refresh_token: string
  }
}
```

#### Kayıt (Register)
```javascript
const response = await client.register(
    'username',
    'password',
    'email@example.com',
    'Turkey'
);
```

#### Çıkış (Logout)
```javascript
const response = await client.logout();
```

### 🎥 Video İşlemleri

#### Video Bilgisi
```javascript
const video = await client.getVideoInfo(videoId);
```

#### Video Listeleme
```javascript
// En son videolar
const latest = await client.getLatestVideos();

// Trend videolar
const trending = await client.getTrendingVideos();

// Top 50 video
const top50 = await client.getTop50Videos();
```

#### Video Arama
```javascript
const results = await client.searchVideos({
    query: 'arama kelimesi',
    type: 'video',
    sortBy: 'views',
    page: 1,
    perPage: 10,
    filterApproved: true,
    minViews: 1000,
    maxDuration: 3600,
    uploadDateAfter: '2024-01-01',
    uploadDateBefore: '2024-12-31'
});
```

#### Video Yorumları
```javascript
const comments = await client.getVideoComments(videoId);
```

#### İzleme Geçmişi
```javascript
const history = await client.getWatchHistory();
```

### 👥 Kullanıcı İşlemleri

#### Profil Bilgileri
```javascript
const profile = await client.getUserProfile('username');
```

#### Kullanıcı Videoları
```javascript
const videos = await client.getUserVideos(userId);
```

#### Kullanıcı Listeleme
```javascript
// En çok abonesi olanlar
const topUsers = await client.getTopSubscribers();

// Önerilen kullanıcılar
const recommended = await client.getRecommendedUsers();

// Aktif kullanıcılar
const active = await client.getActiveUsers();
```

### 🌐 Topluluk Özellikleri

#### Topluluk Gönderileri
```javascript
const posts = await client.getCommunityPosts({
    page: 1,
    perPage: 10
});
```

#### Kullanıcı Gönderileri
```javascript
const userPosts = await client.getUserPosts(userId, {
    page: 1,
    perPage: 10
});
```

### 🎬 İçerik Üretici Araçları

#### Stüdyo Videoları
```javascript
const studioVideos = await client.getStudioVideos();
```

### 🔔 Bildirimler

```javascript
const notifications = await client.getNotifications();
```

## ⚠️ Hata Yönetimi

```javascript
try {
    const response = await client.someMethod();
} catch (error) {
    console.error({
        status: error.status,      // HTTP durum kodu
        message: error.message,    // Hata mesajı
        details: error.data        // Detaylı hata bilgisi
    });
}
```

## 🛠️ Özellikler

- JWT token tabanlı kimlik doğrulama
- Otomatik token yönetimi
- Detaylı hata yönetimi
- Tüm yanıtlar için tip tanımları
- Kapsamlı API desteği
- Sayfalama desteği
- FormData desteği
- Timeout yönetimi
- Özelleştirilebilir base URL

## 📚 Teknik Detaylar

- **HTTP İstemcisi**: axios
- **Timeout**: 10 saniye
- **Content-Type**: application/json
- **Kimlik Doğrulama**: Bearer token
- **Base URL**: https://sitwatch.net/api

## 👨‍💻 Geliştirici Notları

### Token Yönetimi
- Login sonrası otomatik token ayarı
- Logout ile token temizleme
- Authorization header yönetimi

### Hata İşleme
- HTTP durum kodları
- API hata mesajları
- Network hataları
- Timeout yönetimi

### Sayfalama

- Varsayılan sayfa boyutu: 10
- Sayfa numarası ve boyutu özelleştirme
- Toplam sayfa ve öğe sayısı bilgisi

### Yanıt Formatları
- Tüm metodlar için detaylı JSDoc
- Örnek kullanımlar
- Tip tanımları

## 🔒 Güvenlik

- SSL/TLS şifrelemesi
- JWT token güvenliği
- API rate limiting desteği
- Hassas veri yönetimi

## 💡 Öneriler

1. Token'ı güvenli şekilde saklayın
2. Hata yönetimini her zaman kullanın
3. Büyük listelerde sayfalama kullanın
4. API limitlerini göz önünde bulundurun
5. Dökümantasyonu takip edin

## 🆘 Destek

- GitHub Issues üzerinden destek alabilirsiniz
- API dökümantasyonu için: https://sitwatch.net/docs/api
- Sürüm notları için: https://github.com/iphysicc/sitwatch-npm/releases

## 📄 Lisans

ISC

---

Bu modül, SitWatch platformunun tüm özelliklerine programmatik erişim sağlar ve modern web standartlarını takip eder.

## 🔑 Token Yönetimi

### Token'ı Kaydetme
```javascript
const SitWatch = require('sitwatch-npm');

// Token değiştiğinde çağrılacak fonksiyon
const handleTokenChange = (token) => {
    if (token) {
        // Token'ı güvenli bir şekilde sakla (örn: localStorage, secure cookie, vb.)
        localStorage.setItem('sitwatch_token', token);
    } else {
        // Token'ı temizle
        localStorage.removeItem('sitwatch_token');
    }
};

// İstemciyi oluştur ve kaydedilmiş token'ı kullan
const client = new SitWatch({
    token: localStorage.getItem('sitwatch_token'), // Kaydedilmiş token'ı kullan
    onTokenChange: handleTokenChange // Token değişikliklerini takip et
});
```

### Token Kontrolü
```javascript
// Token'ın varlığını kontrol et
if (client.hasValidToken()) {
    console.log('Token mevcut:', client.getToken());
} else {
    console.log('Token bulunamadı');
}
```

### Token'ı Manuel Yönetme
```javascript
// Token'ı manuel olarak ayarla
client.setToken('your_jwt_token');

// Mevcut token'ı al
const token = client.getToken();

// Token'ı temizle
client.clearToken();
``` 