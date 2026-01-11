// Projects Page Script

let projects = [];
let currentDeleteId = null;

document.addEventListener("DOMContentLoaded", function () {
  console.log("Projects page loaded");

  // Check authentication
  const token = api.getToken();
  const user = api.getUser();

  console.log("Auth check:", { hasToken: !!token, hasUser: !!user });

  if (!token || !user) {
    console.warn("No token or user found, redirecting to login");
    window.location.href = "/Auth/Login";
    return;
  }

  // Initialize navigation
  try {
    initNavigation();
  } catch (error) {
    console.error("Navigation init error:", error);
  }

  // Setup add project button visibility
  setupAddProjectButton();

  // Load projects
  loadProjects();

  // Setup delete button
  setupDeleteButton();
});

// Setup add project button visibility
function setupAddProjectButton() {
  const addProjectBtn = document.getElementById("addProjectLink");
  if (addProjectBtn) {
    if (getUserRole() === "Admin") {
      addProjectBtn.style.display = "";
    } else {
      addProjectBtn.style.display = "none";
    }
  }
}

// Load projects from API
async function loadProjects() {
  const tbody = document.getElementById("projectsTableBody");

  if (!tbody) {
    console.error("Projects table body not found");
    return;
  }

  try {
    console.log("Calling API: GET /api/projects");

    projects = await api.projects.getAll();

    console.log("API Response received:", projects);
    console.log("Projects count:", projects ? projects.length : 0);

    if (!projects) {
      console.warn("Projects is null or undefined");
      projects = [];
    }

    if (!Array.isArray(projects)) {
      console.error("Projects is not an array:", projects);
      throw new Error("API response is not an array");
    }

    displayProjects(projects);
  } catch (error) {
    console.error("Projects error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      response: error.response,
    });

    let errorMessage = "Projeler yüklenirken bir hata oluştu.";

    if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 401) {
      errorMessage = "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.";
      setTimeout(() => {
        window.location.href = "/Auth/Login";
      }, 2000);
    } else if (error.status === 403) {
      errorMessage = "Bu işlem için yetkiniz yok.";
    } else if (error.status === 404) {
      errorMessage = "API endpoint bulunamadı.";
    }

    tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i> 
                        ${errorMessage}
                        <br><small class="text-muted">Hata: ${
                          error.message || "Bilinmeyen hata"
                        }</small>
                    </div>
                </td>
            </tr>
        `;
  }
}

// Display projects in table
function displayProjects(projectsList) {
  const tbody = document.getElementById("projectsTableBody");

  if (!tbody) {
    console.error("Projects table body not found");
    return;
  }

  if (projectsList.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                    <p class="mb-0">Henüz proje bulunmamaktadır.</p>
                </td>
            </tr>
        `;
    return;
  }

  const isAdmin = getUserRole() === "Admin";

  tbody.innerHTML = projectsList
    .map((project) => {
      // Get project ID - handle both camelCase and PascalCase
      const projectId =
        project.id !== undefined
          ? project.id
          : project.Id !== undefined
          ? project.Id
          : null;

      if (projectId === null || projectId === undefined) {
        console.error("Project without ID:", project);
        return "";
      }

      const projectName = project.name || project.Name || "İsimsiz Proje";
      const description =
        project.description || project.Description || "Açıklama yok";
      const createdDate = project.createdDate || project.CreatedDate;
      const userNames = project.userNames || project.UserNames || [];

      // Escape project name for onclick attribute
      const escapedProjectName = projectName
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;");

      // Truncate description if too long
      const shortDescription =
        description.length > 50
          ? description.substring(0, 50) + "..."
          : description;

      const actionButtons = isAdmin
        ? `
            <a href="/Tasks/Add?projectId=${projectId}" class="btn btn-sm btn-outline-success me-2" title="Görev Ekle">
                <i class="bi bi-plus-circle"></i> Görev Ekle
            </a>
            <a href="/Projects/Detail/${projectId}" class="btn btn-sm btn-outline-info me-2" title="Detayları Gör">
                <i class="bi bi-eye"></i> Detaylar
            </a>
            <a href="/Projects/Edit/${projectId}" class="btn btn-sm btn-outline-primary me-2" title="Düzenle">
                <i class="bi bi-pencil"></i>
            </a>
            <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${projectId}, '${escapedProjectName}')" title="Sil">
                <i class="bi bi-trash"></i>
            </button>
        `
        : `
            <a href="/Tasks/Add?projectId=${projectId}" class="btn btn-sm btn-outline-success me-2" title="Görev Ekle">
                <i class="bi bi-plus-circle"></i> Görev Ekle
            </a>
            <a href="/Projects/Detail/${projectId}" class="btn btn-sm btn-outline-info" title="Detayları Gör">
                <i class="bi bi-eye"></i> Detaylar
            </a>
        `;

      return `
            <tr>
                <td>${projectId}</td>
                <td><strong>${escapeHtml(projectName)}</strong></td>
                <td>${escapeHtml(shortDescription)}</td>
                <td>
                    ${
                      userNames.length > 0
                        ? userNames.join(", ")
                        : '<span class="text-muted">Atanmış kullanıcı yok</span>'
                    }
                </td>
                <td>${formatDate(createdDate)}</td>
                <td class="text-end">${actionButtons}</td>
            </tr>
        `;
    })
    .join("");
}

// Confirm delete
function confirmDelete(projectId, projectName) {
  if (!projectId) {
    console.error("Delete: Project ID is missing");
    showAlert("Proje ID'si bulunamadı.", "danger");
    return;
  }

  const numericId =
    typeof projectId === "string" ? parseInt(projectId, 10) : projectId;

  if (!numericId || isNaN(numericId) || numericId <= 0) {
    console.error("Delete: Invalid project ID:", projectId);
    showAlert("Geçersiz proje ID'si.", "danger");
    return;
  }

  console.log(
    "Confirm delete - Project ID:",
    numericId,
    "Project Name:",
    projectName
  );

  currentDeleteId = numericId;
  const deleteProjectNameEl = document.getElementById("deleteProjectName");
  if (deleteProjectNameEl) {
    deleteProjectNameEl.textContent = projectName || "Bu proje";
  }

  const deleteModal = document.getElementById("deleteModal");
  if (deleteModal) {
    const modal = new bootstrap.Modal(deleteModal);
    modal.show();
  } else {
    console.error("Delete modal not found");
  }
}

// Setup delete button event listener
function setupDeleteButton() {
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  if (!confirmDeleteBtn) {
    console.error("Confirm delete button not found");
    return;
  }

  // Remove existing event listeners by cloning
  const newBtn = confirmDeleteBtn.cloneNode(true);
  confirmDeleteBtn.parentNode.replaceChild(newBtn, confirmDeleteBtn);

  // Add event listener
  newBtn.addEventListener("click", async function () {
    const deleteId = currentDeleteId;

    if (!deleteId || isNaN(deleteId) || deleteId <= 0) {
      console.error("Delete: Invalid project ID:", deleteId);
      showAlert("Geçersiz proje ID'si.", "danger");
      return;
    }

    const btn = this;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Siliniyor...';

    try {
      console.log("Deleting project with ID:", deleteId);

      await api.projects.delete(deleteId);

      console.log("Project deleted successfully");
      showAlert("Proje başarıyla silindi.", "success");

      // Close modal
      const deleteModal = document.getElementById("deleteModal");
      if (deleteModal) {
        const modalInstance = bootstrap.Modal.getInstance(deleteModal);
        if (modalInstance) {
          modalInstance.hide();
        }
      }

      // Reload projects list
      await loadProjects();
      currentDeleteId = null;
    } catch (error) {
      console.error("Delete project error:", error);

      let errorMessage = "Proje silinirken bir hata oluştu.";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 404) {
        errorMessage = "Proje bulunamadı.";
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

// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
