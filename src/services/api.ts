const API_BASE_URL = 'http://192.168.1.104:3001/api';

class ApiService {
  private token: string | null = null;
  private baseUrl = 'http://192.168.1.10:3001/api';

  constructor() {
    // Get token on initialization
    this.token = localStorage.getItem('token');
  }

  // Add method to update token
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token && !endpoint.includes('/auth/login')) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(deviceSerial: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ deviceSerial, password }),
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async logout() {
    this.setToken(null);
    localStorage.removeItem('user');
  }

  // async updateProfile(username: string, deviceSerial: string) {
  //   return this.request('/auth/profile', {
  //     method: 'PUT',
  //     body: JSON.stringify({ username, deviceSerial }),
  //   });
  // }

  // Users methods
  async getUsers(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/users${query}`);
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData: any) {
    return this.request('/auth/register', {
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

  async setTaxpayerActiveStatus(id: string, isActive: boolean) {
    return this.request(`/taxpayers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  async getBusinessTypes() {
    return this.request('/taxpayers/business-types');
  }

  async getCountries() {
    return this.request("/locations/countries");
  }
  async getRegions() { return this.request("/locations/regions"); }
  async getDistricts(params?: any) { return this.request(`/locations/districts${params?.regionId ? '?regionId=' + params.regionId : ''}`); }
  async getWards(params?: any) { return this.request(`/locations/wards${params?.districtId ? '?districtId=' + params.districtId : ''}`); }
  async getStreets(params?: any) {
    // Supports: GET /api/locations/streets and GET /api/locations/streets?wardId=...
    const query = params?.wardId ? `?wardId=${params.wardId}` : '';
    return this.request(`/locations/streets${query}`);
  }

  async searchTaxpayers(query: string) {
    return this.request(`/taxpayers/search?query=${encodeURIComponent(query)}`);
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
    // Only send allowed fields
    const {
      code,
      name,
      taxpayerId,
      streetId,
      address,
      ewuraLicenseNo,
    } = stationData;

    return this.request('/stations', {
      method: 'POST',
      body: JSON.stringify({
        code,
        name,
        taxpayerId,
        streetId,
        address,
        ewuraLicenseNo,
      }),
    });
  }

  async updateStation(id: string, stationData: any) {
    // Only send allowed fields
    const {
      code,
      name,
      taxpayerId,
      streetId,
      address,
      ewuraLicenseNo,
    } = stationData;

    return this.request(`/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        code,
        name,
        taxpayerId,
        streetId,
        address,
        ewuraLicenseNo,
      }),
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
    return this.request('/auth/change-password', {
      method: 'POST', // <-- Change to POST if backend expects POST
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

  async createRegion(data: any) {
    return this.request("/locations/regions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateRegion(id: string, data: any) {
    return this.request(`/locations/regions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async createDistrict(data: any) {
    return this.request("/locations/districts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateDistrict(id: string, data: any) {
    return this.request(`/locations/districts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async createWard(data: any) {
    return this.request("/locations/wards", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateWard(id: string, data: any) {
    return this.request(`/locations/wards/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async registerWithManager(managerId: string, data: { tranId: string; brandName: string; receiptCode: string }) {
    return this.request(`/ewura/register-with-manager/${managerId}`, {
      method: "POST",
      body: JSON.stringify({
        tranId: data.tranId,
        brandName: data.brandName,
        receiptCode: data.receiptCode,
      }),
    });
  }

  async getManagers() {
    return this.request('/users/managers');
  }

  async getEwuraRegistrationData(managerId: string) {
    return this.request(`/ewura/registration-data/${managerId}`);
  }

  
  async getStreet(id: string) {
    // Supports: GET /api/locations/streets/{id}
    return this.request(`/locations/streets/${id}`);
  }

  async createStreet(streetData: { code: string; name: string; wardId: string }) {
    // Supports: POST /api/locations/streets
    return this.request('/locations/streets', {
      method: 'POST',
      body: JSON.stringify(streetData),
    });
  }

  async updateStreet(id: string, streetData: { name?: string; code?: string; wardId?: string }) {
    // Supports: PUT /api/locations/streets/{id}
    return this.request(`/locations/streets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(streetData),
    });
  }

  // ATG Tank Monitoring Methods

  async startATGMonitoring() {
    return this.request('/tanks/atg/start', {
      method: 'POST',
    });
  }

  async stopATGMonitoring() {
    return this.request('/tanks/atg/stop', {
      method: 'POST',
    });
  }

  async getATGStatus() {
    return this.request('/tanks/atg/status');
  }

  async getCurrentTankData() {
    return this.request('/tanks/current/data');
  }

  // Get today's daily summary
  async getTanksDailySummary() {
    return this.request('/tanks/daily-summary');
  }

  // Get hourly readings for today
  async getTanksHourlyReadings() {
    return this.request('/tanks/hourly-readings');
  }

  // Get specific tank readings for date range
  async getTankReadingsForPeriod(tankId: string, startDate: string, endDate: string) {
    return this.request(`/tanks/${tankId}/readings/period?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
  }

  // Products methods
  async getProducts(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/products${query}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, { method: 'DELETE' });
  }

  async getProductsWithTanks() {
    return this.request('/products/with-tanks');
  }

  // Tank assignment (assign/unassign product to tank)
  async assignProductToTank(tankId: string, productId: string, tankName?: string) {
    // Use product_id as per backend
    return this.request(`/tanks/${tankId}`, {
      method: 'PUT',
      body: JSON.stringify({
        product_id: productId,
        ...(tankName ? { tank_name: tankName } : {}),
      }),
    });
  }

  async unassignProductFromTank(tankId: string) {
    return this.request(`/tanks/${tankId}`, {
      method: 'PUT',
      body: JSON.stringify({ product_id: null }),
    });
  }
}

export default new ApiService();

