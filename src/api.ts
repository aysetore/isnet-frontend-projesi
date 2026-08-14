export const apiFetch = (endpoint: string, options: RequestInit = {}) => {
    // Tarayıcı hafızasından giriş anahtarını (token) alıyoruz
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    return fetch(`https://localhost:7181/api${endpoint}`, {
        ...options,
        headers,
    });
};