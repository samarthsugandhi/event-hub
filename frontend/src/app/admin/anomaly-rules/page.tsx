'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AnomalyRulesPage() {
  const { user } = useAuth();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    ruleType: 'overflow',
    threshold: 1,
    description: '',
  });

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await api.admin.anomalyRules();
      setRules(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const createRule = async () => {
    try {
      await api.admin.createAnomalyRule({
        ruleType: form.ruleType,
        threshold: Number(form.threshold),
        description: form.description,
      });
      toast.success('Rule created');
      setForm({ ruleType: 'overflow', threshold: 1, description: '' });
      loadRules();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create rule');
    }
  };

  const toggleRule = async (id: string, enabled: boolean) => {
    try {
      await api.admin.updateAnomalyRule(id, { enabled: !enabled });
      setRules((prev) => prev.map((r) => (r._id === id ? { ...r, enabled: !enabled } : r)));
      toast.success('Rule updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update rule');
    }
  };

  const removeRule = async (id: string) => {
    try {
      await api.admin.deleteAnomalyRule(id);
      setRules((prev) => prev.filter((r) => r._id !== id));
      toast.success('Rule deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete rule');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
          <Link href="/login" className="btn-primary">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-wrap py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Anomaly Rules</h1>
        <p className="text-[#B0B0B0] mt-1">Configure server-side anomaly detection thresholds.</p>
      </div>

      <div className="glass-card space-y-3">
        <h2 className="text-lg font-semibold text-white">Create rule</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <select
            className="input-field"
            value={form.ruleType}
            onChange={(e) => setForm((prev) => ({ ...prev, ruleType: e.target.value }))}
          >
            <option value="overflow">Overflow</option>
            <option value="no-show-gap">No-show gap</option>
            <option value="low-attendance">Low attendance</option>
          </select>
          <input
            type="number"
            className="input-field"
            min={0}
            value={form.threshold}
            onChange={(e) => setForm((prev) => ({ ...prev, threshold: Number(e.target.value) }))}
            placeholder="Threshold"
          />
          <input
            type="text"
            className="input-field"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
          />
        </div>
        <button onClick={createRule} className="btn-primary">Create rule</button>
      </div>

      <div className="glass-card">
        <h2 className="text-lg font-semibold text-white mb-3">Existing rules</h2>
        {loading ? (
          <p className="text-[#B0B0B0]">Loading...</p>
        ) : rules.length === 0 ? (
          <p className="text-[#8f8f8f]">No rules configured.</p>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <div key={rule._id} className="rounded-xl border border-white/[0.08] p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-white text-sm font-medium">{rule.ruleType}</p>
                  <p className="text-xs text-[#AFAFAF]">Threshold: {rule.threshold} • {rule.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleRule(rule._id, rule.enabled)} className="btn-secondary !py-1.5 text-xs">
                    {rule.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => removeRule(rule._id)} className="btn-danger !py-1.5 text-xs">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
