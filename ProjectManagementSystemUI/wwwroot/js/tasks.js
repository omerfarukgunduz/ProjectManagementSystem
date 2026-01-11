// Tasks Page Script

let tasks = [];
let projects = [];
let users = [];
let currentDeleteId = null;
let currentEditTask = null;

document.addEventListener("DOMContentLoaded", function () {
  console.log("Tasks page loaded");

  // Check authentication
  const token = api.getToken();
  const user = api.getUser();

  if (!token || !user) {
    window.location.href = "/Auth/Login";
    return;
  }

  // Initialize navigation
  try {
    initNavigation();
  } catch (error) {
    console.error("Navigation init error:", error);
  }

  // Load initial data
  loadProjects().then(() => {
    loadTasks();
  });

  // Setup event listeners
  setupProjectFilter();
  
  // Setup admin buttons
  setupAdminButtons();
  
  // Setup delete button
  setupDeleteTaskButton();
  
  // Setup edit form
  setupEditTaskForm();
});

// Load projects from API
async function loadProjects() {
  try {
    projects = await api.projects.getAll();
    console.log("Loaded projects:", projects);
    populateProjectFilter();
  } catch (error) {
    console.error("Projects error:", error);
    showAlert("Projeler yüklenirken bir hata oluştu.", "danger");
  }
}

// Populate project filter dropdown
function populateProjectFilter() {
  const projectFilter = document.getElementById("projectFilter");
  if (!projectFilter) return;

  projectFilter.innerHTML = '<option value="">Tüm Projeler</option>';

  if (projects && projects.length > 0) {
    projects.forEach((project) => {
      const projectId =
        project.id !== undefined
          ? project.id
          : project.Id !== undefined
          ? project.Id
          : null;
      const projectName = project.name || project.Name || "İsimsiz Proje";

      if (projectId !== null) {
        const option = document.createElement("option");
        option.value = projectId;
        option.textContent = projectName;
        projectFilter.appendChild(option);
      }
    });
  }
}

// Setup project filter
function setupProjectFilter() {
  const projectFilter = document.getElementById("projectFilter");
  if (projectFilter) {
    projectFilter.addEventListener("change", function () {
      const projectId = this.value ? parseInt(this.value, 10) : null;
      loadTasks(projectId);
    });
  }
}

// Load tasks from API
async function loadTasks(projectId = null) {
  const tbody = document.getElementById("tasksTableBody");

  if (!tbody) {
    console.error("Tasks table body not found");
    return;
  }

  try {
    console.log("Loading tasks, projectId:", projectId);

    if (projectId) {
      tasks = await api.tasks.getAll(projectId);
    } else {
      tasks = await api.tasks.getAll();
    }

    console.log("Loaded tasks:", tasks);

    if (!tasks) {
      tasks = [];
    }

    if (!Array.isArray(tasks)) {
      throw new Error("API response is not an array");
    }

    displayTasks(tasks);
  } catch (error) {
    console.error("Tasks error:", error);

    let errorMessage = "Görevler yüklenirken bir hata oluştu.";

    if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 401) {
      errorMessage = "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.";
      setTimeout(() => {
        window.location.href = "/Auth/Login";
      }, 2000);
    }

    const isAdmin = getUserRole() === "Admin";
    const colCount = isAdmin ? 8 : 7;
    tbody.innerHTML = `
            <tr>
                <td colspan="${colCount}" class="text-center py-5">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i> 
                        ${errorMessage}
                    </div>
                </td>
            </tr>
        `;
  }
}

// Display tasks in table
function displayTasks(tasksList) {
  const tbody = document.getElementById("tasksTableBody");

  if (!tbody) return;

  const isAdmin = getUserRole() === "Admin";
  const colCount = isAdmin ? 8 : 7;
  
  if (tasksList.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="${colCount}" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                    <p class="mb-0">Henüz görev bulunmamaktadır.</p>
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = tasksList
    .map((task) => {
      const taskId =
        task.id !== undefined
          ? task.id
          : task.Id !== undefined
          ? task.Id
          : null;

      if (taskId === null) {
        return "";
      }

      const title = task.title || task.Title || "İsimsiz Görev";
      const projectName = task.projectName || task.ProjectName || "Proje yok";
      const status =
        task.status !== undefined
          ? task.status
          : task.Status !== undefined
          ? task.Status
          : 0;
      const priority =
        task.priority !== undefined
          ? task.priority
          : task.Priority !== undefined
          ? task.Priority
          : 1;
      const projectId =
        task.projectId !== undefined
          ? task.projectId
          : task.ProjectId !== undefined
          ? task.ProjectId
          : null;
      const createdDate = task.createdDate || task.CreatedDate;

      // Status badge
      const statusMap = {
        0: { text: "Yapılacak", class: "warning" },
        1: { text: "Devam Ediyor", class: "info" },
        2: { text: "Tamamlandı", class: "success" },
      };
      const statusInfo = statusMap[status] || statusMap[0];

      // Priority badge
      const priorityMap = {
        0: { text: "Düşük", class: "secondary" },
        1: { text: "Orta", class: "primary" },
        2: { text: "Yüksek", class: "danger" },
      };
      const priorityInfo = priorityMap[priority] || priorityMap[1];

      // Status update dropdown - only "Devam Ediyor" (1) and "Tamamlandı" (2)
      let statusDropdown = "";
      if (status === 0) {
        // If status is "Yapılacak", show both options
        statusDropdown = `
                <select class="form-select form-select-sm" onchange="updateTaskStatus(${taskId}, ${projectId}, this.value)" style="min-width: 150px;">
                    <option value="0" ${
                      status === 0 ? "selected" : ""
                    }>Yapılacak</option>
                    <option value="1">Devam Ediyor</option>
                    <option value="2">Tamamlandı</option>
                </select>
            `;
      } else if (status === 1) {
        // If status is "Devam Ediyor", show only "Tamamlandı"
        statusDropdown = `
                <select class="form-select form-select-sm" onchange="updateTaskStatus(${taskId}, ${projectId}, this.value)" style="min-width: 150px;">
                    <option value="1" selected>Devam Ediyor</option>
                    <option value="2">Tamamlandı</option>
                </select>
            `;
      } else {
        // If status is "Tamamlandı", show only "Devam Ediyor"
        statusDropdown = `
                <select class="form-select form-select-sm" onchange="updateTaskStatus(${taskId}, ${projectId}, this.value)" style="min-width: 150px;">
                    <option value="2" selected>Tamamlandı</option>
                    <option value="1">Devam Ediyor</option>
                </select>
            `;
      }

      // Admin buttons
      const isAdmin = getUserRole() === "Admin";
      const adminButtons = isAdmin
        ? `
            <div class="btn-group" role="group">
                <button class="btn btn-sm btn-outline-primary" onclick="editTask(${taskId})" title="Düzenle">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteTask(${taskId}, '${escapeHtml(title).replace(/'/g, "\\'")}')" title="Sil">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `
        : "";

      return `
            <tr>
                <td>${taskId}</td>
                <td><strong>${escapeHtml(title)}</strong></td>
                <td>${escapeHtml(projectName)}</td>
                <td>
                    <span class="badge bg-${statusInfo.class}">${
        statusInfo.text
      }</span>
                </td>
                <td>
                    <span class="badge bg-${priorityInfo.class}">${
        priorityInfo.text
      }</span>
                </td>
                <td>${formatDate(createdDate)}</td>
                <td>
                    ${statusDropdown}
                </td>
                ${isAdmin ? `<td class="text-end">${adminButtons}</td>` : ""}
            </tr>
        `;
    })
    .join("");
}

// Update task status
async function updateTaskStatus(taskId, projectId, newStatus) {
  try {
    console.log("Updating task status:", { taskId, projectId, newStatus });

    // Get current task data
    const task = await api.tasks.getById(taskId);

    if (!task) {
      showAlert("Görev bulunamadı.", "danger");
      return;
    }

    // Prepare update data - keep existing values, only update status
    const taskData = {
      Title: task.title || task.Title || "",
      Description: task.description || task.Description || "",
      Status: parseInt(newStatus, 10),
      Priority:
        task.priority !== undefined
          ? task.priority
          : task.Priority !== undefined
          ? task.Priority
          : 1,
      ProjectId:
        projectId ||
        (task.projectId !== undefined
          ? task.projectId
          : task.ProjectId !== undefined
          ? task.ProjectId
          : null),
      AssignedUserIds: task.assignedUserIds || task.AssignedUserIds || null,
    };

    console.log("Updating task with data:", taskData);

    // Call update API
    await api.tasks.update(taskId, taskData);

    showAlert("Görev durumu başarıyla güncellendi!", "success");

    // Reload tasks
    const projectFilter = document.getElementById("projectFilter");
    const selectedProjectId = projectFilter
      ? projectFilter.value
        ? parseInt(projectFilter.value, 10)
        : null
      : null;
    await loadTasks(selectedProjectId);
  } catch (error) {
    console.error("Update task status error:", error);
    showAlert(
      error.message || "Görev durumu güncellenirken bir hata oluştu.",
      "danger"
    );

    // Reload tasks to reset dropdown
    const projectFilter = document.getElementById("projectFilter");
    const selectedProjectId = projectFilter
      ? projectFilter.value
        ? parseInt(projectFilter.value, 10)
        : null
      : null;
    await loadTasks(selectedProjectId);
  }
}

// Show error in modal
function showError(message, errorDiv) {
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    errorDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } else {
    alert(message);
  }
}

// Setup admin buttons visibility
function setupAdminButtons() {
  const isAdmin = getUserRole() === "Admin";
  const adminColumns = document.querySelectorAll(".admin-only-column");
  adminColumns.forEach((col) => {
    col.style.display = isAdmin ? "" : "none";
  });
}

// Edit task - open modal
async function editTask(taskId) {
  try {
    console.log("Editing task:", taskId);
    
    // Get task data
    const task = await api.tasks.getById(taskId);
    
    if (!task) {
      showAlert("Görev bulunamadı.", "danger");
      return;
    }

    currentEditTask = task;

    // Populate form
    document.getElementById("editTaskId").value = taskId;
    document.getElementById("editTaskTitle").value = task.title || task.Title || "";
    document.getElementById("editTaskDescription").value = task.description || task.Description || "";
    document.getElementById("editTaskStatus").value = task.status !== undefined ? task.status : (task.Status !== undefined ? task.Status : 0);
    document.getElementById("editTaskPriority").value = task.priority !== undefined ? task.priority : (task.Priority !== undefined ? task.Priority : 1);

    // Populate project select
    const projectSelect = document.getElementById("editTaskProjectId");
    projectSelect.innerHTML = '<option value="">Proje seçin...</option>';
    if (projects && projects.length > 0) {
      projects.forEach((project) => {
        const projectId = project.id !== undefined ? project.id : (project.Id !== undefined ? project.Id : null);
        const projectName = project.name || project.Name || "İsimsiz Proje";
        if (projectId !== null) {
          const option = document.createElement("option");
          option.value = projectId;
          option.textContent = projectName;
          const taskProjectId = task.projectId !== undefined ? task.projectId : (task.ProjectId !== undefined ? task.ProjectId : null);
          if (taskProjectId && projectId === taskProjectId) {
            option.selected = true;
          }
          projectSelect.appendChild(option);
        }
      });
    }

    // Load users for assigned users select
    await loadUsersForEdit();

    // Set assigned users
    const assignedUserIds = task.assignedUserIds || task.AssignedUserIds || [];
    const assignedUserSelect = document.getElementById("editTaskAssignedUserIds");
    if (assignedUserSelect) {
      Array.from(assignedUserSelect.options).forEach((option) => {
        if (option.value && assignedUserIds.includes(parseInt(option.value, 10))) {
          option.selected = true;
        }
      });
    }

    // Show modal
    const editModal = new bootstrap.Modal(document.getElementById("editTaskModal"));
    editModal.show();

  } catch (error) {
    console.error("Edit task error:", error);
    showAlert("Görev bilgileri yüklenirken bir hata oluştu.", "danger");
  }
}

// Load users for edit modal
async function loadUsersForEdit() {
  try {
    users = await api.users.getAll();
    const assignedUserSelect = document.getElementById("editTaskAssignedUserIds");
    
    if (!assignedUserSelect) return;

    assignedUserSelect.innerHTML = "";

    if (users && users.length > 0) {
      users.forEach((user) => {
        const userId = user.id !== undefined ? user.id : (user.Id !== undefined ? user.Id : null);
        const username = user.username || user.Username || "";
        const email = user.email || user.Email || "";
        
        if (userId !== null) {
          const option = document.createElement("option");
          option.value = userId;
          option.textContent = email ? `${username} (${email})` : username;
          assignedUserSelect.appendChild(option);
        }
      });
    } else {
      assignedUserSelect.innerHTML = '<option value="">Kullanıcı bulunamadı</option>';
    }
  } catch (error) {
    console.error("Load users error:", error);
  }
}

// Save edited task
async function saveTask() {
  const taskId = parseInt(document.getElementById("editTaskId").value, 10);
  const title = document.getElementById("editTaskTitle").value.trim();
  const description = document.getElementById("editTaskDescription").value.trim();
  const projectId = parseInt(document.getElementById("editTaskProjectId").value, 10);
  const status = parseInt(document.getElementById("editTaskStatus").value, 10);
  const priority = parseInt(document.getElementById("editTaskPriority").value, 10);
  const assignedUserIdsSelect = document.getElementById("editTaskAssignedUserIds");
  const assignedUserIds = Array.from(assignedUserIdsSelect.selectedOptions)
    .map((option) => parseInt(option.value, 10));

  // Validation
  if (!title) {
    showError("Başlık gereklidir.", document.getElementById("editTaskError"));
    return;
  }

  if (!projectId || isNaN(projectId)) {
    showError("Proje seçimi gereklidir.", document.getElementById("editTaskError"));
    return;
  }

  const saveBtn = document.getElementById("saveTaskBtn");
  const originalText = saveBtn.innerHTML;
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Kaydediliyor...';

  try {
    const taskData = {
      Title: title,
      Description: description || "",
      Status: status,
      Priority: priority,
      ProjectId: projectId,
      AssignedUserIds: assignedUserIds.length > 0 ? assignedUserIds : null
    };

    console.log("Updating task with data:", taskData);

    await api.tasks.update(taskId, taskData);

    showAlert("Görev başarıyla güncellendi!", "success");

    // Close modal
    const editModal = bootstrap.Modal.getInstance(document.getElementById("editTaskModal"));
    if (editModal) {
      editModal.hide();
    }

    // Reload tasks
    const projectFilter = document.getElementById("projectFilter");
    const selectedProjectId = projectFilter
      ? projectFilter.value
        ? parseInt(projectFilter.value, 10)
        : null
      : null;
    await loadTasks(selectedProjectId);

  } catch (error) {
    console.error("Save task error:", error);
    let errorMsg = "Görev güncellenirken bir hata oluştu.";
    if (error.message) {
      errorMsg = error.message;
    }
    showError(errorMsg, document.getElementById("editTaskError"));
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = originalText;
  }
}

// Confirm delete task
function confirmDeleteTask(taskId, taskName) {
  if (!taskId) {
    console.error("Delete: Task ID is missing");
    showAlert("Görev ID'si bulunamadı.", "danger");
    return;
  }

  const numericId = typeof taskId === "string" ? parseInt(taskId, 10) : taskId;

  if (!numericId || isNaN(numericId) || numericId <= 0) {
    console.error("Delete: Invalid task ID:", taskId);
    showAlert("Geçersiz görev ID'si.", "danger");
    return;
  }

  console.log("Confirm delete - Task ID:", numericId, "Task Name:", taskName);

  currentDeleteId = numericId;
  const deleteTaskNameEl = document.getElementById("deleteTaskName");
  if (deleteTaskNameEl) {
    deleteTaskNameEl.textContent = taskName || "Bu görev";
  }

  const deleteModal = document.getElementById("deleteTaskModal");
  if (deleteModal) {
    const modal = new bootstrap.Modal(deleteModal);
    modal.show();
  } else {
    console.error("Delete modal not found");
  }
}

// Setup delete button event listener
function setupDeleteTaskButton() {
  const confirmDeleteBtn = document.getElementById("confirmDeleteTaskBtn");
  if (!confirmDeleteBtn) {
    return;
  }

  // Remove existing event listeners by cloning
  const newBtn = confirmDeleteBtn.cloneNode(true);
  confirmDeleteBtn.parentNode.replaceChild(newBtn, confirmDeleteBtn);

  // Add event listener
  newBtn.addEventListener("click", async function () {
    const deleteId = currentDeleteId;

    if (!deleteId || isNaN(deleteId) || deleteId <= 0) {
      console.error("Delete: Invalid task ID:", deleteId);
      showAlert("Geçersiz görev ID'si.", "danger");
      return;
    }

    const btn = this;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Siliniyor...';

    try {
      console.log("Deleting task with ID:", deleteId);

      await api.tasks.delete(deleteId);

      console.log("Task deleted successfully");
      showAlert("Görev başarıyla silindi.", "success");

      // Close modal
      const deleteModal = document.getElementById("deleteTaskModal");
      if (deleteModal) {
        const modalInstance = bootstrap.Modal.getInstance(deleteModal);
        if (modalInstance) {
          modalInstance.hide();
        }
      }

      // Reload tasks list
      const projectFilter = document.getElementById("projectFilter");
      const selectedProjectId = projectFilter
        ? projectFilter.value
          ? parseInt(projectFilter.value, 10)
          : null
        : null;
      await loadTasks(selectedProjectId);
      currentDeleteId = null;
    } catch (error) {
      console.error("Delete task error:", error);

      let errorMessage = "Görev silinirken bir hata oluştu.";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 404) {
        errorMessage = "Görev bulunamadı.";
      } else if (error.status === 403) {
        errorMessage = "Bu işlem için yetkiniz yok.";
      } else if (error.status === 401) {
        errorMessage = "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.";
      }

      showAlert(errorMessage, "danger");
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });
}

// Setup edit form submission
function setupEditTaskForm() {
  const saveBtn = document.getElementById("saveTaskBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveTask);
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
