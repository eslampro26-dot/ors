'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { tierConfig } from '@/lib/data';

export default function SubAgentsTree() {
  const [currentAgent, setCurrentAgent] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subName, setSubName] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subUsername, setSubUsername] = useState('');
  const [subPassword, setSubPassword] = useState('');
  const [subPromo, setSubPromo] = useState('');
  const [addingAgent, setAddingAgent] = useState(false);

  const loadTree = async () => {
    try {
      setLoading(true);

      // Fetch current agent info and all agents in parallel
      const [meRes, agentsRes] = await Promise.all([
        fetch('/api/auth/agent-me', { credentials: 'include' }),
        fetch('/api/agent/sub-agents', { credentials: 'include' }),
      ]);

      if (!meRes.ok || !agentsRes.ok) {
        setError('تعذر تحميل بيانات شجرة الوكلاء.');
        return;
      }

      const meData = await meRes.json();
      const allAgents = await agentsRes.json();
      const me = meData.agent;

      setCurrentAgent(me);

      // Build recursive tree from current agent down
      const buildSubTree = (agentNode) => {
        const children = (allAgents || []).filter(
          a => String(a.parentId) === String(agentNode.id)
        );

        return {
          id: agentNode.id,
          name: agentNode.name,
          tier: agentNode.tier,
          totalSales: `€${(agentNode.sales || 0).toLocaleString()}`,
          joinDate: agentNode.joinDate,
          icon: tierConfig[agentNode.tier]?.icon || '🥉',
          children: children.map(child => buildSubTree(child))
        };
      };

      setTreeData(buildSubTree(me));
    } catch (e) {
      console.error('Error building subagents tree', e);
      setError('حدث خطأ أثناء تحميل البيانات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, []);

  const handleAddSubAgent = async (e) => {
    e.preventDefault();
    if (!subName || !subEmail || !subUsername || !subPassword) {
      alert('الرجاء ملء جميع الحقول المطلوبة!');
      return;
    }

    setAddingAgent(true);
    try {
      const res = await fetch('/api/agent/sub-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: subName,
          email: subEmail,
          username: subUsername,
          password: subPassword,
          promoCode: subPromo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || '❌ فشل إضافة الوكيل الفرعي!');
        return;
      }

      alert(`تمت إضافة الوكيل الفرعي ${subName} بنجاح!`);
      setIsModalOpen(false);

      // Reset form
      setSubName('');
      setSubEmail('');
      setSubUsername('');
      setSubPassword('');
      setSubPromo('');

      // Reload tree
      await loadTree();
    } catch (err) {
      console.error('Error adding subagent:', err);
      alert('❌ فشل إضافة الوكيل الفرعي!');
    } finally {
      setAddingAgent(false);
    }
  };

  const renderNode = (node, isRoot = false) => {
    if (!node) return null;
    return (
      <div className={styles.treeNode} key={node.id || 'root'}>
        <div className={`${styles.agentCard} ${isRoot ? styles.rootCard : ''}`}>
          <div className={styles.agentHeader}>
            <div className={styles.agentAvatar}>{node.icon}</div>
            <div className={styles.agentInfo}>
              <h4>{node.name}</h4>
              <span className={`badge ${node.tier === 'silver' ? 'badge-ocean' : node.tier === 'gold' ? 'badge-gold' : node.tier === 'platinum' ? 'badge-emerald' : 'badge-coral'}`} style={{ fontSize: '10px' }}>
                وكيل {tierConfig[node.tier]?.nameAr || 'برونزي'}
              </span>
            </div>
          </div>
          <div className={styles.agentStats}>
            <div className={styles.stat}>
              <span>المبيعات:</span>
              <strong>{node.totalSales}</strong>
            </div>
            <div className={styles.stat}>
              <span>الانضمام:</span>
              <span>{node.joinDate}</span>
            </div>
          </div>
        </div>
        
        {node.children && node.children.length > 0 && (
          <div className={styles.treeChildren}>
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-secondary)' }}>
        جاري تحميل شجرة الوكلاء...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--coral-400)' }}>
        {error}
      </div>
    );
  }

  return (
    <div className={styles.treePage}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>شجرة الوكلاء والشركاء</h2>
          <p>قم بإضافة وكلاء جدد للانضمام إلى شبكتك التسويقية واربح عمولات إضافية على مبيعاتهم.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <span>➕</span> إضافة وكيل فرعي جديد
        </button>
      </div>

      <div className={`${styles.treeContainer} glass-card animate-fade-in-up`}>
        <div className={styles.treeWrapper}>
          {treeData ? renderNode(treeData, true) : <div style={{ color: 'var(--text-tertiary)' }}>لا يوجد بيانات لشجرة الوكلاء.</div>}
        </div>
      </div>
      
      <div className={`${styles.infoCards} stagger-children`}>
        <div className="glass-card">
          <h3>كيف تعمل الشجرة والعمولات الفرعية؟</h3>
          <p className={styles.infoText}>
            كل وكيل تسجله تحتم منك مباشرة يتم إضافته تلقائياً في شجرتك. يمكنك تتبع مبيعاتهم ونشاطهم وحجم التفاعل مع كود الخصم الخاص بكل منهم من لوحة التحكم الخاصة بك.
          </p>
        </div>
        <div className="glass-card">
          <h3>ترقيات الشبكة (مستويات الوكالة)</h3>
          <p className={styles.infoText}>
            للترقية إلى المستويات الأعلى فضي (SILVER) أو ذهبي (GOLD)، يتم احتساب إجمالي مبيعات شبكتك الفرعية ضمن تقييمك السنوي لتسهيل الحصول على نسبة عمولة أكبر تصل لـ 25%.
          </p>
        </div>
      </div>

      {/* Add SubAgent Modal */}
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
          textAlign: 'right'
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
              <button onClick={() => setIsModalOpen(false)} style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}>×</button>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>➕ إضافة وكيل فرعي تحتي</h3>
            </div>

            <form onSubmit={handleAddSubAgent} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>اسم الوكيل الكامل *</label>
                <input 
                  type="text" 
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="مثال: يوسف محمود الهواري"
                  required
                  style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>البريد الإلكتروني للوكيل *</label>
                <input 
                  type="email" 
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="example@orluxus.com"
                  required
                  style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', textAlign: 'left' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>اسم المستخدم (Username) *</label>
                  <input 
                    type="text" 
                    value={subUsername}
                    onChange={(e) => setSubUsername(e.target.value)}
                    placeholder="youssef_agent"
                    required
                    style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', textAlign: 'left' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>كلمة المرور *</label>
                  <input 
                    type="password" 
                    value={subPassword}
                    onChange={(e) => setSubPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>تخصيص كود خصم ترويجي أولي للوكيل (اختياري)</label>
                <input 
                  type="text" 
                  value={subPromo}
                  onChange={(e) => setSubPromo(e.target.value)}
                  placeholder="مثال: YOUSEF10"
                  style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>سيتم إنشاء كود خصم بقيمة 10% للعملاء ونسب المبيعات تحسب للوكيل الجديد تلقائياً.</span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '0.8rem' }}
                  disabled={addingAgent}
                >
                  {addingAgent ? 'جاري الإضافة...' : 'تسجيل وإضافة'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsModalOpen(false)} 
                  style={{ flex: 1, padding: '0.8rem' }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
