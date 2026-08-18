import React, { useState } from 'react';
import { X, DollarSign, CreditCard, CheckCircle, Calendar } from 'lucide-react';
import { SuperAdminClient, PaymentTransaction, PaymentStatus } from '../types';

interface RecordPaymentModalProps {
  isOpen: boolean;
  clients: SuperAdminClient[];
  onClose: () => void;
  onRecordPayment: (tx: PaymentTransaction) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  clients,
  onClose,
  onRecordPayment
}) => {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2026-08-${Math.floor(100 + Math.random() * 900)}`);
  const [billingPeriod, setBillingPeriod] = useState('Aug 2026');
  const [amount, setAmount] = useState<number>(clients[0]?.subscription.monthlyEstimatedAmount || 25000);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<PaymentStatus>('PAID');
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'CREDIT_CARD' | 'UPI' | 'ACH'>('BANK_TRANSFER');
  const [transactionReference, setTransactionReference] = useState('TXN-89021-REF');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const target = clients.find((c) => c.id === clientId);
    if (target) {
      setAmount(target.subscription.monthlyEstimatedAmount || 25000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = clients.find((c) => c.id === selectedClientId) || clients[0];

    const newTx: PaymentTransaction = {
      id: 'tx-' + Date.now(),
      clientId: targetClient.id,
      clientName: targetClient.name,
      invoiceNumber,
      billingPeriod,
      amount,
      paymentDate: status === 'PAID' ? paymentDate : '-',
      dueDate,
      status,
      paymentMethod: status === 'PAID' ? paymentMethod : 'PENDING',
      transactionReference,
      notes
    };

    onRecordPayment(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bg-surface border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl">
              <DollarSign className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-txt-primary leading-tight">
                Record Platform Payment
              </h3>
              <p className="text-xs text-txt-secondary mt-0.5">
                Maintain client payment status and billing history
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-txt-secondary hover:text-txt-primary p-1 rounded-lg hover:bg-bg-surface-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-txt-primary mb-1">Select Client</label>
            <select
              value={selectedClientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code}) — Plan: {c.subscription.pricingModel}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-txt-primary mb-1">Invoice Number</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm font-mono text-txt-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-txt-primary mb-1">Billing Period</label>
              <input
                type="text"
                required
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value)}
                placeholder="e.g. Aug 2026"
                className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-txt-primary mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-txt-primary mb-1">Payment Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="OVERDUE">OVERDUE</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>
          </div>

          {status === 'PAID' && (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="ACH">ACH Direct Debit</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">Transaction Ref / UTR</label>
                <input
                  type="text"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm font-mono text-txt-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-txt-primary mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-txt-primary mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-txt-primary mb-1">Notes / Remarks</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared via monthly NEFT batch"
              className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-txt-secondary hover:text-txt-primary bg-bg-surface-2 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Save Payment Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
