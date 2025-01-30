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

### 🔄 Canlı Video İzleme

SitWatch API'si, yeni yüklenen videoları otomatik olarak tespit etmek için iki farklı yöntem sunar:

#### Event Listener API (Önerilen)
```javascript
// Yeni videoları dinlemeye başla
const listener = client.on('newVideo', (video) => {
    console.log('Yeni video yüklendi!', {
        id: video.id,
        başlık: video.title,
        yükleyen: video.uploader.username,
        yüklenme_tarihi: video.upload_date
    });
}, { 
    interval: 5000 // 5 saniyede bir kontrol (varsayılan)
});

// Dinleyici durumunu kontrol et
if (listener.isActive()) {
    console.log('Dinleyici aktif');
}

// Kontrol aralığını öğren
console.log('Kontrol aralığı:', listener.getInterval(), 'ms');

// Dinlemeyi durdur
listener.stop();
```

#### Klasik API (Eski)
```javascript
// Yeni videoları izlemeye başla
const observerId = client.observeNewVideos((video) => {
    console.log('Yeni video yüklendi:', video.title);
}, { 
    interval: 10000 // 10 saniyede bir kontrol
});

// İzlemeyi durdur
client.stopObserving(observerId);

// Tüm izlemeleri durdur
client.stopAllObserving();
```

#### Video Nesnesi Yapısı
```javascript
{
    id: number,           // Video ID
    title: string,        // Video başlığı
    description: string,  // Video açıklaması
    thumbnail_url: string,// Küçük resim URL'i
    video_url: string,    // Video URL'i
    upload_date: string,  // Yüklenme tarihi
    views: number,        // İzlenme sayısı
    uploader: {
        username: string,    // Yükleyen kullanıcı adı
        profile_image: string// Profil resmi
    }
}
```

#### Örnek Kullanım

```javascript
const SitWatch = require('sitwatch-npm');
const client = new SitWatch();

// Video işleme fonksiyonu
const handleNewVideo = (video) => {
    console.log('\n🎥 Yeni Video!');
    console.log('━━━━━━━━━━━━━━━━');
    console.log('📝 Başlık:', video.title);
    console.log('👤 Yükleyen:', video.uploader.username);
    console.log('⏰ Tarih:', video.upload_date);
    console.log('🔗 URL:', `https://sitwatch.net/watch/${video.id}`);
};

async function watchNewVideos() {
    try {
        // Giriş yap (isteğe bağlı)
        await client.login('username', 'password');

        // Yeni videoları dinle (10 saniyede bir)
        const listener = client.on('newVideo', handleNewVideo, {
            interval: 10000
        });

        // Ctrl+C ile durdurma
        process.on('SIGINT', () => {
            listener.stop();
            process.exit(0);
        });

    } catch (error) {
        console.error('Hata:', error.message);
    }
}

watchNewVideos();
```

#### Özellikler

- **Otomatik Tespit**: Yeni videolar otomatik olarak tespit edilir
- **Özelleştirilebilir Aralık**: Kontrol sıklığı ayarlanabilir (varsayılan: 5 saniye)
- **Temiz Kapatma**: Dinleyici düzgün bir şekilde kapatılabilir
- **Durum Kontrolü**: Dinleyicinin aktif olup olmadığı kontrol edilebilir
- **Hata Yönetimi**: Hatalar otomatik olarak yakalanır ve raporlanır

#### Öneriler

1. Çok kısa kontrol aralıkları kullanmaktan kaçının (5 saniyeden az)
2. Her zaman try-catch bloğu kullanın
3. Programı kapatırken dinleyiciyi durdurun
4. Event Listener API'sini tercih edin (yeni versiyon)
5. Uzun süreli kullanımlarda bellek kullanımını takip edin

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
- **Base URL**: https://api.sitwatch.net/api

### API URL Kişiselleştirme

```javascript
// İstemciyi özel bir API URL'i ile oluşturma
const client = new SitWatch({
    baseURL: 'https://api.sitwatch.net/api'
});

// API URL'ini sonradan değiştirme
client.setBaseURL('https://api.sitwatch.net/api');

// Mevcut API URL'ini alma
const baseURL = client.getBaseURL();
```

## 👨‍💻 Geliştirici Bilgileri

<div align="center">
  <h3>Physic</h3>
  <p>SitWatch Geliştiricisi</p>
  
  [![GitHub](https://img.shields.io/github/followers/iphysicc?label=GitHub&style=social)](https://github.com/iphysicc)
  [![Version](https://img.shields.io/npm/v/sitwatch-npm.svg)](https://www.npmjs.com/package/sitwatch-npm)
  [![Downloads](https://img.shields.io/npm/dt/sitwatch-npm.svg)](https://www.npmjs.com/package/sitwatch-npm)
</div>

### 📊 Proje İstatistikleri
- **Versiyon**: 1.0.1
- **Node.js Gereksinimi**: >= 22
- **Ana Bağımlılık**: axios
- **Lisans**: [MIT](https://github.com/iphysicc/sitwatch-npm/blob/main/LICENSE)
- **Paket Boyutu**: Minimal (~100KB)

### 🤝 Katkıda Bulunma
1. Bu depoyu fork edin
2. Yeni bir özellik dalı oluşturun (`git checkout -b yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik: XYZ'`)
4. Dalınıza push yapın (`git push origin yeni-ozellik`)
5. Bir Pull Request oluşturun

### 📝 Sürüm Geçmişi
- **v1.0.1** - Güncel versiyon
  - Token yönetimi iyileştirmeleri
  - Hata yönetimi geliştirmeleri
  - Dokümantasyon güncellemeleri

- **v1.0.0** - İlk sürüm
  - Temel API özellikleri
  - JWT tabanlı kimlik doğrulama
  - Kapsamlı API desteği

### 📞 İletişim
- GitHub: [@iphysicc](https://github.com/iphysicc)
- SitWatch: [@Physic](https://sitwatch.net/profile/Physic)

### ⭐ Projeyi Destekle
Eğer bu proje işinize yaradıysa, GitHub üzerinde yıldız vermeyi unutmayın!

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://sitwatch.net/profile/Physic">Physic</a></sub>
</div>

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
- Sürüm notları için: https://github.com/iphysicc/sitwatch-npm/

## 📄 Lisans

[MIT](https://github.com/iphysicc/sitwatch-npm/blob/main/LICENSE)

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