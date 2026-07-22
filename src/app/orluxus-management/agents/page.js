'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { getAgents, addAgent, updateAgent, deleteAgent, getBookings, addPromoCode } from '@/lib/db';
import { tierConfig } from '@/lib/data';

export default function AdminAgents() {
  const [viewMode, setViewMode] = useState('table'); // table or tree
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('All Tiers');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [agents, setAgents] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentEmail, setNewAgentEmail] = useState('');
  const [newAgentUsername, setNewAgentUsername] = useState('');
  const [newAgentPassword, setNewAgentPassword] = useState('');
  const [newAgentTier, setNewAgentTier] = useState('bronze');
  const [newAgentPromo, setNewAgentPromo] = useState('');
  const [parentAgentId, setParentAgentId] = useState('');
  // New fields
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [newAgentBank, setNewAgentBank] = useState('');
  const [newAgentCountry, setNewAgentCountry] = useState('');
  const [newAgentPartnerId, setNewAgentPartnerId] = useState('');
  const [newAgentPhoto, setNewAgentPhoto] = useState('');
  const [newAgentJoinDate, setNewAgentJoinDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Details Modal State
  const [selectedAgentDetails, setSelectedAgentDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const loadData = async () => {
    try {
      const allAgents = await getAgents();
      const allBookings = await getBookings();
      
      // Calculate dynamic sales for each agent based on their active bookings
      const updatedAgents = (allAgents || []).map(agent => {
        const agentBookings = (allBookings || []).filter(b => b.agentId === agent.id && b.status !== 'ملغي' && b.status !== 'Cancelled');
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

  // Handle Edit Click
  const handleEditAgentClick = (agent) => {
    setEditingAgent(agent);
    setNewAgentName(agent.name || '');
    setNewAgentEmail(agent.email || '');
    setNewAgentUsername(agent.username || '');
    setNewAgentPassword(agent.password || '');
    setNewAgentTier(agent.tier || 'bronze');
    setNewAgentPromo(agent.promoCodes?.[0] || '');
    setParentAgentId(agent.parentId ? String(agent.parentId) : '');
    setNewAgentPhone(agent.phone || '');
    setNewAgentBank(agent.bankAccount || '');
    setNewAgentCountry(agent.country || '');
    setNewAgentPartnerId(agent.partnerId || '');
    setNewAgentPhoto(agent.photo || '');
    setNewAgentJoinDate(agent.joinDate || new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  // Handle Delete Agent
  const handleDeleteAgent = async (id) => {
    if (!confirm('⚠️ Are you sure you want to permanently delete this agent?')) return;
    try {
      const success = await deleteAgent(id);
      if (success) {
        alert('Agent deleted successfully!');
        await loadData();
      } else {
        alert('❌ Failed to delete agent from server.');
      }
    } catch (e) {
      console.error('Error deleting agent:', e);
      alert('❌ Failed to delete agent!');
    }
  };

  // Handle Add / Edit Agent Submission
  const handleAddAgent = async (e) => {
    e.preventDefault();
    if (!newAgentName || !newAgentEmail || !newAgentUsername || !newAgentPassword) {
      alert('Please fill in all required fields!');
      return;
    }

    try {
      // Verify username is unique (excluding the agent itself if editing)
      const isTaken = agents.some(a => 
        a.username.toLowerCase() === newAgentUsername.trim().toLowerCase() && 
        (!editingAgent || String(a.id) !== String(editingAgent.id))
      );
      if (isTaken) {
        alert('This username is already taken! Please choose a different username.');
        return;
      }

      const parentIdParsed = parentAgentId ? parseInt(parentAgentId, 10) : null;
      const cleanPromo = newAgentPromo.trim().toUpperCase();

      const agentData = {
        name: newAgentName,
        email: newAgentEmail,
        username: newAgentUsername.trim().toLowerCase(),
        password: newAgentPassword,
        tier: newAgentTier,
        parentId: parentIdParsed,
        promoCodes: cleanPromo ? [cleanPromo] : [],
        phone: newAgentPhone,
        bankAccount: newAgentBank,
        country: newAgentCountry,
        partnerId: newAgentPartnerId || `PRT-${Date.now().toString().slice(-6)}`,
        photo: newAgentPhoto,
        joinDate: newAgentJoinDate,
      };

      if (editingAgent) {
        // Mode: Edit existing agent
        const success = await updateAgent(editingAgent.id, agentData);
        if (success) {
          alert(`Agent ${newAgentName} updated successfully!`);
        } else {
          alert('❌ Failed to update agent.');
        }
      } else {
        // Mode: Add new agent
        const createdAgent = await addAgent(agentData);

        if (createdAgent) {
          // Create promo code in database if provided
          if (cleanPromo) {
            await addPromoCode({
              code: cleanPromo,
              agentId: createdAgent.id,
              discountType: 'percentage',
              discountValue: newAgentTier === 'platinum' ? 20 : newAgentTier === 'gold' ? 15 : 10,
              maxUses: 100,
              isActive: true,
              expiryDate: '2026-12-31',
              createdBy: 'admin'
            });
          }
          alert(`Agent ${newAgentName} added successfully!`);
        } else {
          alert('❌ Failed to add agent. There may be an issue with the database or permissions.');
        }
      }

      setIsModalOpen(false);
      setEditingAgent(null);

      // Reset Form
      setNewAgentName('');
      setNewAgentEmail('');
      setNewAgentUsername('');
      setNewAgentPassword('');
      setNewAgentTier('bronze');
      setNewAgentPromo('');
      setParentAgentId('');
      setNewAgentPhone('');
      setNewAgentBank('');
      setNewAgentCountry('');
      setNewAgentPartnerId('');
      setNewAgentPhoto('');
      setNewAgentJoinDate(new Date().toISOString().split('T')[0]);

      // Reload data
      await loadData();
    } catch (err) {
      console.error('Error saving agent:', err);
      alert('❌ Failed to save agent data!');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const allAgents = await getAgents();
      const agent = (allAgents || []).find(a => a.id === id);
      if (agent) {
        const newStatus = agent.status === 'نشط' || agent.status === 'Active' ? 'Suspended' : 'Active';
        await updateAgent(id, { status: newStatus });
        alert(`Agent status updated successfully!`);
        await loadData();
      }
    } catch (err) {
      console.error('Error toggling agent status:', err);
      alert('An error occurred while updating agent status!');
    }
  };

  // Filter Agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.includes(searchTerm) || 
                          agent.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          agent.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          `AG-${agent.id}`.includes(searchTerm);
    
    const matchesTier = tierFilter === 'All Tiers' || 
                        (tierFilter === 'Bronze' && agent.tier === 'bronze') ||
                        (tierFilter === 'Silver' && agent.tier === 'silver') ||
                        (tierFilter === 'Gold' && agent.tier === 'gold') ||
                        (tierFilter === 'Platinum' && agent.tier === 'platinum');

    const matchesStatus = statusFilter === 'All Statuses' || 
                          (statusFilter === 'Active' && (agent.status === 'نشط' || agent.status === 'Active')) ||
                          (statusFilter === 'Suspended' && (agent.status === 'موقوف' || agent.status === 'Suspended'));

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
            <span className={`badge badge-${agent.status === 'نشط' || agent.status === 'Active' ? 'emerald' : 'coral'}`} style={{ fontSize: '10px' }}>
              {agent.status === 'نشط' ? 'Active' : agent.status === 'موقوف' ? 'Suspended' : agent.status}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Sales: <strong>€{agent.sales.toLocaleString()}</strong></span>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ marginTop: '8px', padding: '4px 12px', fontSize: '11px', width: '100%', cursor: 'pointer' }}
            onClick={() => {
              setSelectedAgentDetails(agent);
              setShowDetailsModal(true);
            }}
          >
            Details
          </button>

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
          <h2>Agents &amp; Marketing Network Management</h2>
          <p className={styles.subtitle}>Manage agent accounts, tiers, passwords, and the marketing network hierarchy.</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.toggleBtn} ${viewMode === 'table' ? styles.active : ''}`}
              onClick={() => setViewMode('table')}
            >
              Agents Table
            </button>
            <button 
              className={`${styles.toggleBtn} ${viewMode === 'tree' ? styles.active : ''}`}
              onClick={() => setViewMode('tree')}
            >
              Network Tree
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => {
            setNewAgentName('');
            setNewAgentEmail('');
            setNewAgentUsername('');
            setNewAgentPassword('');
            setNewAgentTier('bronze');
            setNewAgentPromo('');
            setParentAgentId('');
            setNewAgentPhone('');
            setNewAgentBank('');
            setNewAgentCountry('');
            setNewAgentPartnerId('');
            setNewAgentPhoto('');
            setNewAgentJoinDate(new Date().toISOString().split('T')[0]);
            setIsModalOpen(true);
          }}>
            <span>+</span> Add New Direct Agent
          </button>
        </div>
      </div>

      <div className={`${styles.filterCard} glass-card`}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>◎</span>
          <input 
            type="text" 
            placeholder="Search by name, username, email, or code..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingRight: '40px', paddingLeft: '16px' }}
          />
        </div>
        <div className={styles.filters}>
          <select className={styles.select} value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
            <option>All Tiers</option>
            <option>Bronze</option>
            <option>Silver</option>
            <option>Gold</option>
            <option>Platinum</option>
          </select>
          <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Statuses</option>
            <option>Active</option>
            <option>Suspended</option>
          </select>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className={`${styles.tableCard} glass-card animate-fade-in-up`}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Agent Name / Account</th>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Sponsoring Agent</th>
                  <th>Tier</th>
                  <th>Promo Codes</th>
                  <th>Total Sales</th>
                  <th>Sub-Agents</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                          <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>Direct — General Manager</span>
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
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>No Code</span>
                        )}
                      </td>
                      <td className={styles.monoBold}>€{agent.sales.toLocaleString()}</td>
                      <td>{agent.subAgents}</td>
                      <td>{agent.joinDate}</td>
                      <td>
                        <span className={`badge badge-${agent.status === 'نشط' || agent.status === 'Active' ? 'emerald' : 'coral'}`}>
                          {agent.status === 'نشط' ? 'Active' : agent.status === 'موقوف' ? 'Suspended' : agent.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionsCell} style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className={styles.actionBtn} 
                            onClick={() => handleToggleStatus(agent.id)}
                            title={agent.status === 'نشط' || agent.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                            style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                          >
                            {agent.status === 'نشط' || agent.status === 'Active' ? '🔒 Suspend' : '🔓 Activate'}
                          </button>
                          <button 
                            className={styles.actionBtn} 
                            onClick={() => handleEditAgentClick(agent)}
                            title="Edit Agent Data"
                            style={{ padding: '2px 6px', fontSize: '0.75rem', color: 'var(--gold-400)', borderColor: 'rgba(251,191,36,0.3)' }}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            className={styles.actionBtn} 
                            onClick={() => handleDeleteAgent(agent.id)}
                            title="Delete Agent"
                            style={{ padding: '2px 6px', fontSize: '0.75rem', color: 'var(--coral-500)', borderColor: 'rgba(244,63,94,0.3)' }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredAgents.length === 0 && (
                  <tr>
                    <td colSpan="12" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    No agents match the search criteria.
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
            {rootAgents.length === 0 && <div style={{ color: 'var(--text-tertiary)' }}>No network agents to display as a tree.</div>}
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
          textAlign: 'left'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '540px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-accent)',
            boxShadow: 'var(--shadow-xl)',
            padding: '2.5rem',
            maxHeight: '85vh',
            overflowY: 'auto',
            margin: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>
              <button onClick={() => { setIsModalOpen(false); setEditingAgent(null); }} style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}>×</button>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                {editingAgent ? '✏️ Edit Certified Agent Data' : '➕ Add New Certified Agent'}
              </h3>
            </div>

            <form onSubmit={handleAddAgent} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Full Agent Name *</label>
                <input 
                  type="text" 
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g. John Smith"
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
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Agent Email Address *</label>
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
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Username *</label>
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
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Password *</label>
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
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Agency Tier</label>
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
                    <option value="bronze">Bronze (BRONZE)</option>
                    <option value="silver">Silver (SILVER)</option>
                    <option value="gold">Gold (GOLD)</option>
                    <option value="platinum">Platinum (PLATINUM)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Sponsoring Agent (Parent)</label>
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
                    <option value="">Direct — General Manager</option>
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.name} (AG-{a.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Profile Photo URL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Profile Photo URL</label>
                <input
                  type="text"
                  value={newAgentPhoto}
                  onChange={(e) => setNewAgentPhoto(e.target.value)}
                  placeholder="https://example.com/photo.jpg (optional)"
                  style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', textAlign: 'left' }}
                />
              </div>

              {/* Partner ID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Partner ID (optional)</label>
                  <input
                    type="text"
                    value={newAgentPartnerId}
                    onChange={(e) => setNewAgentPartnerId(e.target.value)}
                    placeholder="PRT-001"
                    style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', textAlign: 'left', fontFamily: 'var(--font-en)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Phone Number</label>
                  <input
                    type="tel"
                    value={newAgentPhone}
                    onChange={(e) => setNewAgentPhone(e.target.value)}
                    placeholder="+20100000000"
                    style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', textAlign: 'left' }}
                  />
                </div>
              </div>

              {/* Bank Account */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Bank Account Number</label>
                <input
                  type="text"
                  value={newAgentBank}
                  onChange={(e) => setNewAgentBank(e.target.value)}
                  placeholder="IBAN or account number"
                  style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', textAlign: 'left', fontFamily: 'var(--font-en)', letterSpacing: '0.5px' }}
                />
              </div>

              {/* Country / City */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Country / City</label>
                <input
                  type="text"
                  value={newAgentCountry}
                  onChange={(e) => setNewAgentCountry(e.target.value)}
                  placeholder="e.g. Egypt - Sharm El Sheikh"
                  style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              {/* Date Joined */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Date Joined</label>
                <input
                  type="date"
                  value={newAgentJoinDate}
                  onChange={(e) => setNewAgentJoinDate(e.target.value)}
                  style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-en)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Initial Promo Code for Agent (optional)</label>
                <input 
                  type="text" 
                  value={newAgentPromo}
                  onChange={(e) => setNewAgentPromo(e.target.value)}
                  placeholder="e.g. JOHN10"
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
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }}>
                  {editingAgent ? '💾 Save Changes' : 'Add Agent'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setIsModalOpen(false); setEditingAgent(null); }} style={{ flex: 1, padding: '0.8rem' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agent Details Modal */}
      {showDetailsModal && selectedAgentDetails && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, textAlign: 'left'
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: '500px', background: 'var(--bg-secondary)',
            border: '1px solid var(--border-accent)', boxShadow: 'var(--shadow-xl)', padding: '2rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>
              <button onClick={() => setShowDetailsModal(false)} style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}>×</button>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Agent Details</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {selectedAgentDetails.photo && (
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <img src={selectedAgentDetails.photo} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold-400)' }} />
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Name:</span>
                <span>{selectedAgentDetails.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Partner ID:</span>
                <span style={{ fontFamily: 'var(--font-en)' }}>{selectedAgentDetails.partnerId || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Email:</span>
                <span style={{ fontFamily: 'var(--font-en)' }}>{selectedAgentDetails.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Phone Number:</span>
                <span style={{ fontFamily: 'var(--font-en)' }}>{selectedAgentDetails.phone || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Bank Account Number:</span>
                <span style={{ fontFamily: 'var(--font-en)' }}>{selectedAgentDetails.bankAccount || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Country / City:</span>
                <span>{selectedAgentDetails.country || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Join Date:</span>
                <span style={{ fontFamily: 'var(--font-en)' }}>{selectedAgentDetails.joinDate || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Tier:</span>
                <span>{selectedAgentDetails.tier.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Total Sales:</span>
                <span style={{ fontFamily: 'var(--font-en)', color: 'var(--gold-500)', fontWeight: 'bold' }}>€{selectedAgentDetails.sales?.toLocaleString() || 0}</span>
              </div>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button className="btn btn-primary" onClick={() => setShowDetailsModal(false)} style={{ padding: '0.8rem 2rem' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
