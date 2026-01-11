// Dashboard Page Script

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard page loaded');
    
    // Check authentication
    const token = api.getToken();
    const user = api.getUser();
    
    console.log('Auth check:', { hasToken: !!token, hasUser: !!user });
    
    if (!token || !user) {
        console.warn('No token or user found, redirecting to login');
        window.location.href = '/Auth/Login';
        return;
    }

    // Initialize navigation
    try {
        initNavigation();
    } catch (error) {
        console.error('Navigation init error:', error);
    }

    // Load dashboard stats
    loadDashboardStats();
});

async function loadDashboardStats() {
    const statsContainer = document.getElementById('statsContainer');
    
    if (!statsContainer) {
        console.error('Stats container not found!');
        return;
    }
    
    console.log('Loading dashboard stats...');
    
    try {
        const stats = await api.dashboard.getStats();
        console.log('Dashboard stats received:', stats);
        displayStats(stats);
    } catch (error) {
        console.error('Dashboard error:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            response: error.response
        });
        
        let errorMessage = 'Dashboard verileri yüklenirken bir hata oluştu.';
        
        if (error.status === 401) {
            errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
            setTimeout(() => {
                window.location.href = '/Auth/Login';
            }, 2000);
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        statsContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> 
                    ${errorMessage}
                    <br><small class="text-muted">Hata: ${error.message || 'Bilinmeyen hata'}</small>
                </div>
            </div>
        `;
    }
}

function displayStats(stats) {
    const statsContainer = document.getElementById('statsContainer');
    const user = api.getUser();
    const isAdmin = user && user.role === 'Admin';

    const statsCards = [
        {
            title: 'Toplam Proje',
            value: stats.totalProjects || 0,
            icon: 'bi-folder',
            color: 'primary',
            gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
        },
        {
            title: 'Toplam Görev',
            value: stats.totalTasks || 0,
            icon: 'bi-list-check',
            color: 'info',
            gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
        },
        {
            title: 'Tamamlanan İşler',
            value: stats.completedTasks || 0,
            icon: 'bi-check-circle',
            color: 'success',
            gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
        },
        {
            title: 'Bekleyen İşler',
            value: stats.pendingTasks || 0,
            icon: 'bi-clock',
            color: 'warning',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
        }
    ];

    // Add Total Users card for Admin
    if (isAdmin) {
        statsCards.push({
            title: 'Toplam Kullanıcı',
            value: stats.totalUsers || 0,
            icon: 'bi-people',
            color: 'secondary',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'
        });
    }

    // Calculate column class based on number of cards
    const colSize = isAdmin ? Math.floor(12 / statsCards.length) : 3;
    const finalColClass = isAdmin ? `col-xl-${colSize}` : 'col-xl-3';

    statsContainer.innerHTML = statsCards.map(card => `
        <div class="col-12 col-md-6 col-lg-4 ${finalColClass}">
            <div class="stat-card">
                <div class="stat-card-icon" style="background: ${card.gradient}">
                    <i class="bi ${card.icon}"></i>
                </div>
                <div class="stat-card-content">
                    <h3 class="stat-card-value">${card.value}</h3>
                    <p class="stat-card-title">${card.title}</p>
                </div>
            </div>
        </div>
    `).join('');

    // Add animation
    const cards = statsContainer.querySelectorAll('.stat-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
    });
}
