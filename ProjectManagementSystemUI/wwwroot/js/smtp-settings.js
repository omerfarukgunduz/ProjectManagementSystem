// SMTP Settings Page JavaScript

// Check if user is admin
if (!requireAdmin()) {
    // Redirect if not admin
    window.location.href = '/Dashboard';
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    setupPasswordToggle();
    loadSettings();
    setupFormSubmission();
});

// Setup password toggle
function setupPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('smtpPassword');
    const toggleIcon = document.getElementById('togglePasswordIcon');

    if (toggleBtn && passwordInput && toggleIcon) {
        toggleBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon
            if (type === 'password') {
                toggleIcon.classList.remove('bi-eye-slash');
                toggleIcon.classList.add('bi-eye');
            } else {
                toggleIcon.classList.remove('bi-eye');
                toggleIcon.classList.add('bi-eye-slash');
            }
        });
    }
}

// Load SMTP settings
async function loadSettings() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const settingsForm = document.getElementById('settingsForm');
    const noSettingsMessage = document.getElementById('noSettingsMessage');

    try {
        const settings = await api.smtpSettings.get();
        
        if (settings) {
            // Populate form
            document.getElementById('smtpSettingsId').value = settings.id || '';
            document.getElementById('smtpHost').value = settings.host || '';
            document.getElementById('smtpPort').value = settings.port || 587;
            document.getElementById('smtpUsername').value = settings.username || '';
            document.getElementById('smtpPassword').value = settings.password || '';
            document.getElementById('smtpFromEmail').value = settings.fromEmail || '';
            document.getElementById('smtpFromName').value = settings.fromName || '';
            document.getElementById('smtpEnableSsl').checked = settings.enableSsl !== false;
            document.getElementById('smtpIsActive').checked = settings.isActive !== false;

            loadingIndicator.style.display = 'none';
            settingsForm.style.display = 'block';
            noSettingsMessage.style.display = 'none';
        } else {
            loadingIndicator.style.display = 'none';
            settingsForm.style.display = 'block';
            noSettingsMessage.style.display = 'none';
        }
    } catch (error) {
        console.error('Load settings error:', error);
        
        if (error.status === 404) {
            // No settings found - show form for new entry
            loadingIndicator.style.display = 'none';
            settingsForm.style.display = 'block';
            noSettingsMessage.style.display = 'none';
        } else {
            showError('Ayarlar yüklenirken bir hata oluştu: ' + error.message);
            loadingIndicator.style.display = 'none';
            settingsForm.style.display = 'block';
        }
    }
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('smtpSettingsForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Kaydediliyor...';

        hideMessages();

        try {
            const settingsData = {
                id: document.getElementById('smtpSettingsId').value || null,
                host: document.getElementById('smtpHost').value.trim(),
                port: parseInt(document.getElementById('smtpPort').value),
                username: document.getElementById('smtpUsername').value.trim(),
                password: document.getElementById('smtpPassword').value,
                enableSsl: document.getElementById('smtpEnableSsl').checked,
                fromEmail: document.getElementById('smtpFromEmail').value.trim(),
                fromName: document.getElementById('smtpFromName').value.trim(),
                isActive: document.getElementById('smtpIsActive').checked
            };

            // Validation
            if (!settingsData.host || !settingsData.username || !settingsData.password || 
                !settingsData.fromEmail || !settingsData.fromName) {
                throw new Error('Lütfen tüm zorunlu alanları doldurun.');
            }

            if (settingsData.port < 1 || settingsData.port > 65535) {
                throw new Error('Port numarası 1-65535 arasında olmalıdır.');
            }

            const result = await api.smtpSettings.createOrUpdate(settingsData);
            
            // Update ID if it's a new record
            if (result && result.id) {
                document.getElementById('smtpSettingsId').value = result.id;
            }

            showSuccess('SMTP ayarları başarıyla kaydedildi!');
            
            // Reload settings to get updated data
            setTimeout(() => {
                loadSettings();
            }, 1000);

        } catch (error) {
            console.error('Save settings error:', error);
            showError('Ayarlar kaydedilirken bir hata oluştu: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('formError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Scroll to error
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Show success message
function showSuccess(message) {
    const successDiv = document.getElementById('formSuccess');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        
        // Scroll to success
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Hide after 5 seconds
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 5000);
    }
}

// Hide messages
function hideMessages() {
    const errorDiv = document.getElementById('formError');
    const successDiv = document.getElementById('formSuccess');
    
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
}
