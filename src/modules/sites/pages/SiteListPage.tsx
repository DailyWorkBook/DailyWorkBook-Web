import React, { useState, useEffect } from 'react';
import { Search, Plus, Building2, MapPin, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { sitesApi } from '../../../services/sitesApi';

export const SiteListPage: React.FC = () => {
  const [sites, setSites] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Site Form
  const [clientName, setClientName] = useState('HDFC Bank');
  const [siteName, setSiteName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [geofenceRadius, setGeofenceRadius] = useState(100);

  useEffect(() => {
    async function loadSites() {
      try {
        setLoading(true);
        const data = await sitesApi.getSites();
        setSites(data || []);
      } catch (err) {
        console.error('Error fetching sites:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSites();
  }, []);

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newSite = await sitesApi.createSite({
        clientName,
        name: siteName,
        addressLine,
        city,
        latitude: 18.5204,
        longitude: 73.8567,
        geofenceRadiusM: Number(geofenceRadius)
      });
      setSites((prev) => [newSite, ...prev]);
      setIsAddModalOpen(false);
      setSiteName('');
      setAddressLine('');
    } catch (err) {
      console.error('Error creating site:', err);
    }
  };

  const filtered = sites.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-brand-primary/10 text-brand-primary font-mono text-xs font-bold flex items-center gap-1">
              <Building2 className="w-4 h-4 text-brand-primary" /> CLIENT SITES & POSTS DIRECTORY
            </span>
          </div>
          <h1 className="text-2xl font-black text-txt-primary tracking-tight mt-1">
            Sites Directory ({sites.length})
          </h1>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-brand-primary hover:bg-brand-primary-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add New Security Site
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-txt-secondary" />
        <input
          type="text"
          placeholder="Search site name, client, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 gap-2 text-txt-secondary text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> Syncing site locations from MySQL...
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((site) => (
            <div key={site.id} className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3 hover:border-brand-primary/40 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-primary uppercase font-mono tracking-wider">
                    {site.clientName}
                  </span>
                  <h3 className="text-base font-extrabold text-txt-primary leading-tight mt-0.5">{site.name}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                  Active
                </span>
              </div>

              <div className="text-xs text-txt-secondary space-y-1 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-txt-secondary flex-shrink-0" />
                  <span className="truncate">{site.addressLine}, {site.city}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-txt-secondary">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>GPS Geofence Radius: {site.geofenceRadiusM || 100}m</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-bold">
                <span className="text-txt-secondary">{site.postsCount || site.posts?.length || 2} Security Posts</span>
                <span className="text-brand-primary">{site.employeesCount || 10} Guards Assigned</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Site Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-txt-primary">Add Security Site Location</h3>
            <form onSubmit={handleCreateSite} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-txt-secondary">Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-txt-secondary">Site Name</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC FC Road Branch"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-txt-secondary">Address Line</label>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-txt-secondary">Geofence Radius (meters)</label>
                <input
                  type="number"
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                  className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-primary text-white">
                  Save Site
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
