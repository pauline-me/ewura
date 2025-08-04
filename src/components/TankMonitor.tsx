import React, { useState, useEffect } from 'react';
import { Fuel, Thermometer, Droplets, Activity, AlertTriangle, Play, Pause, RefreshCw } from 'lucide-react';
import apiService from '../services/api';
import { io, Socket } from 'socket.io-client';

interface Tank {
  id: string;
  tank_number: string;
  name: string;
  fuel_type: string;
  capacity: number;
  current_volume: number;
  water_level: number;
  temperature: number;
  pressure: number;
  status: string;
  station: {
    name: string;
  };
}

const WS_URL = 'http://192.168.1.104:3001';

const TankMonitor: React.FC = () => {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null);
  const [atgStatus, setAtgStatus] = useState<string>('unknown');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    fetchTanks();
    fetchATGStatus();

    // Setup polling
    const interval = setInterval(fetchTanks, 30000);
    return () => clearInterval(interval);
  }, []);

  // Setup WebSocket for live tank data
  useEffect(() => {
    const s = io(WS_URL, {
      auth: { token: localStorage.getItem('token') },
    });
    setSocket(s);

    s.on('tankData', (data: any) => {
      // If data is an object with numeric keys, convert to array
      const tanksArray = Array.isArray(data) ? data : Object.values(data);

      setTanks(
        tanksArray.map((tank: any) => ({
          id: tank.tankNumber || tank.tank_number || tank.id,
          tank_number: tank.tankNumber || tank.tank_number,
          name: tank.name || `Tank ${tank.tankNumber || tank.tank_number}`,
          fuel_type: tank.fuel_type || tank.fuelType || 'unknown',
          capacity: Number(tank.totalVolume || tank.total_volume || tank.capacity || 0),
          current_volume: Number(tank.oilVolume || tank.oil_volume || tank.current_volume || 0),
          water_level: Number(tank.waterHeight || tank.water_height || tank.water_level || 0),
          temperature: Number(tank.temperature || 0),
          pressure: Number(tank.pressure || 0),
          status: tank.status || 'unknown',
          station: {
            name: tank.stationName || tank.station_name || 'Unknown',
          },
        }))
      );
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const fetchTanks = async () => {
    try {
      const data = await apiService.getTanks();
      // Convert object with numeric keys to array if needed
      const tanksArray = Array.isArray(data) ? data : Object.values(data);
      const formattedData = tanksArray.map((tank: any) => ({
        ...tank,
        current_volume: Number(tank.oilVolume || tank.oil_volume || tank.current_volume || 0),
        capacity: Number(tank.totalVolume || tank.total_volume || tank.capacity || 0),
        water_level: Number(tank.waterHeight || tank.water_height || tank.water_level || 0),
        temperature: Number(tank.temperature || 0),
        pressure: Number(tank.pressure || 0),
        id: tank.tankNumber || tank.tank_number || tank.id,
        tank_number: tank.tankNumber || tank.tank_number,
        name: tank.name || `Tank ${tank.tankNumber || tank.tank_number}`,
        fuel_type: tank.fuel_type || tank.fuelType || 'unknown',
        status: tank.status || 'unknown',
        station: {
          name: tank.stationName || tank.station_name || 'Unknown',
        },
      }));
      setTanks(formattedData);
    } catch (error) {
      console.error('Error fetching tanks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchATGStatus = async () => {
    try {
      const res = await apiService.getATGStatus();
      setAtgStatus(res.status || 'unknown');
    } catch {
      setAtgStatus('unknown');
    }
  };

  const handleStartATG = async () => {
    await apiService.startATGMonitoring();
    fetchATGStatus();
  };

  const handleStopATG = async () => {
    await apiService.stopATGMonitoring();
    fetchATGStatus();
  };

  const handleRefreshCurrentData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCurrentTankData();
      const tanksArray = Array.isArray(data) ? data : Object.values(data);
      setTanks(
        tanksArray.map((tank: any) => ({
          ...tank,
          current_volume: Number(tank.oilVolume || tank.oil_volume || tank.current_volume || 0),
          capacity: Number(tank.totalVolume || tank.total_volume || tank.capacity || 0),
          water_level: Number(tank.waterHeight || tank.water_height || tank.water_level || 0),
          temperature: Number(tank.temperature || 0),
          pressure: Number(tank.pressure || 0),
          id: tank.tankNumber || tank.tank_number || tank.id,
          tank_number: tank.tankNumber || tank.tank_number,
          name: tank.name || `Tank ${tank.tankNumber || tank.tank_number}`,
          fuel_type: tank.fuel_type || tank.fuelType || 'unknown',
          status: tank.status || 'unknown',
          station: {
            name: tank.stationName || tank.station_name || 'Unknown',
          },
        }))
      );
    } catch (error) {
      console.error('Error fetching current tank data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFillPercentage = (tank: Tank) => {
    return ((tank.current_volume / tank.capacity) * 100).toFixed(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'empty': return 'text-red-600 bg-red-100';
      case 'full': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getFuelTypeColor = (fuelType: string) => {
    switch (fuelType) {
      case 'regular': return 'bg-green-500';
      case 'premium': return 'bg-blue-500';
      case 'diesel': return 'bg-yellow-500';
      case 'super': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
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
        <h1 className="text-2xl font-bold text-black">Tank Monitor</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Activity className="w-4 h-4" />
          <span>Real-time monitoring</span>
        </div>
      </div>

      {/* ATG Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={handleStartATG}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Play className="w-4 h-4 mr-2" /> Start ATG
        </button>
        <button
          onClick={handleStopATG}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          <Pause className="w-4 h-4 mr-2" /> Stop ATG
        </button>
        <button
          onClick={handleRefreshCurrentData}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
        </button>
        <span className="ml-4 text-sm">
          <b>ATG Status:</b> <span className="uppercase">{atgStatus}</span>
        </span>
      </div>

      {/* Tank Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tanks.map((tank) => {
          const fillPercentage = parseFloat(getFillPercentage(tank));
          const isLowLevel = fillPercentage < 20;
          const isHighWater = tank.water_level > 50;

          return (
            <div
              key={tank.id}
              className={`bg-white rounded-lg shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
                selectedTank?.id === tank.id ? 'border-red-600' : 'border-gray-200'
              }`}
              onClick={() => setSelectedTank(tank)}
            >
              <div className="p-6">
                {/* Tank Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFuelTypeColor(tank.fuel_type)}`}>
                      <Fuel className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-black">Tank {tank.tank_number}</div>
                      <div className="text-sm text-gray-600 capitalize">{tank.fuel_type}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tank.status)}`}>
                      {tank.status.toUpperCase()}
                    </span>
                    {(isLowLevel || isHighWater) && (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>

                {/* Fuel Level */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Fuel Level</span>
                    <span className={`font-medium ${isLowLevel ? 'text-red-600' : 'text-black'}`}>
                      {fillPercentage}%
                    </span>
                  </div>
                  <div className="relative w-40 h-32 mx-auto border-2 border-gray-300 rounded-lg overflow-hidden">
                    {/* Tank Fill */}
                    <div 
                      className={`absolute bottom-0 w-full transition-all duration-500 ${
                        isLowLevel ? 'bg-red-600' : fillPercentage > 80 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ height: `${fillPercentage}%` }}
                    ></div>
                    {/* Level Lines */}
                    <div className="absolute w-full h-full flex flex-col justify-between py-1">
                      <div className="w-full border-t border-gray-300"></div>
                      <div className="w-full border-t border-gray-300"></div>
                      <div className="w-full border-t border-gray-300"></div>
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    
                    {/* Volume Display */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-white drop-shadow-md">
                        {tank.current_volume?.toFixed(0) || '0'}L
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0L</span>
                    <span>{tank.capacity?.toFixed(0) || '0'}L</span>
                  </div>
                </div>

                {/* Sensor Data */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Temperature</span>
                    </div>
                    <span className="text-sm font-medium text-black">
                      {tank.temperature ? `${tank.temperature.toFixed(1)}°C` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Droplets className={`w-4 h-4 ${isHighWater ? 'text-red-500' : 'text-blue-500'}`} />
                      <span className="text-sm text-gray-600">Water Level</span>
                    </div>
                    <span className={`text-sm font-medium ${isHighWater ? 'text-red-600' : 'text-black'}`}>
                      {tank.water_level ? `${tank.water_level.toFixed(1)}mm` : '0mm'}
                    </span>
                  </div>

                  {tank.pressure && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600">Pressure</span>
                      </div>
                      <span className="text-sm font-medium text-black">
                        {tank.pressure?.toFixed(1) || '0'} PSI
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tank Details Modal */}
      {selectedTank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black">
                Tank {selectedTank.tank_number} Details
              </h2>
              <button
                onClick={() => setSelectedTank(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-black">Basic Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tank Number:</span>
                    <span className="font-medium text-black">{selectedTank.tank_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-black">{selectedTank.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fuel Type:</span>
                    <span className="font-medium text-black capitalize">{selectedTank.fuel_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTank.status)}`}>
                      {selectedTank.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Capacity Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-black">Capacity Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Capacity:</span>
                    <span className="font-medium text-black">{selectedTank.capacity?.toFixed(0) || '0'}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Volume:</span>
                    <span className="font-medium text-black">{selectedTank.current_volume?.toFixed(0) || '0'}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fill Percentage:</span>
                    <span className="font-medium text-black">{getFillPercentage(selectedTank)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Space:</span>
                    <span className="font-medium text-black">
                      {((selectedTank.capacity || 0) - (selectedTank.current_volume || 0)).toFixed(0)}L
                    </span>
                  </div>
                </div>
              </div>

              {/* Sensor Readings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-black">Sensor Readings</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temperature:</span>
                    <span className="font-medium text-black">
                      {selectedTank.temperature ? `${selectedTank.temperature.toFixed(1)}°C` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Water Level:</span>
                    <span className={`font-medium ${(selectedTank.water_level || 0) > 50 ? 'text-red-600' : 'text-black'}`}>
                      {selectedTank.water_level ? `${selectedTank.water_level.toFixed(1)}mm` : '0mm'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pressure:</span>
                    <span className="font-medium text-black">
                      {selectedTank.pressure ? `${selectedTank.pressure.toFixed(1)} PSI` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Station Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-black">Station Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Station:</span>
                    <span className="font-medium text-black">{selectedTank.station.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedTank(null)}
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

export default TankMonitor;