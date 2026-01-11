// Reset Password Page Script

document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (isAuthenticated()) {
        window.location.href = '/Dashboard';
        return;
    }

    // Check if token and email are present
    const token = document.getElementById('token').value;
    const email = document.getElementById('email').value;

    if (!token || !email) {
        showError('Geçersiz veya eksik şifre sıfırlama bağlantısı. Lütfen yeni bir şifre sıfırlama talebinde bulunun.');
        document.getElementById('resetPasswordForm').style.display = 'none';
        return;
    }

    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('newPassword');
    const eyeIcon = document.getElementById('eyeIcon');

    // Toggle password visibility
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

    // Handle form submission
    resetPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Hide messages
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
        successMessage.style.display = 'none';
        successMessage.textContent = '';

        // Get form values
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate
        if (!newPassword || !confirmPassword) {
            showError('Lütfen tüm alanları doldurun.');
            return;
        }

        if (newPassword.length < 6) {
            showError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (newPassword !== confirmPassword) {
            showError('Şifreler eşleşmiyor. Lütfen tekrar kontrol edin.');
            return;
        }

        // Disable submit button
        const submitBtn = resetPasswordForm.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;
        submitBtn.disabled = true;
        btnText.textContent = 'Sıfırlanıyor...';

        try {
            const result = await api.auth.resetPassword(token, email, newPassword);
            
            // Show success message
            showSuccess(result.message || 'Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.');
            
            // Hide form and show success
            resetPasswordForm.style.display = 'none';
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                window.location.href = '/Auth/Login';
            }, 3000);
            
        } catch (error) {
            console.error('Reset password error:', error);
            showError(error.message || 'Şifre sıfırlanırken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            submitBtn.disabled = false;
            btnText.textContent = originalText;
        }
    });
});

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }
}
