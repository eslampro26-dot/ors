'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { getAgents, addAgent, updateAgent, getBookings, addPromoCode } from '@/lib/db';
import { tierConfig } from '@/lib/data';

export default function AdminAgents() {
  const [viewMode, setViewMode] = useState('table'); // table or tree
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('جميع المستويات');
  const [statusFilter, setStatusFilter] = useState('كل الحالات');
  const [agents, setAgents] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentEmail, setNewAgentEmail] = useState('');
  const [newAgentUsername, setNewAgentUsername] = useState('');
  const [newAgentPassword, setNewAgentPassword] = useState('');
  const [newAgentTier, setNewAgentTier] = useState('bronze');
  const [newAgentPromo, setNewAgentPromo] = useState('');
  const [parentAgentId, setParentAgentId] = useState('');

  const loadData = async () => {
    try {
      const allAgents = await getAgents();
      const allBookings = await getBookings();
      
      // Calculate dynamic sales for each agent based on their active bookings
      const updatedAgents = (allAgents || []).map(agent => {
        const agentBookings = (allBookings || []).filter(b => b.agentId === agent.id && b.status !== 'ملغي');
        const salesTotal = agentBookings.reduce((sum, b) => sum + b.finalAmount, 0);
        const subCount = (allAgents || []).filter(a => a.parentId === agent.id || a.parentId === agent.id.toString()).length;
        
        return {
          ...agent,
          sales: salesTotal,
          subAgents: subCount
        };
      });

      setAgents(updatedAgents);
      setBookings(allBookings || []);
    } catch (e) {
      console.error('Error loading admin agents data', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Add Agent Submission
  const handleAddAgent = async (e) => {
    e.preventDefault();
    if (!newAgentName || !newAgentEmail || !newAgentUsername || !newAgentPassword) {
      alert('الرجاء تعبئة كافة الحقول المطلوبة!');
      return;
    }

    try {
      // Verify username is unique
      const isTaken = agents.some(a => a.username.toLowerCase() === newAgentUsername.trim().toLowerCase());
      if (isTaken) {
        alert('اسم المستخدم هذا محجوز مسبقاً! الرجاء اختيار اسم مستخدم آخر.');
        return;
      }

      const parentIdParsed = parentAgentId ? parseInt(parentAgentId, 10) : null;
      const cleanPromo = newAgentPromo.trim().toUpperCase();

      const createdAgent = await addAgent({
        name: newAgentName,
        email: newAgentEmail,
        username: newAgentUsername.trim().toLowerCase(),
        password: newAgentPassword,
        tier: newAgentTier,
        parentId: parentIdParsed,
        promoCodes: cleanPromo ? [cleanPromo] : []
      });

      // Create promo code in database if provided
      if (cleanPromo && createdAgent) {
        await addPromoCode({
          code: cleanPromo,
          agentId: createdAgent.id,
          discountType: 'percentage',
          discountValue: newAgentTier === 'platinum' ? 20 : newAgentTier === 'gold' ? 15 : 10, // higher tier, better discount potential
          maxUses: 100,
          isActive: true,
          expiryDate: '2026-12-31',
          createdBy: 'admin'
        });
      }

      alert(`تمت إضافة الوكيل ${newAgentName} بنجاح!`);
      setIsModalOpen(false);

      // Reset Form
      setNewAgentName('');
      setNewAgentEmail('');
      setNewAgentUsername('');
      setNewAgentPassword('');
      setNewAgentTier('bronze');
      setNewAgentPromo('');
      setParentAgentId('');

      // Reload data
      await loadData();
    } catch (err) {
      console.error('Error adding agent:', err);
      alert('❌ فشل إضافة الوكيل!');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const allAgents = await getAgents();
      const agent = (allAgents || []).find(a => a.id === id);
      if (agent) {
        const newStatus = agent.status === 'نشط' ? 'موقوف' : 'نشط';
        await updateAgent(id, { status: newStatus });
        alert(`تم تعديل حالة الوكيل بنجاح!`);
        await loadData();
      }
    } catch (err) {
      console.error('Error toggling agent status:', err);
      alert('حدث خطأ أثناء تعديل حالة الوكيل!');
    }
  };

  // Filter Agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.includes(searchTerm) || 
                          agent.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          agent.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          `AG-${agent.id}`.includes(searchTerm);
    
    const matchesTier = tierFilter === 'جميع المستويات' || 
                        (tierFilter === 'برونزي' && agent.tier === 'bronze') ||
                        (tierFilter === 'فضي' && agent.tier === 'silver') ||
                        (tierFilter === 'ذهبي' && agent.tier === 'gold') ||
                        (tierFilter === 'بلاتيني' && agent.tier === 'platinum');

    const matchesStatus = statusFilter === 'كل الحالات' || 
                          (statusFilter === 'نشط' && agent.status === 'نشط') ||
                          (statusFilter === 'موقوف' && agent.status === 'موقوف');

    return matchesSearch && matchesTier && matchesStatus;
  });

  // Recursive Tree Render Component
  const TreeNode = ({ agent, allAgents, level = 0 }) => {
    const children = allAgents.filter(a => a.parentId === agent.id || a.parentId === agent.id.toString());
    const [isExpanded, setIsExpanded] = useState(true);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 1rem', position: 'relative' }}>
        {/* Card of the Agent */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: `2px solid ${agent.tier === 'platinum' ? 'var(--emerald-500)' : agent.tier === 'gold' ? 'var(--gold-400)' : agent.tier === 'silver' ? 'var(--ocean-400)' : 'var(--text-tertiary)'}`,
          borderRadius: '12px',
          padding: '1rem',
          minWidth: '220px',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
          zIndex: 10,
          position: 'relative',
          transition: 'all var(--transition-base)',
        }} className={styles.treeNodeCard}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'var(--font-size-xs)',
            background: 'var(--bg-primary)',
            padding: '2px 8px',
            borderRadius: '999px',
            border: '1px solid var(--border-medium)',
            fontWeight: 'bold',
            color: 'var(--gold-600)'
          }}>
            AG-{agent.id}
          </div>
          
          <h4 style={{ margin: '8px 0 2px 0', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{agent.name}</h4>
          <p style={{ margin: '0 0 6px 0', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>@{agent.username}</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span className={`badge badge-${agent.tier === 'gold' ? 'gold' : agent.tier === 'silver' ? 'ocean' : agent.tier === 'platinum' ? 'emerald' : 'coral'}`} style={{ fontSize: '10px' }}>
              {agent.tier.toUpperCase()}
            </span>
            <span className={`badge badge-${agent.status === 'نشط' ? 'emerald' : 'coral'}`} style={{ fontSize: '10px' }}>
              {agent.status}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>المبيعات: <strong>€{agent.sales.toLocaleString()}</strong></span>
          </div>

          {children.length > 0 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                bottom: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '10px',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                zIndex: 20
              }}
            >
              {isExpanded ? '▼' : '▲'}
            </button>
          )}
        </div>

        {/* Render child tree nodes recursively */}
        {children.length > 0 && isExpanded && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '2px dashed var(--border-medium)',
          }}>
            {/* Connecting lines helper */}
            <div style={{
              position: 'absolute',
              top: '-1.5rem',
              left: '50%',
              width: '2px',
              height: '1.5rem',
              background: 'var(--border-medium)',
            }}></div>
            
            {children.map(child => (
              <TreeNode key={child.id} agent={child} allAgents={allAgents} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Find root agents (agents with no parent)
  const rootAgents = agents.filter(a => !a.parentId);

  return (
    <div className={styles.agentsPage}>
      <div className={styles.header}>
        <div>
          <h2>إدارة الوكلاء والشبكة التسويقية</h2>
          <p className={styles.subtitle}>التحكم بحسابات الوكلاء، المستويات، كلمات المرور، وهيكل التبعية التسويقية.</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.toggleBtn} ${viewMode === 'table' ? styles.active : ''}`}
              onClick={() => setViewMode('table')}
            >
              جدول الوكلاء
            </button>
            <button 
              className={`${styles.toggleBtn} ${viewMode === 'tree' ? styles.active : ''}`}
              onClick={() => setViewMode('tree')}
            >
              شجرة الشبكة
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <span>➕</span> إضافة وكيل مباشر جديد
          </button>
        </div>
      </div>

      <div className={`${styles.filterCard} glass-card`}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input 
            type="text" 
            placeholder="ابحث بالاسم، اسم المستخدم، البريد، أو الكود..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingRight: '40px', paddingLeft: '16px' }}
          />
        </div>
        <div className={styles.filters}>
          <select className={styles.select} value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
            <option>جميع المستويات</option>
            <option>برونزي</option>
            <option>فضي</option>
            <option>ذهبي</option>
            <option>بلاتيني</option>
          </select>
          <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>كل الحالات</option>
            <option>نشط</option>
            <option>موقوف</option>
          </select>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className={`${styles.tableCard} glass-card animate-fade-in-up`}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>اسم الوكيل / الحساب</th>
                  <th>اسم المستخدم</th>
                  <th>كلمة المرور</th>
                  <th>الوكيل الراعي</th>
                  <th>المستوى</th>
                  <th>أكواد الخصم</th>
                  <th>إجمالي المبيعات</th>
                  <th>الفرعيين</th>
                  <th>تاريخ الانضمام</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.map(agent => {
                  const parent = agents.find(p => p.id === agent.parentId || p.id === parseInt(agent.parentId, 10));
                  return (
                    <tr key={agent.id}>
                      <td><span className={styles.mono}>AG-{agent.id}</span></td>
                      <td>
                        <div className={styles.agentNameCell}>
                          <div className={styles.agentAvatar}>{agent.name.charAt(0)}</div>
                          <div>
                            <div className={styles.agentName}>{agent.name}</div>
                            <div className={styles.agentEmail}>{agent.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.mono}>@{agent.username}</td>
                      <td className={styles.mono} style={{ color: 'var(--text-tertiary)' }}>{agent.password}</td>
                      <td>
                        {parent ? (
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {parent.name} <strong style={{ color: 'var(--gold-600)', fontSize: '10px' }}>(AG-{parent.id})</strong>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>المدير العام المباشر</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${agent.tier === 'gold' ? 'gold' : agent.tier === 'silver' ? 'ocean' : agent.tier === 'platinum' ? 'emerald' : 'coral'}`}>
                          {agent.tier === 'gold' ? 'GOLD' : agent.tier === 'silver' ? 'SILVER' : agent.tier === 'platinum' ? 'PLATINUM' : 'BRONZE'}
                        </span>
                      </td>
                      <td>
                        {agent.promoCodes && agent.promoCodes.length > 0 ? (
                          agent.promoCodes.map((code, idx) => (
                            <span key={idx} style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', color: 'var(--gold-500)', margin: '2px', display: 'inline-block' }}>
                              {code}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>بدون كود</span>
                        )}
                      </td>
                      <td className={styles.monoBold}>€{agent.sales.toLocaleString()}</td>
                      <td>{agent.subAgents}</td>
                      <td>{agent.joinDate}</td>
                      <td>
                        <span className={`badge badge-${agent.status === 'نشط' ? 'emerald' : 'coral'}`}>
                          {agent.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button 
                            className={styles.actionBtn} 
                            onClick={() => handleToggleStatus(agent.id)}
                            title={agent.status === 'نشط' ? 'تجميد الحساب' : 'تفعيل الحساب'}
                          >
                            {agent.status === 'نشط' ? '⏸️' : '▶️'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredAgents.length === 0 && (
                  <tr>
                    <td colSpan="12" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                      ❌ لا يوجد وكلاء يطابقون خيارات البحث.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card animate-fade-in-up" style={{ padding: '3rem 2rem', overflowX: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '500px' }}>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', minWidth: 'max-content', paddingBottom: '2rem' }}>
            {rootAgents.map(rootAgent => (
              <TreeNode key={rootAgent.id} agent={rootAgent} allAgents={agents} />
            ))}
            {rootAgents.length === 0 && <div style={{ color: 'var(--text-tertiary)' }}>لا يوجد وكلاء شبكة لعرضهم كشجرة.</div>}
          </div>
        </div>
      )}

      {/* Add Agent Modal Dialog */}
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
            maxWidth: '540px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-accent)',
            boxShadow: 'var(--shadow-xl)',
            padding: '2.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}>×</button>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>➕ إضافة وكيل معتمد جديد</h3>
            </div>

            <form onSubmit={handleAddAgent} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>اسم الوكيل الكامل *</label>
                <input 
                  type="text" 
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="مثال: أحمد محمود الهواري"
                  required
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>البريد الإلكتروني للوكيل *</label>
                <input 
                  type="email" 
                  value={newAgentEmail}
                  onChange={(e) => setNewAgentEmail(e.target.value)}
                  placeholder="example@orluxus.com"
                  required
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    textAlign: 'left'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>اسم المستخدم *</label>
                  <input 
                    type="text" 
                    value={newAgentUsername}
                    onChange={(e) => setNewAgentUsername(e.target.value)}
                    placeholder="ahmed_agent"
                    required
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      textAlign: 'left'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>كلمة المرور *</label>
                  <input 
                    type="password" 
                    value={newAgentPassword}
                    onChange={(e) => setNewAgentPassword(e.target.value)}
                    placeholder="123456"
                    required
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>مستوى الوكالة</label>
                  <select 
                    value={newAgentTier}
                    onChange={(e) => setNewAgentTier(e.target.value)}
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  >
                    <option value="bronze">برونزي (BRONZE)</option>
                    <option value="silver">فضي (SILVER)</option>
                    <option value="gold">ذهبي (GOLD)</option>
                    <option value="platinum">بلاتيني (PLATINUM)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>الوكيل الراعي (الأعلى)</label>
                  <select 
                    value={parentAgentId}
                    onChange={(e) => setParentAgentId(e.target.value)}
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  >
                    <option value="">المدير العام مباشرة</option>
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.name} (AG-{a.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>إنشاء كود خصم ترويجي أولي للوكيل (اختياري)</label>
                <input 
                  type="text" 
                  value={newAgentPromo}
                  onChange={(e) => setNewAgentPromo(e.target.value)}
                  placeholder="مثال: AHMED10"
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }}>إضافة الوكيل</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.8rem' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
