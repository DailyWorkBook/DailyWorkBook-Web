import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { sitesApi, type Site } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';

interface Props {
  site?: Site;
  onClose: () => void;
  onSaved: (site: Site) => void;
}

export const SiteFormDialog: React.FC<Props> = ({ site, onClose, onSaved }) => {
  const isEditing = Boolean(site);

  const [name, setName] = useState(site?.name ?? '');
  const [addressLine, setAddress] = useState(site?.addressLine ?? '');
  const [city, setCity] = useState(site?.city ?? '');
  const [state, setState] = useState(site?.state ?? '');
  const [postalCode, setPostalCode] = useState(site?.postalCode ?? '');
  const [latitude, setLatitude] = useState(site ? String(site.latitude) : '');
  const [longitude, setLongitude] = useState(site ? String(site.longitude) : '');
  const [geofenceRadiusM, setRadius] = useState(String(site?.geofenceRadiusM ?? 100));
  const [contactPerson, setContactPerson] = useState(site?.contactPerson ?? '');
  const [contactPhone, setContactPhone] = useState(site?.contactPhone ?? '');
  const [error, setError] = useState('');

  const save = useMutation({
    mutationFn: () => {
      const body = {
        name,
        addressLine,
        city,
        state: state || undefined,
        postalCode: postalCode || undefined,
        latitude: Number(latitude),
        longitude: Number(longitude),
        geofenceRadiusM: Number(geofenceRadiusM),
        contactPerson: contactPerson || undefined,
        contactPhone: contactPhone || undefined,
      };
      return isEditing ? sitesApi.update(site!.id, body) : sitesApi.create(body);
    },
    onSuccess: onSaved,
    onError: (caught) => setError(describeApiError(caught)),
  });

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('This browser cannot report your location. Enter the coordinates by hand.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
      },
      () => setError('Location permission was refused. Enter the coordinates by hand.'),
    );
  };

  const fieldClass =
    'w-full px-3 py-2 min-h-[38px] bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-bg-surface border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="border-b border-border pb-3">
          <h2 className="text-base font-bold text-txt-primary">{isEditing ? `Edit ${site!.name}` : 'Add a site'}</h2>
          <p className="text-xs text-txt-secondary mt-0.5">
            The coordinates and radius define the geofence every check-in is measured against.
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-status-absent/10 border border-status-absent/25 text-status-absent text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" aria-hidden />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            save.mutate();
          }}
          className="space-y-3"
        >
          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">
              Site name <span className="text-status-absent">*</span>
            </span>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Corporate Tower, Hinjawadi" className={fieldClass} />
          </label>

          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">
              Address <span className="text-status-absent">*</span>
            </span>
            <input required value={addressLine} onChange={(e) => setAddress(e.target.value)} className={fieldClass} />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">
                City <span className="text-status-absent">*</span>
              </span>
              <input required value={city} onChange={(e) => setCity(e.target.value)} className={fieldClass} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">State</span>
              <input value={state} onChange={(e) => setState(e.target.value)} className={fieldClass} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Postal code</span>
              <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={fieldClass} />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">
                Latitude <span className="text-status-absent">*</span>
              </span>
              <input
                required
                type="number"
                step="any"
                min={-90}
                max={90}
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className={`${fieldClass} font-mono`}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">
                Longitude <span className="text-status-absent">*</span>
              </span>
              <input
                required
                type="number"
                step="any"
                min={-180}
                max={180}
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className={`${fieldClass} font-mono`}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Geofence (m)</span>
              <input
                type="number"
                min={10}
                max={5000}
                value={geofenceRadiusM}
                onChange={(e) => setRadius(e.target.value)}
                className={fieldClass}
              />
            </label>
          </div>

          <button type="button" onClick={useCurrentLocation} className="text-[11px] font-bold text-brand-primary hover:underline">
            Use my current location
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Site contact</span>
              <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className={fieldClass} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Contact phone</span>
              <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={fieldClass} />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" isLoading={save.isPending}>
              {isEditing ? 'Save changes' : 'Create site'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
