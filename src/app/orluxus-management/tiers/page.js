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
    { name: 'برونزي', color: 'bronze', icon: '🥉', comm: '10%', desc: 'المستوى الافتراضي لجميع الوكلاء الجدد.' },
    { name: 'فضي', color: 'silver', icon: '🥈', comm: '15%', desc: 'ترقية تلقائية عند تحقيق الشروط.', criteria: ['مبيعات 96,000€ سنوياً', 'أو 1,920 عملية', 'أو 5-10 وكلاء فضيين'] },
    { name: 'ذهبي', color: 'gold', icon: '🥇', comm: '20%', desc: 'يتم تحديد الشروط من قبل الإدارة.', criteria: ['مبيعات 250,000€ سنوياً', 'أو 5000 عملية'] },
    { name: 'بلاتيني', color: 'platinum', icon: '💎', comm: '25%', desc: 'أعلى مستوى متاح لكبار الوكلاء.', criteria: ['مبيعات 500,000€ سنوياً'] },
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
      setUpgradeMessage('❌ يرجى اختيار وكيل أولاً.');
      return;
    }

    setIsUpgrading(true);
    setUpgradeMessage('');

    try {
      const agent = agents.find(a => String(a.id) === String(selectedAgentId));
      const result = await updateAgent(selectedAgentId, { tier: selectedTier });

      if (result) {
        const tierNames = { bronze: 'برونزي', silver: 'فضي', gold: 'ذهبي', platinum: 'بلاتيني' };
        setUpgradeMessage(`✅ تم ترقية ${agent?.name || 'الوكيل'} بنجاح إلى المستوى ${tierNames[selectedTier] || selectedTier}!`);
        // Refresh agents list
        const updatedAgents = await getAgents();
        setAgents(updatedAgents || []);
        setSelectedAgentId('');
      } else {
        setUpgradeMessage('❌ فشلت عملية الترقية. يرجى المحاولة مرة أخرى.');
      }
    } catch (e) {
      console.error('Error upgrading agent:', e);
      setUpgradeMessage('❌ حدث خطأ أثناء الترقية. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className={styles.tiersPage}>
      <div className={styles.header}>
        <div>
          <h2>نظام الترقيات</h2>
          <p className={styles.subtitle}>تكوين معايير الترقيات التلقائية للوكلاء</p>
        </div>
      </div>

      <div className={`${styles.tiersGrid} stagger-children`}>
        {tiers.map((tier, idx) => (
          <div key={idx} className={`${styles.tierCard} glass-card`} data-tier={tier.color}>
            <div className={styles.tierHeader}>
              <div className={styles.tierIcon}>{tier.icon}</div>
              <h3>المستوى الـ{tier.name}</h3>
            </div>
            
            <div className={styles.commRate}>
              <span className={styles.commLabel}>نسبة العمولة المباشرة:</span>
              <span className={styles.commValue}>{tier.comm}</span>
            </div>
            
            <p className={styles.tierDesc}>{tier.desc}</p>
            
            {tier.criteria && (
              <div className={styles.criteriaBox}>
                <h4>شروط الترقية:</h4>
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
          <h3>ترقية يدوية استثنائية</h3>
          <p>يمكنك ترقية وكيل يدوياً حتى وإن لم يستوفِ الشروط المطلوبة.</p>
        </div>
        <div className={styles.upgradeForm}>
          <div className={styles.formGroup}>
            <label>اختر الوكيل</label>
            <select
              className={styles.input}
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              <option value="">-- اختر وكيل --</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} (AG-{a.id}) — المستوى الحالي: {
                    a.tier === 'gold' ? 'ذهبي' :
                    a.tier === 'silver' ? 'فضي' :
                    a.tier === 'platinum' ? 'بلاتيني' : 'برونزي'
                  }
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>المستوى الجديد</label>
            <select
              className={styles.input}
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
            >
              <option value="bronze">برونزي (عمولة 10%)</option>
              <option value="silver">فضي (عمولة 15%)</option>
              <option value="gold">ذهبي (عمولة 20%)</option>
              <option value="platinum">بلاتيني (عمولة 25%)</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end' }}
            onClick={handleUpgrade}
            disabled={isUpgrading}
          >
            {isUpgrading ? 'جاري التنفيذ...' : 'تنفيذ الترقية'}
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
