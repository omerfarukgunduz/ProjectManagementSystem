// Login Page Script

document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (isAuthenticated()) {
        window.location.href = '/Dashboard';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');

    // Toggle password visibility
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

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Hide error message
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';

        // Get form values
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Validate
        if (!email || !password) {
            showError('Lütfen tüm alanları doldurun.');
            return;
        }

        // Disable submit button
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnIcon = submitBtn.querySelector('.btn-icon');
        const originalText = btnText.textContent;
        const originalIcon = btnIcon.innerHTML;
        
        submitBtn.disabled = true;
        btnText.textContent = 'Giriş yapılıyor...';
        btnIcon.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div>';

        try {
            // Log API URL for debugging
            const apiBaseUrl = document.querySelector('meta[name="api-base-url"]')?.getAttribute('content') || 'https://localhost:7241/api';
            console.log('API Base URL:', apiBaseUrl);
            console.log('Login attempt for:', email);
            
            // Call login API
            const response = await api.auth.login(email, password);

            // Save token and user info
            api.setToken(response.token);
            api.setUser({
                id: response.userId,
                username: response.username,
                role: response.role
            });

            // Show success message
            showAlert('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/Dashboard';
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            
            // Show specific error message
            let errorMsg = 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.';
            
            if (error.message) {
                errorMsg = error.message;
            } else if (error instanceof Error) {
                errorMsg = error.message;
            }
            
            // Ensure Turkish message for common errors
            if (errorMsg.toLowerCase().includes('invalid') || 
                errorMsg.toLowerCase().includes('email') || 
                errorMsg.toLowerCase().includes('password')) {
                errorMsg = 'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.';
            }
            
            showError(errorMsg);
            
            // Add shake animation to form
            loginForm.classList.add('shake');
            setTimeout(() => {
                loginForm.classList.remove('shake');
            }, 500);
            
            // Re-enable submit button
            submitBtn.disabled = false;
            btnText.textContent = originalText;
            btnIcon.innerHTML = originalIcon;
        }
    });

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'flex';
        
        // Add error class to inputs
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        emailInput.classList.add('error');
        passwordInput.classList.add('error');
        
        // Remove error class after user starts typing
        emailInput.addEventListener('input', function() {
            this.classList.remove('error');
        });
        passwordInput.addEventListener('input', function() {
            this.classList.remove('error');
        });
        
        // Scroll to error message smoothly
        setTimeout(() => {
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
});
