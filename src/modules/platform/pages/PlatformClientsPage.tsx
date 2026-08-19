import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { PageHeader, Pagination, SearchInput, SortableHeader } from '../../../components/data';
import { EmptyState, ErrorState, TableSkeleton } from '../../../components/feedback/States';
import { queryKeys } from '../../../core/query';
import { platformApi } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useDebounced, useToast } from '../../../hooks';
import { CreateClientWizard } from '../components/CreateClientWizard';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-brand-teal/10 text-brand-teal',
  SUSPENDED: 'bg-status-late/10 text-status-late',
  INACTIVE: 'bg-status-absent/10 text-status-absent',
};

export const PlatformClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [isWizardOpen, setWizardOpen] = useState(false);

  const debouncedSearch = useDebounced(search);
  const params = { page, pageSize, sort, order, q: debouncedSearch || undefined, status: status || undefined };

  const clients = useQuery({
    queryKey: queryKeys.platformClients(params),
    queryFn: () => platformApi.listClients(params),
  });

  const toggleSort = (field: string) => {
    if (sort === field) setOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
    else {
      setSort(field);
      setOrder('asc');
    }
    setPage(1);
  };

  const money = (value: number, currency = 'INR') =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Platform"
        eyebrowIcon={<Building2 className="w-3.5 h-3.5" aria-hidden />}
        title="Clients"
        description="Every organisation on the platform, with the modules they own and what they are billed."
        actions={
          <Button onClick={() => setWizardOpen(true)} leftIcon={<Plus className="w-4 h-4" aria-hidden />}>
            Create client
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by name, code, contact or city…"
          className="flex-1 max-w-md"
          label="Search clients"
        />
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
          className="px-3 py-2 min-h-[38px] bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {clients.isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : clients.isError ? (
          <ErrorState message={describeApiError(clients.error)} onRetry={() => void clients.refetch()} />
        ) : clients.data!.data.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={debouncedSearch || status ? 'No clients match these filters' : 'No clients yet'}
            description={
              debouncedSearch || status
                ? 'Try a different search term or status.'
                : 'Onboard your first client: pick their modules, price the plan, and create their administrator account.'
            }
            action={
              !debouncedSearch && !status
                ? { label: 'Create the first client', onClick: () => setWizardOpen(true), icon: <Plus className="w-3.5 h-3.5" /> }
                : undefined
            }
            className="border-0"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-surface-2 border-b border-border/70 text-txt-secondary">
                  <tr>
                    <SortableHeader field="name" label="Client" currentSort={sort} currentOrder={order} onSort={toggleSort} />
                    <SortableHeader field="city" label="Location" currentSort={sort} currentOrder={order} onSort={toggleSort} />
                    <th scope="col" className="px-4 py-3 font-mono uppercase text-[10px] tracking-wide">Modules</th>
                    <th scope="col" className="px-4 py-3 font-mono uppercase text-[10px] tracking-wide">Administrator</th>
                    <th scope="col" className="px-4 py-3 font-mono uppercase text-[10px] tracking-wide text-right">Monthly</th>
                    <SortableHeader field="status" label="Status" currentSort={sort} currentOrder={order} onSort={toggleSort} className="text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {clients.data!.data.map((client) => (
                    <tr
                      key={client.id}
                      onClick={() => navigate(`/platform/clients/${client.id}`)}
                      className="hover:bg-bg-surface-2/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-txt-primary">{client.name}</div>
                        <div className="text-[10px] font-mono text-brand-primary">{client.code}</div>
                      </td>
                      <td className="px-4 py-3 text-txt-secondary">
                        {client.city}
                        {client.state && `, ${client.state}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-txt-primary tabular-nums">{client.modules.length}</span>
                        <span className="text-txt-secondary"> assigned</span>
                        <div className="text-[10px] text-txt-secondary">
                          {client.counts.employees} employees · {client.counts.sites} sites
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {client.primaryAdmin ? (
                          <>
                            <div className="text-txt-primary">{client.primaryAdmin.name}</div>
                            <div className="text-[10px] text-txt-secondary truncate max-w-[14rem]">
                              {client.primaryAdmin.email}
                            </div>
                          </>
                        ) : (
                          <span className="text-txt-tertiary">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold text-txt-primary">
                        {client.subscription
                          ? money(client.subscription.monthlyAmount, client.subscription.currency)
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            STATUS_STYLES[client.status] ?? 'bg-bg-surface-2 text-txt-secondary'
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              meta={clients.data!.meta}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              label="clients"
            />
          </>
        )}
      </div>

      {isWizardOpen && (
        <CreateClientWizard
          onClose={() => setWizardOpen(false)}
          onCreated={(client) => {
            setWizardOpen(false);
            toast.success(
              'Client created',
              `${client.name} is live. Their administrator can sign in with the credentials you set.`,
            );
            void queryClient.invalidateQueries({ queryKey: ['platform'] });
            navigate(`/platform/clients/${client.id}`);
          }}
        />
      )}
    </div>
  );
};
