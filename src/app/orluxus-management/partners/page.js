'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    category: 'hotel',
    categoryLabelAr: 'فندق ومنتجع فاخر',
    categoryLabelEn: 'Luxury Resort & Hotel',
    city: 'hurghada',
    cityLabelAr: 'الغردقة',
    cityLabelEn: 'Hurghada',
    image: '',
    rating: 5.0,
    descriptionAr: '',
    descriptionEn: '',
    websiteUrl: '',
    locationUrl: '',
    discountOffer: '',
    featured: true,
  });

  const CATEGORY_MAP = {
    hotel: { ar: 'فندق ومنتجع فاخر', en: 'Luxury Resort & Hotel' },
    restaurant: { ar: 'مطعم فاخر', en: 'Fine Dining Restaurant' },
    yacht: { ar: 'يخوت وأنشطة بحرية', en: 'Luxury Yachts & Marine' },
    activity: { ar: 'أنشطة وترفيه', en: 'Activity & Entertainment' },
  };

  const CITY_MAP = {
    hurghada: { ar: 'الغردقة', en: 'Hurghada' },
    'el-gouna': { ar: 'الجونة', en: 'El Gouna' },
    'sharm-el-sheikh': { ar: 'شرم الشيخ', en: 'Sharm El Sheikh' },
    'marsa-alam': { ar: 'مرسى علم', en: 'Marsa Alam' },
    cairo: { ar: 'القاهرة', en: 'Cairo' },
    'north-coast': { ar: 'الساحل الشمالي', en: 'North Coast' },
  };

  const loadPartners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/partners');
      if (res.ok) {
        const data = await res.json();
        setPartners(data.partners || []);
      }
    } catch (err) {
      console.error('Failed to load partners', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const resetForm = () => {
    setFormData({
      nameAr: '',
      nameEn: '',
      category: 'hotel',
      categoryLabelAr: 'فندق ومنتجع فاخر',
      categoryLabelEn: 'Luxury Resort & Hotel',
      city: 'hurghada',
      cityLabelAr: 'الغردقة',
      cityLabelEn: 'Hurghada',
      image: '',
      rating: 5.0,
      descriptionAr: '',
      descriptionEn: '',
      websiteUrl: '',
      locationUrl: '',
      discountOffer: '',
      featured: true,
    });
    setEditingPartner(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (partner) => {
    setEditingPartner(partner);
    setFormData({
      nameAr: partner.nameAr || '',
      nameEn: partner.nameEn || '',
      category: partner.category || 'hotel',
      categoryLabelAr: partner.categoryLabelAr || CATEGORY_MAP[partner.category]?.ar || '',
      categoryLabelEn: partner.categoryLabelEn || CATEGORY_MAP[partner.category]?.en || '',
      city: partner.city || 'hurghada',
      cityLabelAr: partner.cityLabelAr || CITY_MAP[partner.city]?.ar || '',
      cityLabelEn: partner.cityLabelEn || CITY_MAP[partner.city]?.en || '',
      image: partner.image || '',
      rating: partner.rating || 5.0,
      descriptionAr: partner.descriptionAr || '',
      descriptionEn: partner.descriptionEn || '',
      websiteUrl: partner.websiteUrl || '',
      locationUrl: partner.locationUrl || '',
      discountOffer: partner.discountOffer || '',
      featured: partner.featured !== false,
    });
    setIsModalOpen(true);
  };

  const handleCategoryChange = (cat) => {
    setFormData(prev => ({
      ...prev,
      category: cat,
      categoryLabelAr: CATEGORY_MAP[cat]?.ar || '',
      categoryLabelEn: CATEGORY_MAP[cat]?.en || '',
    }));
  };

  const handleCityChange = (cityKey) => {
    setFormData(prev => ({
      ...prev,
      city: cityKey,
      cityLabelAr: CITY_MAP[cityKey]?.ar || '',
      cityLabelEn: CITY_MAP[cityKey]?.en || '',
    }));
  };

  const handleImageFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setFormData(prev => ({ ...prev, image: data.url }));
          return;
        }
      }
    } catch (err) {
      console.error('Error uploading partner image to cloud:', err);
    }

    // Fallback if network issue
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setFormData(prev => ({ ...prev, image: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nameAr.trim() || !formData.nameEn.trim()) {
      alert('يرجى كتابة اسم الشريك بالعربية والإنجليزية!');
      return;
    }

    setIsSaving(true);
    try {
      if (editingPartner) {
        // Update
        const res = await fetch('/api/partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            id: editingPartner.id,
            partner: formData
          })
        });
        if (res.ok) {
          alert('✅ تم تعديل بيانات الشريك بنجاح!');
          setIsModalOpen(false);
          loadPartners();
        } else {
          alert('❌ حدث خطأ أثناء التعديل');
        }
      } else {
        // Create
        const res = await fetch('/api/partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partner: formData
          })
        });
        if (res.ok) {
          alert('✅ تم إضافة الشريك الجديد بنجاح!');
          setIsModalOpen(false);
          loadPartners();
        } else {
          alert('❌ حدث خطأ أثناء إضافة الشريك');
        }
      }
    } catch (err) {
      console.error('Error saving partner:', err);
      alert('❌ خطأ في الاتصال بالسيرفر');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (partnerId, partnerName) => {
    if (!confirm(`هل أنت متأكد من حذف الشريك "${partnerName}"؟`)) return;

    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id: partnerId
        })
      });
      if (res.ok) {
        alert('✅ تم الحذف بنجاح');
        loadPartners();
      } else {
        alert('❌ حدث خطأ أثناء الحذف');
      }
    } catch (err) {
      console.error('Error deleting partner:', err);
      alert('❌ خطأ في الاتصال بالسيرفر');
    }
  };

  const filteredPartners = partners.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      (p.nameAr || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.nameEn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.cityLabelAr || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1400px', margin: '0 auto', color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--gold-400, #f6d063)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🤝 إدارة الشركاء (Partners)
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            إضافة وإدارة الفنادق، المطاعم، اليخوت، والأنشطة الشريكة المعروضة على الموقع
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            href="/partners"
            target="_blank"
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '0.88rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            👁️ عرض صفحة الشركاء
          </Link>

          <button
            onClick={openAddModal}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--gold-500, #c9a227) 0%, var(--gold-600, #a3821a) 100%)',
              border: 'none',
              color: '#000',
              fontSize: '0.92rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ➕ إضافة شريك جديد
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.7)',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid rgba(201, 162, 39, 0.2)',
        marginBottom: '2rem'
      }}>
        {/* Search */}
        <input
          type="text"
          placeholder="🔍 بحث بالاسم أو المدينة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: '1 1 240px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            outline: 'none',
            fontSize: '0.9rem'
          }}
        />

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'hotel', label: '🏨 فنادق ومنتجعات' },
            { id: 'restaurant', label: '🍽️ مطاعم' },
            { id: 'yacht', label: '⛵ يخوت وبحرية' },
            { id: 'activity', label: '🎯 أنشطة' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: selectedCategory === cat.id ? '1px solid var(--gold-400)' : '1px solid rgba(255,255,255,0.1)',
                background: selectedCategory === cat.id ? 'rgba(201,162,39,0.2)' : 'rgba(255,255,255,0.02)',
                color: selectedCategory === cat.id ? 'var(--gold-400)' : 'rgba(255,255,255,0.7)',
                fontWeight: selectedCategory === cat.id ? '800' : '500',
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Partners List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.6)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
          <div>جارٍ تحميل قائمة الشركاء...</div>
        </div>
      ) : filteredPartners.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'rgba(15, 23, 42, 0.5)',
          borderRadius: '16px',
          border: '1px dashed rgba(201,162,39,0.3)',
          color: 'rgba(255,255,255,0.6)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>لا يوجد شركاء متطابقين</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>يمكنك إضافة أول شريك بالضغط على الزر أدناه</p>
          <button
            onClick={openAddModal}
            style={{
              padding: '10px 22px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--gold-500) 0%, var(--gold-600) 100%)',
              border: 'none',
              color: '#000',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            ➕ إضافة شريك جديد الآن
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredPartners.map(partner => (
            <div
              key={partner.id}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(201, 162, 39, 0.25)',
                borderRadius: '14px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 6px 18px rgba(0,0,0,0.3)'
              }}
            >
              {/* Image & Header */}
              <div style={{ position: 'relative', width: '100%', height: '170px', background: '#1e293b' }}>
                <img
                  src={partner.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'}
                  alt={partner.nameAr}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.8)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  color: 'var(--gold-400)',
                  fontWeight: '700'
                }}>
                  {partner.categoryLabelAr || partner.category}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.7)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  color: '#fbbf24',
                  fontWeight: '700'
                }}>
                  ⭐ {partner.rating || 5.0}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                  📍 {partner.cityLabelAr || partner.city}
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: '#fff', fontWeight: '800' }}>
                  {partner.nameAr}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--gold-400)', marginBottom: '10px', direction: 'ltr', textAlign: 'left' }}>
                  {partner.nameEn}
                </div>
                <p style={{
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.65)',
                  lineHeight: '1.5',
                  margin: '0 0 12px 0',
                  flex: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {partner.descriptionAr}
                </p>

                {partner.discountOffer && (
                  <div style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'rgba(201,162,39,0.1)',
                    border: '1px dashed rgba(201,162,39,0.35)',
                    color: 'var(--gold-400)',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    marginBottom: '1rem'
                  }}>
                    🎁 {partner.discountOffer}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                  <button
                    onClick={() => openEditModal(partner)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      background: 'rgba(201,162,39,0.15)',
                      border: '1px solid rgba(201,162,39,0.3)',
                      color: 'var(--gold-400)',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: '700'
                    }}
                  >
                    ✏️ تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(partner.id, partner.nameAr)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: '700'
                    }}
                  >
                    🗑️ حذف
                  </button>
                  {partner.websiteUrl && (
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        textDecoration: 'none',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="زيارة الموقع الإلكتروني"
                    >
                      🌐
                    </a>
                  )}
                  {partner.locationUrl && (
                    <a
                      href={partner.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'rgba(201,162,39,0.1)',
                        border: '1px solid rgba(201,162,39,0.25)',
                        color: 'var(--gold-400)',
                        textDecoration: 'none',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="الموقع على الخريطة (Google Maps)"
                    >
                      📍
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'var(--bg-primary, #0f172a)',
            border: '1.5px solid rgba(201,162,39,0.4)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--gold-400)', fontSize: '1.4rem', fontWeight: '800' }}>
              {editingPartner ? '✏️ تعديل بيانات الشريك' : '➕ إضافة شريك جديد'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Names */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.8)' }}>
                    اسم الشريك بالعربية *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: فندق ريكسوس بريميوم مجاويش"
                    value={formData.nameAr}
                    onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.8)' }}>
                    اسم الشريك بالإنجليزية *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rixos Premium Magawish"
                    value={formData.nameEn}
                    onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Category & City */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.8)' }}>
                    التصنيف *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => handleCategoryChange(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', outline: 'none' }}
                  >
                    <option value="hotel">🏨 فندق ومنتجع فاخر</option>
                    <option value="restaurant">🍽️ مطعم فاخر</option>
                    <option value="yacht">⛵ يخوت وبحرية</option>
                    <option value="activity">🎯 أنشطة وترفيه</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.8)' }}>
                    المدينة / الوجهة *
                  </label>
                  <select
                    value={formData.city}
                    onChange={e => handleCityChange(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', outline: 'none' }}
                  >
                    <option value="hurghada">الغردقة</option>
                    <option value="el-gouna">الجونة</option>
                    <option value="sharm-el-sheikh">شرم الشيخ</option>
                    <option value="marsa-alam">مرسى علم</option>
                    <option value="cairo">القاهرة</option>
                    <option value="north-coast">الساحل الشمالي</option>
                  </select>
                </div>
              </div>

              {/* Image Input + Upload */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.8)' }}>
                  رابط صورة الشريك أو رفع صورة
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="https://... رابط الصورة"
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    style={{ flex: 1, padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', outline: 'none' }}
                  />
                  <label style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: 'rgba(201,162,39,0.2)',
                    border: '1px solid rgba(201,162,39,0.4)',
                    color: 'var(--gold-400)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    📁 رفع
                    <input type="file" accept="image/*" onChange={handleImageFile} style={{ display: 'none' }} />
                  </label>
                </div>
                {formData.image && (
                  <div style={{ marginTop: '8px' }}>
                    <img src={formData.image} alt="معاينة" style={{ height: '80px', borderRadius: '6px', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              {/* Rating & Exclusive Offer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.8)' }}>
                    التقييم (1 - 5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5.0 })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.8)' }}>
                    العرض أو الخصم الحصري (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: خصم 15% لعملاء أورلوكسوس + ترحيب VIP"
                    value={formData.discountOffer}
                    onChange={e => setFormData({ ...formData, discountOffer: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Website Link */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.8)' }}>
                  🌐 رابط الموقع الإلكتروني (اختياري)
                </label>
                <input
                  type="url"
                  placeholder="https://www.example.com"
                  value={formData.websiteUrl}
                  onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', outline: 'none', direction: 'ltr' }}
                />
              </div>

              {/* Location Link */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.8)' }}>
                  📍 رابط الموقع الجغرافي (Google Maps - اختياري)
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={formData.locationUrl}
                  onChange={e => setFormData({ ...formData, locationUrl: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', outline: 'none', direction: 'ltr' }}
                />
              </div>

              {/* Arabic Description */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.8)' }}>
                  نبذة عن الشريك (بالعربية)
                </label>
                <textarea
                  rows="3"
                  placeholder="وصف مميزات الشريك والخدمات الفاخرة المقدمة..."
                  value={formData.descriptionAr}
                  onChange={e => setFormData({ ...formData, descriptionAr: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* English Description */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.8)' }}>
                  نبذة عن الشريك (بالإنجليزية)
                </label>
                <textarea
                  rows="3"
                  placeholder="Brief description of the partner and VIP luxury services..."
                  value={formData.descriptionEn}
                  onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', outline: 'none', resize: 'vertical', direction: 'ltr' }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--gold-500) 0%, var(--gold-600) 100%)',
                    border: 'none',
                    color: '#000',
                    fontSize: '1rem',
                    fontWeight: '800',
                    cursor: isSaving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSaving ? '⏳ جاري الحفظ...' : (editingPartner ? '💾 حفظ التعديلات' : '➕ إضافة الشريك')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
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
