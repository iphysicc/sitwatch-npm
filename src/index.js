const axios = require('axios');

/**
 * SitWatch API istemcisi
 * @class
 */
class SitWatch {
    /**
     * SitWatch API istemcisini oluşturur
     * @param {Object} config - Yapılandırma seçenekleri
     * @param {string} [config.baseURL='https://api.sitwatch.net/api'] - API'nin temel URL'i
     * @param {string} [config.token] - Önceden kaydedilmiş token
     * @param {Function} [config.onTokenChange] - Token değiştiğinde çağrılacak fonksiyon
     */
    constructor(config = {}) {
        this.baseURL = config.baseURL || 'https://api.sitwatch.net/api';
        this.onTokenChange = config.onTokenChange;
        
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status >= 200 && status < 300;
            }
        });
        
        // Eğer başlangıç token'ı verildiyse ayarla
        this.token = null;
        if (config.token) {
            this.setToken(config.token);
        }
    }

    /**
     * API'nin temel URL'ini değiştirir
     * @param {string} url - Yeni API URL'i
     * @example
     * client.setBaseURL('https://api.sitwatch.net/api');
     */
    setBaseURL(url) {
        this.baseURL = url;
        this.client.defaults.baseURL = url;
    }

    /**
     * Mevcut API temel URL'ini döndürür
     * @returns {string} Mevcut API URL'i
     * @example
     * const baseURL = client.getBaseURL();
     */
    getBaseURL() {
        return this.baseURL;
    }

    /**
     * API istekleri için kullanılacak token'ı ayarlar
     * @param {string} token - JWT token
     */
    setToken(token) {
        this.token = token;
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Token değişikliğini bildir
        if (this.onTokenChange) {
            this.onTokenChange(token);
        }
    }

    /**
     * Mevcut token'ı döndürür
     * @returns {string|null} Mevcut token veya null
     */
    getToken() {
        return this.token;
    }

    /**
     * Token'ın geçerli olup olmadığını kontrol eder
     * @returns {boolean} Token'ın geçerli olup olmadığı
     */
    hasValidToken() {
        return !!this.token;
    }

    /**
     * Token'ı temizler
     */
    clearToken() {
        this.token = null;
        delete this.client.defaults.headers.common['Authorization'];
        
        // Token değişikliğini bildir
        if (this.onTokenChange) {
            this.onTokenChange(null);
        }
    }

    /**
     * Kullanıcı girişi yapar
     * @param {string} username - Kullanıcı adı
     * @param {string} password - Kullanıcı şifresi
     * @returns {Promise<Object>} Giriş yanıtı
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const response = await client.login('username', 'password');
     */
    async login(username, password) {
        try {
            const response = await this.client.post('/auth/login', {
                username,
                password
            });
            
            if (response.data.success && response.data.tokens.access_token) {
                this.setToken(response.data.tokens.access_token);
            }
            
            return response.data;
        } catch (error) {
            if (error.response) {
                throw {
                    status: error.response.status,
                    message: error.response.data.message || 'Sunucu hatası',
                    data: error.response.data
                };
            } else if (error.request) {
                throw {
                    status: 0,
                    message: 'Sunucuya erişilemiyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.',
                    error: error.message
                };
            } else {
                throw {
                    status: 0,
                    message: 'İstek oluşturulamadı',
                    error: error.message
                };
            }
        }
    }

    /**
     * Kullanıcı oturumunu sonlandırır
     * @returns {Promise<Object>} Çıkış yanıtı
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const response = await client.logout();
     */
    async logout() {
        try {
            const response = await this.client.post('/auth/logout');
            this.clearToken();
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Yeni kullanıcı kaydı oluşturur
     * @param {string} username - Kullanıcı adı
     * @param {string} password - Kullanıcı şifresi
     * @param {string} email - E-posta adresi
     * @param {string} country - Ülke
     * @returns {Promise<Object>} Kayıt yanıtı
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const response = await client.register('username', 'password', 'email@example.com', 'Turkey');
     */
    async register(username, password, email, country) {
        try {
            const response = await this.client.post('/auth/register', {
                username,
                password,
                email,
                country
            });
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Hata durumlarını standart bir formata dönüştürür
     * @private
     * @param {Error} error - Axios hata nesnesi
     * @returns {Object} Standartlaştırılmış hata nesnesi
     */
    _handleError(error) {
        if (error.response) {
            return {
                status: error.response.status,
                data: error.response.data,
                message: error.response.data.message || 'An error occurred'
            };
        }
        return {
            status: 500,
            message: error.message || 'Network error occurred'
        };
    }

    /**
     * Belirli bir video hakkında detaylı bilgi alır
     * @param {number} videoId - Video ID
     * @returns {Promise<Object>} Video bilgisi
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const response = await client.getVideoInfo(123);
     * // Başarılı yanıt:
     * {
     *   success: true,
     *   video: {
     *     id: number,
     *     title: string,
     *     description: string,
     *     thumbnail_url: string,
     *     video_url: string,
     *     upload_date: string,
     *     views: number,
     *     likes: number,
     *     is_approved: boolean,
     *     uploader: {
     *       id: number,
     *       username: string,
     *       profile_image: string,
     *       subscriber_count: number,
     *       subscribed: boolean
     *     }
     *   },
     *   actions: {
     *     liked: boolean,
     *     disliked: boolean
     *   }
     * }
     */
    async getVideoInfo(videoId) {
        try {
            const response = await this.client.get(`/videos/${videoId}/info`);
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * En son yüklenen videoları alır
     * @returns {Promise<Array>} Video listesi
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const videos = await client.getLatestVideos();
     */
    async getLatestVideos() {
        try {
            const response = await this.client.get('/videos/latest');
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Trend olan videoları alır
     * @returns {Promise<Array>} Video listesi
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const videos = await client.getTrendingVideos();
     */
    async getTrendingVideos() {
        try {
            const response = await this.client.get('/videos/trending');
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * En popüler 50 videoyu alır
     * @returns {Promise<Array>} Video listesi
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const videos = await client.getTop50Videos();
     */
    async getTop50Videos() {
        try {
            const response = await this.client.get('/videos/trending/top50');
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Bir videoyu raporlar
     * @param {number} videoId - Video ID
     * @param {string} reason - Raporlama nedeni
     * @returns {Promise<Object>} Raporlama sonucu
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const response = await client.reportVideo(123, 'Uygunsuz içerik');
     */
    async reportVideo(videoId, reason) {
        try {
            const formData = new FormData();
            formData.append('reason', reason);
            
            const response = await this.client.post(`/videos/${videoId}/report`, formData);
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Video araması yapar
     * @param {Object} options - Arama seçenekleri
     * @param {string} [options.query] - Arama sorgusu
     * @param {string} [options.type] - Arama tipi ('video' | 'channel' | 'trending')
     * @param {string} [options.sortBy] - Sıralama ('relevance' | 'views' | 'date' | 'likes' | 'trending')
     * @param {number} [options.page] - Sayfa numarası
     * @param {number} [options.perPage] - Sayfa başına sonuç
     * @param {boolean} [options.filterApproved] - Sadece onaylı videolar
     * @param {number} [options.minViews] - Minimum görüntülenme
     * @param {number} [options.maxDuration] - Maksimum süre
     * @param {string} [options.uploadDateAfter] - Bu tarihten sonra
     * @param {string} [options.uploadDateBefore] - Bu tarihten önce
     * @returns {Promise<Object>} Arama sonuçları
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const results = await client.searchVideos({
     *   query: 'test',
     *   type: 'video',
     *   sortBy: 'views',
     *   page: 1,
     *   perPage: 10
     * });
     */
    async searchVideos(options = {}) {
        try {
            const params = {
                query: options.query,
                type: options.type,
                sort_by: options.sortBy,
                page: options.page,
                per_page: options.perPage,
                filter_approved: options.filterApproved,
                min_views: options.minViews,
                max_duration: options.maxDuration,
                upload_date_after: options.uploadDateAfter,
                upload_date_before: options.uploadDateBefore
            };

            // Undefined değerleri temizle
            Object.keys(params).forEach(key => {
                if (params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await this.client.get('/videos/search', { params });
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Kullanıcı profil bilgilerini alır
     * @param {string} username - Kullanıcı adı
     * @returns {Promise<Object>} Kullanıcı profil bilgileri
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const profile = await client.getUserProfile('username');
     * // Başarılı yanıt:
     * {
     *   id: number,
     *   username: string,
     *   profile_image: string,
     *   banner: string,
     *   background_image: string,
     *   description: string,
     *   country: string,
     *   role: string,
     *   is_admin: boolean,
     *   is_founder: boolean,
     *   is_co_founder: boolean,
     *   subscriber_count: number,
     *   ban_reason: string,
     *   last_active: string,
     *   song: {
     *     id: number,
     *     title: string,
     *     url: string,
     *     start_time: number,
     *     is_muted: boolean
     *   },
     *   statistic: {
     *     video_count: number,
     *     view_count: number
     *   },
     *   quote: string | {
     *     quote: string,
     *     author: string
     *   }
     * }
     */
    async getUserProfile(username) {
        try {
            const response = await this.client.get(`/users/username/${username}`);
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Kullanıcının videolarını alır
     * @param {number} userId - Kullanıcı ID
     * @returns {Promise<Object>} Kullanıcının videoları
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const videos = await client.getUserVideos(123);
     */
    async getUserVideos(userId) {
        try {
            const response = await this.client.get(`/users/${userId}/videos`);
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * En çok abonesi olan kullanıcıları listeler
     * @returns {Promise<Object>} En çok abonesi olan kullanıcılar listesi
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const topUsers = await client.getTopSubscribers();
     */
    async getTopSubscribers() {
        try {
            const response = await this.client.get('/users/top/subscribers');
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Önerilen kullanıcıları alır
     * @returns {Promise<Object>} Önerilen kullanıcılar listesi
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const recommendedUsers = await client.getRecommendedUsers();
     */
    async getRecommendedUsers() {
        try {
            const response = await this.client.get('/users/recommend');
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Aktif kullanıcıları alır
     * @returns {Promise<Object>} Aktif kullanıcılar listesi
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const activeUsers = await client.getActiveUsers();
     */
    async getActiveUsers() {
        try {
            const response = await this.client.get('/users/active');
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Kullanıcının topluluk gönderilerini alır
     * @param {number} userId - Kullanıcı ID
     * @param {Object} options - Sayfalama seçenekleri
     * @param {number} [options.page=1] - Sayfa numarası
     * @param {number} [options.perPage=10] - Sayfa başına gönderi sayısı
     * @returns {Promise<Object>} Kullanıcının gönderileri
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const posts = await client.getUserPosts(123, { page: 1, perPage: 10 });
     */
    async getUserPosts(userId, options = {}) {
        try {
            const params = {
                page: options.page || 1,
                per_page: options.perPage || 10
            };
            const response = await this.client.get(`/users/${userId}/community/paged`, { params });
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Giriş yapmış kullanıcının aboneliklerini alır
     * @returns {Promise<Array>} Abonelik listesi
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const subscriptions = await client.getMySubscriptions();
     */
    async getMySubscriptions() {
        try {
            const response = await this.client.get('/me/subscriptions');
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Sayfalanmış topluluk gönderilerini alır
     * @param {Object} [options] - Sayfalama seçenekleri
     * @param {number} [options.page=1] - Sayfa numarası
     * @param {number} [options.perPage=10] - Sayfa başına gönderi sayısı
     * @returns {Promise<Object>} Topluluk gönderileri
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const posts = await client.getCommunityPosts({ page: 1, perPage: 10 });
     * // Başarılı yanıt:
     * {
     *   success: boolean,
     *   posts: [
     *     {
     *       id: number,
     *       content: string,
     *       created_at: string,
     *       comments_count: number,
     *       image: string,
     *       uploader: {
     *         username: string,
     *         profile_image: string,
     *         subscriber_count: number
     *       },
     *       actions: {
     *         likes: number,
     *         midlikes: number,
     *         dislikes: number
     *       }
     *     }
     *   ],
     *   total: number,
     *   pages: number,
     *   has_next: boolean,
     *   has_prev: boolean
     * }
     */
    async getCommunityPosts(options = {}) {
        try {
            const params = {
                page: options.page || 1,
                per_page: options.perPage || 10
            };
            const response = await this.client.get('/community/posts/paged', { params });
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Video yorumlarını alır
     * @param {number} videoId - Video ID
     * @returns {Promise<Array>} Yorum listesi
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const comments = await client.getVideoComments(123);
     * // Başarılı yanıt:
     * [
     *   {
     *     comment_id: number,
     *     content: string,
     *     username: string,
     *     user_avatar: string,
     *     created_at: string,
     *     user_id: number,
     *     parent_id: number,
     *     edited_at: string,
     *     is_edited: boolean
     *   }
     * ]
     */
    async getVideoComments(videoId) {
        try {
            const response = await this.client.get(`/videos/${videoId}/comments`);
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Kullanıcının video izleme geçmişini alır
     * @returns {Promise<Array>} İzleme geçmişi
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const history = await client.getWatchHistory();
     * // Başarılı yanıt:
     * [
     *   {
     *     video_id: string,
     *     title: string,
     *     thumbnail: string,
     *     viewed_at: string
     *   }
     * ]
     */
    async getWatchHistory() {
        try {
            const response = await this.client.get('/library/history');
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * İçerik üreticinin video listesini alır
     * @returns {Promise<Object>} Stüdyo videoları
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const studioVideos = await client.getStudioVideos();
     * // Başarılı yanıt:
     * {
     *   videos: [
     *     {
     *       id: number,
     *       title: string,
     *       description: string,
     *       thumbnail_url: string,
     *       upload_date: string,
     *       views: number,
     *       is_approved: boolean,
     *       is_visible: boolean,
     *       duration: number,
     *       filename: string,
     *       delete_reason: string,
     *       actions: {
     *         likes: number,
     *         dislikes: number,
     *         midlikes: number
     *       }
     *     }
     *   ]
     * }
     */
    async getStudioVideos() {
        try {
            const response = await this.client.get('/studio/videos');
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Kullanıcı bildirimlerini alır
     * @returns {Promise<Array>} Bildirim listesi
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * const notifications = await client.getNotifications();
     * // Başarılı yanıt:
     * [
     *   {
     *     id: number,
     *     message: string,
     *     type: string,
     *     time_ago: string,
     *     sender_image: string,
     *     sender_username: string,
     *     read: boolean
     *   }
     * ]
     */
    async getNotifications() {
        try {
            const response = await this.client.get('/notifications');
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Yeni videoları gözlemler (Eski metod - geriye dönük uyumluluk için)
     * @deprecated Lütfen bunun yerine on('newVideo', callback, options) kullanın
     * @param {Function} callback - Yeni video bulunduğunda çağrılacak fonksiyon
     * @param {Object} [options] - Gözlem seçenekleri
     * @param {number} [options.interval=5000] - Kontrol aralığı (milisaniye)
     * @returns {number} Gözlem ID'si (durdurma için kullanılır)
     * @throws {Object} Hata durumunda detaylı hata bilgisi
     * @example
     * // Yeni videoları izlemeye başla
     * const observerId = client.observeNewVideos((video) => {
     *   console.log('Yeni video:', video.title);
     * }, { interval: 10000 }); // 10 saniyede bir kontrol et
     * 
     * // İzlemeyi durdur
     * client.stopObserving(observerId);
     */
    observeNewVideos(callback, options = {}) {
        console.warn('Warning: observeNewVideos metodu eski versiyondur. Lütfen on("newVideo", callback, options) kullanın.');
        
        if (!callback || typeof callback !== 'function') {
            throw new Error('Callback fonksiyonu gerekli');
        }

        // Son kontrol edilen video ID'sini sakla
        let lastVideoId = null;
        
        // Varsayılan interval 5 saniye
        const interval = options.interval || 5000;

        // Kontrol fonksiyonu
        const checkNewVideos = async () => {
            try {
                const response = await this.getLatestVideos();
                
                if (response && response.length > 0) {
                    const latestVideo = response[0];

                    // Eğer bu yeni bir video ise
                    if (lastVideoId !== null && latestVideo.id !== lastVideoId) {
                        // Yeni videoları bul (son kontrolden sonra eklenenler)
                        const newVideos = response.filter(video => video.id > lastVideoId);
                        
                        // Yeni videoları callback ile bildir (en yeniden eskiye)
                        for (const video of newVideos.reverse()) {
                            callback(video);
                        }
                    }

                    // Son video ID'sini güncelle
                    lastVideoId = latestVideo.id;
                }
            } catch (error) {
                console.error('Video kontrolü sırasında hata:', error);
            }
        };

        // İlk kontrolü hemen yap
        checkNewVideos();

        // Periyodik kontrolleri başlat
        const intervalId = setInterval(checkNewVideos, interval);

        // Interval ID'sini kaydet
        this._observers = this._observers || new Map();
        this._observers.set(intervalId, { type: 'newVideos', callback });

        return intervalId;
    }

    /**
     * Video gözlemini durdurur
     * @deprecated Lütfen bunun yerine listener.stop() kullanın
     * @param {number} observerId - Gözlem ID'si
     * @example
     * client.stopObserving(observerId);
     */
    stopObserving(observerId) {
        console.warn('Warning: stopObserving metodu eski versiyondur. Lütfen listener.stop() kullanın.');
        if (this._observers && this._observers.has(observerId)) {
            clearInterval(observerId);
            this._observers.delete(observerId);
        }
    }

    /**
     * Tüm video gözlemlerini durdurur
     * @deprecated Lütfen bunun yerine listener.stop() kullanın
     * @example
     * client.stopAllObserving();
     */
    stopAllObserving() {
        console.warn('Warning: stopAllObserving metodu eski versiyondur. Lütfen listener.stop() kullanın.');
        if (this._observers) {
            for (const [observerId] of this._observers) {
                this.stopObserving(observerId);
            }
        }
    }

    /**
     * Yeni videolar için sürekli dinleyici
     * @param {string} event - Dinlenecek olay ('newVideo')
     * @param {Function} callback - Olay gerçekleştiğinde çağrılacak fonksiyon
     * @param {Object} [options] - Dinleyici seçenekleri
     * @param {number} [options.interval=5000] - Kontrol aralığı (milisaniye)
     * @returns {Object} Dinleyici kontrolcüsü
     * @example
     * // Yeni videoları sürekli dinle
     * const listener = client.on('newVideo', (video) => {
     *   console.log('Yeni video:', video.title);
     * }, { interval: 10000 });
     * 
     * // Dinlemeyi durdur
     * listener.stop();
     */
    on(event, callback, options = {}) {
        if (event !== 'newVideo') {
            throw new Error('Geçersiz event tipi. Sadece "newVideo" destekleniyor.');
        }

        if (!callback || typeof callback !== 'function') {
            throw new Error('Callback fonksiyonu gerekli');
        }

        // Son kontrol edilen video ID'sini sakla
        let lastVideoId = null;
        
        // Varsayılan interval 5 saniye
        const interval = options.interval || 5000;

        // Kontrol fonksiyonu
        const checkNewVideos = async () => {
            try {
                const response = await this.getLatestVideos();
                
                if (response && response.length > 0) {
                    const latestVideo = response[0];

                    // Eğer bu yeni bir video ise
                    if (lastVideoId !== null && latestVideo.id !== lastVideoId) {
                        // Yeni videoları bul (son kontrolden sonra eklenenler)
                        const newVideos = response.filter(video => video.id > lastVideoId);
                        
                        // Yeni videoları callback ile bildir (en yeniden eskiye)
                        for (const video of newVideos.reverse()) {
                            callback(video);
                        }
                    }

                    // Son video ID'sini güncelle
                    lastVideoId = latestVideo.id;
                }
            } catch (error) {
                console.error('Video kontrolü sırasında hata:', error);
            }
        };

        // İlk kontrolü hemen yap
        checkNewVideos();

        // Periyodik kontrolleri başlat
        const intervalId = setInterval(checkNewVideos, interval);

        // Interval ID'sini kaydet
        this._listeners = this._listeners || new Map();
        this._listeners.set(intervalId, { type: event, callback });

        // Kontrol objesi döndür
        return {
            stop: () => {
                clearInterval(intervalId);
                this._listeners.delete(intervalId);
            },
            isActive: () => this._listeners.has(intervalId),
            getInterval: () => interval
        };
    }
}

module.exports = SitWatch; 