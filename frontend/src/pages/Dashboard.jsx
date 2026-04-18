import { useState, useEffect } from "react";
import {
  Activity,
  Users,
  Monitor,
  Clock,
  Package,
  RefreshCw,
  Search,
} from "lucide-react";

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://ai-cctv-dashboard.onrender.com/api/metrics",
      );
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Factory Productivity
            </h1>
            <p className="text-gray-500 mt-1">Real-time AI Vision Analytics</p>
          </div>
          <button
            onClick={fetchMetrics}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors rounded-md"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
        </div>

        {/* Search Filter */}
        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by worker or workstation name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Factory Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-500 uppercase text-sm">
                Total Active Time
              </h3>
              <Clock className="w-5 h-5 text-black" />
            </div>
            <p className="text-3xl font-bold">
              {metrics.factorySummary.totalActiveTimeMinutes}{" "}
              <span className="text-lg font-normal text-gray-500">mins</span>
            </p>
          </div>
          <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-500 uppercase text-sm">
                Total Units Produced
              </h3>
              <Package className="w-5 h-5 text-black" />
            </div>
            <p className="text-3xl font-bold">
              {metrics.factorySummary.totalUnitsProduced}
            </p>
          </div>
          <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-500 uppercase text-sm">
                System Status
              </h3>
              <Activity className="w-5 h-5 text-black" />
            </div>
            <p className="text-xl font-bold text-black flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full inline-block animate-pulse"></span>
              Live Monitoring
            </p>
          </div>
        </div>

        {/* Workers & Workstations Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Workers Table */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
              <Users className="w-5 h-5" />
              <h2 className="font-bold text-lg">Worker Metrics</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Active</th>
                    <th className="p-4">Idle</th>
                    <th className="p-4">Utilization</th>
                    <th className="p-4">Units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {metrics.workers
                    .filter(worker => worker.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((worker) => (
                    <tr
                      key={worker.worker_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 font-medium">{worker.name}</td>
                      <td className="p-4">{worker.activeTime}m</td>
                      <td className="p-4">{worker.idleTime}m</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="w-8">
                            {worker.utilizationPercentage}%
                          </span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-black"
                              style={{
                                width: `${worker.utilizationPercentage}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{worker.totalUnits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Workstations Table */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              <h2 className="font-bold text-lg">Workstation Metrics</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase">
                  <tr>
                    <th className="p-4">Station Name</th>
                    <th className="p-4">Total Active</th>
                    <th className="p-4">Total Units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {metrics.workstations
                    .filter(station => station.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((station) => (
                    <tr
                      key={station.station_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 font-medium">{station.name}</td>
                      <td className="p-4">{station.activeTime}m</td>
                      <td className="p-4 font-bold">{station.totalUnits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;