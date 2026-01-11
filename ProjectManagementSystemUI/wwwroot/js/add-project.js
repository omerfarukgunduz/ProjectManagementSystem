// Add Project Page Script

let users = [];

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

    // Load users first
    loadUsers();

    // Setup form submission
    setupFormSubmission();
});

// Load users from API
async function loadUsers() {
    try {
        users = await api.users.getAll();
        console.log('Loaded users:', users);
        populateUserSelect();
    } catch (error) {
        console.error('Users error:', error);
        showError('Kullanıcılar yüklenirken bir hata oluştu.');
    }
}

// Populate user dropdown
function populateUserSelect() {
    const userSelect = document.getElementById('userIds');
    
    if (!userSelect) {
        console.error('User select element not found');
        return;
    }
    
    userSelect.innerHTML = '';
    
    if (!users || users.length === 0) {
        userSelect.innerHTML = '<option value="">Kullanıcı bulunamadı</option>';
        return;
    }
    
    users.forEach(user => {
        const userId = user.id !== undefined ? user.id : (user.Id !== undefined ? user.Id : null);
        const username = user.username || user.Username || '';
        const email = user.email || user.Email || '';
        
        if (userId !== null) {
            const option = document.createElement('option');
            option.value = userId;
            option.textContent = `${username} (${email})`;
            userSelect.appendChild(option);
        }
    });
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('addProjectForm');
    
    if (!form) {
        console.error('Form not found');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Hide previous error
        hideError();

        // Get form elements
        const nameInput = document.getElementById('name');
        const descriptionInput = document.getElementById('description');
        const userIdsSelect = document.getElementById('userIds');

        // Get values
        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const selectedUserIds = Array.from(userIdsSelect.selectedOptions).map(option => parseInt(option.value, 10));

        // Validation
        if (!name) {
            showError('Proje adı gereklidir.');
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
            // Prepare data according to API DTO: CreateProjectDto
            // API expects: Name, Description, UserIds (PascalCase)
            const projectData = {
                Name: name,
                Description: description || '',
                UserIds: selectedUserIds.length > 0 ? selectedUserIds : null
            };

            console.log('Creating project with data:', projectData);
            
            // Call API: POST /api/projects
            await api.projects.create(projectData);

            // Show success message
            showAlert('Proje başarıyla eklendi!', 'success');

            // Redirect to projects page after 1 second
            setTimeout(() => {
                window.location.href = '/Projects';
            }, 1000);

        } catch (error) {
            console.error('Add project error:', error);
            
            // Show error message
            let errorMsg = 'Proje eklenirken bir hata oluştu.';
            
            if (error.message) {
                errorMsg = error.message;
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
