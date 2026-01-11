// Project Detail Page Script

let project = null;
let tasks = [];

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

    // Get project ID from hidden input
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

    console.log('Project detail - Project ID:', projectId);

    // Load project data and tasks
    loadProjectData(projectId);
    loadTasks(projectId);
});

// Load project data from API
async function loadProjectData(projectId) {
    const projectInfoLoading = document.getElementById('projectInfoLoading');
    const projectInfo = document.getElementById('projectInfo');
    const projectError = document.getElementById('projectError');

    try {
        project = await api.projects.getById(projectId);
        
        if (!project) {
            showProjectError('Proje bulunamadı.');
            setTimeout(() => {
                window.location.href = '/Projects';
            }, 2000);
            return;
        }

        console.log('Loaded project:', project);

        // Display project info
        const projectIdValue = project.id !== undefined ? project.id : (project.Id !== undefined ? project.Id : null);
        const projectName = project.name || project.Name || 'İsimsiz Proje';
        const description = project.description || project.Description || 'Açıklama yok';
        const createdDate = project.createdDate || project.CreatedDate;
        const userNames = project.userNames || project.UserNames || [];

        document.getElementById('projectName').textContent = escapeHtml(projectName);
        document.getElementById('projectDescription').textContent = escapeHtml(description);
        document.getElementById('projectCreatedDate').textContent = formatDate(createdDate);
        
        if (userNames.length > 0) {
            document.getElementById('projectUsers').textContent = userNames.join(', ');
        } else {
            document.getElementById('projectUsers').innerHTML = '<span class="text-muted">Atanmış kullanıcı yok</span>';
        }

        // Show "Add Task" button if user is admin or assigned to project
        const currentUser = api.getUser();
        const isCurrentUserAdmin = currentUser && currentUser.role === 'Admin';
        const currentUserId = currentUser ? (currentUser.id || currentUser.Id) : null;
        const userIds = project.userIds || project.UserIds || [];
        const isUserAssignedToProject = currentUserId && userIds.includes(currentUserId);

        if (isCurrentUserAdmin || isUserAssignedToProject) {
            const addTaskBtn = document.getElementById('addTaskBtn');
            if (addTaskBtn) {
                addTaskBtn.href = `/Tasks/Add?projectId=${projectIdValue}`;
                addTaskBtn.style.display = '';
            }
        }

        // Hide loading, show content
        if (projectInfoLoading) projectInfoLoading.style.display = 'none';
        if (projectInfo) projectInfo.style.display = 'block';
        if (projectError) projectError.style.display = 'none';

    } catch (error) {
        console.error('Load project error:', error);
        
        let errorMessage = 'Proje bilgileri yüklenirken bir hata oluştu.';
        
        if (error.message) {
            errorMessage = error.message;
        } else if (error.status === 404) {
            errorMessage = 'Proje bulunamadı.';
            setTimeout(() => {
                window.location.href = '/Projects';
            }, 2000);
        } else if (error.status === 403) {
            errorMessage = 'Bu projeyi görüntüleme yetkiniz yok.';
        } else if (error.status === 401) {
            errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
            setTimeout(() => {
                window.location.href = '/Auth/Login';
            }, 2000);
        }

        showProjectError(errorMessage);
    }
}

// Load tasks from API
async function loadTasks(projectId) {
    const tasksLoading = document.getElementById('tasksLoading');
    const tasksContent = document.getElementById('tasksContent');
    const tasksError = document.getElementById('tasksError');
    const tasksTableBody = document.getElementById('tasksTableBody');

    try {
        tasks = await api.tasks.getAll(projectId);
        
        if (!tasks) {
            tasks = [];
        }

        console.log('Loaded tasks:', tasks);

        // Display tasks
        if (tasks.length === 0) {
            tasksTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                        <p class="mb-0">Bu projede henüz görev bulunmamaktadır.</p>
                    </td>
                </tr>
            `;
        } else {
            tasksTableBody.innerHTML = tasks.map(task => {
                const taskId = task.id !== undefined ? task.id : (task.Id !== undefined ? task.Id : null);
                const title = task.title || task.Title || 'Başlıksız';
                const description = task.description || task.Description || 'Açıklama yok';
                const status = task.status !== undefined ? task.status : (task.Status !== undefined ? task.Status : 0);
                const priority = task.priority !== undefined ? task.priority : (task.Priority !== undefined ? task.Priority : 0);
                const assignedUserNames = task.assignedUserNames || task.AssignedUserNames || [];
                const createdDate = task.createdDate || task.CreatedDate;

                // Status text
                const statusText = getStatusText(status);
                const statusClass = getStatusClass(status);

                // Priority text
                const priorityText = getPriorityText(priority);
                const priorityClass = getPriorityClass(priority);

                // Truncate description if too long
                const shortDescription = description.length > 50 
                    ? description.substring(0, 50) + '...' 
                    : description;

                return `
                    <tr>
                        <td>${taskId || '-'}</td>
                        <td><strong>${escapeHtml(title)}</strong></td>
                        <td>${escapeHtml(shortDescription)}</td>
                        <td><span class="badge ${statusClass}">${statusText}</span></td>
                        <td><span class="badge ${priorityClass}">${priorityText}</span></td>
                        <td>
                            ${assignedUserNames.length > 0 
                                ? assignedUserNames.join(', ') 
                                : '<span class="text-muted">Atanmış kullanıcı yok</span>'
                            }
                        </td>
                        <td>${formatDate(createdDate)}</td>
                    </tr>
                `;
            }).join('');
        }

        // Hide loading, show content
        if (tasksLoading) tasksLoading.style.display = 'none';
        if (tasksContent) tasksContent.style.display = 'block';
        if (tasksError) tasksError.style.display = 'none';

    } catch (error) {
        console.error('Load tasks error:', error);
        
        let errorMessage = 'Görevler yüklenirken bir hata oluştu.';
        
        if (error.message) {
            errorMessage = error.message;
        } else if (error.status === 401) {
            errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
            setTimeout(() => {
                window.location.href = '/Auth/Login';
            }, 2000);
        } else if (error.status === 403) {
            errorMessage = 'Bu görevleri görüntüleme yetkiniz yok.';
        }

        showTasksError(errorMessage);
    }
}

// Show project error
function showProjectError(message) {
    const projectInfoLoading = document.getElementById('projectInfoLoading');
    const projectInfo = document.getElementById('projectInfo');
    const projectError = document.getElementById('projectError');
    
    if (projectInfoLoading) projectInfoLoading.style.display = 'none';
    if (projectInfo) projectInfo.style.display = 'none';
    if (projectError) {
        projectError.textContent = message;
        projectError.style.display = 'block';
    }
}

// Show tasks error
function showTasksError(message) {
    const tasksLoading = document.getElementById('tasksLoading');
    const tasksContent = document.getElementById('tasksContent');
    const tasksError = document.getElementById('tasksError');
    
    if (tasksLoading) tasksLoading.style.display = 'none';
    if (tasksContent) tasksContent.style.display = 'none';
    if (tasksError) {
        tasksError.textContent = message;
        tasksError.style.display = 'block';
    }
}

// Get status text
function getStatusText(status) {
    switch (status) {
        case 0: return 'Yapılacak';
        case 1: return 'Devam Ediyor';
        case 2: return 'Tamamlandı';
        default: return 'Bilinmiyor';
    }
}

// Get status class
function getStatusClass(status) {
    switch (status) {
        case 0: return 'bg-secondary';
        case 1: return 'bg-warning';
        case 2: return 'bg-success';
        default: return 'bg-secondary';
    }
}

// Get priority text
function getPriorityText(priority) {
    switch (priority) {
        case 0: return 'Düşük';
        case 1: return 'Orta';
        case 2: return 'Yüksek';
        default: return 'Bilinmiyor';
    }
}

// Get priority class
function getPriorityClass(priority) {
    switch (priority) {
        case 0: return 'bg-info';
        case 1: return 'bg-warning';
        case 2: return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
