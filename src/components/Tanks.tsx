import React, { useState } from 'react';
import { Search, Plus, Edit, MoreHorizontal, X } from 'lucide-react';

interface Tank {
  id: number;
  tankNo: string;
  description: string;
  product: string;
  capacity: number;
  waterHeight: number;
  fuelTemperature: number;
}

const Tanks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTank, setNewTank] = useState({
    tankNo: '',
    description: '',
    maxVolume: '',
    product: ''
  });

  const tanks: Tank[] = [
    {
      id: 1,
      tankNo: '4',
      description: 'Tank 4',
      product: 'Diesel',
      capacity: 100,
      waterHeight: 0,
      fuelTemperature: 0
    },
    {
      id: 2,
      tankNo: '3',
      description: 'Tank 3',
      product: 'Premium',
      capacity: 100,
      waterHeight: 0,
      fuelTemperature: 0
    },
    {
      id: 3,
      tankNo: '2',
      description: 'Tank 2',
      product: 'ULEADED',
      capacity: 100,
      waterHeight: 51.54,
      fuelTemperature: 25.19
    },
    {
      id: 4,
      tankNo: '1',
      description: 'Tank 1',
      product: 'DIESEL',
      capacity: 100,
      waterHeight: 46.77,
      fuelTemperature: 26.31
    }
  ];

  const filteredTanks = tanks.filter(tank => {
    return tank.tankNo.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAddTank = () => {
    // Handle tank addition logic here
    console.log('Adding tank:', newTank);
    setShowAddModal(false);
    setNewTank({ tankNo: '', description: '', maxVolume: '', product: '' });
    setEditingTank(tank);
    setNewTank({
      tankNo: tank.tankNo,
      description: tank.description,
      maxVolume: tank.capacity.toString(),
      product: tank.product
    });
    setShowAddModal(true);
    if (window.confirm('Are you sure you want to delete this tank?')) {
      // Implement delete functionality
      console.log('Deleting tank:', id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tank Management</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Please enter tank number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tank Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S/N
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tank No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity (L)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Water Height (mm)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel Temperature (°C)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTanks.map((tank, index) => (
                <tr key={tank.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tank.tankNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tank.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tank.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tank.capacity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tank.waterHeight}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tank.fuelTemperature}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditTank(tank)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteTank(tank.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Total: {filteredTanks.length} records
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">15/page</span>
            <div className="flex items-center space-x-1">
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                1
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                Go to
              </button>
              <input
                type="number"
                className="w-12 px-2 py-1 border border-gray-300 rounded text-sm"
                min="1"
                defaultValue="1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Tank Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Tank</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-500">*</span> Tank No.
                </label>
                <input
                  type="text"
                  value={newTank.tankNo}
                  onChange={(e) => setNewTank({ ...newTank, tankNo: e.target.value })}
                  placeholder="Please enter tank number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-red-500 text-sm mt-1">Please enter tank number</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newTank.description}
                  onChange={(e) => setNewTank({ ...newTank, description: e.target.value })}
                  placeholder="Please enter tank description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-500">*</span> Maximum Volume (L)
                </label>
                <input
                  type="number"
                  value={newTank.maxVolume}
                  onChange={(e) => setNewTank({ ...newTank, maxVolume: e.target.value })}
                  placeholder="Please enter the volume (L)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-500">*</span> Product
                </label>
                <select
                  value={newTank.product}
                  onChange={(e) => setNewTank({ ...newTank, product: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Please choose the product</option>
                  <option value="ULEADED">UNLEADED</option>
                  <option value="Diesel">Diesel</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTank}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tanks;