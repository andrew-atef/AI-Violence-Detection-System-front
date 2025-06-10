const BASE_URL = 'http://127.0.0.1:8000/api'; // Uses the proxy defined in vercel.json

/**
 * A centralized API fetch function.
 * @param {string} url - The endpoint URL (e.g., '/users').
 * @param {object} options - The options for the fetch call (method, body, etc.).
 * @returns {Promise<any>} - The JSON response from the API.
 */
const api = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Accept': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // The browser sets the 'Content-Type' for FormData automatically, including the boundary.
    // Manually setting it will break the request.
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${BASE_URL}${url}`, config);

        if (!response.ok) {
            // Try to parse error message from the server, otherwise use status text
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `API error: ${response.status}`);
        }

        // Handle successful but no-content responses (e.g., DELETE)
        if (response.status === 204) {
            return null;
        }

        return response.json();
    } catch (error) {
        console.error(`API call to ${url} failed:`, error);
        throw error; // Re-throw the error to be handled by the component
    }
};

export default api;