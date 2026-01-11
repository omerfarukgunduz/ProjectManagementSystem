// Forgot Password Page Script

document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (isAuthenticated()) {
        window.location.href = '/Dashboard';
        return;
    }

    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Handle form submission
    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Hide messages
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
        successMessage.style.display = 'none';
        successMessage.textContent = '';

        // Get form values
        const email = document.getElementById('email').value.trim();

        // Validate
        if (!email) {
            showError('Lütfen e-posta adresinizi girin.');
            return;
        }

        // Disable submit button
        const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;
        submitBtn.disabled = true;
        btnText.textContent = 'Gönderiliyor...';

        try {
            const result = await api.auth.forgotPassword(email);
            
            // Show success message
            showSuccess(result.message || 'Eğer bu e-posta adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderilmiştir.');
            
            // Clear form
            document.getElementById('email').value = '';
            
        } catch (error) {
            console.error('Forgot password error:', error);
            showError(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
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
