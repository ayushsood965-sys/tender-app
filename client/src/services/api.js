const API_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Helper to get Auth Headers
 */
const getAuthHeaders = (extraHeaders = {}) => {
    const token = localStorage.getItem("tender_auth_token");
    const headers = { ...extraHeaders };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

export const fetchDashboardData = async () => {
    const res = await fetch(`${API_URL}/dashboard-data`, {
        headers: getAuthHeaders(),
    });
    return res.json();
};

export const fetchTenders = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_URL}/tenders?${query}` : `${API_URL}/tenders`;
    const res = await fetch(url, {
        headers: getAuthHeaders(),
    });
    return res.json();
};

export const fetchTender = async (id) => {
    const res = await fetch(`${API_URL}/tenders/${id}`, {
        headers: getAuthHeaders(),
    });
    return res.json();
};

export const createTender = async (data) => {
    const res = await fetch(`${API_URL}/tenders`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create tender");
    }
    return res.json();
};

export const updateTender = async (id, data) => {
    const res = await fetch(`${API_URL}/tenders/${id}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update tender");
    }
    return res.json();
};

export const deleteTender = async (id) => {
    const res = await fetch(`${API_URL}/tenders/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete tender");
    }
    return res.json();
};

export const createCategory = async (data) => {
    const res = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create category");
    }
    return res.json();
};

export const updateCategory = async (id, data) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update category");
    }
    return res.json();
};

export const deleteCategory = async (id) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete category");
    }
    return res.json();
};

export const createTerm = async (data) => {
    const res = await fetch(`${API_URL}/terms`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create term");
    }
    return res.json();
};

export const updateTerm = async (id, data) => {
    const res = await fetch(`${API_URL}/terms/${id}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update term");
    }
    return res.json();
};

export const deleteTerm = async (id) => {
    const res = await fetch(`${API_URL}/terms/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete term");
    }
    return res.json();
};

export const saveDocument = async (data) => {
    const res = await fetch(`${API_URL}/documents`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save document");
    }
    return res.json();
};

export const updateSavedDocument = async (id, data) => {
    const res = await fetch(`${API_URL}/documents/${id}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update document");
    }
    return res.json();
};

export const fetchDocuments = async (tenderId) => {
    const res = await fetch(`${API_URL}/tenders/${tenderId}/documents`, {
        headers: getAuthHeaders(),
    });
    return res.json();
};

export const fetchSavedDocument = async (id) => {
    const res = await fetch(`${API_URL}/documents/${id}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Document not found");
    return res.json();
};

export const deleteDocument = async (id) => {
    const res = await fetch(`${API_URL}/documents/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    return res.json();
};

export const fetchAdminUsers = async () => {
    const res = await fetch(`${API_URL}/auth/users`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch users list");
    return res.json();
};
