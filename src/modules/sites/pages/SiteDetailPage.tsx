import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Plus, ArrowLeft, ShieldCheck, CheckCircle2, QrCode, SlidersHorizontal, Edit3, Navigation, Radio, Battery, Clock, AlertTriangle, Users, ExternalLink, Search } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Sheet } from '../../../components/ui/Sheet';
import { INITIAL_SITES, Site, Post } from '../../../mockData/sites';
import { INITIAL_EMPLOYEES, Employee } from '../../../mockData/employees';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Custom Guard Live Location Map Icon with pulse indicator
const createGuardMarkerIcon = (photoUrl: string, isInsideGeofence: boolean) => {
  const borderCol = isInsideGeofence ? '#10B981' : '#EF4444';
  return L.divIcon({
    className: 'custom-guard-marker',
    html: `
      <div style="position: relative; width: 38px; height: 38px; cursor: pointer;">
        <img src="${photoUrl}" style="width: 38px; height: 38px; border-radius: 9999px; object-fit: cover; border: 3px solid ${borderCol}; box-shadow: 0 4px 14px rgba(0,0,0,0.35);" />
        <span style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; border-radius: 9999px; background-color: ${borderCol}; border: 2px solid white;"></span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
  });
};

// Map Fly-To controller component
const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16, { duration: 1.2 });
  }, [center, map]);
  return null;
};

export const SiteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const initialSite = INITIAL_SITES.find(s => s.id === id) || INITIAL_SITES[0];
  const [site, setSite] = useState<Site>(initialSite);
  const [posts, setPosts] = useState<Post[]>(initialSite.posts);
  const [radius, setRadius] = useState<number>(initialSite.geofenceRadiusM);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Deployed Guards Live Tracking Data
  const siteGuards = INITIAL_EMPLOYEES.filter(e => e.currentSiteId === site.id);
  const [mapCenter, setMapCenter] = useState<[number, number]>([site.latitude, site.longitude]);
  const [guardSearch, setGuardSearch] = useState('');
  const [selectedGuard, setSelectedGuard] = useState<Employee | null>(null);
  const [lastPingTime, setLastPingTime] = useState('Just now (2s ago)');

  // Post Form State (Create / Edit)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [postName, setPostName] = useState('');
  const [postAddress, setPostAddress] = useState('');
  const [latitude, setLatitude] = useState(initialSite.latitude);
  const [longitude, setLongitude] = useState(initialSite.longitude);
  const [postRadius, setPostRadius] = useState(60);
  const [requiredGuards, setRequiredGuards] = useState(1);
  const [shiftType, setShiftType] = useState<Post['shiftType']>('24_7_ROTATIONAL');
  const [qrCodeId, setQrCodeId] = useState('');
  const [instructions, setInstructions] = useState('');

  // Simulated live guard positions around the site coordinates
  const liveGuards = siteGuards.slice(0, 8).map((g, idx) => {
    const isInside = idx % 5 !== 0; // 1 out of 5 out of bounds for demonstration
    const latOffset = (idx % 2 === 0 ? 0.00035 : -0.00025) * (idx + 1);
    const lngOffset = (idx % 3 === 0 ? -0.00030 : 0.00035) * (idx + 1);
    return {
      ...g,
      liveLat: site.latitude + latOffset,
      liveLng: site.longitude + lngOffset,
      isInsideGeofence: isInside,
      batteryLevel: 95 - (idx * 6),
      accuracyM: 3 + (idx % 3),
      checkInTime: '08:45 AM',
      distanceFromPostM: isInside ? 8 + idx * 3 : 42 + idx * 5
    };
  });

  const filteredGuards = liveGuards.filter(g =>
    `${g.firstName} ${g.lastName}`.toLowerCase().includes(guardSearch.toLowerCase()) ||
    g.employeeCode.toLowerCase().includes(guardSearch.toLowerCase()) ||
    g.currentPostName.toLowerCase().includes(guardSearch.toLowerCase())
  );

  const openCreatePostModal = () => {
    setEditingPost(null);
    setPostName('');
    setPostAddress(`${site.addressLine} - New Post`);
    setLatitude(site.latitude + 0.0002 * (posts.length + 1));
    setLongitude(site.longitude + 0.0002 * (posts.length + 1));
    setPostRadius(60);
    setRequiredGuards(1);
    setShiftType('24_7_ROTATIONAL');
    setQrCodeId(`QR-${site.clientName.slice(0, 3).toUpperCase()}-${posts.length + 1}`);
    setInstructions('');
    setIsPostModalOpen(true);
  };

  const openEditPostModal = (post: Post) => {
    setEditingPost(post);
    setPostName(post.name);
    setPostAddress(post.addressLine);
    setLatitude(post.latitude);
    setLongitude(post.longitude);
    setPostRadius(post.geofenceRadiusM);
    setRequiredGuards(post.guardCountRequired);
    setShiftType(post.shiftType);
    setQrCodeId(post.qrCodeId);
    setInstructions(post.postInstructions);
    setIsPostModalOpen(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postName) return;

    if (editingPost) {
      const updated: Post = {
        ...editingPost,
        name: postName,
        addressLine: postAddress,
        latitude: Number(latitude),
        longitude: Number(longitude),
        geofenceRadiusM: Number(postRadius),
        guardCountRequired: Number(requiredGuards),
        shiftType,
        qrCodeId: qrCodeId || editingPost.qrCodeId,
        postInstructions: instructions
      };
      setPosts(prev => prev.map(p => p.id === editingPost.id ? updated : p));
      setToastMsg(`Updated post "${postName}" successfully!`);
    } else {
      const newPost: Post = {
        id: `post-${Date.now()}`,
        siteId: site.id,
        siteName: site.name,
        clientId: site.clientId,
        clientName: site.clientName,
        name: postName,
        addressLine: postAddress,
        latitude: Number(latitude),
        longitude: Number(longitude),
        geofenceRadiusM: Number(postRadius),
        guardCountRequired: Number(requiredGuards),
        shiftType,
        qrCodeId: qrCodeId || `QR-${site.clientName.slice(0, 3).toUpperCase()}-${posts.length + 1}`,
        postInstructions: instructions || 'Standard post duty verification.',
        isActive: true
      };
      setPosts(prev => [...prev, newPost]);
      setToastMsg(`Created new post "${postName}" successfully!`);
    }

    setIsPostModalOpen(false);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const focusGuardOnMap = (g: typeof liveGuards[0]) => {
    setMapCenter([g.liveLat, g.liveLng]);
    setSelectedGuard(g);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {/* Back & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/sites')}>
          Back to Sites
        </Button>
        <span className="text-txt-tertiary text-xs">/</span>
        <span className="text-xs font-bold text-txt-primary">{site.name}</span>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 bg-brand-teal-050 border border-brand-teal/30 text-brand-teal text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Site Header Banner */}
      <div className="wt-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-brand-primary-050 text-brand-primary border border-brand-primary/20">
              {site.clientName}
            </span>
            <Badge status={site.isActive ? 'ACTIVE' : 'INACTIVE'} />
          </div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight mt-1">{site.name}</h1>
          <p className="text-xs text-txt-secondary flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-txt-tertiary" />
            <span>{site.addressLine}, {site.city}, {site.state} ({site.zipCode})</span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-txt-tertiary block">Posts</span>
            <span className="text-xl font-extrabold text-brand-primary tabular-nums">{posts.length} Posts</span>
          </div>
          <div className="text-right">
            <span className="text-txt-tertiary block">Live On Duty</span>
            <span className="text-xl font-extrabold text-brand-teal tabular-nums">{liveGuards.length} Guards</span>
          </div>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreatePostModal}>
            Add Duty Post
          </Button>
        </div>
      </div>

      {/* REALTIME GUARD GPS LOCATION TRACKER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Leaflet Live Guard Map (2/3 width) */}
        <div className="lg:col-span-2 wt-card overflow-hidden h-[500px] relative flex flex-col">
          {/* Live Ping Status Bar */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between z-20 text-xs border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>LIVE GUARD LOCATION TRACKER</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                8 Guards Active
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Ping: {lastPingTime}
              </span>
              <span className="hidden sm:inline text-slate-400">GPS Accuracy: ±3m</span>
            </div>
          </div>

          {/* Leaflet Map Container */}
          <div className="flex-1 w-full h-full relative">
            <MapContainer
              center={mapCenter}
              zoom={16}
              scrollWheelZoom={false}
              className="w-full h-full z-10"
            >
              <MapRecenter center={mapCenter} />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Site Geofence Boundary */}
              <Circle
                center={[site.latitude, site.longitude]}
                radius={radius}
                pathOptions={{
                  color: '#2F6BFF',
                  fillColor: '#2F6BFF',
                  fillOpacity: 0.15,
                  weight: 2.5
                }}
              />

              {/* Site Main Marker */}
              <Marker position={[site.latitude, site.longitude]}>
                <Popup>
                  <div className="text-xs font-bold">{site.name}</div>
                  <div className="text-[11px] text-gray-600">Center Campus Radius: {radius}m</div>
                </Popup>
              </Marker>

              {/* Duty Post Markers */}
              {posts.map(p => (
                <Marker key={p.id} position={[p.latitude, p.longitude]}>
                  <Popup>
                    <div className="text-xs font-bold text-brand-primary">Duty Station: {p.name}</div>
                    <div className="text-[11px] text-gray-600">Req Guards: {p.guardCountRequired}</div>
                  </Popup>
                </Marker>
              ))}

              {/* LIVE GUARD GPS MARKERS */}
              {liveGuards.map(g => (
                <Marker
                  key={g.id}
                  position={[g.liveLat, g.liveLng]}
                  icon={createGuardMarkerIcon(g.photoUrl, g.isInsideGeofence)}
                  eventHandlers={{
                    click: () => setSelectedGuard(g)
                  }}
                >
                  <Popup>
                    <div className="p-1 max-w-xs space-y-2 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={g.photoUrl} alt={g.firstName} className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-primary" />
                        <div>
                          <div className="font-bold text-sm text-txt-primary">{g.firstName} {g.lastName}</div>
                          <div className="text-[11px] text-brand-primary font-semibold">{g.role.replace(/_/g, ' ')} • {g.employeeCode}</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200 space-y-1 text-[11px]">
                        <div>Assigned Post: <strong>{g.currentPostName}</strong></div>
                        <div className="flex items-center justify-between">
                          <span>Battery: <strong>{g.batteryLevel}%</strong></span>
                          <span>Check-in: <strong>{g.checkInTime}</strong></span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className={`font-bold ${g.isInsideGeofence ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {g.isInsideGeofence ? `Inside Geofence (${g.distanceFromPostM}m)` : `Outside Geofence (${g.distanceFromPostM}m)`}
                          </span>
                          <span className="font-mono text-gray-500">±{g.accuracyM}m</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Link
                          to={`/employees/${g.id}`}
                          className="w-full inline-flex items-center justify-center gap-1 py-1 px-2 bg-brand-primary text-white text-[11px] font-bold rounded-lg hover:bg-brand-primary-600"
                        >
                          View Guard Profile & Docs <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Live Guards Roster Sidebar (1/3 width) */}
        <div className="wt-card p-4 space-y-4 flex flex-col justify-between h-[500px]">
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4 text-brand-teal" />
                <span>Live Guard Locations ({siteGuards.length})</span>
              </h3>
              <span className="text-[10px] font-bold text-brand-teal px-2 py-0.5 rounded-full bg-brand-teal/10">
                Realtime
              </span>
            </div>

            {/* Search Guards */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-txt-tertiary" />
              <input
                type="text"
                placeholder="Search active guard..."
                value={guardSearch}
                onChange={e => setGuardSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary focus:outline-none"
              />
            </div>

            {/* Guard List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
              {filteredGuards.map(g => (
                <button
                  key={g.id}
                  onClick={() => focusGuardOnMap(g)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedGuard?.id === g.id
                      ? 'bg-brand-primary-050 border-brand-primary text-brand-primary shadow-sm'
                      : 'bg-bg-surface-2 border-border text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-3'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img src={g.photoUrl} alt={g.firstName} className="w-8 h-8 rounded-full object-cover ring-2 ring-border" />
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${
                        g.isInsideGeofence ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-txt-primary">{g.firstName} {g.lastName}</div>
                      <div className="text-[11px] text-txt-secondary">{g.currentPostName}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-bold block ${
                      g.isInsideGeofence ? 'text-brand-teal' : 'text-status-late'
                    }`}>
                      {g.isInsideGeofence ? `${g.distanceFromPostM}m` : 'Out of Bounds'}
                    </span>
                    <span className="text-[10px] text-txt-tertiary flex items-center justify-end gap-1">
                      <Battery className="w-3 h-3 text-emerald-500" /> {g.batteryLevel}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Geofence Parameter Quick Adjustment */}
          <div className="pt-3 border-t border-border space-y-2">
            <div className="flex justify-between text-xs font-bold text-txt-primary">
              <span>Geofence Boundary</span>
              <span className="text-brand-primary tabular-nums">{radius} Meters</span>
            </div>
            <input
              type="range"
              min={50}
              max={500}
              step={10}
              value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              className="w-full accent-brand-primary cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Duty Posts Table with Edit Actions */}
      <div className="wt-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-txt-primary">Posts & Duty Stations ({posts.length})</h3>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreatePostModal}>
            Add Duty Post
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left wt-table">
            <thead>
              <tr>
                <th>POST NAME & INSTRUCTIONS</th>
                <th>GUARD HEADCOUNT REQ</th>
                <th>SHIFT TYPE</th>
                <th>GPS LOCATION & RADIUS</th>
                <th>QR CODE ID</th>
                <th>STATUS</th>
                <th className="text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="font-bold text-xs text-txt-primary">{p.name}</div>
                    <div className="text-[11px] text-txt-secondary">{p.postInstructions}</div>
                  </td>
                  <td className="font-bold text-brand-teal tabular-nums">{p.guardCountRequired} Guards</td>
                  <td className="text-xs font-semibold text-txt-secondary">{p.shiftType}</td>
                  <td>
                    <div className="font-mono text-xs text-txt-primary">{p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</div>
                    <div className="text-[11px] text-brand-primary font-semibold">{p.geofenceRadiusM}m Radius</div>
                  </td>
                  <td className="font-mono text-xs text-txt-secondary">{p.qrCodeId}</td>
                  <td><Badge status={p.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                  <td className="text-right">
                    <Button size="sm" variant="secondary" leftIcon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => openEditPostModal(p)}>
                      Edit Post
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Full Field Create / Edit Post Drawer */}
      <Sheet
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title={editingPost ? `Edit Duty Post: ${editingPost.name}` : 'Create Duty Post Station'}
      >
        <form onSubmit={handleSavePost} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-txt-primary mb-1">Duty Post Station Name</label>
            <input
              type="text"
              required
              value={postName}
              onChange={e => setPostName(e.target.value)}
              placeholder="e.g. Cash Vault Entrance"
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Specific Post Address / Location Details</label>
            <input
              type="text"
              value={postAddress}
              onChange={e => setPostAddress(e.target.value)}
              placeholder="e.g. Basement B2, Vault Room Gate 1"
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-txt-primary mb-1">Required Guards Headcount</label>
              <input
                type="number"
                min={1}
                value={requiredGuards}
                onChange={e => setRequiredGuards(Number(e.target.value))}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-txt-primary mb-1">Shift Type</label>
              <select
                value={shiftType}
                onChange={e => setShiftType(e.target.value as any)}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
              >
                <option value="24_7_ROTATIONAL">24x7 Rotational Shift</option>
                <option value="DAY">Day Shift Only</option>
                <option value="NIGHT">Night Shift Only</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-txt-primary mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={e => setLatitude(Number(e.target.value))}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-txt-primary mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={e => setLongitude(Number(e.target.value))}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-txt-primary mb-1">Geofence (m)</label>
              <input
                type="number"
                value={postRadius}
                onChange={e => setPostRadius(Number(e.target.value))}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">QR Code Check-in Token ID</label>
            <input
              type="text"
              value={qrCodeId}
              onChange={e => setQrCodeId(e.target.value.toUpperCase())}
              placeholder="QR-HDF-5"
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-mono uppercase"
            />
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Post Duty Instructions</label>
            <textarea
              rows={3}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Detailed instructions for guards on post..."
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setIsPostModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              {editingPost ? 'Save Post Changes' : 'Create Duty Post'}
            </Button>
          </div>
        </form>
      </Sheet>
    </motion.div>
  );
};
