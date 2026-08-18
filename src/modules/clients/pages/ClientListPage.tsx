import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, MapPin, Phone, Mail, Loader2, DollarSign } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { superAdminApi } from '../../superadmin/services/superAdminApi';

export const ClientListPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      try {
        setLoading(true);
        const data = await superAdminApi.getClients();
        setClients(data || []);
      } catch (err) {
        console.error('Error loading clients:', err);
      } finally {
        setLoading(false);
      }
    }
    loadClients();
  }, []);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-brand-primary/10 text-brand-primary font-mono text-xs font-bold flex items-center gap-1">
              <Building2 className="w-4 h-4 text-brand-primary" /> CLIENT ORGANIZATIONS DIRECTORY
            </span>
          </div>
          <h1 className="text-2xl font-black text-txt-primary tracking-tight mt-1">
            Clients Directory ({clients.length})
          </h1>
        </div>

        <Button
          onClick={() => navigate('/superadmin/clients')}
          className="bg-brand-primary hover:bg-brand-primary-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Manage Fleet Clients
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-txt-secondary" />
        <input
          type="text"
          placeholder="Search client organization, code, or contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 gap-2 text-txt-secondary text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> Loading client organizations from database...
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div key={client.id} className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3 hover:border-brand-primary/40 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={client.logoUrl}
                    alt={client.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-border"
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-txt-primary leading-tight">{client.name}</h3>
                    <span className="text-[10px] text-txt-secondary font-mono">{client.code}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    client.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                  }`}
                >
                  {client.status}
                </span>
              </div>

              <div className="text-xs text-txt-secondary space-y-1 font-medium">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-txt-secondary" />
                  <span>{client.contactPerson} ({client.contactPhone})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-txt-secondary" />
                  <span>{client.contactEmail}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-bold">
                <span className="text-txt-secondary">{client.sitesCount || 3} Active Sites</span>
                <span className="text-emerald-600">{client.subscription?.planName || 'Enterprise Suite'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
