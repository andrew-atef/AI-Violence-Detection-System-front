// src/utils/api.js

const BASE_URL = 'http://127.0.0.1:8000/api'; // Using relative path for Vercel proxy

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorBody;
        try {
            errorBody = await response.json();
        } catch (e) {
            errorBody = { message: response.statusText };
        }
        const error = new Error(errorBody.message || 'An error occurred');
        error.response = response;
        error.body = errorBody;
        throw error;
    }
    return response.json();
};

export const loginUser = (credentials) => {
    return fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
    }).then(handleResponse);
};

export const registerUser = (userData) => {
    return fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
    }).then(handleResponse);
};

export const getAuthenticatedUser = () => {
    return fetch(`${BASE_URL}/auth/user`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);
};

export const getViolenceNotifications = (page = 1) => {
    return fetch(`${BASE_URL}/violence-notifications?page=${page}`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);
};

export const getViolenceNotificationById = (id) => {
    return fetch(`${BASE_URL}/violence-notifications/${id}`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);
};

export const getCameras = () => {
    return fetch(`${BASE_URL}/cameras`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);
};

export const createCamera = (cameraData) => {
    return fetch(`${BASE_URL}/cameras`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(cameraData),
    }).then(handleResponse);
};

export const updateCamera = (id, cameraData) => {
    return fetch(`${BASE_URL}/cameras/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(cameraData),
    }).then(handleResponse);
};

export const deleteCamera = (id) => {
    return fetch(`${BASE_URL}/cameras/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    }).then(response => {
        if (!response.ok) throw new Error('Failed to delete camera');
        // DELETE might not return a body, so we don't call .json()
        return { success: true };
    });
};

export const assignCameraToUser = (cameraId, userId) => {
    return fetch(`${BASE_URL}/cameras/${cameraId}/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId }),
    }).then(handleResponse);
};

// NOTE: No /api/users endpoint was provided in the spec.
// This function is included assuming one exists, as it's needed by UsersTable and CamerasView.
// If it doesn't exist, this part will fail.
export const getUsers = () => {
    return fetch(`http://127.0.0.1:8000/api/users`, { // Assuming an endpoint like this exists
        headers: getAuthHeaders()
    }).then(handleResponse);
};