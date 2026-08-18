import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, ShieldCheck, Phone, Mail, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { employeesApi } from '../../../services/employeesApi';
import { sitesApi } from '../../../services/sitesApi';

export const EmployeeListPage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Employee Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('SECURITY_GUARD');
  const [siteId, setSiteId] = useState('');

  useEffect(() => {
    async function loadEmployees() {
      try {
        setLoading(true);
        const [empData, sitesData] = await Promise.all([
          employeesApi.getEmployees(),
          sitesApi.getSites()
        ]);
        setEmployees(empData || []);
        setSites(sitesData || []);
        if (sitesData?.length > 0) setSiteId(sitesData[0].id);
      } catch (err) {
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEmployees();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newEmp = await employeesApi.createEmployee({
        firstName,
        lastName,
        phone,
        email,
        role,
        currentSiteId: siteId,
        dateOfJoining: new Date().toISOString().split('T')[0]
      });
      setEmployees((prev) => [newEmp, ...prev]);
      setIsAddModalOpen(false);
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
    } catch (err) {
      console.error('Error creating employee:', err);
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.currentSiteName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-brand-primary/10 text-brand-primary font-mono text-xs font-bold flex items-center gap-1">
              <Users className="w-4 h-4 text-brand-primary" /> WORKFORCE & GUARD DIRECTORY
            </span>
          </div>
          <h1 className="text-2xl font-black text-txt-primary tracking-tight mt-1">
            Employees Directory ({employees.length})
          </h1>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-brand-primary hover:bg-brand-primary-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add New Security Guard
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-txt-secondary" />
        <input
          type="text"
          placeholder="Search employee name, code, or site..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 gap-2 text-txt-secondary text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> Syncing employee directory from database...
        </div>
      )}

      {!loading && (
        <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-surface-2 border-b border-border/80 text-txt-secondary font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Employee Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Assigned Site & Post</th>
                  <th className="px-4 py-3">Contact Information</th>
                  <th className="px-4 py-3">Date of Joining</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-bg-surface-2/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.photoUrl || `https://i.pravatar.cc/150?u=${emp.id}`}
                          alt={emp.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-border"
                        />
                        <div>
                          <div className="font-bold text-txt-primary">{emp.name}</div>
                          <div className="text-[10px] text-txt-secondary font-mono">{emp.employeeCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-txt-primary">{emp.role}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-txt-primary">{emp.currentSiteName}</div>
                      <div className="text-[10px] text-txt-secondary">{emp.currentPostName}</div>
                    </td>
                    <td className="px-4 py-3 text-txt-secondary">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-txt-secondary" />
                        <span>{emp.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-txt-secondary">{emp.dateOfJoining}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-txt-primary">Onboard Security Employee</h3>
            <form onSubmit={handleCreateEmployee} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-txt-secondary">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-txt-secondary">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-txt-secondary">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98000 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-txt-secondary">Role / Position</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                >
                  <option value="SECURITY_GUARD">Security Guard</option>
                  <option value="SECURITY_OFFICER">Security Officer</option>
                  <option value="RELIEVER">Reliever Guard</option>
                  <option value="TEMPORARY">Temporary Guard</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-txt-secondary">Assigned Site</label>
                <select
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-primary text-white">
                  Save Employee
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
