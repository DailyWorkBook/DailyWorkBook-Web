import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { sitesApi, type Post } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';

interface Props {
  siteId: string;
  post: Post | null;
  onClose: () => void;
  onSaved: () => void;
}

export const PostFormDialog: React.FC<Props> = ({ siteId, post, onClose, onSaved }) => {
  const isEditing = post !== null;

  const [name, setName] = useState(post?.name ?? '');
  const [description, setDescription] = useState(post?.description ?? '');
  const [guardCountRequired, setGuardCount] = useState(String(post?.guardCountRequired ?? 1));
  const [error, setError] = useState('');

  const save = useMutation({
    mutationFn: () => {
      const body = {
        name,
        description: description || undefined,
        guardCountRequired: Number(guardCountRequired),
      };
      return isEditing ? sitesApi.updatePost(post!.id, body) : sitesApi.createPost(siteId, body);
    },
    onSuccess: onSaved,
    onError: (caught) => setError(describeApiError(caught)),
  });

  const fieldClass =
    'w-full px-3 py-2 min-h-[38px] bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="text-base font-bold text-txt-primary">{isEditing ? `Edit ${post!.name}` : 'Add a post'}</h2>
          <p className="text-xs text-txt-secondary mt-0.5">
            {isEditing ? 'The QR code stays with the post.' : 'A QR code is generated automatically for scanning at the post.'}
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
              Post name <span className="text-status-absent">*</span>
            </span>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Main entrance gate" className={fieldClass} />
          </label>

          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">Description</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className={fieldClass} />
          </label>

          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">Guards required</span>
            <input
              type="number"
              min={1}
              max={100}
              value={guardCountRequired}
              onChange={(e) => setGuardCount(e.target.value)}
              className={fieldClass}
            />
            <span className="block text-[11px] text-txt-tertiary mt-1">
              Used to warn when a roster leaves this post short.
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" isLoading={save.isPending}>
              {isEditing ? 'Save changes' : 'Create post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
