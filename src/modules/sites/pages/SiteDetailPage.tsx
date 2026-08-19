import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, DoorOpen, MapPin, Plus, QrCode, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog, PageHeader } from '../../../components/data';
import { EmptyState, ErrorState, LoadingState } from '../../../components/feedback/States';
import { useAuth } from '../../../core/auth';
import { queryKeys } from '../../../core/query';
import { sitesApi, type Post } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useToast } from '../../../hooks';
import { SiteFormDialog } from '../components/SiteFormDialog';
import { PostFormDialog } from '../components/PostFormDialog';

export const SiteDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { can } = useAuth();

  const [isEditOpen, setEditOpen] = useState(false);
  const [isPostFormOpen, setPostFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [pendingPostDelete, setPendingPostDelete] = useState<Post | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);

  const site = useQuery({
    queryKey: queryKeys.site(id),
    queryFn: () => sitesApi.get(id),
    enabled: Boolean(id),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.site(id) });
    void queryClient.invalidateQueries({ queryKey: ['sites'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const removePost = useMutation({
    mutationFn: (post: Post) => sitesApi.removePost(post.id),
    onSuccess: (_, post) => {
      toast.success('Post archived', `${post.name} is no longer active.`);
      setPendingPostDelete(null);
      invalidate();
    },
    onError: (error) => toast.error('Could not archive the post', describeApiError(error)),
  });

  const archiveSite = useMutation({
    mutationFn: () => sitesApi.remove(id),
    onSuccess: () => {
      toast.success('Site archived');
      setConfirmArchive(false);
      invalidate();
      navigate('/sites');
    },
    onError: (error) => toast.error('Could not archive the site', describeApiError(error)),
  });

  if (site.isLoading) return <LoadingState label="Loading site…" />;

  if (site.isError) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate('/sites')} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
          Back to sites
        </Button>
        <ErrorState message={describeApiError(site.error)} onRetry={() => void site.refetch()} />
      </div>
    );
  }

  const data = site.data!;
  const posts = (data.posts ?? []) as Post[];

  return (
    <div className="space-y-6 pb-12">
      <Link to="/sites" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden /> Back to sites
      </Link>

      <PageHeader
        eyebrow={data.code}
        title={data.name}
        description={`${data.addressLine}, ${data.city}${data.state ? `, ${data.state}` : ''}`}
        actions={
          <div className="flex gap-2">
            {can('SITE_UPDATE') && (
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                Edit site
              </Button>
            )}
            {can('SITE_DELETE') && data.isActive && (
              <Button variant="destructive" onClick={() => setConfirmArchive(true)}>
                Archive
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Geofence radius', value: `${data.geofenceRadiusM} m`, icon: ShieldCheck },
          { label: 'Posts', value: String(data.postCount), icon: DoorOpen },
          { label: 'Guards required', value: String(data.guardsRequired), icon: MapPin },
          { label: 'Deployed here', value: String(data.employeeCount), icon: MapPin },
        ].map((tile) => {
          const Icon = tile.icon;
          return (
            <div key={tile.label} className="bg-bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-txt-secondary">{tile.label}</span>
                <Icon className="w-4 h-4 text-brand-primary" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="text-2xl font-black text-txt-primary tabular-nums mt-1">{tile.value}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/70">
          <div>
            <h2 className="text-sm font-extrabold text-txt-primary">Posts at this site</h2>
            <p className="text-[11px] text-txt-secondary">Shifts are defined against a post, and rosters against a shift.</p>
          </div>
          {can('POST_CREATE') && (
            <Button
              size="sm"
              onClick={() => {
                setEditingPost(null);
                setPostFormOpen(true);
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" aria-hidden />}
            >
              Add post
            </Button>
          )}
        </div>

        {posts.length === 0 ? (
          <EmptyState
            icon={DoorOpen}
            title="No posts at this site yet"
            description="A post is a position you staff — a gate, a lobby, a control room. Add one to start defining shifts."
            action={
              can('POST_CREATE')
                ? {
                    label: 'Add the first post',
                    onClick: () => {
                      setEditingPost(null);
                      setPostFormOpen(true);
                    },
                    icon: <Plus className="w-3.5 h-3.5" />,
                  }
                : undefined
            }
            className="border-0"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-surface-2 border-b border-border/70 text-txt-secondary font-mono uppercase text-[10px]">
                <tr>
                  <th scope="col" className="px-4 py-3">Post</th>
                  <th scope="col" className="px-4 py-3">QR code</th>
                  <th scope="col" className="px-4 py-3">Guards required</th>
                  <th scope="col" className="px-4 py-3">Shifts</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-bg-surface-2/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-txt-primary">{post.name}</div>
                      {post.description && <div className="text-[10px] text-txt-secondary">{post.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-txt-secondary">
                        <QrCode className="w-3 h-3" aria-hidden /> {post.qrCodeId}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{post.guardCountRequired}</td>
                    <td className="px-4 py-3 tabular-nums">{post.shiftCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          post.isActive ? 'bg-brand-teal/10 text-brand-teal' : 'bg-bg-surface-2 text-txt-secondary'
                        }`}
                      >
                        {post.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {can('POST_UPDATE') && (
                        <button
                          onClick={() => {
                            setEditingPost(post);
                            setPostFormOpen(true);
                          }}
                          className="text-[10px] font-bold text-brand-primary hover:underline"
                        >
                          Edit
                        </button>
                      )}
                      {can('POST_DELETE') && post.isActive && (
                        <button
                          onClick={() => setPendingPostDelete(post)}
                          aria-label={`Archive ${post.name}`}
                          className="text-status-absent p-1 rounded-md hover:bg-status-absent/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isEditOpen && (
        <SiteFormDialog
          site={data}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            toast.success('Site updated');
            invalidate();
          }}
        />
      )}

      {isPostFormOpen && (
        <PostFormDialog
          siteId={id}
          post={editingPost}
          onClose={() => setPostFormOpen(false)}
          onSaved={() => {
            setPostFormOpen(false);
            toast.success(editingPost ? 'Post updated' : 'Post created');
            invalidate();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={pendingPostDelete !== null}
        title={`Archive ${pendingPostDelete?.name ?? 'this post'}?`}
        message="Posts with active shifts cannot be archived. Existing history is preserved either way."
        confirmLabel="Archive post"
        tone="destructive"
        isBusy={removePost.isPending}
        onConfirm={() => pendingPostDelete && removePost.mutate(pendingPostDelete)}
        onCancel={() => setPendingPostDelete(null)}
      />

      <ConfirmDialog
        isOpen={confirmArchive}
        title={`Archive ${data.name}?`}
        message="A site with active posts cannot be archived — archive its posts first. Employees deployed here will be released."
        confirmLabel="Archive site"
        tone="destructive"
        isBusy={archiveSite.isPending}
        onConfirm={() => archiveSite.mutate()}
        onCancel={() => setConfirmArchive(false)}
      />
    </div>
  );
};
