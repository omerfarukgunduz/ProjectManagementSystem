// API Base URL - Read from meta tag or use default
const getApiBaseUrl = () => {
    // Try to read from meta tag
    const metaTag = document.querySelector('meta[name="api-base-url"]');
    if (metaTag) {
        return metaTag.getAttribute('content');
    }
    // Default fallback
    return 'https://localhost:7241/api';
};

const API_BASE_URL = getApiBaseUrl();

// API Helper Functions
const api = {
    // Get token from localStorage
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Set token to localStorage
    setToken: (token) => {
        localStorage.setItem('token', token);
    },

    // Remove token from localStorage
    removeToken: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get user from localStorage
    getUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Set user to localStorage
    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Get headers with authorization
    getHeaders: (includeAuth = true) => {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth) {
            const token = api.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    },

    // Make API request
    request: async (endpoint, options = {}) => {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = api.getHeaders(options.includeAuth !== false);

        const config = {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        };

        console.log('API Request:', {
            url: url,
            method: config.method || 'GET',
            headers: headers,
            hasBody: !!config.body
        });

        try {
            const response = await fetch(url, config);
            
            // Handle NoContent (204) responses (like DELETE)
            if (response.status === 204) {
                return {};
            }
            
            // Try to parse JSON, but handle empty responses
            let data = null;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const text = await response.text();
                if (text) {
                    data = JSON.parse(text);
                }
            }

            if (!response.ok) {
                // Translate common error messages to Turkish
                let errorMessage = (data && data.message) || `HTTP ${response.status}: ${response.statusText}` || 'Bir hata oluştu';
                
                if (errorMessage.includes('Invalid email or password') || 
                    errorMessage.includes('email or password')) {
                    errorMessage = 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.';
                } else if (errorMessage.includes('Email already exists')) {
                    errorMessage = 'Bu e-posta adresi zaten kullanılıyor.';
                } else if (errorMessage.includes('required')) {
                    errorMessage = 'Lütfen tüm alanları doldurun.';
                } else if (errorMessage.includes('User not found')) {
                    errorMessage = 'Kullanıcı bulunamadı.';
                } else if (errorMessage.includes('Unauthorized') || response.status === 401) {
                    errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
                } else if (errorMessage.includes('Forbidden') || response.status === 403) {
                    errorMessage = 'Bu işlem için yetkiniz yok.';
                } else if (errorMessage.includes('Not Found') || response.status === 404) {
                    errorMessage = 'İstenen kaynak bulunamadı.';
                }
                
                const error = new Error(errorMessage);
                error.status = response.status;
                error.response = data;
                throw error;
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', {
                url: url,
                error: error,
                message: error.message,
                stack: error.stack
            });

            // Handle network errors (CORS, connection refused, etc.)
            if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
                throw new Error('API sunucusuna bağlanılamıyor. Lütfen API projesinin çalıştığından emin olun. (CORS hatası olabilir)');
            }

            // If it's already an Error object with message, keep it
            if (error instanceof Error) {
                throw error;
            }
            // Otherwise create a new error
            throw new Error(error.message || 'Bir hata oluştu');
        }
    },

    // Auth endpoints
    auth: {
        login: async (email, password) => {
            return api.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                includeAuth: false
            });
        },
        register: async (username, email, password) => {
            return api.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, email, password }),
                includeAuth: false
            });
        },
        logout: async () => {
            return api.request('/auth/logout', {
                method: 'POST'
            });
        }
    },

    // User endpoints
    users: {
        getAll: async () => api.request('/users'),
        getById: async (id) => api.request(`/users/${id}`),
        create: async (userData) => api.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        }),
        update: async (id, userData) => api.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        }),
        delete: async (id) => api.request(`/users/${id}`, {
            method: 'DELETE'
        }),
        changePassword: async (currentPassword, newPassword) => api.request('/users/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        }),
        getRoles: async () => api.request('/users/roles')
    },

    // Project endpoints
    projects: {
        getAll: async () => api.request('/projects'),
        getById: async (id) => api.request(`/projects/${id}`),
        create: async (projectData) => api.request('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData)
        }),
        update: async (id, projectData) => api.request(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(projectData)
        }),
        delete: async (id) => api.request(`/projects/${id}`, {
            method: 'DELETE'
        })
    },

    // Task endpoints
    tasks: {
        getAll: async (projectId = null) => {
            const endpoint = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
            return api.request(endpoint);
        },
        getById: async (id) => api.request(`/tasks/${id}`),
        create: async (taskData) => api.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        }),
        update: async (id, taskData) => api.request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(taskData)
        }),
        delete: async (id) => api.request(`/tasks/${id}`, {
            method: 'DELETE'
        })
    },

    // Dashboard endpoint
    dashboard: {
        getStats: async () => api.request('/dashboard')
    }
};
