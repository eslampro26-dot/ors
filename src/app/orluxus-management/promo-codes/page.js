'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { getPromoCodes, addPromoCode, deletePromoCode, savePromoCodes, getAgents } from '@/lib/db';

export default function AdminPromoCodes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [promoCodes, setPromoCodes] = useState([]);
  const [agents, setAgents] = useState([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [codeStr, setCodeStr] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [maxUses, setMaxUses] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const loadData = async () => {
    try {
      const codes = await getPromoCodes();
      const agentsList = await getAgents();
      setPromoCodes(codes || []);
      setAgents(agentsList || []);
    } catch (e) {
      console.error('Error loading promo codes page data', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    if (!codeStr) {
      alert('Please enter a promo code string first!');
      return;
    }

    try {
      const agentIdVal = selectedAgentId ? parseInt(selectedAgentId, 10) : null;
      const maxUsesVal = maxUses ? parseInt(maxUses, 10) : null;

      const result = await addPromoCode({
        code: codeStr.trim().toUpperCase(),
        agentId: agentIdVal,
        discountType,
        discountValue: parseFloat(discountValue) || 0,
        maxUses: maxUsesVal,
        expiryDate: expiryDate || null,
        createdBy: 'admin'
      });

      if (result.error) {
        alert(result.error);
        return;
      }

      alert(`Promo code ${codeStr.toUpperCase()} created successfully!`);
      setIsModalOpen(false);

      // Reset Form
      setCodeStr('');
      setSelectedAgentId('');
      setDiscountType('percentage');
      setDiscountValue('10');
      setMaxUses('');
      setExpiryDate('');

      // Reload
      await loadData();
    } catch (err) {
      console.error('Error creating promo:', err);
      alert('❌ Failed to create promo code!');
    }
  };

  const handleToggleActive = async (code) => {
    try {
      const codes = await getPromoCodes();
      const idx = (codes || []).findIndex(c => c.code === code);
      if (idx !== -1) {
        codes[idx].isActive = !codes[idx].isActive;
        await savePromoCodes(codes);
        alert(`Promo code status updated!`);
        await loadData();
      }
    } catch (err) {
      console.error('Error toggling promo code status:', err);
      alert('Error updating promo code status!');
    }
  };

  const handleDeletePromo = async (code) => {
    if (confirm(`Are you sure you want to permanently delete promo code ${code}?`)) {
      try {
        const success = await deletePromoCode(code);
        if (success) {
          alert('Promo code deleted successfully!');
          await loadData();
        } else {
          alert('Failed to delete promo code!');
        }
      } catch (err) {
        console.error('Error deleting promo code:', err);
        alert('An error occurred while deleting promo code!');
      }
    }
  };

  const filteredCodes = promoCodes.filter(c => 
    c.code.toUpperCase().includes(searchTerm.toUpperCase()) ||
    (c.agentId && agents.find(a => a.id === c.agentId)?.name.includes(searchTerm))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: '800' }}>Promo Codes Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Create promo codes, configure discounts, assign to agents, and track usage.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <span>➕</span> Create New Promo Code
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <input 
            type="text" 
            placeholder="Search by code or agent name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Promo Codes Table */}
      <div className="glass-card animate-fade-in-up" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Code / Coupon</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Owner (Agent)</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Discount Type</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Discount Value</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Uses</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Max Limit</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Expiration Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCodes.map((promo) => {
                const owner = agents.find(a => a.id === promo.agentId || a.id === parseInt(promo.agentId, 10));
                return (
                  <tr key={promo.code} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '1.2rem 1rem' }}>
                      <span style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '800', color: 'var(--gold-400)', fontFamily: 'var(--font-en)' }}>
                        {promo.code}
                      </span>
                    </td>
                    <td style={{ padding: '1.2rem 1rem' }}>
                      {owner ? (
                        <strong>{owner.name} <span style={{ color: 'var(--text-tertiary)', fontSize: '10px', fontFamily: 'var(--font-en)' }}>(AG-{owner.id})</span></strong>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', fontSize: '12px' }}>General (Direct Admin)</span>
                      )}
                    </td>
                    <td style={{ padding: '1.2rem 1rem' }}>
                      {promo.discountType === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (€)'}
                    </td>
                    <td style={{ padding: '1.2rem 1rem', fontFamily: 'var(--font-en)', fontWeight: 'bold', color: 'var(--gold-400)' }}>
                      {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `€${promo.discountValue}`}
                    </td>
                    <td style={{ padding: '1.2rem 1rem', fontFamily: 'var(--font-en)' }}>{promo.usedCount || 0}</td>
                    <td style={{ padding: '1.2rem 1rem', fontFamily: 'var(--font-en)' }}>{promo.maxUses || 'Unlimited'}</td>
                    <td style={{ padding: '1.2rem 1rem' }}>{promo.expiryDate || <span style={{ color: 'var(--text-tertiary)' }}>No Expiration</span>}</td>
                    <td style={{ padding: '1.2rem 1rem' }}>
                      <span className={`badge badge-${promo.isActive ? 'emerald' : 'coral'}`}>
                        {promo.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleToggleActive(promo.code)}
                          className={styles.actionBtn}
                          title={promo.isActive ? 'Disable Code' : 'Activate Code'}
                          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                        >
                          {promo.isActive ? '⏸️' : '▶️'}
                        </button>
                        <button 
                          onClick={() => handleDeletePromo(promo.code)}
                          className={styles.actionBtn}
                          title="Delete Code Permanently"
                          style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--coral-500)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredCodes.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    ❌ No promo codes match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Promo Code Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          textAlign: 'left'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '520px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-accent)',
            boxShadow: 'var(--shadow-xl)',
            padding: '2.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>➕ Create New Promo Code</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}>×</button>
            </div>

            <form onSubmit={handleCreatePromo} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Promo Code String *</label>
                <input 
                  type="text" 
                  value={codeStr}
                  onChange={(e) => setCodeStr(e.target.value)}
                  placeholder="e.g. SUMMER10"
                  required
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-en)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Link Code to Agent (Optional)</label>
                <select 
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                >
                  <option value="">General promo code (Direct Admin)</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (AG-{a.id})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Discount Type</label>
                  <select 
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (€)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Discount Value *</label>
                  <input 
                    type="number" 
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="10"
                    required
                    min="1"
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontFamily: 'var(--font-en)'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Max Uses</label>
                  <input 
                    type="number" 
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="100 (Optional)"
                    min="1"
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontFamily: 'var(--font-en)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Expiration Date</label>
                  <input 
                    type="date" 
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontFamily: 'var(--font-en)'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }}>Create Code</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.8rem' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
