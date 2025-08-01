import React, { useEffect, useState } from "react";
import apiService from "../services/api";
import { Plus, X, Search as SearchIcon, Pencil } from "lucide-react";

interface Taxpayer {
  id?: string;
  tin: string;
  vrn: string;
  businessName: string;
  tradeName: string;
  businessType: string;
  regionId: string;
  districtId: string;
  wardId: string;
  address: string;
  phone: string;
  email: string;
  streetId:string;
  isActive?: boolean; // <-- Add this line
}

interface Station {
  id?: string;
  code: string;
  name: string;
  taxpayerId: string;
  regionId: string;
  districtId: string;
  streetId?: string; // <-- use camelCase
  wardName?: string; // <-- use camelCase
  wardId: string;
  address: string;
  ewuraLicenseNo: string;
  operationalHours?: any; // Add as needed
  email?: string;
  isActive?: boolean;
}

export default function Stations() {
  const [taxpayers, setTaxpayers] = useState<Taxpayer[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Taxpayer | null>(null);
  const [form, setForm] = useState<Station>({
    code: "",
    name: "",
    taxpayerId: "",
    regionId: "",
    districtId: "",
    wardId: "",
    streetId: "", // <-- always include this
    address: "",
    ewuraLicenseNo: "",
    email: "",
  });
  const [regionSearch, setRegionSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");
  // Add a taxpayer search state
  const [taxpayerSearch, setTaxpayerSearch] = useState("");
  const [stations, setStations] = useState<Station[]>([]);
  const [streets, setStreets] = useState<any[]>([]);
  const [streetSearch, setStreetSearch] = useState("");

  // Fetch all data
  useEffect(() => {
    fetchStations();
    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchTaxpayers = async () => {
      const res = await apiService.getTaxpayers({ search: taxpayerSearch });
      setTaxpayers(res.data?.taxpayers || []);
    };
    fetchTaxpayers();
  }, [taxpayerSearch]);

  const fetchRegions = async () => {
    const res = await apiService.getRegions();
    setRegions(res.data?.regions || []);
  };

  const fetchDistricts = async (regionId: string) => {
    if (!regionId) {
      setDistricts([]);
      return;
    }
    const res = await apiService.getDistricts({ regionId });
    setDistricts(res.data?.districts || []);
  };

  const fetchWards = async (districtId: string) => {
    if (!districtId) {
      setWards([]);
      return;
    }
    const res = await apiService.getWards({ districtId });
    setWards(res.data?.wards || []);
  };

  const fetchStations = async () => {
    const res = await apiService.getStations();
    console.log("Fetched stations:", res.data);
    // Map snake_case to camelCase if needed
    const mapped = (res.data?.stations || res.data || []).map((s: any) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      taxpayerId: s.taxpayer_id, // use the actual taxpayer id, not name
      regionId: s.region_id,
      districtId: s.district_id,
      wardId: s.ward_id,
      streetId: s.street_id || "", // <-- add this
      wardName: s.ward_name,
      address: s.address,
      ewuraLicenseNo: s.ewura_license_no,
      operationalHours: s.operational_hours,
      email: s.email,
      isActive: s.is_active,
    }));
    setStations(mapped);
  };

  // Update address when region, district, or ward changes
  useEffect(() => {
    const region = regions.find(r => r.id === form.regionId)?.name || "";
    const district = districts.find(d => d.id === form.districtId)?.name || "";
    const ward = wards.find(w => w.id === form.wardId)?.name || "";
    const address = [ward, district, region].filter(Boolean).join(", ");
    setForm(f => ({ ...f, address }));
    // eslint-disable-next-line
  }, [form.regionId, form.districtId, form.wardId, regions, districts, wards]);

  // When region/district changes, fetch children
  useEffect(() => {
    if (form.regionId) fetchDistricts(form.regionId);
    else setDistricts([]);
    setForm(f => ({ ...f, districtId: "", wardId: "" }));
    // eslint-disable-next-line
  }, [form.regionId]);

  useEffect(() => {
    if (form.districtId) fetchWards(form.districtId);
    else setWards([]);
    setForm(f => ({ ...f, wardId: "" }));
    // eslint-disable-next-line
  }, [form.districtId]);

  // Fetch streets when ward changes
  useEffect(() => {
    if (form.wardId) {
      apiService.getStreets({ wardId: form.wardId }).then(res => {
        setStreets(res.data?.streets || []);
      });
    } else {
      setStreets([]);
    }
    setForm(f => ({ ...f, streetId: "" }));
    // eslint-disable-next-line
  }, [form.wardId]);

  const handleSearch = async () => {
    if (!search) {
      fetchStations();
      return;
    }
    const res = await apiService.searchTaxpayers(search);
    setTaxpayers(res.data?.taxpayers || []);
  };

  // Make search live
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line
  }, [search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openModal = (item?: Taxpayer | Station) => {
      setEditItem(item && "tin" in item ? item : null);
      if (item) {
        if ("tin" in item) {
          // Taxpayer
          setForm({
            code: "",
            name: item.businessName || "",
            taxpayerId: item.id || "",
            regionId: item.regionId || "",
            districtId: item.districtId || "",
            wardId: item.wardId || "",
            address: item.address || "",
            ewuraLicenseNo: "",
            email: item.email || "",
          });
        } else {
          // Station
          setForm({
            code: item.code || "",
            name: item.name || "",
            taxpayerId: item.taxpayerId || "",
            regionId: item.regionId || "",
            districtId: item.districtId || "",
            wardId: item.wardId || "",
            streetId: item.streetId || "", // <-- use snake_case here
            address: item.address || "",
            ewuraLicenseNo: item.ewuraLicenseNo || "",
            email: item.email || "",
          });
        }
      } else {
        setForm({
          code: "",
          name: "",
          taxpayerId: "",
          regionId: "",
          districtId: "",
          wardId: "",
          address: "",
          ewuraLicenseNo: "",
          email: "",
          streetId: "", // <-- add this
        });
      }
      setShowModal(true);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.streetId) {
      alert("Please select a valid street.");
      return;
    }
    const payload = {
      code: form.code,
      name: form.name,
      taxpayerId: form.taxpayerId,
      regionId: form.regionId,
      districtId: form.districtId,
      wardId: form.wardId,
      streetId: form.streetId, // <-- always send this
      address: form.address,
      ewuraLicenseNo: form.ewuraLicenseNo,
      email: form.email,
    };

 console.log("Submitting payload:", payload);
    if (editItem && editItem.id) {
      await apiService.updateStation(editItem.id, payload);
    } else {
      await apiService.createStation(payload);
    }
    setShowModal(false);
    setEditItem(null);
    setForm({
      code: "",
      name: "",
      taxpayerId: "",
      regionId: "",
      districtId: "",
      wardId: "",
      streetId: "", // <-- reset this too
      address: "",
      ewuraLicenseNo: "",
      email: "",
    });
    fetchStations();
  };

  // Filtered lists
  const filteredRegions = regions.filter(r =>
    r.name.toLowerCase().includes(regionSearch.toLowerCase())
  );
  const filteredDistricts = districts.filter(d =>
    d.name.toLowerCase().includes(districtSearch.toLowerCase())
  );
  const filteredWards = wards.filter(w =>
    w.name.toLowerCase().includes(wardSearch.toLowerCase())
  );
  const filteredStreets = streets.filter(s =>
    s.name.toLowerCase().includes(streetSearch.toLowerCase())
  );
  // Filter stations based on search input
  const filteredStations = stations.filter(
    s =>
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.ewuraLicenseNo.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Station Management</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center max-w-md w-full">
          <SearchIcon className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search stations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded flex items-center"
          onClick={() => openModal()}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add station
        </button>
      </div>

      {/* --- Stations Table --- */}
      <h2 className="text-xl font-bold mt-10 mb-4">Stations</h2>
      <table className="min-w-full border mt-2">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Code</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">EWURA License</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Address</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Taxpayer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStations.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-2">No stations to display</td>
            </tr>
          ) : (
            filteredStations.map(station => (
              <tr key={station.id}>
                <td className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">{station.code}</td>
                <td className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">{station.name}</td>
                <td className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">{station.ewuraLicenseNo}</td>
                <td className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">{station.address}</td>
                <td className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">{station.taxpayerId}</td>
                <td className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider text-center">
                  <button
                    className="inline-flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full p-2 transition-colors duration-150"
                    onClick={() => openModal(station)}
                    title="Edit"
                    type="button"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* --- End stations table --- */}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl relative shadow-lg flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10 rounded-t-lg">
              <h3 className="text-2xl font-bold">
                {editItem ? "Edit" : "Add"} Station
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body (scrollable) */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="code"
                  placeholder="Station Code"
                  value={form.code}
                  onChange={handleInputChange}
                  className="border px-4 py-3 rounded text-lg"
                  required
                />
                <input
                  name="name"
                  placeholder="Station Name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="border px-4 py-3 rounded text-lg"
                  required
                />
                <input
                  name="ewuraLicenseNo"
                  placeholder="EWURA License No"
                  value={form.ewuraLicenseNo}
                  onChange={handleInputChange}
                  className="border px-4 py-3 rounded text-lg"
                  required
                />

                {/* Region search and select */}
                <div className="flex flex-col">
                  <input
                    type="text"
                    placeholder="Search Region"
                    value={regionSearch}
                    onChange={e => setRegionSearch(e.target.value)}
                    className="border px-4 py-3 rounded mb-2 text-lg"
                  />
                  <select
                    name="regionId"
                    value={form.regionId}
                    onChange={handleInputChange}
                    className="border px-4 py-3 rounded text-lg"
                    required
                  >
                    <option value="">Select Region</option>
                    {filteredRegions.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* District search and select */}
                <div className="flex flex-col">
                  <input
                    type="text"
                    placeholder="Search District"
                    value={districtSearch}
                    onChange={e => setDistrictSearch(e.target.value)}
                    className="border px-4 py-3 rounded mb-2 text-lg"
                    disabled={!form.regionId}
                  />
                  <select
                    name="districtId"
                    value={form.districtId}
                    onChange={handleInputChange}
                    className="border px-4 py-3 rounded text-lg"
                    required
                    disabled={!form.regionId}
                  >
                    <option value="">Select District</option>
                    {filteredDistricts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Ward search and select */}
                <div className="flex flex-col">
                  <input
                    type="text"
                    placeholder="Search Ward"
                    value={wardSearch}
                    onChange={e => setWardSearch(e.target.value)}
                    className="border px-4 py-3 rounded mb-2 text-lg"
                    disabled={!form.districtId}
                  />
                  <select
                    name="wardId"
                    value={form.wardId}
                    onChange={handleInputChange}
                    className="border px-4 py-3 rounded text-lg"
                    required
                    disabled={!form.districtId}
                  >
                    <option value="">Select Ward</option>
                    {filteredWards.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                {/* Street search and select */}
                <div className="flex flex-col">
                  <input
                    type="text"
                    placeholder="Search Street"
                    value={streetSearch}
                    onChange={e => setStreetSearch(e.target.value)}
                    className="border px-4 py-3 rounded mb-2 text-lg"
                    disabled={!form.wardId}
                  />
                  <select
                    name="streetId"
                    value={form.streetId || ""}
                    onChange={handleInputChange}
                    className="border px-4 py-3 rounded text-lg"
                    required
                    disabled={!form.wardId}
                  >
                    <option value="">Select Street</option>
                    {streets
                      .filter(s => s.name.toLowerCase().includes(streetSearch.toLowerCase()))
                      .map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                  </select>
                </div>

                <div className="flex flex-col col-span-2">
                  <input
                    type="text"
                    placeholder="Search Taxpayer"
                    value={taxpayerSearch}
                    onChange={e => setTaxpayerSearch(e.target.value)}
                    className="border px-4 py-3 rounded mb-2 text-lg"
                  />
                  <select
                    name="taxpayerId"
                    value={form.taxpayerId}
                    onChange={handleInputChange}
                    className="border px-4 py-3 rounded text-lg"
                    required
                  >
                    <option value="">Select Taxpayer</option>
                    {taxpayers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.business_name } 
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  name="address"
                  placeholder="Address"
                  value={form.address}
                  className="border px-4 py-3 rounded col-span-2 bg-gray-100 text-lg"
                  readOnly
                  required
                />
              </div>

              {/* Modal Footer with Register/Update Button */}
              <div className="pt-4 border-t mt-4 flex justify-end sticky bottom-0 bg-white z-10">
                <button
                  type="submit"
                  className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 text-lg font-semibold w-full"
                >
                  {editItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
