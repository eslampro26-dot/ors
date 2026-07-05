'use client';

import styles from './page.module.css';

export default function AdminTiers() {
  const tiers = [
    { name: 'برونزي', color: 'bronze', icon: '🥉', comm: '10%', desc: 'المستوى الافتراضي لجميع الوكلاء الجدد.' },
    { name: 'فضي', color: 'silver', icon: '🥈', comm: '15%', desc: 'ترقية تلقائية عند تحقيق الشروط.', criteria: ['مبيعات 96,000€ سنوياً', 'أو 1,920 عملية', 'أو 5-10 وكلاء فضيين'] },
    { name: 'ذهبي', color: 'gold', icon: '🥇', comm: '20%', desc: 'يتم تحديد الشروط من قبل الإدارة.', criteria: ['مبيعات 250,000€ سنوياً', 'أو 5000 عملية'] },
    { name: 'بلاتيني', color: 'platinum', icon: '💎', comm: '25%', desc: 'أعلى مستوى متاح لكبار الوكلاء.', criteria: ['مبيعات 500,000€ سنوياً'] },
  ];

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
                <button className="btn btn-secondary btn-sm" style={{marginTop: '1rem', width: '100%'}} onClick={() => alert('هذه الخاصية سيتم تفعيلها في التحديث القادم')}>تعديل الشروط</button>
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
            <select className={styles.input}>
              <option>-- اختر وكيل --</option>
              <option>أحمد محمود (AG-1)</option>
              <option>خالد عبد الرحمن (AG-3)</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>المستوى الجديد</label>
            <select className={styles.input}>
              <option>فضي</option>
              <option>ذهبي</option>
              <option>بلاتيني</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{alignSelf: 'flex-end'}} onClick={() => alert('سيتم تفعيل هذه الخاصية قريباً')}>تنفيذ الترقية</button>
        </div>
      </div>
    </div>
  );
}
