import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Users, Phone, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { superAdminApi } from '../../superadmin/services/superAdminApi';
import { sitesApi } from '../../../services/sitesApi';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClientData() {
      if (!id) return;
      try {
        setLoading(true);
        const [cData, sitesData] = await Promise.all([
          superAdminApi.getClientById(id),
          sitesApi.getSites()
        ]);
        setClient(cData);
        setSites(sitesData || []);
      } catch (err) {
        console.error('Error loading client detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadClientData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 gap-2 text-txt-secondary text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> Loading client profile from database...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center text-xs text-txt-secondary">
        Client not found. <Button onClick={() => navigate('/clients')}>Back to Clients</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <button
        onClick={() => navigate('/clients')}
        className="flex items-center gap-1 text-xs font-bold text-txt-secondary hover:text-txt-primary"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Clients Directory
      </button>

      <div className="bg-bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={client.logoUrl} alt={client.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-border" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-txt-primary">{client.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                {client.status}
              </span>
            </div>
            <p className="text-xs text-txt-secondary mt-0.5">{client.industry} &bull; Tax ID: {client.taxId}</p>
          </div>
        </div>

        <div className="text-right text-xs">
          <div className="text-txt-secondary font-mono">Designated Admin</div>
          <div className="font-bold text-txt-primary">{client.contactPerson} ({client.contactPhone})</div>
        </div>
      </div>

      <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-extrabold text-txt-primary flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brand-primary" /> Active Site Locations ({sites.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sites.map((s) => (
            <div key={s.id} className="p-3.5 bg-bg-surface-2 rounded-xl border border-border/60">
              <div className="font-extrabold text-xs text-txt-primary">{s.name}</div>
              <div className="text-[11px] text-txt-secondary">{s.addressLine}, {s.city}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
