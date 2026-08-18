import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Plus, Search, MapPin, ExternalLink, ShieldCheck, ChevronRight, Edit3, CheckCircle2, Radio, Users, Shield, SlidersHorizontal, Map } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Sheet } from '../../../components/ui/Sheet';
import { INITIAL_SITES, Site, Post } from '../../../mockData/sites';
import { INITIAL_CLIENTS } from '../../../mockData/clients';
import confetti from 'canvas-confetti';

export const SiteListPage: React.FC = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>(INITIAL_SITES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Comprehensive Site Form State
  const [clientId, setClientId] = useState(INITIAL_CLIENTS[0].id);
  const [siteName, setSiteName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [zipCode, setZipCode] = useState('411001');
  const [latitude, setLatitude] = useState(18.5204);
  const [longitude, setLongitude] = useState(73.8567);
  const [radius, setRadius] = useState(100);
  const [isActive, setIsActive] = useState(true);

  // Initial Post Details
  const [defaultPostName, setDefaultPostName] = useState('Main Gate & Visitor Entrance');
  const [defaultPostGuards, setDefaultPostGuards] = useState(2);

  const openCreateModal = () => {
    setEditingSite(null);
    setClientId(INITIAL_CLIENTS[0].id);
    setSiteName('');
    setAddress('');
    setCity('Pune');
    setState('Maharashtra');
    setZipCode('411001');
    setLatitude(18.5204);
    setLongitude(73.8567);
    setRadius(100);
    setIsActive(true);
    setDefaultPostName('Main Gate & Visitor Entrance');
    setDefaultPostGuards(2);
    setIsModalOpen(true);
  };

  const openEditModal = (site: Site) => {
    setEditingSite(site);
    setClientId(site.clientId);
    setSiteName(site.name);
    setAddress(site.addressLine);
    setCity(site.city);
    setState(site.state);
    setZipCode(site.zipCode);
    setLatitude(site.latitude);
    setLongitude(site.longitude);
    setRadius(site.geofenceRadiusM);
    setIsActive(site.isActive);
    setIsModalOpen(true);
  };

  const filteredSites = sites.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClient = !selectedClientId || s.clientId === selectedClientId;
    return matchSearch && matchClient;
  });

  const totalPosts = sites.reduce((acc, s) => acc + s.postsCount, 0);
  const totalGuards = sites.reduce((acc, s) => acc + s.guardsCount, 0);

  const handleSaveSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName) return;

    const parentClient = INITIAL_CLIENTS.find(c => c.id === clientId) || INITIAL_CLIENTS[0];

    if (editingSite) {
      const updatedSite: Site = {
        ...editingSite,
        clientId: parentClient.id,
        clientName: parentClient.name,
        name: siteName,
        addressLine: address,
        city,
        state,
        zipCode,
        latitude: Number(latitude),
        longitude: Number(longitude),
        geofenceRadiusM: Number(radius),
        isActive
      };
      setSites(prev => prev.map(s => s.id === editingSite.id ? updatedSite : s));
      setToastMsg(`Updated site "${siteName}" successfully!`);
    } else {
      const newSiteId = `site-${Date.now()}`;
      const defaultPost: Post = {
        id: `post-${Date.now()}-1`,
        siteId: newSiteId,
        siteName: siteName,
        clientId: parentClient.id,
        clientName: parentClient.name,
        name: defaultPostName,
        addressLine: `${address} - ${defaultPostName}`,
        latitude: Number(latitude),
        longitude: Number(longitude),
        geofenceRadiusM: Number(radius),
        guardCountRequired: Number(defaultPostGuards),
        shiftType: '24_7_ROTATIONAL',
        qrCodeId: `QR-${parentClient.code}-1`,
        postInstructions: 'Standard post duty and visitor log verification.',
        isActive: true
      };

      const newSite: Site = {
        id: newSiteId,
        clientId: parentClient.id,
        clientName: parentClient.name,
        name: siteName,
        addressLine: address || 'Main Road',
        city,
        state,
        zipCode,
        latitude: Number(latitude),
        longitude: Number(longitude),
        geofenceRadiusM: Number(radius),
        timezone: 'Asia/Kolkata',
        isActive,
        postsCount: 1,
        guardsCount: 15,
        posts: [defaultPost]
      };

      setSites(prev => [newSite, ...prev]);
      setToastMsg(`Created new site "${siteName}" successfully!`);
      confetti({ particleCount: 50, spread: 60 });
    }

    setIsModalOpen(false);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {/* Header Banner */}
      <div className="wt-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-bg-surface via-bg-surface to-brand-primary-050/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-primary-050 text-brand-primary border border-brand-primary/20">
              Campus Control Plane & GPS Geofencing
            </span>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">Sites & Duty Campuses</h1>
          <p className="text-xs text-txt-secondary mt-1">Manage corporate client site campuses, GPS geofence boundaries, and nested duty post stations</p>
        </div>

        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Create Site Campus
        </Button>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 bg-brand-teal-050 border border-brand-teal/30 text-brand-teal text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Active Campuses</span>
            <div className="text-2xl font-extrabold text-brand-primary tracking-tight mt-0.5 tabular-nums">{sites.length} Campuses</div>
            <span className="text-[11px] text-txt-secondary">100% Geofence Active</span>
          </div>
          <div className="p-3 bg-brand-primary-050 text-brand-primary rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Total Duty Posts</span>
            <div className="text-2xl font-extrabold text-brand-teal tracking-tight mt-0.5 tabular-nums">{totalPosts} Posts</div>
            <span className="text-[11px] text-txt-secondary">QR Check-in Enabled</span>
          </div>
          <div className="p-3 bg-brand-teal-050 text-brand-teal rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Deployed Guards</span>
            <div className="text-2xl font-extrabold text-txt-primary tracking-tight mt-0.5 tabular-nums">{totalGuards} Guards</div>
            <span className="text-[11px] text-txt-secondary">Live GPS Tracked</span>
          </div>
          <div className="p-3 bg-bg-surface-2 text-txt-primary rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">GPS Geofence Status</span>
            <div className="text-2xl font-extrabold text-brand-teal tracking-tight mt-0.5 flex items-center gap-1.5">
              <Radio className="w-5 h-5 text-brand-teal animate-pulse" /> Active
            </div>
            <span className="text-[11px] text-txt-secondary">Precision Radius ±100m</span>
          </div>
          <div className="p-3 bg-brand-teal/10 text-brand-teal rounded-xl">
            <Map className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="wt-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-tertiary" />
          <input
            type="text"
            placeholder="Search site name, client, or city..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto text-xs">
          <select
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
            className="p-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary font-semibold w-full sm:w-auto"
          >
            <option value="">All Corporate Clients</option>
            {INITIAL_CLIENTS.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-bg-surface-2 p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-brand-primary text-white shadow-sm' : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-brand-primary text-white shadow-sm' : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSites.map(s => (
            <div key={s.id} className="wt-card wt-card-interactive p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-brand-primary-050 text-brand-primary border border-brand-primary/20">
                      {s.clientName}
                    </span>
                    <h3 className="text-lg font-bold text-txt-primary mt-2">
                      <Link to={`/sites/${s.id}`} className="hover:text-brand-primary transition-colors">
                        {s.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-txt-secondary flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-txt-tertiary" />
                      <span>{s.addressLine}, {s.city}, {s.state} ({s.zipCode})</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge status={s.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-1.5 text-txt-secondary hover:text-brand-primary hover:bg-bg-surface-2 rounded-lg transition-colors"
                      title="Edit Site Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 grid grid-cols-3 gap-2 text-xs text-center">
                  <div className="p-3 bg-bg-surface-2 rounded-xl border border-border">
                    <span className="text-txt-tertiary block text-[10px]">Duty Posts</span>
                    <span className="font-extrabold text-brand-primary text-sm tabular-nums">{s.postsCount} Posts</span>
                  </div>
                  <div className="p-3 bg-bg-surface-2 rounded-xl border border-border">
                    <span className="text-txt-tertiary block text-[10px]">Guards</span>
                    <span className="font-extrabold text-brand-teal text-sm tabular-nums">{s.guardsCount} Guards</span>
                  </div>
                  <div className="p-3 bg-bg-surface-2 rounded-xl border border-border">
                    <span className="text-txt-tertiary block text-[10px]">Geofence Radius</span>
                    <span className="font-extrabold text-txt-primary text-sm tabular-nums">{s.geofenceRadiusM}m</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-[11px] font-mono text-txt-tertiary flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                  {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" leftIcon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => openEditModal(s)}>
                    Edit Site
                  </Button>
                  <Button size="sm" variant="primary" rightIcon={<ChevronRight className="w-3.5 h-3.5" />} onClick={() => navigate(`/sites/${s.id}`)}>
                    Manage Map & Posts
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="wt-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left wt-table">
              <thead>
                <tr>
                  <th>SITE CAMPUS NAME & CLIENT</th>
                  <th>LOCATION & ADDRESS</th>
                  <th>POSTS</th>
                  <th>GUARDS</th>
                  <th>GPS GEOFENCE</th>
                  <th>STATUS</th>
                  <th className="text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredSites.map(s => (
                  <tr key={s.id}>
                    <td>
                      <Link to={`/sites/${s.id}`} className="font-bold text-xs text-txt-primary hover:text-brand-primary">
                        {s.name}
                      </Link>
                      <div className="text-[11px] text-brand-primary font-semibold">{s.clientName}</div>
                    </td>
                    <td>
                      <div className="text-xs text-txt-primary">{s.city}, {s.state}</div>
                      <div className="text-[11px] text-txt-tertiary truncate max-w-xs">{s.addressLine}</div>
                    </td>
                    <td className="font-bold text-brand-primary tabular-nums">{s.postsCount} Posts</td>
                    <td className="font-bold text-brand-teal tabular-nums">{s.guardsCount} Guards</td>
                    <td className="font-mono text-xs text-txt-primary">{s.geofenceRadiusM}m Radius</td>
                    <td><Badge status={s.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="secondary" leftIcon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => openEditModal(s)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/sites/${s.id}`)}>
                          Manage
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comprehensive Full Field Create / Edit Site Drawer */}
      <Sheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSite ? `Edit Site Campus: ${editingSite.name}` : 'Create New Site Campus'}
      >
        <form onSubmit={handleSaveSite} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-txt-primary mb-1">Parent Corporate Client</label>
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
            >
              {INITIAL_CLIENTS.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Site Campus Name</label>
            <input
              type="text"
              required
              value={siteName}
              onChange={e => setSiteName(e.target.value)}
              placeholder="e.g. Hinjawadi Phase 1 IT Campus"
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Street Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Plot No. 1, Rajiv Gandhi Infotech Park"
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-txt-primary mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-txt-primary mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-txt-primary mb-1">Zip Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={e => setZipCode(e.target.value)}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-txt-primary mb-1">Latitude Coordinate</label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={e => setLatitude(Number(e.target.value))}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-txt-primary mb-1">Longitude Coordinate</label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={e => setLongitude(Number(e.target.value))}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-txt-primary mb-1">Geofence Radius (m)</label>
              <input
                type="number"
                value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
              />
            </div>
          </div>

          {!editingSite && (
            <div className="pt-3 border-t border-border space-y-3">
              <h4 className="font-bold text-txt-primary text-sm">Initial Duty Post Setup</h4>

              <div>
                <label className="block font-semibold text-txt-primary mb-1">First Post Station Name</label>
                <input
                  type="text"
                  value={defaultPostName}
                  onChange={e => setDefaultPostName(e.target.value)}
                  placeholder="e.g. Main Gate Entry"
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-txt-primary mb-1">Required Guards Headcount</label>
                <input
                  type="number"
                  value={defaultPostGuards}
                  onChange={e => setDefaultPostGuards(Number(e.target.value))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              {editingSite ? 'Save Changes' : 'Create Site Campus'}
            </Button>
          </div>
        </form>
      </Sheet>
    </motion.div>
  );
};
