import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, KeyRound, Plus, Shield, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog, PageHeader, Pagination, SearchInput } from '../../../components/data';
import { EmptyState, ErrorState, LoadingState } from '../../../components/feedback/States';
import { useAuth } from '../../../core/auth';
import { queryKeys } from '../../../core/query';
import { catalogApi, rolesApi, type Role } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useDebounced, useToast } from '../../../hooks';

export const RolesPage: React.FC = () => {
  const { can } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);

  const [isFormOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Role | null>(null);

  const params = { page, pageSize, q: debouncedSearch || undefined, sort: 'createdAt', order: 'asc' as const };

  const roles = useQuery({
    queryKey: queryKeys.roles(params),
    queryFn: () => rolesApi.list(params),
  });

  // The permission matrix comes from the API, narrowed to the modules this
  // workspace owns — so a role can never be built around a capability the
  // module gate would then strip.
  const permissionGroups = useQuery({
    queryKey: queryKeys.catalogPermissions,
    queryFn: () => catalogApi.assignablePermissions(),
    staleTime: 5 * 60_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['roles'] });
    void queryClient.invalidateQueries({ queryKey: ['employees'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const removeRole = useMutation({
    mutationFn: (role: Role) => rolesApi.remove(role.id),
    onSuccess: (_, role) => {
      toast.success('Role removed', `${role.name} is no longer available.`);
      setPendingDelete(null);
      invalidate();
    },
    onError: (error) => toast.error('Could not remove the role', describeApiError(error)),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Role-based access control"
        eyebrowIcon={<KeyRound className="w-3.5 h-3.5" aria-hidden />}
        title="Roles & access"
        description="Roles decide what each person can do. At least one role must exist before employees can be added."
        actions={
          can('ROLE_CREATE') ? (
            <Button onClick={openCreate} leftIcon={<Plus className="w-4 h-4" aria-hidden />}>
              Create role
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
        placeholder="Search roles by name or code…"
        className="max-w-md"
        label="Search roles"
      />

      {roles.isLoading ? (
        <LoadingState label="Loading roles…" />
      ) : roles.isError ? (
        <ErrorState message={describeApiError(roles.error)} onRetry={() => void roles.refetch()} />
      ) : roles.data!.data.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title={debouncedSearch ? 'No roles match that search' : 'No roles configured yet'}
          description={
            debouncedSearch
              ? 'Try a different name or code.'
              : 'A role is a named set of permissions. Create the first one — employees cannot be onboarded until at least one exists.'
          }
          action={
            !debouncedSearch && can('ROLE_CREATE')
              ? { label: 'Create the first role', onClick: openCreate, icon: <Plus className="w-3.5 h-3.5" /> }
              : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {roles.data!.data.map((role) => (
              <article
                key={role.id}
                className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-extrabold text-sm text-txt-primary truncate">{role.name}</h2>
                    <span className="text-[10px] font-mono font-bold text-brand-primary">{role.code}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!role.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-bg-surface-2 text-txt-secondary border border-border">
                        Inactive
                      </span>
                    )}
                    {can('ROLE_UPDATE') && (
                      <button
                        onClick={() => openEdit(role)}
                        className="text-[10px] font-bold text-brand-primary hover:underline px-1"
                      >
                        Edit
                      </button>
                    )}
                    {can('ROLE_DELETE') && !role.isSystem && (
                      <button
                        onClick={() => setPendingDelete(role)}
                        aria-label={`Delete ${role.name}`}
                        className="text-status-absent hover:text-status-absent p-1 rounded-md hover:bg-status-absent/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-txt-secondary leading-relaxed flex-1">
                  {role.description || 'No description provided.'}
                </p>

                <div className="pt-2 border-t border-border/60 space-y-2">
                  <span className="text-[11px] font-bold text-txt-secondary">
                    {role.permissions.length} permission{role.permissions.length === 1 ? '' : 's'}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 6).map((permission) => (
                      <span
                        key={permission.code}
                        title={`${permission.moduleName} · ${permission.name}`}
                        className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-bg-surface-2 text-txt-primary border border-border"
                      >
                        {permission.code}
                      </span>
                    ))}
                    {role.permissions.length > 6 && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono text-txt-secondary">
                        +{role.permissions.length - 6} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-txt-secondary font-mono pt-1 border-t border-border/60">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" aria-hidden /> {role.usage.employees} employee
                    {role.usage.employees === 1 ? '' : 's'}
                  </span>
                  <span>{role.usage.users} login{role.usage.users === 1 ? '' : 's'}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="bg-bg-surface border border-border rounded-2xl">
            <Pagination
              meta={roles.data!.meta}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              label="roles"
            />
          </div>
        </>
      )}

      {isFormOpen && (
        <RoleFormDialog
          role={editing}
          permissionGroups={permissionGroups.data ?? []}
          isLoadingPermissions={permissionGroups.isLoading}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            invalidate();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title={`Delete ${pendingDelete?.name ?? 'this role'}?`}
        message="This cannot be undone. Roles still assigned to an employee or a login cannot be deleted."
        confirmLabel="Delete role"
        tone="destructive"
        isBusy={removeRole.isPending}
        onConfirm={() => pendingDelete && removeRole.mutate(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

interface RoleFormDialogProps {
  role: Role | null;
  permissionGroups: { moduleCode: string; moduleName: string; permissions: { code: string; name: string; description: string | null }[] }[];
  isLoadingPermissions: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const RoleFormDialog: React.FC<RoleFormDialogProps> = ({
  role,
  permissionGroups,
  isLoadingPermissions,
  onClose,
  onSaved,
}) => {
  const toast = useToast();
  const isEditing = role !== null;

  const [name, setName] = useState(role?.name ?? '');
  const [code, setCode] = useState(role?.code ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [selected, setSelected] = useState<string[]>(role?.permissionCodes ?? []);
  const [error, setError] = useState('');

  const save = useMutation({
    mutationFn: () =>
      isEditing
        ? rolesApi.update(role!.id, { name, description: description || null, permissionCodes: selected })
        : rolesApi.create({ name, code, description: description || undefined, permissionCodes: selected }),
    onSuccess: () => {
      toast.success(isEditing ? 'Role updated' : 'Role created', `${name} is ready to assign.`);
      onSaved();
    },
    onError: (caught) => setError(describeApiError(caught)),
  });

  const togglePermission = (permissionCode: string) => {
    setSelected((current) =>
      current.includes(permissionCode)
        ? current.filter((item) => item !== permissionCode)
        : [...current, permissionCode],
    );
  };

  const toggleModule = (moduleCode: string) => {
    const group = permissionGroups.find((item) => item.moduleCode === moduleCode);
    if (!group) return;
    const codes = group.permissions.map((permission) => permission.code);
    const allSelected = codes.every((permissionCode) => selected.includes(permissionCode));
    setSelected((current) =>
      allSelected
        ? current.filter((permissionCode) => !codes.includes(permissionCode))
        : [...new Set([...current, ...codes])],
    );
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (selected.length === 0) {
      setError('A role needs at least one permission.');
      return;
    }
    save.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-bg-surface border border-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="border-b border-border pb-3">
          <h2 className="text-base font-bold text-txt-primary">{isEditing ? `Edit ${role!.name}` : 'Create a role'}</h2>
          <p className="text-xs text-txt-secondary mt-0.5">
            Choose the permissions this role grants. Only the modules your organisation owns are listed.
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-status-absent/10 border border-status-absent/25 text-status-absent text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" aria-hidden />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="role-name" className="block text-xs font-bold text-txt-secondary mb-1">
                Role name <span className="text-status-absent">*</span>
              </label>
              <input
                id="role-name"
                required
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (!isEditing) setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]+/g, '_'));
                }}
                placeholder="Shift Supervisor"
                className="w-full px-3 py-2 bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
            </div>
            <div>
              <label htmlFor="role-code" className="block text-xs font-bold text-txt-secondary mb-1">
                Role code <span className="text-status-absent">*</span>
              </label>
              <input
                id="role-code"
                required
                disabled={isEditing}
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]+/g, '_'))}
                placeholder="SHIFT_SUPERVISOR"
                className="w-full px-3 py-2 bg-bg-surface-2 border border-border rounded-xl text-sm font-mono text-txt-primary disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
            </div>
          </div>

          <div>
            <label htmlFor="role-description" className="block text-xs font-bold text-txt-secondary mb-1">
              Description
            </label>
            <input
              id="role-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What this role is responsible for"
              className="w-full px-3 py-2 bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-xs font-bold text-txt-secondary mb-1">
              Permissions ({selected.length} selected)
            </legend>

            {isLoadingPermissions ? (
              <LoadingState label="Loading the permission matrix…" />
            ) : permissionGroups.length === 0 ? (
              <p className="text-xs text-txt-secondary p-4 bg-bg-surface-2 rounded-xl">
                No modules are assigned to this organisation, so there is nothing to grant yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {permissionGroups.map((group) => {
                  const codes = group.permissions.map((permission) => permission.code);
                  const allSelected = codes.every((permissionCode) => selected.includes(permissionCode));

                  return (
                    <div key={group.moduleCode} className="border border-border rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-bg-surface-2 border-b border-border">
                        <span className="text-[11px] font-bold text-txt-primary">{group.moduleName}</span>
                        <button
                          type="button"
                          onClick={() => toggleModule(group.moduleCode)}
                          className="text-[10px] font-bold text-brand-primary hover:underline"
                        >
                          {allSelected ? 'Clear all' : 'Select all'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2">
                        {group.permissions.map((permission) => {
                          const isChecked = selected.includes(permission.code);
                          return (
                            <label
                              key={permission.code}
                              className={`p-2 rounded-lg border text-[11px] cursor-pointer flex items-start justify-between gap-2 transition-colors ${
                                isChecked
                                  ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold'
                                  : 'border-border bg-bg-surface hover:border-brand-primary/40 text-txt-secondary'
                              }`}
                            >
                              <span className="min-w-0">
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={isChecked}
                                  onChange={() => togglePermission(permission.code)}
                                />
                                <span className="block">{permission.name}</span>
                                <span className="block text-[9px] font-mono opacity-70">{permission.code}</span>
                              </span>
                              {isChecked && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden />}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </fieldset>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" isLoading={save.isPending}>
              {isEditing ? 'Save changes' : 'Create role'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
