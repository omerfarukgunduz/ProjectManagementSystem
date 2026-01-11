// Add Task Page Script

let projects = [];
let projectUsers = [];
let selectedProjectId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = api.getToken();
    const user = api.getUser();
    
    if (!token || !user) {
        window.location.href = '/Auth/Login';
        return;
    }

    // Initialize navigation
    try {
        initNavigation();
    } catch (error) {
        console.error('Navigation init error:', error);
    }

    // Get project ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectIdParam = urlParams.get('projectId');
    
    if (projectIdParam) {
        selectedProjectId = parseInt(projectIdParam, 10);
        console.log('Project ID from URL:', selectedProjectId);
    }

    // Load projects first
    loadProjects().then(() => {
        // If project ID is provided, load project users
        if (selectedProjectId) {
            loadProjectUsers(selectedProjectId);
        }
        
        // Setup form submission
        setupFormSubmission();
    });
});

// Load projects from API
async function loadProjects() {
    try {
        projects = await api.projects.getAll();
        console.log('Loaded projects:', projects);
        populateProjectSelect();
    } catch (error) {
        console.error('Projects error:', error);
        showError('Projeler yüklenirken bir hata oluştu.');
    }
}

// Populate project select
function populateProjectSelect() {
    const projectSelect = document.getElementById('taskProjectId');
    if (!projectSelect) return;

    projectSelect.innerHTML = '<option value="">Proje seçin...</option>';
    
    if (projects && projects.length > 0) {
        projects.forEach(project => {
            const projectId = project.id !== undefined ? project.id : (project.Id !== undefined ? project.Id : null);
            const projectName = project.name || project.Name || 'İsimsiz Proje';
            
            if (projectId !== null) {
                const option = document.createElement('option');
                option.value = projectId;
                option.textContent = projectName;
                
                // If project ID matches selected project, select it
                if (selectedProjectId && projectId === selectedProjectId) {
                    option.selected = true;
                    // Disable select if project is pre-selected
                    projectSelect.disabled = true;
                }
                
                projectSelect.appendChild(option);
            }
        });
    }
}

// Load project users from API
async function loadProjectUsers(projectId) {
    try {
        console.log('Loading project users for project ID:', projectId);
        const project = await api.projects.getById(projectId);
        
        if (!project) {
            showError('Proje bulunamadı.');
            return;
        }

        console.log('Loaded project:', project);
        
        // Get user IDs and names from project
        const userIds = project.userIds || project.UserIds || [];
        const userNames = project.userNames || project.UserNames || [];
        
        console.log('Project user IDs:', userIds);
        console.log('Project user names:', userNames);
        
        // If we have user IDs, fetch full user details
        if (userIds.length > 0) {
            projectUsers = [];
            for (const userId of userIds) {
                try {
                    const user = await api.users.getById(userId);
                    if (user) {
                        projectUsers.push(user);
                    }
                } catch (error) {
                    console.error(`Error loading user ${userId}:`, error);
                }
            }
        } else {
            // If no user IDs, create user objects from names
            projectUsers = userNames.map((name, index) => ({
                id: userIds[index] || null,
                username: name,
                email: ''
            }));
        }
        
        console.log('Project users:', projectUsers);
        populateUserSelect();
        
    } catch (error) {
        console.error('Load project users error:', error);
        showError('Proje kullanıcıları yüklenirken bir hata oluştu.');
    }
}

// Populate user select with project users only
function populateUserSelect() {
    const userSelect = document.getElementById('taskAssignedUserIds');
    if (!userSelect) return;

    userSelect.innerHTML = '';
    
    // Get current user and role
    const currentUser = api.getUser();
    const isCurrentUserAdmin = currentUser && currentUser.role === 'Admin';
    const currentUserId = currentUser ? (currentUser.id || currentUser.Id) : null;
    
    // If User role, only show current user
    if (!isCurrentUserAdmin && currentUserId) {
        // Find current user in project users
        const currentUserInProject = projectUsers.find(user => {
            const userId = user.id !== undefined ? user.id : (user.Id !== undefined ? user.Id : null);
            return userId === currentUserId;
        });
        
        if (currentUserInProject) {
            const userId = currentUserInProject.id !== undefined ? currentUserInProject.id : (currentUserInProject.Id !== undefined ? currentUserInProject.Id : null);
            const username = currentUserInProject.username || currentUserInProject.Username || '';
            const email = currentUserInProject.email || currentUserInProject.Email || '';
            
            if (userId !== null) {
                const option = document.createElement('option');
                option.value = userId;
                option.textContent = email ? `${username} (${email})` : username;
                option.selected = true; // Auto-select current user
                userSelect.appendChild(option);
            }
        } else {
            // Current user is not in project users, but still show them
            const username = currentUser.username || currentUser.Username || '';
            const email = currentUser.email || currentUser.Email || '';
            
            if (currentUserId !== null) {
                const option = document.createElement('option');
                option.value = currentUserId;
                option.textContent = email ? `${username} (${email})` : username;
                option.selected = true; // Auto-select current user
                userSelect.appendChild(option);
            }
        }
        
        // Disable select for User role (can only select themselves)
        userSelect.disabled = true;
    } else if (projectUsers && projectUsers.length > 0) {
        // Admin can see all project users
        projectUsers.forEach(user => {
            const userId = user.id !== undefined ? user.id : (user.Id !== undefined ? user.Id : null);
            const username = user.username || user.Username || '';
            const email = user.email || user.Email || '';
            
            if (userId !== null) {
                const option = document.createElement('option');
                option.value = userId;
                option.textContent = email ? `${username} (${email})` : username;
                userSelect.appendChild(option);
            }
        });
        userSelect.disabled = false;
    } else {
        userSelect.innerHTML = '<option value="">Bu projede kullanıcı bulunmamaktadır</option>';
    }
}

// Setup project change listener
function setupProjectChangeListener() {
    const projectSelect = document.getElementById('taskProjectId');
    if (projectSelect && !projectSelect.disabled) {
        projectSelect.addEventListener('change', function() {
            const projectId = this.value ? parseInt(this.value, 10) : null;
            if (projectId) {
                selectedProjectId = projectId;
                loadProjectUsers(projectId);
            } else {
                projectUsers = [];
                populateUserSelect();
            }
        });
    }
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('addTaskForm');
    
    if (!form) {
        console.error('Form not found');
        return;
    }

    // Setup project change listener
    setupProjectChangeListener();

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Hide previous error
        hideError();

        // Get form elements
        const titleInput = document.getElementById('taskTitle');
        const descriptionInput = document.getElementById('taskDescription');
        const projectIdSelect = document.getElementById('taskProjectId');
        const statusSelect = document.getElementById('taskStatus');
        const prioritySelect = document.getElementById('taskPriority');
        const assignedUserIdsSelect = document.getElementById('taskAssignedUserIds');

        // Get values
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const projectId = parseInt(projectIdSelect.value, 10);
        const status = parseInt(statusSelect.value, 10);
        const priority = parseInt(prioritySelect.value, 10);
        const assignedUserIds = Array.from(assignedUserIdsSelect.selectedOptions)
            .map(option => parseInt(option.value, 10));

        // Validation
        if (!title) {
            showError('Başlık gereklidir.');
            return;
        }

        if (!projectId || isNaN(projectId)) {
            showError('Proje seçimi gereklidir.');
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
            // Prepare data according to API DTO: CreateTaskDto
            // API expects: Title, Description, Status, Priority, ProjectId, AssignedUserIds (PascalCase)
            const taskData = {
                Title: title,
                Description: description || '',
                Status: status,
                Priority: priority,
                ProjectId: projectId,
                AssignedUserIds: assignedUserIds.length > 0 ? assignedUserIds : null
            };

            console.log('Creating task with data:', taskData);
            
            // Call API: POST /api/tasks
            await api.tasks.create(taskData);

            // Show success message
            showAlert('Görev başarıyla eklendi!', 'success');

            // Redirect to projects page after 1 second
            setTimeout(() => {
                window.location.href = '/Projects';
            }, 1000);

        } catch (error) {
            console.error('Add task error:', error);
            
            // Show error message
            let errorMsg = 'Görev eklenirken bir hata oluştu.';
            
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
