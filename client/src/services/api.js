const API_URL = "/api";

export const fetchDashboardData = async () => {
    const res = await fetch(`${API_URL}/dashboard-data`);
    return res.json();
};

export const fetchTender = async (id) => {
    const res = await fetch(`${API_URL}/tenders/${id}`);
    return res.json();
};

export const createTender = async (data) => {
    const res = await fetch(`${API_URL}/tenders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const updateTender = async (id, data) => {
    const res = await fetch(`${API_URL}/tenders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const deleteTender = async (id) => {
    const res = await fetch(`${API_URL}/tenders/${id}`, {
        method: "DELETE",
    });
    return res.json();
};

export const createCategory = async (data) => {
    const res = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const updateCategory = async (id, data) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const deleteCategory = async (id) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
    }
    return res.json();
};

export const createTerm = async (data) => {
    const res = await fetch(`${API_URL}/terms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const updateTerm = async (id, data) => {
    const res = await fetch(`${API_URL}/terms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const deleteTerm = async (id) => {
    const res = await fetch(`${API_URL}/terms/${id}`, {
        method: "DELETE",
    });
    return res.json();
};

export const saveDocument = async (data) => {
    const res = await fetch(`${API_URL}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const fetchDocuments = async (tenderId) => {
    const res = await fetch(`${API_URL}/tenders/${tenderId}/documents`);
    return res.json();
};

export const fetchSavedDocument = async (id) => {
    const res = await fetch(`${API_URL}/documents/${id}`);
    if (!res.ok) throw new Error("Document not found");
    return res.json();
};

export const deleteDocument = async (id) => {
    const res = await fetch(`${API_URL}/documents/${id}`, {
        method: "DELETE",
    });
    return res.json();
};
