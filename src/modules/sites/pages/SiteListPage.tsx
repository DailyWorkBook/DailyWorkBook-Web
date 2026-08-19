import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, MapPin, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { PageHeader, Pagination, SearchInput } from '../../../components/data';
import { EmptyState, ErrorState, TableSkeleton } from '../../../components/feedback/States';
import { useAuth } from '../../../core/auth';
import { queryKeys } from '../../../core/query';
import { sitesApi, type Site } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useDebounced, useToast } from '../../../hooks';
import { SiteFormDialog } from '../components/SiteFormDialog';

export const SiteListPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { can } = useAuth();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [isFormOpen, setFormOpen] = useState(false);
  const debouncedSearch = useDebounced(search);

  const params = { page, pageSize, q: debouncedSearch || undefined, sort: 'createdAt', order: 'desc' as const };

  const sites = useQuery({
    queryKey: queryKeys.sites(params),
    queryFn: () => sitesApi.list(params),
  });

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Deployment"
        eyebrowIcon={<Building2 className="w-3.5 h-3.5" aria-hidden />}
        title="Sites & posts"
        description="Each site holds the posts you guard. Shifts and rosters are built beneath them."
        actions={
          can('SITE_CREATE') ? (
            <Button onClick={() => setFormOpen(true)} leftIcon={<Plus className="w-4 h-4" aria-hidden />}>
              Add site
            </Button>
          ) : undefined
        }
      />

      <SearchInput
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search by site name, code, city or address…"
        className="max-w-md"
        label="Search sites"
      />

      {sites.isLoading ? (
        <TableSkeleton rows={4} columns={4} />
      ) : sites.isError ? (
        <ErrorState message={describeApiError(sites.error)} onRetry={() => void sites.refetch()} />
      ) : sites.data!.data.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={debouncedSearch ? 'No sites match that search' : 'No sites yet'}
          description={
            debouncedSearch
              ? 'Try a different name, code or city.'
              : 'A site is a place you deploy people to. Add one to start building posts, shifts and rosters beneath it.'
          }
          action={
            !debouncedSearch && can('SITE_CREATE')
              ? { label: 'Add your first site', onClick: () => setFormOpen(true), icon: <Plus className="w-3.5 h-3.5" /> }
              : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sites.data!.data.map((site) => (
              <button
                key={site.id}
                onClick={() => navigate(`/sites/${site.id}`)}
                className="text-left bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3 hover:border-brand-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-wide">{site.code}</span>
                    <h2 className="text-base font-extrabold text-txt-primary leading-tight mt-0.5 truncate">{site.name}</h2>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                      site.isActive ? 'bg-brand-teal/10 text-brand-teal' : 'bg-bg-surface-2 text-txt-secondary'
                    }`}
                  >
                    {site.isActive ? 'Active' : 'Archived'}
                  </span>
                </div>

                <div className="text-xs text-txt-secondary space-y-1">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden />
                    <span className="line-clamp-2">
                      {site.addressLine}, {site.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" aria-hidden />
                    <span>Geofence {site.geofenceRadiusM} m</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-txt-secondary">
                    <span className="font-bold text-txt-primary tabular-nums">{site.postCount}</span> post
                    {site.postCount === 1 ? '' : 's'}
                  </span>
                  <span className="text-txt-secondary">
                    <span className="font-bold text-txt-primary tabular-nums">{site.guardsRequired}</span> required
                  </span>
                  <span className="text-txt-secondary">
                    <span className="font-bold text-brand-primary tabular-nums">{site.employeeCount}</span> deployed
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-bg-surface border border-border rounded-2xl">
            <Pagination
              meta={sites.data!.meta}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              label="sites"
            />
          </div>
        </>
      )}

      {isFormOpen && (
        <SiteFormDialog
          onClose={() => setFormOpen(false)}
          onSaved={(site: Site) => {
            setFormOpen(false);
            toast.success('Site created', `${site.name} was added as ${site.code}.`);
            void queryClient.invalidateQueries({ queryKey: ['sites'] });
            void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            navigate(`/sites/${site.id}`);
          }}
        />
      )}
    </div>
  );
};
