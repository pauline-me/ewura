import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Update the validation function
const validateDeviceSerial = (serial: string): string[] => {
  const errors = [];
  if (!serial) {
    errors.push("Device serial is required");
    return errors;
  }

  // Update regex validation for new format: ADV-ADMIN-001
  const serialFormat = /^ADV-[A-Z]+-\d{3}$/;
  if (!serialFormat.test(serial)) {
    errors.push("Device serial must be in format: ADV-ADMIN-001");
  }
  return errors;
};

const Login: React.FC = () => {
  const [deviceSerial, setDeviceSerial] = useState('');
  const [deviceSerialErrors, setDeviceSerialErrors] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  // Update the onChange handler
  const handleDeviceSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDeviceSerial(value);
    setDeviceSerialErrors(validateDeviceSerial(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateDeviceSerial(deviceSerial);
    if (errors.length > 0) {
      setDeviceSerialErrors(errors);
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const success = await login(deviceSerial, password);
      if (!success) {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Gas Station Image */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300">
          <img 
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhIkX-A4pe12p-ujdHLQMNTBsN4KhGiGNyjobxy8Uj2GO6irIlO6LnUfOdclQvVhTl2kCLh3Q083yE0V5Uh5yLxJdtBx2EF1Q7KyOSiE_mDkN5u2FyQinRfqtU91WRgPcgShzKUg07SXkgM70nzOs7rnSicQvE3mMN2ui4oglw7C1a4J7PDLBervAGsaV4/w640-h360/IMG-20231223-WA0030.jp"
            alt="Gas Station" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          {/* Overlay text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 py-10 z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg text-center">EWURA NPGIS</h2>
            <p className="text-lg md:text-xl text-white mb-4 drop-shadow-lg text-center">
              Professional monitoring and management solution for modern gas stations
            </p>
            <ul className="text-white text-base md:text-lg space-y-1 list-disc pl-5 drop-shadow-lg text-left">
              <li>Real-time tank monitoring</li>
              <li>Advanced analytics &amp; reporting</li>
              <li>Multi-interface support (Console &amp; PTS)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Sign in</h1>
            <p className="text-gray-600">Welcome to the Smart Gas Station System</p>
          </div>

          {/* Language Selector */}
          <div className="flex justify-end mb-6">
         
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="device_serial" className="block text-sm font-medium text-black mb-2">
                Device Serial
              </label>
              <input
                type="text"
                id="device_serial"
                value={deviceSerial}
                onChange={handleDeviceSerialChange}
                placeholder="Enter device serial (e.g. ADV-ADMIN-001)"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                  deviceSerialErrors.length > 0 ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {deviceSerialErrors.length > 0 && (
                <div className="mt-1 space-y-1">
                  {deviceSerialErrors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600">
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Please enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Demo credentials: Email: admin@eaglestar.com, Password: admin123
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;