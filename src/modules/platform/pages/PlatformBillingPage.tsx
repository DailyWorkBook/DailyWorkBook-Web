import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { PageHeader, Pagination, SearchInput } from '../../../components/data';
import { EmptyState, ErrorState, TableSkeleton } from '../../../components/feedback/States';
import { queryKeys } from '../../../core/query';
import { platformApi, type Invoice } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useDebounced, useToast } from '../../../hooks';

const money = (value: number, currency = 'INR') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);

const STATUS_STYLES: Record<string, string> = {
  PAID: 'bg-brand-teal/10 text-brand-teal',
  PENDING: 'bg-status-pending/10 text-txt-secondary',
  PARTIALLY_PAID: 'bg-status-late/10 text-status-late',
  OVERDUE: 'bg-status-absent/10 text-status-absent',
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const daysFromNow = (days: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const PlatformBillingPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isRaiseOpen, setRaiseOpen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  const debouncedSearch = useDebounced(search);
  const params = { page, pageSize: 25, q: debouncedSearch || undefined, status: status || undefined };

  const invoices = useQuery({
    queryKey: queryKeys.platformInvoices(params),
    queryFn: () => platformApi.listInvoices(params),
  });

  const clients = useQuery({
    queryKey: queryKeys.platformClients({ pageSize: 200, status: 'ACTIVE' }),
    queryFn: () => platformApi.listClients({ pageSize: 200, status: 'ACTIVE' }),
    staleTime: 60_000,
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['platform'] });

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Platform"
        eyebrowIcon={<CreditCard className="w-3.5 h-3.5" aria-hidden />}
        title="Billing & invoices"
        description="Invoices are priced from each client's live subscription — the same engine that quoted their plan."
        actions={
          <Button onClick={() => setRaiseOpen(true)} leftIcon={<Plus className="w-4 h-4" aria-hidden />}>
            Raise invoice
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
          placeholder="Search by invoice number or client…"
          className="flex-1 max-w-md"
          label="Search invoices"
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
          {['PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'].map((value) => (
            <option key={value} value={value}>
              {value.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {invoices.isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : invoices.isError ? (
          <ErrorState message={describeApiError(invoices.error)} onRetry={() => void invoices.refetch()} />
        ) : invoices.data!.data.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title={debouncedSearch || status ? 'No invoices match these filters' : 'No invoices raised yet'}
            description={
              debouncedSearch || status
                ? 'Try a different search term or status.'
                : 'Raise an invoice against a client to bill them for a period at their subscribed rate.'
            }
            action={
              !debouncedSearch && !status
                ? { label: 'Raise the first invoice', onClick: () => setRaiseOpen(true), icon: <Plus className="w-3.5 h-3.5" /> }
                : undefined
            }
            className="border-0"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-surface-2 border-b border-border/70 text-txt-secondary font-mono uppercase text-[10px]">
                  <tr>
                    <th scope="col" className="px-4 py-3">Invoice</th>
                    <th scope="col" className="px-4 py-3">Client</th>
                    <th scope="col" className="px-4 py-3">Period</th>
                    <th scope="col" className="px-4 py-3">Due</th>
                    <th scope="col" className="px-4 py-3 text-right">Total</th>
                    <th scope="col" className="px-4 py-3 text-right">Outstanding</th>
                    <th scope="col" className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {invoices.data!.data.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-bg-surface-2/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-txt-primary">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3">
                        <Link to={`/platform/clients/${invoice.clientId}`} className="font-bold text-brand-primary hover:underline">
                          {invoice.clientName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-txt-secondary">
                        {invoice.periodStart} → {invoice.periodEnd}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-txt-secondary">{invoice.dueDate}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{money(invoice.totalAmount, invoice.currency)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold">
                        {money(invoice.outstanding, invoice.currency)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              STATUS_STYLES[invoice.status] ?? 'bg-bg-surface-2 text-txt-secondary'
                            }`}
                          >
                            {invoice.status.replace('_', ' ')}
                          </span>
                          {invoice.outstanding > 0 && invoice.status !== 'CANCELLED' && (
                            <button
                              onClick={() => setPayingInvoice(invoice)}
                              className="text-[10px] font-bold text-brand-primary hover:underline"
                            >
                              Record payment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={invoices.data!.meta} onPageChange={setPage} label="invoices" />
          </>
        )}
      </div>

      {isRaiseOpen && (
        <RaiseInvoiceDialog
          clients={clients.data?.data ?? []}
          onClose={() => setRaiseOpen(false)}
          onCreated={(invoice) => {
            setRaiseOpen(false);
            toast.success('Invoice raised', `${invoice.invoiceNumber} for ${money(invoice.totalAmount, invoice.currency)}.`);
            invalidate();
          }}
        />
      )}

      {payingInvoice && (
        <RecordPaymentDialog
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onDone={(invoice) => {
            setPayingInvoice(null);
            toast.success(
              invoice.status === 'PAID' ? 'Invoice settled' : 'Payment recorded',
              `${money(invoice.outstanding, invoice.currency)} outstanding.`,
            );
            invalidate();
          }}
        />
      )}
    </div>
  );
};

const RaiseInvoiceDialog: React.FC<{
  clients: { id: string; name: string; code: string }[];
  onClose: () => void;
  onCreated: (invoice: Invoice) => void;
}> = ({ clients, onClose, onCreated }) => {
  const [clientId, setClientId] = useState('');
  const [periodStart, setPeriodStart] = useState(daysFromNow(-30));
  const [periodEnd, setPeriodEnd] = useState(todayIso());
  const [dueDate, setDueDate] = useState(daysFromNow(15));
  const [error, setError] = useState('');

  const create = useMutation({
    mutationFn: () => platformApi.createInvoice(clientId, { periodStart, periodEnd, dueDate, status: 'PENDING' }),
    onSuccess: onCreated,
    onError: (caught) => setError(describeApiError(caught)),
  });

  const fieldClass =
    'w-full px-3 py-2 min-h-[38px] bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="text-base font-bold text-txt-primary">Raise an invoice</h2>
          <p className="text-xs text-txt-secondary mt-0.5">
            The amount is computed from the client's current subscription and module set.
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-status-absent/10 border border-status-absent/25 text-status-absent text-xs font-semibold">
            {error}
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            if (!clientId) {
              setError('Select the client to invoice.');
              return;
            }
            create.mutate();
          }}
          className="space-y-3"
        >
          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">
              Client <span className="text-status-absent">*</span>
            </span>
            <select required value={clientId} onChange={(e) => setClientId(e.target.value)} className={fieldClass}>
              <option value="">Select a client…</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.code})
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Period start</span>
              <input required type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className={fieldClass} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Period end</span>
              <input required type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className={fieldClass} />
            </label>
          </div>

          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">Due date</span>
            <input required type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={fieldClass} />
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={create.isPending}>
              Cancel
            </Button>
            <Button type="submit" isLoading={create.isPending}>
              Raise invoice
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RecordPaymentDialog: React.FC<{
  invoice: Invoice;
  onClose: () => void;
  onDone: (invoice: Invoice) => void;
}> = ({ invoice, onClose, onDone }) => {
  const [amount, setAmount] = useState(String(invoice.outstanding));
  const [paymentMethod, setPaymentMethod] = useState('NEFT');
  const [transactionRef, setTransactionRef] = useState('');
  const [error, setError] = useState('');

  const record = useMutation({
    mutationFn: () =>
      platformApi.recordPayment(invoice.id, {
        amount: Number(amount),
        paymentMethod,
        transactionRef: transactionRef || undefined,
      }),
    onSuccess: onDone,
    onError: (caught) => setError(describeApiError(caught)),
  });

  const fieldClass =
    'w-full px-3 py-2 min-h-[38px] bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="text-base font-bold text-txt-primary">Record a payment</h2>
          <p className="text-xs text-txt-secondary mt-0.5">
            {invoice.invoiceNumber} · {money(invoice.outstanding, invoice.currency)} outstanding
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-status-absent/10 border border-status-absent/25 text-status-absent text-xs font-semibold">
            {error}
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            record.mutate();
          }}
          className="space-y-3"
        >
          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">
              Amount <span className="text-status-absent">*</span>
            </span>
            <input
              required
              type="number"
              min={0.01}
              step="0.01"
              max={invoice.outstanding}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`${fieldClass} font-mono`}
            />
          </label>

          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">
              Method <span className="text-status-absent">*</span>
            </span>
            <select required value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={fieldClass}>
              {['NEFT', 'RTGS', 'UPI', 'Cheque', 'Card', 'Cash'].map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">Reference</span>
            <input value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} className={`${fieldClass} font-mono`} />
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={record.isPending}>
              Cancel
            </Button>
            <Button type="submit" isLoading={record.isPending}>
              Record payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
