// Users Page Script

let users = [];
let currentDeleteId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and admin access
    const token = api.getToken();
    const user = api.getUser();
    
    if (!token || !user) {
        window.location.href = '/Auth/Login';
        return;
    }
    
    if (user.role !== 'Admin') {
        window.location.href = '/Dashboard';
        return;
    }

    // Initialize navigation
    try {
        initNavigation();
    } catch (error) {
        console.error('Navigation init error:', error);
    }

    // Load users
    loadUsers();

    // Setup delete button event listener
    setupDeleteButton();
});

async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    
    if (!tbody) {
        console.error('Users table body not found');
        return;
    }
    
    try {
        users = await api.users.getAll();
        console.log('Loaded users:', users);
        if (users.length > 0) {
            console.log('First user structure:', users[0]);
            console.log('First user ID:', users[0].id, 'or', users[0].Id);
        }
        displayUsers(users);
    } catch (error) {
        console.error('Users error:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i> 
                        Kullanıcılar yüklenirken bir hata oluştu.
                    </div>
                </td>
            </tr>
        `;
    }
}

function displayUsers(usersList) {
    const tbody = document.getElementById('usersTableBody');
    
    if (!tbody) return;
    
    if (usersList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                    <p class="mb-0">Henüz kullanıcı bulunmamaktadır.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = usersList.map(user => {
        // Get user ID - handle both camelCase and PascalCase
        const userId = user.id !== undefined ? user.id : (user.Id !== undefined ? user.Id : null);
        
        // Debug: Log if ID is missing
        if (userId === null || userId === undefined) {
            console.error('User without ID:', user);
            return ''; // Skip users without ID
        }
        
        const username = user.username || user.Username || '';
        const email = user.email || user.Email || '';
        const roleName = user.roleName || user.RoleName || '';
        const createdAt = user.createdAt || user.CreatedAt;
        
        // Escape username for onclick attribute
        const escapedUsername = username.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        return `
        <tr>
            <td>${userId}</td>
            <td><strong>${escapeHtml(username)}</strong></td>
            <td>${escapeHtml(email)}</td>
            <td>
                <span class="badge bg-${roleName === 'Admin' ? 'primary' : 'secondary'}">
                    ${escapeHtml(roleName)}
                </span>
            </td>
            <td>${formatDate(createdAt)}</td>
            <td class="text-end">
                <a href="/Users/Edit/${userId}" class="btn btn-sm btn-outline-primary me-2" title="Düzenle">
                    <i class="bi bi-pencil"></i>
                </a>
                <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${userId}, '${escapedUsername}')" title="Sil">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `;
    }).join('');
}

function confirmDelete(userId, username) {
    // Convert to number if it's a string
    const numericId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    
    if (!numericId || isNaN(numericId) || numericId <= 0) {
        console.error('Delete: Invalid user ID:', userId);
        showAlert('Geçersiz kullanıcı ID\'si.', 'danger');
        return;
    }
    
    console.log('Confirm delete - User ID:', numericId, 'Username:', username);
    
    currentDeleteId = numericId;
    const deleteUserNameEl = document.getElementById('deleteUserName');
    if (deleteUserNameEl) {
        deleteUserNameEl.textContent = username || 'Bu kullanıcı';
    }
    
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        const modal = new bootstrap.Modal(deleteModal);
        modal.show();
    } else {
        console.error('Delete modal not found');
    }
}

function setupDeleteButton() {
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (!confirmDeleteBtn) {
        console.error('Confirm delete button not found');
        return;
    }

    // Remove existing event listeners by cloning
    const newBtn = confirmDeleteBtn.cloneNode(true);
    confirmDeleteBtn.parentNode.replaceChild(newBtn, confirmDeleteBtn);

    // Add event listener
    newBtn.addEventListener('click', async function() {
        const deleteId = currentDeleteId;
        
        if (!deleteId || isNaN(deleteId) || deleteId <= 0) {
            console.error('Delete: Invalid user ID:', deleteId);
            showAlert('Geçersiz kullanıcı ID\'si.', 'danger');
            return;
        }
        
        const btn = this;
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Siliniyor...';
        
        try {
            console.log('Deleting user with ID:', deleteId, 'Type:', typeof deleteId);
            
            // API call - endpoint: DELETE /api/users/{id}
            await api.users.delete(deleteId);
            
            console.log('User deleted successfully');
            showAlert('Kullanıcı başarıyla silindi.', 'success');
            
            // Close modal
            const deleteModal = document.getElementById('deleteModal');
            if (deleteModal) {
                const modalInstance = bootstrap.Modal.getInstance(deleteModal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
            
            // Reload users list
            await loadUsers();
            currentDeleteId = null;
            
        } catch (error) {
            console.error('Delete user error:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                status: error.status
            });
            
            let errorMessage = 'Kullanıcı silinirken bir hata oluştu.';
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.response && error.response.message) {
                errorMessage = error.response.message;
            } else if (error.status === 404) {
                errorMessage = 'Kullanıcı bulunamadı.';
            } else if (error.status === 403) {
                errorMessage = 'Bu işlem için yetkiniz yok.';
            } else if (error.status === 401) {
                errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
            }
            
            showAlert(errorMessage, 'danger');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
