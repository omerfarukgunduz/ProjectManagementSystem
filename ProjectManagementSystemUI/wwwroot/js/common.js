// Common utility functions

// Check if user is authenticated
const isAuthenticated = () => {
  const token = api.getToken();
  const user = api.getUser();
  return token && user;
};

// Check if user is admin
const isAdmin = () => {
  const user = api.getUser();
  return user && user.role === "Admin";
};

// Get user role
const getUserRole = () => {
  const user = api.getUser();
  return user ? user.role : null;
};

// Redirect to login if not authenticated
const requireAuth = () => {
  if (!isAuthenticated()) {
    window.location.href = "/Auth/Login";
    return false;
  }
  return true;
};

// Redirect to login if not admin
const requireAdmin = () => {
  if (!requireAuth()) {
    return false;
  }
  if (!isAdmin()) {
    window.location.href = "/Dashboard";
    return false;
  }
  return true;
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format datetime
const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Show alert message
const showAlert = (message, type = "info") => {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
  alertDiv.style.zIndex = "9999";
  alertDiv.style.minWidth = "300px";
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
  document.body.appendChild(alertDiv);

  // Auto remove after 5 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
};

// Show loading spinner
const showLoading = (element) => {
  if (element) {
    element.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Yükleniyor...</span>
                </div>
            </div>
        `;
  }
};

// Logout function
const logout = async () => {
  try {
    // Call logout API endpoint
    await api.auth.logout();
  } catch (error) {
    console.error('Logout API error:', error);
    // Continue with logout even if API call fails
  } finally {
    // Remove token and user data from localStorage (removeToken already removes both)
    api.removeToken();
    // Redirect to login page
    window.location.href = "/Auth/Login";
  }
};

// Initialize navigation
const initNavigation = () => {
  const user = api.getUser();
  if (user) {
    // Update username in navbar
    const usernameElements = document.querySelectorAll(".navbar-username");
    usernameElements.forEach((el) => {
      el.textContent = user.username;
    });

    // Show/hide admin menu items
    if (isAdmin()) {
      document.querySelectorAll(".admin-only").forEach((el) => {
        el.style.display = "";
      });
    } else {
      document.querySelectorAll(".admin-only").forEach((el) => {
        el.style.display = "none";
      });
    }
  }
};
