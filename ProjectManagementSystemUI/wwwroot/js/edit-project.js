// Edit Project Page Script

let users = [];
let project = null;

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

    // Get project ID from ViewBag (set by controller)
    const projectIdInput = document.getElementById('projectId');
    if (!projectIdInput || !projectIdInput.value) {
        showError('Proje ID bulunamadı.');
        setTimeout(() => {
            window.location.href = '/Projects';
        }, 2000);
        return;
    }

    const projectId = parseInt(projectIdInput.value, 10);
    
    if (isNaN(projectId) || projectId <= 0) {
        showError('Geçersiz proje ID.');
        setTimeout(() => {
            window.location.href = '/Projects';
        }, 2000);
        return;
    }

    console.log('Edit project - Project ID:', projectId);

    // Load users first, then project data
    loadUsers().then(() => {
        // Load project data
        loadProjectData(projectId);

        // Setup form submission
        setupFormSubmission(projectId);
    });
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

// Load project data from API
async function loadProjectData(projectId) {
    try {
        console.log('Loading project data for ID:', projectId);
        project = await api.projects.getById(projectId);
        
        if (!project) {
            showError('Proje bulunamadı.');
            setTimeout(() => {
                window.location.href = '/Projects';
            }, 2000);
            return;
        }

        console.log('Loaded project data:', project);

        // Fill form with project data
        document.getElementById('name').value = project.name || project.Name || '';
        document.getElementById('description').value = project.description || project.Description || '';
        
        // Set selected users
        const userIds = project.userIds || project.UserIds || [];
        const userNames = project.userNames || project.UserNames || [];
        
        console.log('Project user IDs:', userIds);
        console.log('Project user names:', userNames);
        
        if (userIds.length > 0 && users.length > 0) {
            const userSelect = document.getElementById('userIds');
            userIds.forEach(userId => {
                const option = userSelect.querySelector(`option[value="${userId}"]`);
                if (option) {
                    option.selected = true;
                }
            });
        }

    } catch (error) {
        console.error('Load project error:', error);
        showError('Proje bilgileri yüklenirken bir hata oluştu.');
        setTimeout(() => {
            window.location.href = '/Projects';
        }, 2000);
    }
}

// Setup form submission
function setupFormSubmission(projectId) {
    const form = document.getElementById('editProjectForm');
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
        const name = document.getElementById('name').value.trim();
        const description = document.getElementById('description').value.trim();
        const selectedUserIds = Array.from(document.getElementById('userIds').selectedOptions)
            .map(option => parseInt(option.value, 10));

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
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Güncelleniyor...';
        }

        try {
            // Ensure projectId is a number
            const numericProjectId = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
            
            if (isNaN(numericProjectId) || numericProjectId <= 0) {
                showError('Geçersiz proje ID.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
                return;
            }

            console.log('Updating project with ID:', numericProjectId);
            console.log('Update data:', { name, description, userIds: selectedUserIds });

            // Prepare data according to API DTO: UpdateProjectDto
            // API expects: Name, Description, UserIds (PascalCase)
            const projectData = {
                Name: name,
                Description: description || '',
                UserIds: selectedUserIds.length > 0 ? selectedUserIds : null
            };

            // Call update project API
            await api.projects.update(numericProjectId, projectData);

            // Show success message
            showAlert('Proje başarıyla güncellendi!', 'success');

            // Redirect to projects page after 1 second
            setTimeout(() => {
                window.location.href = '/Projects';
            }, 1000);

        } catch (error) {
            console.error('Update project error:', error);
            
            // Show error message
            let errorMsg = 'Proje güncellenirken bir hata oluştu.';
            
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
