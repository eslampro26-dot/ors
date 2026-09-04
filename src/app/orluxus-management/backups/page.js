'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminBackupsPage() {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [backupNote, setBackupNote] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  // Restore Confirmation Modal State
  const [confirmRestoreModal, setConfirmRestoreModal] = useState({
    isOpen: false,
    backup: null
  });

  // Fetch Backups on load
  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/backups', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.backups)) {
        setBackups(data.backups);
      }
    } catch (err) {
      console.error('Error loading backups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  // Create Backup Snapshot
  const handleCreateBackup = async (e) => {
    e?.preventDefault();
    setCreating(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggerType: 'manual',
          note: backupNote.trim() || (isAr ? 'نسخة احتياطية يدوية للإدارة' : 'Manual Admin Backup')
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: isAr
            ? '✓ تم إنشاء النسخة الاحتياطية المصغرة بنجاح!'
            : '✓ Micro-backup snapshot created successfully!'
        });
        setBackupNote('');
        fetchBackups();
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || (isAr ? 'فشل إنشاء النسخة الاحتياطية' : 'Failed to create backup')
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message
      });
    } finally {
      setCreating(false);
    }
  };

  // Execute Restore
  const handleConfirmRestore = async () => {
    const target = confirmRestoreModal.backup;
    if (!target) return;

    setRestoringId(target.id);
    setStatusMessage(null);
    setConfirmRestoreModal({ isOpen: false, backup: null });

    try {
      const res = await fetch('/api/admin/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId: target.id })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: isAr
            ? `✓ تم استرجاع كامل بيانات الموقع بنجاح من نسخة (${target.date})!`
            : `✓ Complete system data successfully restored from snapshot (${target.date})!`
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || (isAr ? 'فشل استرجاع النسخة الاحتياطية' : 'Failed to restore backup')
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message
      });
    } finally {
      setRestoringId(null);
    }
  };

  // Delete Backup Snapshot
  const handleDeleteBackup = async (id) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذه النسخة الاحتياطية؟' : 'Are you sure you want to delete this backup?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/backups?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBackups(prev => prev.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete backup:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Upload JSON & Restore
  const handleUploadBackupFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed || !parsed.data) {
          alert(isAr ? 'ملف النسخة الاحتياطية غير صالح!' : 'Invalid backup JSON file structure!');
          return;
        }

        const proceed = window.confirm(
          isAr
            ? 'تنبيه: سيتم استرجاع البيانات من الملف المرفوع واستبدال البيانات الحالية. هل تود المتابعة؟'
            : 'Warning: Restoring from this uploaded file will overwrite current data. Continue?'
        );
        if (!proceed) return;

        setLoading(true);
        const res = await fetch('/api/admin/backups/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uploadedPayload: parsed })
        });
        const data = await res.json();
        if (data.success) {
          setStatusMessage({
            type: 'success',
            text: isAr ? '✓ تم استرجاع النسخة المرفوعة بنجاح!' : '✓ Uploaded backup restored successfully!'
          });
          fetchBackups();
        } else {
          alert(data.error || 'Restore failed');
        }
      } catch (err) {
        alert((isAr ? 'فشل قراءة الملف: ' : 'Failed to parse file: ') + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#fff', direction: isAr ? 'rtl' : 'ltr' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--gold-500)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>💾</span> {isAr ? 'النسخ الاحتياطي التلقائي والاسترجاع' : 'Automated Daily Backups & Restore'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            {isAr
              ? 'يقوم النظام يومياً بعمل نسخة مصغرة تلقائياً لحفظ كافة بيانات الحجوزات، الرحلات، الأسعار، الوكلاء والإعدادات لحمايتك من أي فقدان.'
              : 'The system automatically performs daily micro-backups covering all bookings, excursions, pricing, agents, and settings.'}
          </p>
        </div>

        {/* Upload Button */}
        <label 
          className="btn btn-secondary"
          style={{
            cursor: 'pointer',
            padding: '0.7rem 1.2rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px'
          }}
        >
          <span>📤</span> {isAr ? 'استرجاع من ملف خارجي' : 'Upload & Restore File'}
          <input 
            type="file" 
            accept=".json" 
            onChange={handleUploadBackupFile}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Status Banner */}
      {statusMessage && (
        <div style={{
          padding: '1rem 1.2rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.95rem',
          fontWeight: 'bold',
          background: statusMessage.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          border: statusMessage.type === 'success' ? '1px solid #10b981' : '1px solid #ef4444',
          color: statusMessage.type === 'success' ? '#10b981' : '#ef4444'
        }}>
          {statusMessage.text}
        </div>
      )}

      {/* Quick Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            {isAr ? 'النسخ الاحتياطي اليومي' : 'Daily Automated Backup'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.4rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>
              {isAr ? 'نشط ويعمل يومياً' : 'Active (Daily)'}
            </strong>
          </div>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {isAr ? 'يتم الاحتفاظ بآخر 30 نسخة تلقائية' : 'Retains up to 30 latest snapshots'}
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            {isAr ? 'إجمالي النسخ المتاحة' : 'Total Available Backups'}
          </span>
          <div style={{ marginTop: '0.4rem' }}>
            <strong style={{ color: 'var(--gold-400)', fontSize: '1.4rem' }}>{backups.length}</strong>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginInlineStart: '6px' }}>
              {isAr ? 'نسخة مخزنة' : 'snapshots'}
            </span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            {isAr ? 'آخر نسخة احتياطية' : 'Latest Backup Date'}
          </span>
          <div style={{ marginTop: '0.4rem' }}>
            <strong style={{ color: '#fff', fontSize: '1.1rem' }}>
              {backups[0] ? new Date(backups[0].timestamp).toLocaleString(isAr ? 'ar-EG' : 'en-GB') : (isAr ? 'لا يوجد بعد' : 'None yet')}
            </strong>
          </div>
        </div>
      </div>

      {/* Manual Backup Action Box */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.25)', background: 'rgba(212,175,55,0.03)', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 0.8rem 0', color: 'var(--gold-400)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚡</span> {isAr ? 'إنشاء نسخة احتياطية فورية الآن' : 'Create Immediate Backup Snapshot'}
        </h3>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isAr
            ? 'يمكنك أخذ نسخة احتياطية فورية يدوية قبل إجراء أي تعديلات هامة على الأسعار أو الرحلات أو الإعدادات.'
            : 'Take an immediate manual snapshot before making any major updates to trips, pricing, or settings.'}
        </p>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder={isAr ? 'ملاحظة على النسخة (مثال: قبل تعديل أسعار رحلات الغردقة)...' : 'Backup note (e.g. Before seasonal pricing update)...'}
            value={backupNote}
            onChange={(e) => setBackupNote(e.target.value)}
            style={{
              flex: '1 1 300px',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              fontSize: '0.9rem'
            }}
          />
          <button
            type="button"
            onClick={handleCreateBackup}
            disabled={creating}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.8rem', fontSize: '0.95rem', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}
          >
            {creating ? (isAr ? 'جاري الإنشاء...' : 'Creating...') : (isAr ? '💾 إنشاء النسخة الآن' : '⚡ Create Backup Now')}
          </button>
        </div>
      </div>

      {/* Backups List Table */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>
            {isAr ? 'سجل النسخ الاحتياطية المحفوظة' : 'Stored Backup Snapshots'}
          </h3>
          <button 
            onClick={fetchBackups} 
            style={{ background: 'none', border: 'none', color: 'var(--gold-400)', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            🔄 {isAr ? 'تحديث السجل' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            {isAr ? 'جاري تحميل سجل النسخ الاحتياطية...' : 'Loading backup archives...'}
          </div>
        ) : backups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📭</span>
            {isAr ? 'لا توجد نسخ احتياطية محفوظة حالياً. اضغط على زر الإنشاء بالأعلى لأخذ أول نسخة.' : 'No backup snapshots found. Click Create Backup above to create your first one.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: isAr ? 'right' : 'left' }}>
                  <th style={{ padding: '12px 10px', color: 'var(--gold-400)' }}>{isAr ? 'التاريخ والوقت' : 'Date & Timestamp'}</th>
                  <th style={{ padding: '12px 10px', color: 'var(--gold-400)' }}>{isAr ? 'النوع' : 'Type'}</th>
                  <th style={{ padding: '12px 10px', color: 'var(--gold-400)' }}>{isAr ? 'المحتويات والبيانات' : 'Contents'}</th>
                  <th style={{ padding: '12px 10px', color: 'var(--gold-400)' }}>{isAr ? 'الحجم' : 'Size'}</th>
                  <th style={{ padding: '12px 10px', color: 'var(--gold-400)', textAlign: 'center' }}>{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => {
                  const isAuto = b.triggerType === 'auto';
                  const isRestoring = restoringId === b.id;
                  const isDeleting = deletingId === b.id;

                  return (
                    <tr 
                      key={b.id} 
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'background 0.2s'
                      }}
                    >
                      {/* Date & Note */}
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>
                          {new Date(b.timestamp).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {new Date(b.timestamp).toLocaleTimeString(isAr ? 'ar-EG' : 'en-GB')}
                        </div>
                        {b.note && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--gold-300)', marginTop: '3px' }}>
                            📌 {b.note}
                          </div>
                        )}
                      </td>

                      {/* Type Badge */}
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.74rem',
                          fontWeight: 'bold',
                          background: isAuto ? 'rgba(59,130,246,0.12)' : 'rgba(212,175,55,0.12)',
                          color: isAuto ? '#60a5fa' : 'var(--gold-400)',
                          border: isAuto ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(212,175,55,0.3)'
                        }}>
                          {isAuto ? (isAr ? '📅 تلقائي يومي' : '📅 Auto Daily') : (isAr ? '👤 يدوي' : '👤 Manual')}
                        </span>
                      </td>

                      {/* Content Counts */}
                      <td style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {b.counts ? (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <span>📋 {b.counts.bookings || 0} {isAr ? 'حجز' : 'Bookings'}</span>
                            <span>•</span>
                            <span>🚤 {b.counts.trips || 0} {isAr ? 'رحلة' : 'Trips'}</span>
                            <span>•</span>
                            <span>👥 {b.counts.agents || 0} {isAr ? 'وكيل' : 'Agents'}</span>
                            <span>•</span>
                            <span>⚙️ {isAr ? 'الإعدادات' : 'Settings'}</span>
                          </div>
                        ) : (
                          <span>{isAr ? 'نسخة كاملة' : 'Full system snapshot'}</span>
                        )}
                      </td>

                      {/* File Size */}
                      <td style={{ padding: '12px 10px', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                        {b.sizeFormatted || '—'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {/* Restore Button */}
                          <button
                            type="button"
                            onClick={() => setConfirmRestoreModal({ isOpen: true, backup: b })}
                            disabled={isRestoring}
                            style={{
                              background: 'rgba(16,185,129,0.1)',
                              border: '1px solid #10b981',
                              color: '#10b981',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            {isRestoring ? (isAr ? 'جاري الاسترجاع...' : 'Restoring...') : (isAr ? '🔄 استرجاع' : '🔄 Restore')}
                          </button>

                          {/* Download Button */}
                          <a
                            href={`/api/admin/backups/${b.id}/download`}
                            download
                            style={{
                              background: 'rgba(212,175,55,0.1)',
                              border: '1px solid var(--gold-500)',
                              color: 'var(--gold-400)',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            ⬇️
                          </a>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteBackup(b.id)}
                            disabled={isDeleting}
                            style={{
                              background: 'rgba(239,68,68,0.1)',
                              border: '1px solid rgba(239,68,68,0.3)',
                              color: '#ef4444',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restore Confirmation Modal */}
      {confirmRestoreModal.isOpen && confirmRestoreModal.backup && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          backdropFilter: 'blur(6px)'
        }}>
          <div className="glass-card animate-scale-up" style={{
            background: 'var(--bg-primary)', width: '100%', maxWidth: '520px',
            borderRadius: '12px', padding: '2rem', border: '1.5px solid var(--gold-500)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)', textAlign: isAr ? 'right' : 'left'
          }}>
            <h3 style={{ color: 'var(--gold-400)', margin: '0 0 1rem 0', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span> {isAr ? 'تأكيد استرجاع النسخة الاحتياطية' : 'Confirm System Restore'}
            </h3>
            
            <p style={{ color: '#fff', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
              {isAr
                ? `هل أنت متأكد من رغبتك في استرجاع بيانات الموقع من نسخة تاريخ: ${new Date(confirmRestoreModal.backup.timestamp).toLocaleString('ar-EG')}؟`
                : `Are you sure you want to restore all website data from snapshot taken on: ${new Date(confirmRestoreModal.backup.timestamp).toLocaleString('en-GB')}?`}
            </p>

            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '0.9rem',
              color: '#f87171',
              fontSize: '0.85rem',
              lineHeight: '1.5',
              marginBottom: '1.5rem'
            }}>
              {isAr
                ? '⚠️ تنبيه هام: ستتم إعادة كتابة واستبدال جميع الحجوزات، والرحلات، وأكواد الخصم، والحسابات البنكية بالبيانات المخزنة في هذه النسخة.'
                : '⚠️ Warning: This will overwrite current bookings, trips, promo codes, and settings with the data from this backup snapshot.'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmRestoreModal({ isOpen: false, backup: null })}
                style={{ padding: '0.6rem 1.5rem', cursor: 'pointer' }}
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmRestore}
                style={{ padding: '0.6rem 1.8rem', background: '#10b981', borderColor: '#10b981', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {isAr ? 'نعم، استرجع النسخة الآن' : 'Yes, Restore Now'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
