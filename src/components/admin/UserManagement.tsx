import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Key,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Lock,
  Mail,
  Phone,
  Search,
  UserCheck,
  UserX,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { formatDateTime } from '../../utils/formatters';

export const UserManagement: React.FC = () => {
  const {
    users,
    currentUser,
    addUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    toggleUserStatus,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit User Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'seller' as UserRole,
  });
  const [userFormError, setUserFormError] = useState<string | null>(null);

  // Password Reset Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [targetPasswordUser, setTargetPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Delete User Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const filteredUsers = users.filter(
    u =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenAddModal = () => {
    setEditingUserId(null);
    setUserFormData({
      username: '',
      fullName: '',
      email: '',
      phone: '',
      password: '',
      role: 'seller',
    });
    setUserFormError(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUserId(user.id);
    setUserFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role,
    });
    setUserFormError(null);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);

    if (!userFormData.fullName.trim() || !userFormData.username.trim()) {
      setUserFormError('Full Name and Username are required.');
      return;
    }

    if (!editingUserId && (!userFormData.password || userFormData.password.length < 4)) {
      setUserFormError('Password must be at least 4 characters for new accounts.');
      return;
    }

    // Check unique username
    const existing = users.find(
      u => u.username.toLowerCase() === userFormData.username.toLowerCase() && u.id !== editingUserId
    );
    if (existing) {
      setUserFormError(`Username "${userFormData.username}" is already in use.`);
      return;
    }

    if (editingUserId) {
      const updates: Partial<User> = {
        fullName: userFormData.fullName.trim(),
        username: userFormData.username.trim(),
        email: userFormData.email.trim(),
        phone: userFormData.phone.trim(),
        role: userFormData.role,
      };
      if (userFormData.password && userFormData.password.trim().length >= 4) {
        updates.password = userFormData.password.trim();
        updates.pin = userFormData.password.trim();
      }
      updateUser(editingUserId, updates);
    } else {
      addUser({
        fullName: userFormData.fullName.trim(),
        username: userFormData.username.trim(),
        role: userFormData.role,
        email: userFormData.email.trim(),
        phone: userFormData.phone.trim(),
        password: userFormData.password.trim(),
        pin: userFormData.password.trim(),
        isActive: true,
      });
    }

    setIsUserModalOpen(false);
  };

  const handleOpenPasswordModal = (user: User) => {
    setTargetPasswordUser(user);
    setNewPassword('');
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsPasswordModalOpen(true);
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPasswordUser) return;
    setPasswordError(null);

    if (!newPassword || newPassword.length < 4) {
      setPasswordError('New password must be at least 4 characters long.');
      return;
    }

    resetUserPassword(targetPasswordUser.id, newPassword);
    setPasswordSuccess(`Password updated successfully for ${targetPasswordUser.fullName}`);
    setTimeout(() => {
      setIsPasswordModalOpen(false);
    }, 1200);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Seller & User Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              {users.length} Users ({users.filter(u => u.isActive).length} Active)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provision sales team accounts (2-10 sellers), assign roles, reset credentials, and toggle account activation.
          </p>
        </div>

        <button
          id="btn-add-seller"
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User / Seller</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map(user => {
                const isActive = user.isActive;
                const isAdmin = user.role === 'admin';
                const isSelf = user.id === currentUser.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* User */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs ${
                            isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            {user.fullName}
                            {isSelf && (
                              <span className="text-[10px] text-slate-400 font-normal">(You)</span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">@{user.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isAdmin
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-[11px] text-slate-600">
                        {user.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isActive ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                        {isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenPasswordModal(user)}
                          className="px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                          title="Reset Password"
                        >
                          <Key className="w-3 h-3 text-amber-600" />
                          <span>Password</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit User Info"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!isSelf && (
                          <>
                            <button
                              type="button"
                              onClick={() => toggleUserStatus(user.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isActive
                                  ? 'text-amber-600 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={isActive ? 'Disable User' : 'Enable User'}
                            >
                              {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setUserToDelete(user)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete User from Database"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <form onSubmit={handleSaveUser}>
              <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold">
                    {editingUserId ? 'Edit User Profile' : 'Add New User / Seller'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                {userFormError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                    {userFormError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={userFormData.fullName}
                    onChange={e => setUserFormData({ ...userFormData, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. sjenkins"
                      value={userFormData.username}
                      onChange={e => setUserFormData({ ...userFormData, username: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Role
                    </label>
                    <select
                      value={userFormData.role}
                      onChange={e =>
                        setUserFormData({ ...userFormData, role: e.target.value as UserRole })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    >
                      <option value="seller">Seller (Sales Rep)</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {editingUserId ? 'Change Password / PIN (Optional)' : 'Initial Password / PIN'} {!editingUserId && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingUserId}
                    placeholder={editingUserId ? 'Leave blank to keep existing password' : 'At least 4 characters'}
                    value={userFormData.password}
                    onChange={e => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  {editingUserId && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Enter a new password or PIN (min 4 characters) to change it immediately in the database.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="user@company.com"
                      value={userFormData.email}
                      onChange={e => setUserFormData({ ...userFormData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={userFormData.phone}
                      onChange={e => setUserFormData({ ...userFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
                >
                  {editingUserId ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {isPasswordModalOpen && targetPasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <form onSubmit={handleSaveNewPassword}>
              <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold">Change Password for {targetPasswordUser.fullName}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <p className="font-bold text-slate-900">{targetPasswordUser.fullName}</p>
                  <p className="text-slate-500 font-mono">Username: @{targetPasswordUser.username}</p>
                </div>

                {passwordError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password..."
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 w-fit">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete User Account</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <span className="font-bold text-slate-800">{userToDelete.fullName}</span> (@{userToDelete.username}) from Supabase? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
