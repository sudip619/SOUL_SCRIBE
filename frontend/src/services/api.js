// frontend/src/services/api.js

const API_BASE_URL = 'http://127.0.0.1:5000/api'; // Ensure this matches your Flask backend's port

export async function makeAuthenticatedRequest(url, method = 'GET', data = null) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    alert('You are not logged in.');
    // In a real app, you'd trigger a logout action here (e.g., redirect to login)
    throw new Error('No authentication token found.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const config = {
    method: method,
    headers: headers
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, config); // Prepend API_BASE_URL here

  if (response.status === 401 || response.status === 403) {
    const errorData = await response.json();
    alert(errorData.message || 'Session expired or unauthorized. Please log in again.');
    // In a real app, you'd typically clear localStorage token and redirect to login
    throw new Error('Unauthorized or session expired.');
  }
  return response;
}