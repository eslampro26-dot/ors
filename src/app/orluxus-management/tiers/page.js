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

  const tiers = [
    { name: 'Bronze', color: 'bronze', icon: '🥉', comm: '10%', desc: 'Default tier for all new registered agents.' },
    { name: 'Silver', color: 'silver', icon: '🥈', comm: '15%', desc: 'Automatic upgrade when criteria are met.', criteria: ['Sales of €96,000 / year', 'Or 1,920 bookings', 'Or 5-10 Silver sub-agents'] },
    { name: 'Gold', color: 'gold', icon: '🥇', comm: '20%', desc: 'Criteria configured by administration.', criteria: ['Sales of €250,000 / year', 'Or 5,000 bookings'] },
    { name: 'Platinum', color: 'platinum', icon: '💎', comm: '25%', desc: 'Highest available tier for top performing agents.', criteria: ['Sales of €500,000 / year'] },
  ];

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const data = await getAgents();
        setAgents(data || []);
      } catch (e) {
        console.error('Error loading agents:', e);
      }
    };
    loadAgents();
  }, []);

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
        // Refresh agents list
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

  return (
    <div className={styles.tiersPage} style={{ textAlign: 'left' }}>
      <div className={styles.header}>
        <div>
          <h2>Tier System</h2>
          <p className={styles.subtitle}>Configure automatic tier upgrade criteria for agents</p>
        </div>
      </div>

      <div className={`${styles.tiersGrid} stagger-children`}>
        {tiers.map((tier, idx) => (
          <div key={idx} className={`${styles.tierCard} glass-card`} data-tier={tier.color}>
            <div className={styles.tierHeader}>
              <div className={styles.tierIcon}>{tier.icon}</div>
              <h3>{tier.name} Tier</h3>
            </div>
            
            <div className={styles.commRate}>
              <span className={styles.commLabel}>Direct Commission Rate:</span>
              <span className={styles.commValue}>{tier.comm}</span>
            </div>
            
            <p className={styles.tierDesc}>{tier.desc}</p>
            
            {tier.criteria && (
              <div className={styles.criteriaBox}>
                <h4>Upgrade Requirements:</h4>
                <ul>
                  {tier.criteria.map((crit, i) => (
                    <li key={i}>{crit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

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
                  {a.name} (AG-{a.id}) — Current Tier: {a.tier.toUpperCase()}
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
              <option value="bronze">Bronze (10% Commission)</option>
              <option value="silver">Silver (15% Commission)</option>
              <option value="gold">Gold (20% Commission)</option>
              <option value="platinum">Platinum (25% Commission)</option>
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
