const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.token = response.token;
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Removed duplicate changePassword method for /auth/change-password endpoint

  async updateProfile(username: string, email: string) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ username, email }),
    });
  }

  // Users methods
  async getUsers(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/users${query}`);
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  // Roles methods
  async getRoles() {
    return this.request('/roles');
  }

  async getRole(id: string) {
    return this.request(`/roles/${id}`);
  }

  async createRole(roleData: any) {
    return this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async updateRole(id: string, roleData: any) {
    return this.request(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  async deleteRole(id: string) {
    return this.request(`/roles/${id}`, { method: 'DELETE' });
  }

  // Backup methods
  async createBackup() {
    return this.request('/backup/create', { method: 'POST' });
  }

  async getBackups() {
    return this.request('/backup/list');
  }

  async downloadBackup(filename: string) {
    const response = await fetch(`${API_BASE_URL}/backup/download/${filename}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    return response.blob();
  }

  async deleteBackup(filename: string) {
    return this.request(`/backup/${filename}`, { method: 'DELETE' });
  }
  // Users methods
  // Taxpayers methods
  async getTaxpayers(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/taxpayers${query}`);
  }

  async createTaxpayer(taxpayerData: any) {
    return this.request('/taxpayers', {
      method: 'POST',
      body: JSON.stringify(taxpayerData),
    });
  }

  async updateTaxpayer(id: string, taxpayerData: any) {
    return this.request(`/taxpayers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taxpayerData),
    });
  }

  async deleteTaxpayer(id: string) {
    return this.request(`/taxpayers/${id}`, { method: 'DELETE' });
  }

  // Transactions methods
  async getTransactions(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/transactions${query}`);
  }

  async createTransaction(transactionData: any) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async updateTransactionStatus(id: string, status: string) {
    return this.request(`/transactions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Tanks methods
  async getTanks(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/tanks${query}`);
  }

  async getTank(id: string) {
    return this.request(`/tanks/${id}`);
  }

  async createTank(tankData: any) {
    return this.request('/tanks', {
      method: 'POST',
      body: JSON.stringify(tankData),
    });
  }

  async updateTank(id: string, tankData: any) {
    return this.request(`/tanks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tankData),
    });
  }

  async deleteTank(id: string) {
    return this.request(`/tanks/${id}`, { method: 'DELETE' });
  }

  async updateTankSensorData(id: string, sensorData: any) {
    return this.request(`/tanks/${id}/sensor-data`, {
      method: 'POST',
      body: JSON.stringify(sensorData),
    });
  }

  // Alerts methods
  async getAlerts(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/alerts${query}`);
  }

  async createAlert(alertData: any) {
    return this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async acknowledgeAlert(id: string) {
    return this.request(`/alerts/${id}/acknowledge`, { method: 'POST' });
  }

  async resolveAlert(id: string) {
    return this.request(`/alerts/${id}/resolve`, { method: 'POST' });
  }

  // Maintenance methods
  async getMaintenance(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/maintenance${query}`);
  }

  async createMaintenance(maintenanceData: any) {
    return this.request('/maintenance', {
      method: 'POST',
      body: JSON.stringify(maintenanceData),
    });
  }

  async updateMaintenance(id: string, maintenanceData: any) {
    return this.request(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(maintenanceData),
    });
  }

  // Stations methods
  async getStations() {
    return this.request('/stations');
  }

  async getStation(id: string) {
    return this.request(`/stations/${id}`);
  }

  async createStation(stationData: any) {
    return this.request('/stations', {
      method: 'POST',
      body: JSON.stringify(stationData),
    });
  }

  async updateStation(id: string, stationData: any) {
    return this.request(`/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stationData),
    });
  }

  async deleteStation(id: string) {
    return this.request(`/stations/${id}`, { method: 'DELETE' });
  }
  // Reports methods
  async getDashboardStats(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/reports/dashboard${query}`);
  }

  async getTankMonitoringReport(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/reports/tank-monitoring${query}`);
  }

  async getAlertsReport(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/reports/alerts${query}`);
  }

  async getMaintenanceReport(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/reports/maintenance${query}`);
  }

  // Settings methods
  async getProfile() {
    return this.request('/settings/profile');
  }

  async updateProfile(profileData: any) {
    return this.request('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/settings/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getSystemSettings() {
    return this.request('/settings/system');
  }

  async updateSystemSettings(settings: any) {
    return this.request('/settings/system', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getNotificationSettings() {
    return this.request('/settings/notifications');
  }

  async updateNotificationSettings(settings: any) {
    return this.request('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export default new ApiService();