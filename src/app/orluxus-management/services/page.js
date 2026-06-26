'use client';

import { useState, useEffect } from 'react';
import { cities, internalPackages } from '@/lib/data';
import { getTrips, addTrip, deleteTrip, getPackages, addPackage, deletePackage } from '@/lib/db';
import styles from './page.module.css';

export default function AdminServices() {
  const [activeTab, setActiveTab] = useState('cities'); // 'cities' or 'packages'
  const [selectedCity, setSelectedCity] = useState(cities[0].id);
  const [selectedPkgType, setSelectedPkgType] = useState(internalPackages[0].id);
  
  // State for loaded data to allow immediate reactive UI updates
  const [tripsData, setTripsData] = useState({});
  const [packagesData, setPackagesData] = useState({});
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('trip'); // 'trip' or 'package'
  
  // Form State
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    price: '',
    duration: 'يوم كامل',
    category: '',
    city: '',
    description: '',
    icon: '✈️',
    image: '',
    locationUrl: '',
  });

  // Load data only for the selected city (lazy loading for performance)
  const loadCityData = async (cityId) => {
    // Skip if already loaded
    if (tripsData[cityId]) return;
    
    try {
      const city = cities.find(c => c.id === cityId);
      if (!city) return;
      
      const cityTrips = {};
      // Load all categories for this city in parallel
      await Promise.all(
        city.categories.map(async (cat) => {
          const trips = await getTrips(cityId, cat.id);
          cityTrips[cat.id] = trips || [];
        })
      );
      setTripsData(prev => ({ ...prev, [cityId]: cityTrips }));
    } catch (err) {
      console.error('Error loading city trips:', err);
    }
  };

  const loadPackageData = async (pkgId) => {
    if (packagesData[pkgId]) return;
    try {
      const pkgs = await getPackages(pkgId);
      setPackagesData(prev => ({ ...prev, [pkgId]: pkgs || [] }));
    } catch (err) {
      console.error('Error loading packages:', err);
    }
  };

  // Load data for initial selections on mount
  useEffect(() => {
    loadCityData(selectedCity);
    loadPackageData(selectedPkgType);
  }, []);

  // Load when switching city
  useEffect(() => {
    loadCityData(selectedCity);
  }, [selectedCity]);

  // Load when switching package type
  useEffect(() => {
    loadPackageData(selectedPkgType);
  }, [selectedPkgType]);

  // Force reload after add/delete
  const reloadCurrentCity = async () => {
    const city = cities.find(c => c.id === selectedCity);
    if (!city) return;
    const cityTrips = {};
    await Promise.all(
      city.categories.map(async (cat) => {
        const trips = await getTrips(selectedCity, cat.id);
        cityTrips[cat.id] = trips || [];
      })
    );
    setTripsData(prev => ({ ...prev, [selectedCity]: cityTrips }));
  };

  const reloadCurrentPackage = async () => {
    const pkgs = await getPackages(selectedPkgType);
    setPackagesData(prev => ({ ...prev, [selectedPkgType]: pkgs || [] }));
  };

  // Sync Category when Modal opens
  useEffect(() => {
    if (modalOpen) {
      if (modalType === 'trip') {
        const cityData = cities.find(c => c.id === selectedCity);
        setFormData(prev => ({
          ...prev,
          city: selectedCity,
          category: cityData ? cityData.categories[0].id : '',
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          category: selectedPkgType,
        }));
      }
    }
  }, [modalOpen, modalType, selectedCity, selectedPkgType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (modalType === 'trip') {
      const { city, category, titleAr, titleEn, price, duration, image, locationUrl } = formData;
      if (!titleAr || !titleEn || !price) {
        alert('يرجى ملء جميع الحقول المطلوبة!');
        return;
      }
      
      try {
        const success = await addTrip(city, category, {
          titleAr,
          titleEn,
          price: parseFloat(price),
          duration,
          image: image || '/images/trips/glass-boat.jpg',
          locationUrl: locationUrl || ''
        });

        if (success) {
          alert('تمت إضافة الرحلة بنجاح!');
          setModalOpen(false);
          setFormData({ titleAr:'',titleEn:'',price:'',duration:'يوم كامل',category:'',city:'',description:'',icon:'✈️',image:'',locationUrl:'' });
          await reloadCurrentCity();
        } else {
          alert('حدث خطأ أثناء حفظ الرحلة.');
        }
      } catch (err) {
        console.error('Error adding trip:', err);
        alert('حدث خطأ أثناء حفظ الرحلة.');
      }
    } else {
      const { category, titleAr, titleEn, price, duration, description, icon } = formData;
      if (!titleAr || !titleEn || !price) {
        alert('يرجى ملء جميع الحقول المطلوبة!');
        return;
      }

      try {
        const success = await addPackage(category, {
          titleAr,
          titleEn,
          price: parseFloat(price),
          duration: duration || '3 ليالي / 4 أيام',
          description,
          icon: icon || '✈️'
        });

        if (success) {
          alert('تمت إضافة الباكدج بنجاح!');
          setModalOpen(false);
          setFormData({ titleAr:'',titleEn:'',price:'',duration:'يوم كامل',category:'',city:'',description:'',icon:'✈️',image:'' });
          await reloadCurrentPackage();
        } else {
          alert('حدث خطأ أثناء حفظ الباكدج.');
        }
      } catch (err) {
        console.error('Error adding package:', err);
        alert('حدث خطأ أثناء حفظ الباكدج.');
      }
    }
  };

  const handleDeleteTrip = async (cityId, catId, tripId) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذه الخدمة؟')) {
      try {
        const success = await deleteTrip(cityId, catId, tripId);
        if (success) {
          await reloadCurrentCity();
        } else {
          alert('حدث خطأ أثناء حذف الخدمة.');
        }
      } catch (err) {
        console.error('Error deleting trip:', err);
        alert('حدث خطأ أثناء حذف الخدمة.');
      }
    }
  };

  const handleDeletePackage = async (pkgId, itemUniqueId) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الباكدج؟')) {
      try {
        const success = await deletePackage(pkgId, itemUniqueId);
        if (success) {
          await reloadCurrentPackage();
        } else {
          alert('حدث خطأ أثناء حذف الباكدج.');
        }
      } catch (err) {
        console.error('Error deleting package:', err);
        alert('حدث خطأ أثناء حذف الباكدج.');
      }
    }
  };

  return (
    <div className={styles.servicesPage}>
      {/* Top Header */}
      <div className={styles.header}>
        <div>
          <h2>إدارة الخدمات والرحلات السياحية</h2>
          <p className={styles.subtitle}>تحكم في جميع الرحلات والباكدجات السياحية المتاحة على المنصة.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => { setModalType('trip'); setModalOpen(true); }}
          >
            <span>➕</span> إضافة رحلة جديدة
          </button>
          <button 
            className="btn btn-ocean" 
            onClick={() => { setModalType('package'); setModalOpen(true); }}
          >
            <span>✈️</span> إضافة باكدج جديد
          </button>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-medium)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <button 
          className={`${styles.mainTab} ${activeTab === 'cities' ? styles.activeMainTab : ''}`}
          onClick={() => setActiveTab('cities')}
        >
          🏖️ الرحلات حسب المدن
        </button>
        <button 
          className={`${styles.mainTab} ${activeTab === 'packages' ? styles.activeMainTab : ''}`}
          onClick={() => setActiveTab('packages')}
        >
          📦 باكدجات مصر الشاملة
        </button>
      </div>

      {/* -------------------- CITIES TAB CONTENT -------------------- */}
      {activeTab === 'cities' && (
        <>
          {/* City Tabs */}
          <div className={styles.cityTabs}>
            {cities.map(city => (
              <button 
                key={city.id}
                className={`${styles.cityTab} ${selectedCity === city.id ? styles.activeTab : ''}`}
                onClick={() => setSelectedCity(city.id)}
              >
                {city.emoji} {city.nameAr}
              </button>
            ))}
          </div>

          {/* Categories and Trips for selected city */}
          {cities.map(city => (
            city.id === selectedCity && (
              <div key={city.id} className={`${styles.categoriesList} animate-fade-in-up`}>
                {city.categories.map(cat => {
                  const trips = (tripsData[city.id] && tripsData[city.id][cat.id]) || [];
                  const slotPercent = (trips.length / 20) * 100;
                  
                  return (
                    <div key={cat.id} className={styles.categorySection} style={{ marginBottom: '2.5rem' }}>
                      <div className={styles.catHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div className={styles.catTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.8rem' }}>{cat.icon}</span>
                          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                            {cat.nameAr} <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-en)' }}>({cat.nameEn})</span>
                          </h3>
                        </div>
                        
                        {/* Slots Progress bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '120px', height: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${slotPercent}%`, background: slotPercent > 80 ? 'var(--coral-500)' : 'var(--gold-500)' }}></div>
                          </div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {trips.length} / 20 خانة مشغولة
                          </span>
                        </div>
                      </div>

                      {/* Trips list in this category */}
                      {trips.length > 0 ? (
                        <div className={styles.tripsGrid}>
                          {trips.map(trip => (
                            <div key={trip.id} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', position: 'relative' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                  <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '700' }}>{trip.titleAr}</h4>
                                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontFamily: 'var(--font-en)' }}>{trip.titleEn}</span>
                                </div>
                                <div style={{ color: 'var(--gold-600)', fontWeight: 'bold', fontFamily: 'var(--font-en)' }}>
                                  €{trip.price}
                                </div>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <span>⏱️ {trip.duration}</span>
                                <span>⭐ {trip.rating || '5.0'}</span>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                  {trip.id.toString().startsWith('custom') ? '✏️ مضاف يدوياً' : '📌 افتراضي'}
                                </span>
                                <button 
                                  className="btn btn-secondary btn-sm" 
                                  style={{ padding: '2px 8px', color: 'var(--coral-600)', borderColor: 'rgba(244, 63, 94, 0.2)', fontSize: '0.8rem' }}
                                  onClick={() => handleDeleteTrip(city.id, cat.id, trip.id)}
                                >
                                  🗑️ حذف
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', borderStyle: 'dashed', opacity: 0.7 }}>
                          <p style={{ color: 'var(--text-secondary)' }}>لا توجد رحلات مضافة في هذا القسم حالياً.</p>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ marginTop: '0.5rem' }}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, city: city.id, category: cat.id }));
                              setModalType('trip');
                              setModalOpen(true);
                            }}
                          >
                            ➕ أضف أول رحلة الآن
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ))}
        </>
      )}

      {/* -------------------- PACKAGES TAB CONTENT -------------------- */}
      {activeTab === 'packages' && (
        <>
          {/* Package Type Switcher */}
          <div className={styles.cityTabs}>
            {internalPackages.map(pkg => (
              <button 
                key={pkg.id}
                className={`${styles.cityTab} ${selectedPkgType === pkg.id ? styles.activeTab : ''}`}
                onClick={() => setSelectedPkgType(pkg.id)}
              >
                {pkg.icon} {pkg.nameAr}
              </button>
            ))}
          </div>

          {/* Rendering Packages under selected type */}
          {internalPackages.map(pkg => {
            if (pkg.id !== selectedPkgType) return null;
            const items = packagesData[pkg.id] || [];
            
            return (
              <div key={pkg.id} className="animate-fade-in-up" style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)' }}>{pkg.nameAr}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{pkg.description}</p>
                  </div>
                  <span className="badge badge-ocean">{items.length} / 20 باكدج مفعّل</span>
                </div>

                {items.length > 0 ? (
                  <div className={styles.tripsGrid}>
                    {items.map(item => (
                      <div key={item.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ fontSize: '2rem' }}>{item.icon || '✈️'}</span>
                            <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '700', marginTop: '0.5rem' }}>{item.titleAr}</h4>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', fontFamily: 'var(--font-en)' }}>{item.titleEn}</span>
                          </div>
                          <div style={{ color: 'var(--gold-600)', fontWeight: 'bold', fontSize: '1.1rem', fontFamily: 'var(--font-en)' }}>
                            €{item.price}
                          </div>
                        </div>

                        {item.description && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                            {item.description}
                          </p>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                          <span>⏱️ {item.duration || 'غير محدد'}</span>
                          <span>⭐ {item.rating}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.8rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>مضاف يدوياً</span>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ padding: '2px 8px', color: 'var(--coral-600)', borderColor: 'rgba(244, 63, 94, 0.2)' }}
                            onClick={() => handleDeletePackage(pkg.id, item.id)}
                          >
                            🗑️ حذف الباكدج
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', borderStyle: 'dashed', opacity: 0.7 }}>
                    <span style={{ fontSize: '3rem', opacity: 0.5 }}>{pkg.icon}</span>
                    <h3 style={{ marginTop: '1rem', color: 'var(--text-primary)' }}>لا توجد باكدجات مضافة حالياً في هذا القسم</h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0.5rem auto 1.5rem auto' }}>
                      يمكنك إضافة عروض سياحية شاملة (فندق + طيران + رحلات) وتعيين أسعار خاصة بها لتظهر للجمهور.
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, category: pkg.id }));
                        setModalType('package');
                        setModalOpen(true);
                      }}
                    >
                      ➕ إضافة باكدج لهذا القسم
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* -------------------- ADD TRIP / PACKAGE MODAL -------------------- */}
      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} glass-card animate-scale-in`}>
            <div className={styles.modalHeader}>
              <h3>
                {modalType === 'trip' ? '➕ إضافة رحلة سياحية جديدة' : '✈️ إضافة باكدج سياحي جديد'}
              </h3>
              <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleFormSubmit} className={styles.modalForm}>
              {modalType === 'trip' ? (
                <>
                  {/* Select City */}
                  <div className={styles.formGroup}>
                    <label>المدينة السياحية المستهدفة</label>
                    <select name="city" value={formData.city} onChange={handleInputChange} className={styles.input}>
                      {cities.map(c => (
                        <option key={c.id} value={c.id}>{c.emoji} {c.nameAr}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Category */}
                  <div className={styles.formGroup}>
                    <label>نوع الرحلة (القسم)</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className={styles.input}>
                      {cities.find(c => c.id === formData.city)?.categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.nameAr}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                /* Select Package Category */
                <div className={styles.formGroup}>
                  <label>نوع الباكدج</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className={styles.input}>
                    {internalPackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>{pkg.icon} {pkg.nameAr}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title Arabic */}
              <div className={styles.formGroup}>
                <label>العنوان باللغة العربية *</label>
                <input 
                  type="text" 
                  name="titleAr" 
                  value={formData.titleAr} 
                  onChange={handleInputChange}
                  placeholder="مثال: رحلة اليخت الشراعي عند الغروب"
                  className={styles.input}
                  required
                />
              </div>

              {/* Title English */}
              <div className={styles.formGroup}>
                <label>العنوان باللغة الإنجليزية *</label>
                <input 
                  type="text" 
                  name="titleEn" 
                  value={formData.titleEn} 
                  onChange={handleInputChange}
                  placeholder="Example: Luxury Yacht Sunset Cruise"
                  className={styles.input}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Price */}
                <div className={styles.formGroup}>
                  <label>السعر باليورو (€) *</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange}
                    placeholder="مثال: 45"
                    className={styles.input}
                    min="1"
                    required
                  />
                </div>

                {/* Duration */}
                <div className={styles.formGroup}>
                  <label>المدة الزمنية</label>
                  <input 
                    type="text" 
                    name="duration" 
                    value={formData.duration} 
                    onChange={handleInputChange}
                    placeholder={modalType === 'trip' ? "يوم كامل، 3 ساعات..." : "3 ليالي / 4 أيام..."}
                    className={styles.input}
                  />
                </div>
              </div>

              {modalType === 'package' ? (
                <>
                  {/* Description */}
                  <div className={styles.formGroup}>
                    <label>الوصف / المزايا الشاملة</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange}
                      placeholder="مثال: إقامة فندق 5 نجوم + طيران ذهاب وإياب + ترنسفير مطار"
                      className={styles.input}
                      rows="3"
                    ></textarea>
                  </div>
                  {/* Icon */}
                  <div className={styles.formGroup}>
                    <label>رمز تعبيري مميز (Emoji)</label>
                    <input 
                      type="text" 
                      name="icon" 
                      value={formData.icon} 
                      onChange={handleInputChange}
                      placeholder="مثال: 🛳️, 🧖, 🏨"
                      className={styles.input}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Image Url */}
                  <div className={styles.formGroup}>
                    <label>رابط الصورة (اختياري)</label>
                    <input 
                      type="text" 
                      name="image" 
                      value={formData.image} 
                      onChange={handleInputChange}
                      placeholder="مثال: /images/trips/custom.jpg"
                      className={styles.input}
                    />
                  </div>
                  {/* Location URL */}
                  <div className={styles.formGroup}>
                    <label>رابط الموقع الجغرافي للمطعم/المكان (Google Maps URL) (اختياري)</label>
                    <input 
                      type="text" 
                      name="locationUrl" 
                      value={formData.locationUrl} 
                      onChange={handleInputChange}
                      placeholder="مثال: https://maps.google.com/..."
                      className={styles.input}
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary">➕ تأكيد الإضافة</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
