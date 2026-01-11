// Edit User Page Script

let roles = [];

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

    // Get user ID from ViewBag (set by controller)
    const userIdInput = document.getElementById('userId');
    if (!userIdInput || !userIdInput.value) {
        showError('Kullanıcı ID bulunamadı.');
        setTimeout(() => {
            window.location.href = '/Users';
        }, 2000);
        return;
    }

    const userId = parseInt(userIdInput.value, 10);
    
    if (isNaN(userId) || userId <= 0) {
        showError('Geçersiz kullanıcı ID.');
        setTimeout(() => {
            window.location.href = '/Users';
        }, 2000);
        return;
    }

    console.log('Edit user - User ID from ViewBag:', userId);

    // Load roles first, then user data
    loadRoles().then(() => {
        // Load user data
        loadUserData(userId);

        // Setup form submission
        setupFormSubmission(userId);
    });
});

async function loadRoles() {
    try {
        roles = await api.users.getRoles();
        
        // Debug: Log roles to see actual IDs
        console.log('Loaded roles:', roles);
        
        // Find Admin and User roles by name
        const adminRole = roles.find(r => r.name === 'Admin' || r.name === 'admin');
        const userRole = roles.find(r => r.name === 'User' || r.name === 'user');
        
        // Log found roles
        console.log('Admin role:', adminRole);
        console.log('User role:', userRole);
        
        populateRoleSelect();
    } catch (error) {
        console.error('Roles error:', error);
        showError('Roller yüklenirken bir hata oluştu.');
    }
}

function populateRoleSelect() {
    const roleSelect = document.getElementById('roleId');
    if (!roleSelect) return;
    
    roleSelect.innerHTML = '<option value="">Rol seçin...</option>';
    
    if (roles.length === 0) {
        roleSelect.innerHTML = '<option value="">Rol bulunamadı</option>';
        return;
    }
    
    // Sort roles: Admin first, then User, then others
    const sortedRoles = [...roles].sort((a, b) => {
        if (a.name === 'Admin' || a.name === 'admin') return -1;
        if (b.name === 'Admin' || b.name === 'admin') return 1;
        if (a.name === 'User' || a.name === 'user') return -1;
        if (b.name === 'User' || b.name === 'user') return 1;
        return a.name.localeCompare(b.name);
    });
    
    sortedRoles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.id;
        option.textContent = role.name;
        roleSelect.appendChild(option);
    });
}

async function loadUserData(userId) {
    try {
        console.log('Loading user data for ID:', userId);
        const user = await api.users.getById(userId);
        
        if (!user) {
            showError('Kullanıcı bulunamadı.');
            setTimeout(() => {
                window.location.href = '/Users';
            }, 2000);
            return;
        }

        console.log('Loaded user data:', user);

        // Get user ID - handle both camelCase and PascalCase
        const userIdValue = user.id !== undefined ? user.id : (user.Id !== undefined ? user.Id : userId);
        const username = user.username || user.Username || '';
        const email = user.email || user.Email || '';

        // Fill form with user data
        document.getElementById('userId').value = userIdValue;
        document.getElementById('username').value = username;
        document.getElementById('email').value = email;
        
        // Set role after roles are loaded - handle both string and number IDs
        const userRoleId = user.roleId !== undefined ? user.roleId : (user.RoleId !== undefined ? user.RoleId : null);
        if (userRoleId !== null) {
            // Convert to string for select value (HTML select values are always strings)
            const roleIdString = String(userRoleId);
            
            if (roles.length > 0) {
                document.getElementById('roleId').value = roleIdString;
            } else {
                // Wait a bit for roles to load
                setTimeout(() => {
                    document.getElementById('roleId').value = roleIdString;
                }, 100);
            }
        }

    } catch (error) {
        console.error('Load user error:', error);
        showError('Kullanıcı bilgileri yüklenirken bir hata oluştu.');
        setTimeout(() => {
            window.location.href = '/Users';
        }, 2000);
    }
}

function setupFormSubmission(userId) {
    const form = document.getElementById('editUserForm');
    const errorDiv = document.getElementById('formError');

    if (!form) {
        console.error('Form not found');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Hide error message
        if (errorDiv) {
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
        }

        // Get form values
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const roleIdValue = document.getElementById('roleId').value;
        const roleId = parseInt(roleIdValue, 10);

        // Validation
        if (!username || !email || !roleId || isNaN(roleId)) {
            showError('Lütfen tüm alanları doldurun.');
            return;
        }

        if (!email.includes('@')) {
            showError('Geçerli bir e-posta adresi girin.');
            return;
        }

        // Disable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Güncelleniyor...';
        }

        try {
            // Ensure userId is a number
            const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
            
            if (isNaN(numericUserId) || numericUserId <= 0) {
                showError('Geçersiz kullanıcı ID.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
                return;
            }

            console.log('Updating user with ID:', numericUserId);
            console.log('Update data:', { username, email, roleId });

            // Call update user API
            // API expects: Username, Email, RoleId (PascalCase)
            await api.users.update(numericUserId, {
                Username: username,
                Email: email,
                RoleId: roleId
            });

            // Show success message
            showAlert('Kullanıcı başarıyla güncellendi!', 'success');

            // Redirect to users page after 1 second
            setTimeout(() => {
                window.location.href = '/Users';
            }, 1000);

        } catch (error) {
            console.error('Update user error:', error);
            
            // Show error message
            let errorMsg = 'Kullanıcı güncellenirken bir hata oluştu.';
            
            if (error.message) {
                if (error.message.includes('Email already exists') || error.message.includes('email')) {
                    errorMsg = 'Bu e-posta adresi zaten kullanılıyor.';
                } else {
                    errorMsg = error.message;
                }
            }
            
            showError(errorMsg);
            
            // Re-enable submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
    });
}

function showError(message) {
    const errorDiv = document.getElementById('formError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Scroll to error
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        console.error('Error div not found:', message);
        alert(message);
    }
}
