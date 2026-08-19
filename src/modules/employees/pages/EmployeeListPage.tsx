import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, KeyRound, Mail, Phone, Plus, Users } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { PageHeader, Pagination, SearchInput, SortableHeader } from '../../../components/data';
import { EmptyState, ErrorState, TableSkeleton } from '../../../components/feedback/States';
import { useAuth } from '../../../core/auth';
import { queryKeys } from '../../../core/query';
import { employeesApi, rolesApi, sitesApi } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useDebounced, useToast } from '../../../hooks';
import { EmployeeFormDialog } from '../components/EmployeeFormDialog';

const STATUSES = ['ONBOARDING', 'ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'INACTIVE', 'TERMINATED'];

export const EmployeeListPage: React.FC = () => {
  const { can } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [roleId, setRoleId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [isFormOpen, setFormOpen] = useState(false);

  const debouncedSearch = useDebounced(search);
  const params = {
    page,
    pageSize,
    sort,
    order,
    q: debouncedSearch || undefined,
    status: status || undefined,
    roleId: roleId || undefined,
    siteId: siteId || undefined,
  };

  const employees = useQuery({
    queryKey: queryKeys.employees(params),
    queryFn: () => employeesApi.list(params),
  });

  const roles = useQuery({
    queryKey: queryKeys.roles({ pageSize: 100, isActive: true }),
    queryFn: () => rolesApi.list({ pageSize: 100, isActive: true }),
    staleTime: 60_000,
  });

  const sites = useQuery({
    queryKey: queryKeys.sites({ pageSize: 100 }),
    queryFn: () => sitesApi.list({ pageSize: 100, isActive: true }),
    enabled: can('SITE_VIEW'),
    staleTime: 60_000,
  });

  /**
   * The server is the authority on whether onboarding is possible. It reports
   * `rolesConfigured` alongside the list, so the button state and the warning
   * both come from the same answer rather than a second guess on the client.
   */
  const rolesConfigured = (employees.data?.meta.rolesConfigured as boolean | undefined) ?? true;

  const toggleSort = (field: string) => {
    if (sort === field) {
      setOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(field);
      setOrder('asc');
    }
    setPage(1);
  };

  const hasFilters = Boolean(debouncedSearch || status || roleId || siteId);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Workforce"
        eyebrowIcon={<Users className="w-3.5 h-3.5" aria-hidden />}
        title="Employees"
        description="Everyone on the books, with the role they hold and where they are deployed."
        actions={
          can('EMPLOYEE_CREATE') ? (
            <Button
              onClick={() => setFormOpen(true)}
              disabled={!rolesConfigured}
              title={rolesConfigured ? undefined : 'Configure at least one role first'}
              leftIcon={<Plus className="w-4 h-4" aria-hidden />}
            >
              Add employee
            </Button>
          ) : undefined
        }
      />

      {/* The role gate, stated plainly rather than as a disabled button with no
          explanation. The backend refuses the same request independently. */}
      {!rolesConfigured && !employees.isLoading && (
        <div className="p-4 bg-status-late/10 border border-status-late/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-status-late flex-shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden />
            <div>
              <h2 className="font-extrabold text-sm text-txt-primary">Roles must be configured first</h2>
              <p className="text-xs text-txt-secondary mt-0.5 leading-relaxed max-w-xl">
                Every employee holds a role, so at least one role has to exist before anyone can be onboarded. This is
                enforced by the server as well — creating an employee now would be rejected.
              </p>
            </div>
          </div>
          {can('ROLE_CREATE') && (
            <Link
              to="/roles"
              className="px-4 py-2 bg-status-late text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 flex-shrink-0 hover:opacity-90 transition-opacity min-h-[38px]"
            >
              <KeyRound className="w-4 h-4" aria-hidden /> Configure roles
            </Link>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by name, code, phone or designation…"
          className="flex-1 max-w-md"
          label="Search employees"
        />

        <div className="flex flex-wrap gap-2">
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
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <select
            value={roleId}
            onChange={(event) => {
              setRoleId(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by role"
            className="px-3 py-2 min-h-[38px] bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          >
            <option value="">All roles</option>
            {(roles.data?.data ?? []).map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          {can('SITE_VIEW') && (
            <select
              value={siteId}
              onChange={(event) => {
                setSiteId(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by site"
              className="px-3 py-2 min-h-[38px] bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            >
              <option value="">All sites</option>
              {(sites.data?.data ?? []).map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {employees.isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : employees.isError ? (
          <ErrorState message={describeApiError(employees.error)} onRetry={() => void employees.refetch()} />
        ) : employees.data!.data.length === 0 ? (
          <EmptyState
            icon={Users}
            title={hasFilters ? 'No employees match these filters' : 'No employees yet'}
            description={
              hasFilters
                ? 'Try clearing a filter or searching for something else.'
                : rolesConfigured
                  ? 'Onboard your first employee to start building the roster.'
                  : 'Configure a role first — every employee must hold one.'
            }
            action={
              hasFilters
                ? {
                    label: 'Clear filters',
                    onClick: () => {
                      setSearch('');
                      setStatus('');
                      setRoleId('');
                      setSiteId('');
                      setPage(1);
                    },
                  }
                : rolesConfigured && can('EMPLOYEE_CREATE')
                  ? { label: 'Add employee', onClick: () => setFormOpen(true), icon: <Plus className="w-3.5 h-3.5" /> }
                  : undefined
            }
            className="border-0"
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-surface-2 border-b border-border/70 text-txt-secondary">
                  <tr>
                    <SortableHeader field="employeeCode" label="Code" currentSort={sort} currentOrder={order} onSort={toggleSort} />
                    <SortableHeader field="firstName" label="Name" currentSort={sort} currentOrder={order} onSort={toggleSort} />
                    <SortableHeader field="designation" label="Designation" currentSort={sort} currentOrder={order} onSort={toggleSort} />
                    <th scope="col" className="px-4 py-3 font-mono uppercase text-[10px] tracking-wide">Role</th>
                    <th scope="col" className="px-4 py-3 font-mono uppercase text-[10px] tracking-wide">Deployment</th>
                    <SortableHeader field="status" label="Status" currentSort={sort} currentOrder={order} onSort={toggleSort} />
                    <th scope="col" className="px-4 py-3 font-mono uppercase text-[10px] tracking-wide text-right">Records</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {employees.data!.data.map((employee) => (
                    <tr
                      key={employee.id}
                      onClick={() => navigate(`/employees/${employee.id}`)}
                      className="hover:bg-bg-surface-2/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-brand-primary">{employee.employeeCode}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-txt-primary">{employee.fullName}</div>
                        <div className="text-[10px] text-txt-secondary">{employee.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-txt-primary">{employee.designation}</div>
                        <div className="text-[10px] text-txt-secondary">{employee.department}</div>
                      </td>
                      <td className="px-4 py-3 text-txt-secondary">{employee.role.name}</td>
                      <td className="px-4 py-3">
                        {employee.currentSite ? (
                          <>
                            <div className="text-txt-primary">{employee.currentSite.name}</div>
                            <div className="text-[10px] text-txt-secondary">{employee.currentPost?.name ?? 'No post assigned'}</div>
                          </>
                        ) : (
                          <span className="text-txt-tertiary">Not deployed</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={employee.status} />
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        {employee.kycStatus && (
                          <span
                            title={`KYC ${employee.kycStatus.toLowerCase()}`}
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              employee.kycStatus === 'VERIFIED'
                                ? 'bg-brand-teal/10 text-brand-teal'
                                : 'bg-status-pending/10 text-txt-secondary'
                            }`}
                          >
                            KYC
                          </span>
                        )}
                        {employee.hasBankAccount && (
                          <span
                            title={employee.bankVerified ? 'Bank account verified' : 'Bank account on file, not verified'}
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              employee.bankVerified ? 'bg-brand-teal/10 text-brand-teal' : 'bg-status-pending/10 text-txt-secondary'
                            }`}
                          >
                            BANK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards — a nine-column table is unusable on a phone. */}
            <div className="md:hidden divide-y divide-border/60">
              {employees.data!.data.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => navigate(`/employees/${employee.id}`)}
                  className="w-full text-left p-4 space-y-2 hover:bg-bg-surface-2/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-txt-primary truncate">{employee.fullName}</div>
                      <div className="text-[11px] font-mono text-brand-primary">{employee.employeeCode}</div>
                    </div>
                    <Badge status={employee.status} />
                  </div>
                  <div className="text-xs text-txt-secondary space-y-0.5">
                    <div>{employee.designation} · {employee.role.name}</div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3" aria-hidden /> {employee.phone}
                    </div>
                    {employee.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" aria-hidden /> {employee.email}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <Pagination
              meta={employees.data!.meta}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              label="employees"
            />
          </>
        )}
      </div>

      {isFormOpen && (
        <EmployeeFormDialog
          roles={roles.data?.data ?? []}
          sites={sites.data?.data ?? []}
          onClose={() => setFormOpen(false)}
          onSaved={(employee) => {
            setFormOpen(false);
            toast.success('Employee onboarded', `${employee.fullName} was added as ${employee.employeeCode}.`);
            void queryClient.invalidateQueries({ queryKey: ['employees'] });
            void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            navigate(`/employees/${employee.id}`);
          }}
        />
      )}
    </div>
  );
};
