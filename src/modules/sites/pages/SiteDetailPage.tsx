import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { sitesApi } from '../../../services/sitesApi';

export const SiteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSite() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await sitesApi.getSiteById(id);
        setSite(data);
      } catch (err) {
        console.error('Error loading site detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSite();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 gap-2 text-txt-secondary text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> Loading site profile from database...
      </div>
    );
  }

  if (!site) {
    return (
      <div className="p-8 text-center text-xs text-txt-secondary">
        Site not found. <Button onClick={() => navigate('/sites')}>Back to Sites</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <button
        onClick={() => navigate('/sites')}
        className="flex items-center gap-1 text-xs font-bold text-txt-secondary hover:text-txt-primary"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Sites Directory
      </button>

      <div className="bg-bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-primary uppercase tracking-wider font-mono">{site.clientName}</span>
          <h1 className="text-xl font-black text-txt-primary mt-0.5">{site.name}</h1>
          <p className="text-xs text-txt-secondary flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" /> {site.addressLine}, {site.city}
          </p>
        </div>

        <div className="text-right text-xs">
          <div className="text-txt-secondary font-mono">Geofence Radius</div>
          <div className="font-bold text-emerald-600 flex items-center gap-1 justify-end">
            <ShieldCheck className="w-4 h-4" /> {site.geofenceRadiusM || 100} meters
          </div>
        </div>
      </div>

      <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-extrabold text-txt-primary">Assigned Security Posts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {site.posts?.map((p: any) => (
            <div key={p.id} className="p-3.5 bg-bg-surface-2 rounded-xl border border-border/60 flex items-center justify-between">
              <div>
                <div className="font-extrabold text-xs text-txt-primary">{p.name}</div>
                <div className="text-[10px] text-txt-secondary font-mono">QR Code: {p.qrCodeId}</div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary">
                {p.guardCountRequired} Guards Req.
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
