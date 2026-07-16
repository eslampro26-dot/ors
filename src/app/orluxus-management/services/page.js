'use client';

import { useState, useEffect } from 'react';
import { cities, internalPackages, categoryTranslations } from '@/lib/data';
import { getTrips, addTrip, updateTrip, deleteTrip, getPackages, addPackage, deletePackage } from '@/lib/db';
import styles from './page.module.css';

// أيقونات الفئات
const categoryIcons = {
  'sea-trips': '⛵',
  'desert-trips': '🏜️',
  'city-tours': '🏛️',
  'internal-packages': '📦',
  'restaurants': '🍽️',
  'cafes': '☕',
  'shopping': '🛍️',
  'transfers': '🚌',
  'entertainment': '🎭',
};

// الطلبات الخاصة المتاحة للاختيار
const PRESET_SPECIAL_REQUESTS = [
  { id: 'veg_food', labelAr: 'طعام نباتي', labelEn: 'Vegetarian Food' },
  { id: 'halal_food', labelAr: 'طعام حلال', labelEn: 'Halal Food' },
  { id: 'kids_menu', labelAr: 'قائمة أطفال', labelEn: 'Kids Menu' },
  { id: 'wheelchair', labelAr: 'كرسي متحرك', labelEn: 'Wheelchair Access' },
  { id: 'early_checkin', labelAr: 'تسجيل دخول مبكر', labelEn: 'Early Check-in' },
  { id: 'late_checkout', labelAr: 'تسجيل خروج متأخر', labelEn: 'Late Check-out' },
  { id: 'airport_pickup', labelAr: 'استقبال المطار', labelEn: 'Airport Pickup' },
  { id: 'private_guide', labelAr: 'مرشد خاص', labelEn: 'Private Guide' },
  { id: 'photography', labelAr: 'تصوير احترافي', labelEn: 'Professional Photography' },
  { id: 'birthday_cake', labelAr: 'كيكة عيد ميلاد', labelEn: 'Birthday Cake' },
  { id: 'romantic_setup', labelAr: 'ديكور رومانسي', labelEn: 'Romantic Setup' },
  { id: 'snorkeling_gear', labelAr: 'معدات سنوركل', labelEn: 'Snorkeling Gear' },
];

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
  const [editingTrip, setEditingTrip] = useState(null); // {cityId, catId, tripId}

  
  // Form State
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    price: '',
    economyPrice: '',
    businessPrice: '',
    vipPrice: '',
    duration: 'يوم كامل',
    category: '',
    city: '',
    description: '',
    tripDescription: '',
    icon: '✈️',
    image: '',
    images: [],
    locationUrl: '',
    videoUrl: '',
    economyDesc: '',
    businessDesc: '',
    vipDesc: '',
    specialRequests: [],
  });
  const [useTierPrices, setUseTierPrices] = useState(false);

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
          duration: '3 ليالي / 4 أيام',
        }));
      }
    }
  }, [modalOpen, modalType, selectedCity, selectedPkgType]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // 60% quality jpeg
        setFormData(prev => ({ ...prev, image: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            setFormData(prev => ({
              ...prev,
              images: [...(prev.images || []), dataUrl]
            }));
            resolve();
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveGalleryImage = (idxToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== idxToRemove)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Edit Trip Click
  const handleEditTripClick = (cityId, catId, trip) => {
    setEditingTrip({ cityId, catId, tripId: trip.id });
    setModalType('trip');
    const hasTiers = !!(trip.economyPrice && trip.businessPrice && trip.vipPrice);
    setUseTierPrices(hasTiers);
    setFormData({
      titleAr: trip.titleAr || '',
      titleEn: trip.titleEn || '',
      price: String(trip.price || ''),
      economyPrice: String(trip.economyPrice || trip.price || ''),
      businessPrice: String(trip.businessPrice || ''),
      vipPrice: String(trip.vipPrice || ''),
      duration: trip.duration || 'يوم كامل',
      category: catId,
      city: cityId,
      description: trip.description || '',
      tripDescription: trip.tripDescription || '',
      icon: trip.icon || '✈️',
      image: trip.image || '',
      images: trip.images || [],
      locationUrl: trip.locationUrl || '',
      videoUrl: trip.videoUrl || '',
      economyDesc: trip.economyDesc || '',
      businessDesc: trip.businessDesc || '',
      vipDesc: trip.vipDesc || '',
      specialRequests: trip.specialRequests || [],
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (modalType === 'trip') {
      const { city, category, titleAr, titleEn, price, economyPrice, businessPrice, vipPrice, duration, image, images, locationUrl, videoUrl, economyDesc, businessDesc, vipDesc, tripDescription, specialRequests } = formData;
      const basePrice = useTierPrices ? (parseFloat(economyPrice) || 0) : parseFloat(price);
      if (!titleAr || !titleEn || basePrice <= 0) {
        alert('يرجى ملء جميع الحقول المطلوبة (العنوان والسعر)!');
        return;
      }
      
      const tripPayload = {
        titleAr,
        titleEn,
        price: basePrice,
        economyPrice: useTierPrices ? (parseFloat(economyPrice) || basePrice) : basePrice,
        businessPrice: useTierPrices ? (parseFloat(businessPrice) || basePrice * 1.5) : basePrice * 1.5,
        vipPrice: useTierPrices ? (parseFloat(vipPrice) || basePrice * 2) : basePrice * 2,
        duration,
        image: image || '/images/trips/glass-boat.jpg',
        images: images || [],
        locationUrl: locationUrl || '',
        videoUrl: videoUrl || '',
        tripDescription: tripDescription || '',
        economyDesc: economyDesc || '',
        businessDesc: businessDesc || '',
        vipDesc: vipDesc || '',
        specialRequests: specialRequests || [],
      };
      
      try {
        let success;
        if (editingTrip) {
          // Update mode
          success = await updateTrip(editingTrip.tripId, tripPayload);
          if (success) {
            alert('تم تحديث الرحلة بنجاح!');
          } else {
            alert('حدث خطأ أثناء تحديث الرحلة.');
          }
        } else {
          // Add mode
          success = await addTrip(city, category, tripPayload);
          if (success) {
            alert('تمت إضافة الرحلة بنجاح!');
          } else {
            alert('حدث خطأ أثناء حفظ الرحلة.');
          }
        }

        if (success) {
          setModalOpen(false);
          setEditingTrip(null);
          setFormData({ titleAr:'',titleEn:'',price:'',economyPrice:'',businessPrice:'',vipPrice:'',duration:'يوم كامل',category:'',city:'',description:'',tripDescription:'',icon:'✈️',image:'',images:[],locationUrl:'',videoUrl:'', economyDesc:'', businessDesc:'', vipDesc:'', specialRequests:[] });
          setUseTierPrices(false);
          await reloadCurrentCity();
        }
      } catch (err) {
        console.error('Error saving trip:', err);
        alert('حدث خطأ أثناء حفظ الرحلة.');
      }
    } else {
      const { category, titleAr, titleEn, price, duration, description, icon, image, images } = formData;
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
          icon: icon || '✈️',
          image: image || '',
          images: images || []
        });

        if (success) {
          alert('تمت إضافة الباكدج بنجاح!');
          setModalOpen(false);
          setFormData({ titleAr:'',titleEn:'',price:'',duration:'يوم كامل',category:'',city:'',description:'',icon:'✈️',image:'',images:[] });
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
            onClick={() => { 
              setModalType('package'); 
              setFormData(prev => ({ ...prev, category: selectedPkgType }));
              setModalOpen(true); 
            }}
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
                  
                  return (
                    <div key={cat.id} className={styles.categorySection} style={{ marginBottom: '2.5rem' }}>
                      <div className={styles.catHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div className={styles.catTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.8rem' }}>{cat.icon}</span>
                          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                            {cat.nameAr} <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-en)' }}>({cat.nameEn})</span>
                          </h3>
                        </div>
                        
                        {/* Active count */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                            {trips.length} خدمة نشطة
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
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button 
                                    className="btn btn-secondary btn-sm" 
                                    style={{ padding: '2px 8px', color: 'var(--gold-400)', borderColor: 'rgba(251,191,36,0.3)', fontSize: '0.8rem' }}
                                    onClick={() => handleEditTripClick(city.id, cat.id, trip)}
                                  >
                                    ✏️ تعديل
                                  </button>
                                  <button 
                                    className="btn btn-secondary btn-sm" 
                                    style={{ padding: '2px 8px', color: 'var(--coral-600)', borderColor: 'rgba(244, 63, 94, 0.2)', fontSize: '0.8rem' }}
                                    onClick={() => handleDeleteTrip(city.id, cat.id, trip.id)}
                                  >
                                    🗑️ حذف
                                  </button>
                                </div>
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
                {pkg.icon} {pkg.names?.ar || pkg.id}
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
                    <h3 style={{ color: 'var(--text-primary)' }}>{pkg.names?.ar || pkg.id}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{pkg.descriptions?.ar || ''}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span className="badge badge-ocean">{items.length} باكدج مفعّل</span>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                      onClick={() => {
                        setModalType('package');
                        setFormData(prev => ({ ...prev, category: pkg.id }));
                        setModalOpen(true);
                      }}
                    >
                      ➕ إضافة
                    </button>
                  </div>
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
                {modalType === 'trip' 
                  ? (editingTrip ? '✏️ تعديل بيانات الرحلة' : '➕ إضافة رحلة سياحية جديدة') 
                  : '✈️ إضافة باكدج سياحي جديد'}
              </h3>
              <button className={styles.closeBtn} onClick={() => { setModalOpen(false); setEditingTrip(null); }}>×</button>
            </div>
            
            <form onSubmit={handleFormSubmit} className={styles.modalForm}>
              {modalType === 'trip' ? (
                <>
                  {/* Select City */}
                  <div className={styles.formGroup}>
                    <label>المدينة السياحية المستهدفة</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={styles.input}
                      style={{ backgroundColor: '#0c0f17', color: '#f8fafc', colorScheme: 'dark' }}
                    >
                      {cities.map(c => (
                        <option key={c.id} value={c.id} style={{ backgroundColor: '#0c0f17', color: '#f8fafc' }}>{c.emoji} {c.nameAr}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Category */}
                  <div className={styles.formGroup}>
                    <label>نوع الرحلة (القسم)</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={styles.input}
                      style={{ backgroundColor: '#0c0f17', color: '#f8fafc', colorScheme: 'dark' }}
                    >
                      {cities.find(c => c.id === formData.city)?.categories.map(cat => {
                        const icon = categoryIcons[cat.id] || '📍';
                        const nameAr = categoryTranslations[cat.id]?.ar || cat.id;
                        const nameEn = categoryTranslations[cat.id]?.en || cat.id;
                        return (
                          <option key={cat.id} value={cat.id} style={{ backgroundColor: '#0c0f17', color: '#f8fafc' }}>
                            {icon} {nameAr} ({nameEn})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </>
              ) : (
                /* Select Package Category */
                <div className={styles.formGroup}>
                  <label>نوع الباكدج</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={styles.input}
                    style={{ backgroundColor: '#0c0f17', color: '#f8fafc', colorScheme: 'dark' }}
                  >
                    {internalPackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id} style={{ backgroundColor: '#0c0f17', color: '#f8fafc' }}>{pkg.icon} {pkg.names?.ar || pkg.id}</option>
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

              {/* Trip Description */}
              {modalType === 'trip' && (
                <div className={styles.formGroup}>
                  <label>وصف الرحلة التفصيلي (يظهر للعملاء)</label>
                  <textarea
                    name="tripDescription"
                    value={formData.tripDescription}
                    onChange={handleInputChange}
                    placeholder="اكتب وصفاً شاملاً للرحلة: ما الذي يتضمنه البرنامج، أبرز المعالم، ما المميزات..."
                    className={styles.input}
                    rows="3"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

                {/* Base Price */}
                {!useTierPrices && (
                  <div className={styles.formGroup}>
                    <label>السعر الأساسي (€) *</label>
                    <input 
                      type="number" 
                      name="price" 
                      value={formData.price} 
                      onChange={handleInputChange}
                      placeholder="مثال: 45"
                      className={styles.input}
                      min="1"
                    />
                  </div>
                )}
              </div>

              {/* Tier Prices Toggle */}
              {modalType === 'trip' && (
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: useTierPrices ? '1rem' : 0 }}>
                    <input
                      type="checkbox"
                      checked={useTierPrices}
                      onChange={(e) => setUseTierPrices(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>تفعيل أسعار منفصلة لكل فئة (Economy / Business / VIP)</span>
                  </label>

                  {useTierPrices && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>💰 Economy (€)</label>
                        <input
                          type="number"
                          name="economyPrice"
                          value={formData.economyPrice}
                          onChange={handleInputChange}
                          placeholder="مثال: 45"
                          className={styles.input}
                          min="1"
                        />
                      </div>
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label style={{ color: 'var(--gold-400)', fontSize: '0.85rem' }}>💼 Business (€)</label>
                        <input
                          type="number"
                          name="businessPrice"
                          value={formData.businessPrice}
                          onChange={handleInputChange}
                          placeholder="مثال: 75"
                          className={styles.input}
                          min="1"
                        />
                      </div>
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label style={{ color: 'var(--coral-400)', fontSize: '0.85rem' }}>👑 VIP (€)</label>
                        <input
                          type="number"
                          name="vipPrice"
                          value={formData.vipPrice}
                          onChange={handleInputChange}
                          placeholder="مثال: 120"
                          className={styles.input}
                          min="1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {modalType === 'trip' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem' }}>تفاصيل وتوصيف الفئات (Rich Descriptions)</h4>
                  
                  <div className={styles.formGroup}>
                    <label style={{ color: 'var(--text-secondary)' }}>وصف فئة Economy (اقتصادي)</label>
                    <textarea 
                      name="economyDesc" 
                      value={formData.economyDesc} 
                      onChange={handleInputChange}
                      placeholder="اكتب كل التفاصيل التي تقدمها فئة Economy هنا..."
                      className={styles.input}
                      rows="3"
                    ></textarea>
                  </div>

                  <div className={styles.formGroup}>
                    <label style={{ color: 'var(--gold-400)' }}>وصف فئة Business (أعمال)</label>
                    <textarea 
                      name="businessDesc" 
                      value={formData.businessDesc} 
                      onChange={handleInputChange}
                      placeholder="اكتب كل التفاصيل التي تقدمها فئة Business هنا..."
                      className={styles.input}
                      rows="3"
                    ></textarea>
                  </div>

                  <div className={styles.formGroup}>
                    <label style={{ color: 'var(--coral-400)' }}>وصف فئة VIP (خاص)</label>
                    <textarea 
                      name="vipDesc" 
                      value={formData.vipDesc} 
                      onChange={handleInputChange}
                      placeholder="اكتب كل التفاصيل التي تقدمها فئة VIP هنا..."
                      className={styles.input}
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Special Requests */}
              {modalType === 'trip' && (
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>🎯 الطلبات الخاصة المتاحة للعملاء (اختر ما ينطبق على رحلتك)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                    {PRESET_SPECIAL_REQUESTS.map(req => (
                      <label key={req.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '0.4rem 0.5rem', borderRadius: '6px', background: formData.specialRequests.includes(req.id) ? 'rgba(217,119,6,0.1)' : 'transparent', border: formData.specialRequests.includes(req.id) ? '1px solid var(--gold-500)' : '1px solid transparent', transition: 'all 0.15s' }}>
                        <input
                          type="checkbox"
                          checked={formData.specialRequests.includes(req.id)}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              specialRequests: e.target.checked
                                ? [...prev.specialRequests, req.id]
                                : prev.specialRequests.filter(r => r !== req.id)
                            }));
                          }}
                          style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                        />
                        <span>{req.labelAr}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

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
                  {/* Main Image Upload for Package */}
                  <div className={styles.formGroup}>
                    <label>صورة الباكدج الرئيسية (يتم ضغطها وحفظها تلقائياً)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className={styles.input}
                    />
                    {formData.image && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={formData.image} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--emerald-400)' }}>تم إرفاق الصورة الرئيسية بنجاح ✓</span>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: '' }))} style={{ background: 'none', border: 'none', color: 'var(--coral-500)', cursor: 'pointer', fontSize: '0.8rem' }}>إزالة</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Image Upload for Trip */}
                  <div className={styles.formGroup}>
                    <label>صورة الرحلة الرئيسية (يتم ضغطها وحفظها تلقائياً)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className={styles.input}
                    />
                    {formData.image && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={formData.image} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--emerald-400)' }}>تم إرفاق الصورة الرئيسية بنجاح ✓</span>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: '' }))} style={{ background: 'none', border: 'none', color: 'var(--coral-500)', cursor: 'pointer', fontSize: '0.8rem' }}>إزالة</button>
                      </div>
                    )}
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

                  {/* Video URL */}
                  <div className={styles.formGroup}>
                    <label>رابط فيديو الرحلة (فيديو اليوتيوب أو رابط مباشر) (اختياري)</label>
                    <input 
                      type="text" 
                      name="videoUrl" 
                      value={formData.videoUrl} 
                      onChange={handleInputChange}
                      placeholder="مثال: https://www.youtube.com/watch?v=... أو رابط mp4 مباشر"
                      className={styles.input}
                    />
                  </div>
                </>
              )}

              {/* Multiple Images Gallery for both Trip and Package */}
              <div className={styles.formGroup} style={{ width: '100%', marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--border-medium)', boxSizing: 'border-box' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--gold-400)' }}>📷 معرض الصور الإضافية (يمكن رفع أكثر من صورة)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={handleMultipleImagesUpload}
                  className={styles.input}
                  style={{ marginBottom: '1rem' }}
                />
                {formData.images && formData.images.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                    {formData.images.map((imgSrc, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        <img src={imgSrc} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveGalleryImage(idx)} 
                          style={{ position: 'absolute', top: '2px', right: '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(239,68,68,0.85)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end', width: '100%' }}>
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
