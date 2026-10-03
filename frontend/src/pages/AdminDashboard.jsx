import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldAlert,
  Compass,
  Package,
  TrendingUp,
  Activity,
  UserCheck,
  Trash2,
  Edit,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Tag,
  Plus,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { adminService } from '../services/adminService';
import { useNotifications } from '../context/NotificationContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate, formatDateTime } from '../utils/formatters';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const AdminDashboard = () => {
  const { showToast } = useNotifications();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'users' | 'audit' | 'categories'

  const [searchUser, setSearchUser] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, logsRes, catsRes] = await Promise.all([
        adminService.getStatistics(),
        adminService.getUsers({ limit: 50 }),
        adminService.getAuditLogs({ limit: 50 }),
        adminService.getCategories(),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (usersRes.data) setUsers(usersRes.data.users || []);
      if (logsRes.data) setAuditLogs(logsRes.data.logs || []);
      if (catsRes.data) setCategories(catsRes.data.categories || []);
    } catch (err) {
      console.error('Failed to load admin console:', err);
      showToast(err.message || 'Failed to load admin statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUser(userId, { role: newRole });
      showToast(`User role updated to ${newRole}`, 'success');
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to update user role', 'error');
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await adminService.updateUser(userId, { isActive: !currentStatus });
      showToast(`User account ${!currentStatus ? 'activated' : 'deactivated'}`, 'info');
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to update user status', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user account "${userName}"?`)) return;
    try {
      await adminService.deleteUser(userId);
      showToast('User deleted successfully', 'success');
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await adminService.createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim(),
      });
      showToast('New category added successfully', 'success');
      setNewCategoryName('');
      setNewCategoryDesc('');
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to create category', 'error');
    }
  };

  // Chart 1: Monthly Trends (Lost vs Found)
  const monthlyData = {
    labels: stats?.monthlyTrends?.map((m) => m.month) || ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [
      {
        label: 'Lost Items Reported',
        data: stats?.monthlyTrends?.map((m) => m.lost) || [2, 4, 3, 5, 2, 4],
        backgroundColor: 'rgba(244, 63, 94, 0.75)',
        borderColor: '#f43f5e',
        borderRadius: 8,
      },
      {
        label: 'Found Items Logged',
        data: stats?.monthlyTrends?.map((m) => m.found) || [3, 2, 4, 6, 3, 5],
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: '#10b981',
        borderRadius: 8,
      },
    ],
  };

  // Chart 2: Category Breakdown
  const categoryChartData = {
    labels: stats?.categoryStats?.map((c) => c._id) || ['Electronics', 'Wallet', 'Keys', 'Documents', 'Other'],
    datasets: [
      {
        data: stats?.categoryStats?.map((c) => c.total) || [5, 3, 2, 2, 1],
        backgroundColor: [
          '#6366f1',
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ec4899',
          '#8b5cf6',
          '#14b8a6',
          '#f43f5e',
        ],
      },
    ],
  };

  // Chart 3: Claims Status Doughnut
  const claimsChartData = {
    labels: ['Pending Review', 'Approved', 'Rejected', 'Completed Handovers'],
    datasets: [
      {
        data: [
          stats?.claims?.pending || 1,
          stats?.claims?.approved || 1,
          stats?.claims?.rejected || 0,
          stats?.claims?.completed || 1,
        ],
        backgroundColor: ['#f59e0b', '#3b82f6', '#ef4444', '#10b981'],
      },
    ],
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesSearch =
      !searchUser.trim() ||
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.collegeId.toLowerCase().includes(searchUser.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
            <Compass className="w-4 h-4" /> Administrative Headquarters
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            System Administration & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Database statistics, user authorization, category management, and audit tracking.
          </p>
        </div>

        <div className="px-4 py-2 bg-white/10 rounded-2xl border border-white/20 text-xs">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Overall Recovery Rate</span>
          <span className="text-xl font-black text-emerald-400">{stats?.recoveryRate || 33}%</span>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Users</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats?.users?.total || 0}</div>
          <span className="text-[11px] text-slate-400">
            {stats?.users?.students || 0} Students • {stats?.users?.security || 0} Security
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Reports</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats?.items?.totalReports || 0}</div>
          <span className="text-[11px] text-slate-400">
            {stats?.items?.lost || 0} Lost • {stats?.items?.found || 0} Found
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Claims Handled</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats?.claims?.total || 0}</div>
          <span className="text-[11px] text-amber-600 font-semibold">
            {stats?.claims?.pending || 0} Pending Verification
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Items Recovered</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{stats?.items?.handedOver || 0}</div>
          <span className="text-[11px] text-slate-400">Physical handovers completed</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-100 px-6 pt-4 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Visual Analytics & Charts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Security Audit Logs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Categories</span>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <LoadingSpinner text="Compiling administrative data..." />
          ) : (
            <>
              {/* TAB 1: CHARTS & ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-8">
                  {/* Monthly Bar Chart */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <h3 className="font-bold text-slate-900 text-base mb-1">
                      Monthly Lost vs Found Reports Trend
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">
                      Historical tracking of reported incidents across campus
                    </p>
                    <div className="h-64">
                      <Bar
                        data={monthlyData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { position: 'top' } },
                        }}
                      />
                    </div>
                  </div>

                  {/* 2-Column Pie/Doughnut Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <h3 className="font-bold text-slate-900 text-base mb-1">
                        Reports by Item Category
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        Distribution across college items
                      </p>
                      <div className="h-56 flex items-center justify-center">
                        <Doughnut
                          data={categoryChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'right' } },
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <h3 className="font-bold text-slate-900 text-base mb-1">
                        Claims Verification Breakdown
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        Claims processed by security office
                      </p>
                      <div className="h-56 flex items-center justify-center">
                        <Doughnut
                          data={claimsChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'right' } },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: USER MANAGEMENT */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
                    <input
                      type="text"
                      placeholder="Search users by name, email, or Student ID..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-bold">Filter Role:</span>
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                      >
                        <option value="All">All Roles</option>
                        <option value="USER">Students / Users</option>
                        <option value="SECURITY">Security Officers</option>
                        <option value="ADMIN">Administrators</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3.5">User Details</th>
                          <th className="px-5 py-3.5">College ID</th>
                          <th className="px-5 py-3.5">Department</th>
                          <th className="px-5 py-3.5">Current Role</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-slate-50 transition">
                            <td className="px-5 py-3.5">
                              <span className="font-bold text-slate-900 block">{u.name}</span>
                              <span className="text-[11px] text-slate-400">{u.email}</span>
                            </td>

                            <td className="px-5 py-3.5 font-mono font-bold text-indigo-700">
                              {u.collegeId}
                            </td>

                            <td className="px-5 py-3.5">{u.department || 'General'}</td>

                            <td className="px-5 py-3.5">
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition ${
                                  u.role === 'ADMIN'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : u.role === 'SECURITY'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                }`}
                              >
                                <option value="USER">USER (Student)</option>
                                <option value="SECURITY">SECURITY</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            </td>

                            <td className="px-5 py-3.5">
                              <button
                                onClick={() => handleToggleActive(u._id, u.isActive)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                                  u.isActive
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {u.isActive ? 'Active' : 'Deactivated'}
                              </button>
                            </td>

                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: AUDIT LOGS */}
              {activeTab === 'audit' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Immutable security log records tracking all item submissions, status approvals, role modifications, and handovers.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3.5">Action Event</th>
                          <th className="px-5 py-3.5">Entity</th>
                          <th className="px-5 py-3.5">Performed By</th>
                          <th className="px-5 py-3.5">Timestamp</th>
                          <th className="px-5 py-3.5">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {auditLogs.map((log) => (
                          <tr key={log._id} className="hover:bg-slate-50 transition">
                            <td className="px-5 py-3.5 font-bold text-slate-900">
                              <span className="px-2 py-0.5 bg-slate-100 rounded-md font-mono text-[11px]">
                                {log.action}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="font-semibold text-indigo-700">{log.entityType}</span>
                              {log.entityId && (
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  ID: {log.entityId.substring(0, 10)}...
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 font-medium">{log.performedByName}</td>
                            <td className="px-5 py-3.5">{formatDateTime(log.createdAt)}</td>
                            <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                              {log.ipAddress || '127.0.0.1'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: CATEGORY MANAGER */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleCreateCategory}
                    className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row gap-3 items-end"
                  >
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        New Category Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sports Equipment, Laboratory Gear"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        placeholder="Optional description"
                        value={newCategoryDesc}
                        onChange={(e) => setNewCategoryDesc(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Category</span>
                    </button>
                  </form>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <div
                        key={cat._id}
                        className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800 text-sm block">{cat.name}</span>
                          <span className="text-[11px] text-slate-500">{cat.description || 'Active item category'}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
