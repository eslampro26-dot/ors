'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { getAgents, updateAgent } from '@/lib/db';

export default function AdminTiers() {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedTier, setSelectedTier] = useState('silver');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [isSavingRates, setIsSavingRates] = useState(false);
  const [saveRatesMsg, setSaveRatesMsg] = useState('');

  // Editable commission rates (loaded from settings on mount)
  const [commissionRates, setCommissionRates] = useState({
    bronze: 10,
    silver: 15,
    gold: 20,
    platinum: 25,
  });

  // Editable upgrade criteria per tier
  const [tierCriteria, setTierCriteria] = useState({
    silver: ['Sales of €96,000 / year', 'Or 1,920 bookings', 'Or 5-10 Silver sub-agents'],
    gold: ['Sales of €250,000 / year', 'Or 5,000 bookings'],
    platinum: ['Sales of €500,000 / year'],
  });

  const TIER_META = [
    { name: 'Bronze', key: 'bronze', color: 'bronze', icon: '🥉', desc: 'Default tier for all new registered agents.' },
    { name: 'Silver', key: 'silver', color: 'silver', icon: '🥈', desc: 'Automatic upgrade when criteria are met.' },
    { name: 'Gold', key: 'gold', color: 'gold', icon: '🥇', desc: 'Criteria configured by administration.' },
    { name: 'Platinum', key: 'platinum', color: 'platinum', icon: '💎', desc: 'Highest available tier for top performing agents.' },
  ];

  // Load saved settings on mount
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [agentsData, settingsRes] = await Promise.all([
          getAgents(),
          fetch('/api/settings').then(r => r.ok ? r.json() : {})
        ]);
        setAgents(agentsData || []);
        if (settingsRes.tierCommissions) setCommissionRates(settingsRes.tierCommissions);
        if (settingsRes.tierCriteria) setTierCriteria(settingsRes.tierCriteria);
      } catch (e) {
        console.error('Error loading tiers data:', e);
      }
    };
    loadAll();
  }, []);

  // Save commission rates & criteria to settings
  const handleSaveRates = async () => {
    setIsSavingRates(true);
    setSaveRatesMsg('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierCommissions: commissionRates, tierCriteria }),
      });
      if (res.ok) {
        setSaveRatesMsg('✅ Commission rates and upgrade criteria saved successfully!');
      } else {
        setSaveRatesMsg('❌ Failed to save. Please try again.');
      }
    } catch (e) {
      console.error('Error saving tier settings:', e);
      setSaveRatesMsg('❌ An error occurred while saving.');
    } finally {
      setIsSavingRates(false);
      setTimeout(() => setSaveRatesMsg(''), 4000);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedAgentId) {
      setUpgradeMessage('❌ Please select an agent first.');
      return;
    }
    setIsUpgrading(true);
    setUpgradeMessage('');
    try {
      const agent = agents.find(a => String(a.id) === String(selectedAgentId));
      const result = await updateAgent(selectedAgentId, { tier: selectedTier });
      if (result) {
        setUpgradeMessage(`✅ Successfully upgraded ${agent?.name || 'agent'} to ${selectedTier.toUpperCase()} tier!`);
        const updatedAgents = await getAgents();
        setAgents(updatedAgents || []);
        setSelectedAgentId('');
      } else {
        setUpgradeMessage('❌ Upgrade operation failed. Please try again.');
      }
    } catch (e) {
      console.error('Error upgrading agent:', e);
      setUpgradeMessage('❌ An error occurred during upgrade. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const updateCriterion = (tierKey, idx, value) => {
    setTierCriteria(prev => {
      const arr = [...(prev[tierKey] || [])];
      arr[idx] = value;
      return { ...prev, [tierKey]: arr };
    });
  };

  const addCriterion = (tierKey) => {
    setTierCriteria(prev => ({
      ...prev,
      [tierKey]: [...(prev[tierKey] || []), ''],
    }));
  };

  const removeCriterion = (tierKey, idx) => {
    setTierCriteria(prev => {
      const arr = [...(prev[tierKey] || [])];
      arr.splice(idx, 1);
      return { ...prev, [tierKey]: arr };
    });
  };

  return (
    <div className={styles.tiersPage} style={{ textAlign: 'left' }}>
      <div className={styles.header}>
        <div>
          <h2>Tier System</h2>
          <p className={styles.subtitle}>Configure commission rates and upgrade criteria for agents</p>
        </div>
      </div>

      {/* Tier Cards - Display */}
      <div className={`${styles.tiersGrid} stagger-children`}>
        {TIER_META.map((tier) => (
          <div key={tier.key} className={`${styles.tierCard} glass-card`} data-tier={tier.color}>
            <div className={styles.tierHeader}>
              <div className={styles.tierIcon}>{tier.icon}</div>
              <h3>{tier.name} Tier</h3>
            </div>
            <div className={styles.commRate}>
              <span className={styles.commLabel}>Commission Rate:</span>
              <span className={styles.commValue}>{commissionRates[tier.key]}%</span>
            </div>
            <p className={styles.tierDesc}>{tier.desc}</p>
            {tierCriteria[tier.key] && tierCriteria[tier.key].length > 0 && (
              <div className={styles.criteriaBox}>
                <h4>Upgrade Requirements:</h4>
                <ul>
                  {tierCriteria[tier.key].map((crit, i) => (
                    <li key={i}>{crit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Commission Rates + Criteria — Editable & Saveable */}
      <div className={`${styles.manualUpgradeCard} glass-card animate-fade-in-up`}>
        <div className={styles.cardHeader}>
          <h3>⚙️ Commission Rates & Upgrade Criteria</h3>
          <p>Edit commission percentages and upgrade requirements for each tier, then click Save.</p>
        </div>

        {/* Commission Rates */}
        <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Commission Rates (%)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {TIER_META.map(tier => (
            <div key={tier.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {tier.icon} {tier.name} (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={commissionRates[tier.key]}
                onChange={(e) => setCommissionRates(prev => ({ ...prev, [tier.key]: Number(e.target.value) }))}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem' }}
              />
            </div>
          ))}
        </div>

        {/* Upgrade Criteria - Editable */}
        <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Upgrade Requirements (per tier)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          {['silver', 'gold', 'platinum'].map(tierKey => {
            const meta = TIER_META.find(t => t.key === tierKey);
            return (
              <div key={tierKey} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '1rem 1.2rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{meta?.icon} {meta?.name} Requirements</strong>
                  <button
                    onClick={() => addCriterion(tierKey)}
                    style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    + Add
                  </button>
                </div>
                {(tierCriteria[tierKey] || []).map((crit, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={crit}
                      onChange={(e) => updateCriterion(tierKey, idx, e.target.value)}
                      placeholder="e.g. Sales of €50,000 / year"
                      style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem' }}
                    />
                    <button
                      onClick={() => removeCriterion(tierKey, idx)}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {(!tierCriteria[tierKey] || tierCriteria[tierKey].length === 0) && (
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', fontStyle: 'italic' }}>No requirements set. Click "+ Add" to add one.</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <button
          className="btn btn-primary"
          onClick={handleSaveRates}
          disabled={isSavingRates}
          style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: '700' }}
        >
          {isSavingRates ? '⏳ Saving...' : '💾 Save Commission Rates & Criteria'}
        </button>

        {saveRatesMsg && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: saveRatesMsg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${saveRatesMsg.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: saveRatesMsg.startsWith('✅') ? 'var(--emerald-400)' : 'var(--coral-400)',
            fontWeight: '600'
          }}>
            {saveRatesMsg}
          </div>
        )}
      </div>

      {/* Manual Upgrade */}
      <div className={`${styles.manualUpgradeCard} glass-card animate-fade-in-up`}>
        <div className={styles.cardHeader}>
          <h3>Manual Exceptional Upgrade</h3>
          <p>You can manually upgrade an agent even if criteria are not fully met.</p>
        </div>
        <div className={styles.upgradeForm}>
          <div className={styles.formGroup}>
            <label>Select Agent</label>
            <select
              className={styles.input}
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              <option value="">-- Choose Agent --</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} (AG-{a.id}) — Current Tier: {(a.tier || 'bronze').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>New Target Tier</label>
            <select
              className={styles.input}
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
            >
              <option value="bronze">Bronze ({commissionRates.bronze}% Commission)</option>
              <option value="silver">Silver ({commissionRates.silver}% Commission)</option>
              <option value="gold">Gold ({commissionRates.gold}% Commission)</option>
              <option value="platinum">Platinum ({commissionRates.platinum}% Commission)</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end' }}
            onClick={handleUpgrade}
            disabled={isUpgrading}
          >
            {isUpgrading ? 'Executing...' : 'Execute Upgrade'}
          </button>
        </div>
        {upgradeMessage && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: upgradeMessage.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${upgradeMessage.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: upgradeMessage.startsWith('✅') ? 'var(--emerald-400)' : 'var(--coral-400)',
            fontWeight: '600'
          }}>
            {upgradeMessage}
          </div>
        )}
      </div>
    </div>
  );
}
