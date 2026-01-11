// Add User Page Script

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

    // Load roles first
    loadRoles();

    // Setup password toggle
    setupPasswordToggle();

    // Setup form submission
    setupFormSubmission();
});

// Load roles from API
async function loadRoles() {
    try {
        roles = await api.users.getRoles();
        console.log('Loaded roles:', roles);
        populateRoleSelect();
    } catch (error) {
        console.error('Roles error:', error);
        showError('Roller yüklenirken bir hata oluştu.');
    }
}

// Populate role dropdown
function populateRoleSelect() {
    const roleSelect = document.getElementById('roleId');
    
    if (!roleSelect) {
        console.error('Role select element not found');
        return;
    }
    
    roleSelect.innerHTML = '<option value="">Rol seçin...</option>';
    
    if (!roles || roles.length === 0) {
        roleSelect.innerHTML = '<option value="">Rol bulunamadı</option>';
        return;
    }
    
    // Sort roles: Admin first, then User, then others
    const sortedRoles = [...roles].sort((a, b) => {
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();
        
        if (aName === 'admin') return -1;
        if (bName === 'admin') return 1;
        if (aName === 'user') return -1;
        if (bName === 'user') return 1;
        return aName.localeCompare(bName);
    });
    
    sortedRoles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.id;
        option.textContent = role.name;
        roleSelect.appendChild(option);
    });
}

// Setup password visibility toggle
function setupPasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');

    if (togglePassword && passwordInput && eyeIcon) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            if (type === 'password') {
                eyeIcon.classList.remove('bi-eye-slash');
                eyeIcon.classList.add('bi-eye');
            } else {
                eyeIcon.classList.remove('bi-eye');
                eyeIcon.classList.add('bi-eye-slash');
            }
        });
    }
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('addUserForm');
    
    if (!form) {
        console.error('Form not found');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Hide previous error
        hideError();

        // Get form elements
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const roleIdSelect = document.getElementById('roleId');

        // Get values
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const roleIdValue = roleIdSelect.value;

        // Validation
        if (!username) {
            showError('Kullanıcı adı gereklidir.');
            return;
        }

        if (!email) {
            showError('E-posta adresi gereklidir.');
            return;
        }

        if (!email.includes('@')) {
            showError('Geçerli bir e-posta adresi girin.');
            return;
        }

        if (!password) {
            showError('Şifre gereklidir.');
            return;
        }

        if (password.length < 6) {
            showError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (!roleIdValue) {
            showError('Rol seçimi gereklidir.');
            return;
        }

        const roleId = parseInt(roleIdValue, 10);
        
        if (isNaN(roleId) || roleId <= 0) {
            showError('Geçerli bir rol seçin.');
            return;
        }

        // Disable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Ekleniyor...';
        }

        try {
            // Prepare data according to API DTO: CreateUserDto
            // API expects: Username, Email, Password, RoleId (PascalCase)
            const userData = {
                Username: username,
                Email: email,
                Password: password,
                RoleId: roleId
            };

            console.log('Creating user with data:', userData);
            
            // Call API: POST /api/users
            await api.users.create(userData);

            // Show success message
            showAlert('Kullanıcı başarıyla eklendi!', 'success');

            // Redirect to users page after 1 second
            setTimeout(() => {
                window.location.href = '/Users';
            }, 1000);

        } catch (error) {
            console.error('Add user error:', error);
            
            // Show error message
            let errorMsg = 'Kullanıcı eklenirken bir hata oluştu.';
            
            if (error.message) {
                if (error.message.includes('Email already exists') || 
                    error.message.includes('email') ||
                    error.message.includes('zaten kullanılıyor')) {
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

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('formError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        console.error('Error div not found:', message);
        alert(message);
    }
}

// Hide error message
function hideError() {
    const errorDiv = document.getElementById('formError');
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
}
