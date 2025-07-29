import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Phone, Mail, Users, Fuel, Edit, MoreHorizontal, X } from 'lucide-react';
import { Select, Input } from 'antd';
import apiService from '../services/api';

const { Option } = Select;

const defaultOperationalHours = {
  monday: "06:00-22:00",
  tuesday: "06:00-22:00",
  wednesday: "06:00-22:00",
  thursday: "06:00-22:00",
  friday: "06:00-22:00",
  saturday: "06:00-22:00",
  sunday: "07:00-21:00"
};

interface Station {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'maintenance';
  manager?: {
    username: string;
  };
  tanks: Array<{
    id: string;
    tank_number: string;
    fuel_type: string;
    status: string;
  }>;
  employees: Array<{
    id: string;
    username: string;
  }>;
}

const Stations: React.FC = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await apiService.getStations();
        // Make sure response.data is an array
        if (response && Array.isArray(response.data)) {
          setStations(response.data);
        } else {
          setStations([]); // fallback to empty array
        }
      } catch (error) {
        setStations([]); // fallback to empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const AddStationForm = ({ onSuccess, onCancel }) => {
    const [form, setForm] = useState({
      name: '',
      code: '',
      taxpayerId: '',
      wardId: '',
      address: '',
      ewuraLicenseNo: ''
    });
    const [taxpayers, setTaxpayers] = useState([]);
    const [wards, setWards] = useState([]);
    const [wardDistrictMap, setWardDistrictMap] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      apiService.getTaxpayers().then(res => setTaxpayers(Array.isArray(res.data) ? res.data : []));
      apiService.getWards().then(res => {
        const wardList = Array.isArray(res.data) ? res.data : [];
        setWards(wardList);
        const map = {};
        wardList.forEach(w => { map[w.id] = w.district?.name || ''; });
        setWardDistrictMap(map);
      });
    }, []);

    const handleWardChange = (wardId) => {
      const ward = wards.find(w => w.id === wardId);
      const district = wardDistrictMap[wardId] || '';
      setForm(f => ({
        ...f,
        wardId,
        address: `${ward?.name || ''} Ward${district ? ', ' + district : ''}`
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        await apiService.createStation({
          code: form.code,
          name: form.name,
          taxpayerId: form.taxpayerId,
          wardId: form.wardId,
          address: form.address,
          ewuraLicenseNo: form.ewuraLicenseNo,
          operationalHours: defaultOperationalHours
        });
        setForm({
          name: '',
          code: '',
          taxpayerId: '',
          wardId: '',
          address: '',
          ewuraLicenseNo: ''
        });
        onSuccess();
      } catch {
        alert('Failed to add station');
      }
      setLoading(false);
    };

    return (
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          className="w-full"
          placeholder="Station Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <Input
          className="w-full"
          placeholder="Station Code"
          value={form.code}
          onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
          required
        />
        <Select
          className="w-full"
          placeholder="Select Taxpayer"
          value={form.taxpayerId || undefined}
          onChange={taxpayerId => setForm(f => ({ ...f, taxpayerId }))}
          showSearch
          filterOption={(input, option) =>
            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
          }
          required
        >
          {taxpayers.map(t => (
            <Option key={t.id} value={t.id}>{t.name} ({t.tin})</Option>
          ))}
        </Select>
        <Select
          className="w-full"
          placeholder="Select Ward"
          value={form.wardId || undefined}
          onChange={handleWardChange}
          showSearch
          filterOption={(input, option) =>
            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
          }
          required
        >
          {wards.map(w => (
            <Option key={w.id} value={w.id}>{w.name} ({w.district?.name || ''})</Option>
          ))}
        </Select>
        <Input
          className="w-full"
          placeholder="Address"
          value={form.address}
          disabled
          required
        />
        <Input
          className="w-full"
          placeholder="EWURA License No"
          value={form.ewuraLicenseNo}
          onChange={e => setForm(f => ({ ...f, ewuraLicenseNo: e.target.value }))}
          required
        />
        <div className="flex justify-end mt-4 space-x-2">
          <button
            type="button"
            className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Stations</h1>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Add Station</span>
        </button>
      </div>

      {/* Add Station Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Add Station</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <AddStationForm
              onSuccess={async () => {
                setShowAddModal(false);
                // Refresh stations list
                const response = await apiService.getStations();
                setStations(Array.isArray(response.data) ? response.data : []);
              }}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(stations) && stations.map((station) => (
          <div
            key={station.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedStation(station)}
          >
            <div className="p-6">
              {/* Station Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">{station.name}</h3>
                    <p className="text-sm text-gray-600">Code: {station.code}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(station.status)}`}>
                    {station.status.toUpperCase()}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Station Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{station.address}, {station.city}, {station.state} {station.zip_code}</span>
                </div>
                {station.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{station.phone}</span>
                  </div>
                )}
                {station.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{station.email}</span>
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                    <Fuel className="w-4 h-4" />
                    <span>Tanks</span>
                  </div>
                  <div className="text-lg font-semibold text-black">{station.tanks.length}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Staff</span>
                  </div>
                  <div className="text-lg font-semibold text-black">{station.employees.length}</div>
                </div>
              </div>

              {/* Manager */}
              {station.manager && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">Manager</div>
                  <div className="font-medium text-black">{station.manager.username}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Station Details Modal */}
      {selectedStation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black">{selectedStation.name} Details</h2>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center space-x-1">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setSelectedStation(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-black mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Station Code:</span>
                      <span className="font-medium text-black">{selectedStation.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedStation.status)}`}>
                        {selectedStation.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Manager:</span>
                      <span className="font-medium text-black">
                        {selectedStation.manager?.username || 'Not assigned'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-black mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <div className="font-medium text-black">
                        {selectedStation.address}<br />
                        {selectedStation.city}, {selectedStation.state} {selectedStation.zip_code}
                      </div>
                    </div>
                    {selectedStation.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium text-black">{selectedStation.phone}</span>
                      </div>
                    )}
                    {selectedStation.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-black">{selectedStation.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tanks and Staff */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-black mb-4">Tanks ({selectedStation.tanks.length})</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedStation.tanks.map((tank) => (
                      <div key={tank.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium text-black">Tank {tank.tank_number}</span>
                          <span className="text-sm text-gray-600 ml-2 capitalize">({tank.fuel_type})</span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tank.status)}`}>
                          {tank.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-black mb-4">Staff ({selectedStation.employees.length})</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedStation.employees.map((employee) => (
                      <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="font-medium text-black">{employee.username}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setSelectedStation(null)}
                className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stations;