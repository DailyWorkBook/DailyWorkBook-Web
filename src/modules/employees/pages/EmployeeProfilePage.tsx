import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Phone, Mail, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { employeesApi } from '../../../services/employeesApi';

export const EmployeeProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployee() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await employeesApi.getEmployeeById(id);
        setEmployee(data);
      } catch (err) {
        console.error('Error loading employee profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEmployee();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 gap-2 text-txt-secondary text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> Loading employee profile from database...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8 text-center text-xs text-txt-secondary">
        Employee not found. <Button onClick={() => navigate('/employees')}>Back to Employees</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <button
        onClick={() => navigate('/employees')}
        className="flex items-center gap-1 text-xs font-bold text-txt-secondary hover:text-txt-primary"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Employees Directory
      </button>

      <div className="bg-bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={employee.photoUrl || `https://i.pravatar.cc/150?u=${employee.id}`}
            alt={employee.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-border"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-txt-primary">{employee.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                {employee.status}
              </span>
            </div>
            <p className="text-xs text-txt-secondary font-mono mt-0.5">
              {employee.employeeCode} &bull; {employee.role}
            </p>
          </div>
        </div>

        <div className="text-right text-xs">
          <div className="text-txt-secondary font-mono">Assigned Site</div>
          <div className="font-bold text-txt-primary">{employee.currentSiteName}</div>
        </div>
      </div>

      <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-extrabold text-txt-primary">Identity & Bank Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-txt-secondary font-mono">Aadhaar Card:</span>
            <div className="font-bold text-txt-primary mt-0.5">{employee.aadhaarNumber}</div>
          </div>
          <div>
            <span className="text-txt-secondary font-mono">PAN Number:</span>
            <div className="font-bold text-txt-primary mt-0.5">{employee.panNumber}</div>
          </div>
          <div>
            <span className="text-txt-secondary font-mono">Bank Account:</span>
            <div className="font-bold text-txt-primary mt-0.5">{employee.bankName} ({employee.bankAccountNumber})</div>
          </div>
          <div>
            <span className="text-txt-secondary font-mono">IFSC Code:</span>
            <div className="font-bold text-txt-primary mt-0.5">{employee.ifscCode}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
