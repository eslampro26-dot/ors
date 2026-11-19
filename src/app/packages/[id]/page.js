'use client';

import { useState, useEffect, use } from 'react';
import { internalPackages, getLocalizedPackage, getTripTiers, translateDuration, cities } from '@/lib/data';
import { getPackages } from '@/lib/db';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { notFound } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

import TranslatedText from '@/components/TranslatedText';
import DualPrice from '@/components/DualPrice';

const packageBackgrounds = {
  'relaxation': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
  'cultural': 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1600&q=80',
  'relaxation-cultural': 'https://images.unsplash.com/photo-1572252009286-268acec5a0af?auto=format&fit=crop&w=1600&q=80',
  'nile-cruise': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80',
  'beach': 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=1600&q=80',
  'entertainment-pkg': 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=1600&q=80'
};

export default function PackagePage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { locale, t, isReady } = useLanguage();
  const pkg = internalPackages.find(p => p.id === id);

  if (!pkg) {
    notFound();
  }

  const isHotelMode = id === 'relaxation';
  const isRtl = locale === 'ar';

  const [items, setItems] = useState([]);
  
  // Track selected tier per package item
  const [selectedTiers, setSelectedTiers] = useState({});
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', richDesc: '', images: [] });

  // Hotel Search & Booking Filters (Booking.com style)
  const [selectedCity, setSelectedCity] = useState('all');
  const [checkInDate, setCheckInDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 2);
    return nextDay.toISOString().split('T')[0];
  });
  const [occupancy, setOccupancy] = useState('double'); // 'single' | 'double'
  const [selectedRoomPerHotel, setSelectedRoomPerHotel] = useState({});

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const data = await getPackages(id);
        setItems(data || []);
        
        const initialTiers = {};
        const initialRooms = {};
        (data || []).forEach(item => {
          initialTiers[item.id] = 'economy';
          if (item.hotelRooms && item.hotelRooms.length > 0) {
            initialRooms[item.id] = item.hotelRooms[0].id || 'standard';
          }
        });
        setSelectedTiers(initialTiers);
        setSelectedRoomPerHotel(initialRooms);
      } catch (err) {
        console.error('Error loading package items:', err);
      }
    };
    loadPackages();
  }, [id]);

  const handleTierSelect = (itemId, tierId) => {
    setSelectedTiers(prev => ({
      ...prev,
      [itemId]: tierId
    }));
  };

  // Calculate nights between check-in and check-out
  const nightsCount = (() => {
    try {
      const cin = new Date(checkInDate);
      const cout = new Date(checkOutDate);
      const diffTime = cout.getTime() - cin.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch (e) {
      return 1;
    }
  })();

  const locPkg = getLocalizedPackage(pkg, locale);

  if (!isReady) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading Package...</div>
      </main>
    );
  }

  // Filter items by city if in hotel mode
  const filteredItems = items.filter(item => {
    if (!isHotelMode || selectedCity === 'all') return true;
    return item.hotelCity === selectedCity || (item.slug && item.slug === selectedCity);
  });

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '4rem', background: 'transparent' }}>
      <Navbar />
      
      {/* Package Hero */}
      <div style={{
        minHeight: isHotelMode ? '55vh' : '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 'var(--nav-height)',
        paddingBottom: '2rem',
        textAlign: 'center',
        backgroundImage: `linear-gradient(rgba(10, 14, 23, 0.65), rgba(10, 14, 23, 0.75)), url(${packageBackgrounds[pkg.id] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container animate-fade-in-up">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(201, 162, 39, 0.2)', border: '1px solid rgba(201, 162, 39, 0.4)', padding: '4px 14px', borderRadius: '20px', marginBottom: '12px' }}>
            <span>{pkg.icon}</span>
            <span style={{ color: 'var(--gold-400)', fontSize: '0.88rem', fontWeight: '700' }}>
              {isHotelMode ? (isRtl ? 'حجز الفنادق الفاخرة المعتمدة' : 'Verified Luxury Hotels & Resorts') : locPkg.name}
            </span>
          </div>
          <h1 className="section-title" style={{ fontSize: '3rem', color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.6)', margin: '0 0 10px 0' }}>
            {locPkg.name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
            {locPkg.description}
          </p>
        </div>
      </div>

      {/* Hotel Interactive Search & Filter Bar (Booking.com style) */}
      {isHotelMode && (
        <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 30 }}>
          <div className="glass-card" style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            border: '1.5px solid rgba(201, 162, 39, 0.45)',
            boxShadow: '0 12px 35px rgba(0,0,0,0.5)',
            background: 'rgba(10, 14, 26, 0.95)',
            backdropFilter: 'blur(16px)',
            direction: isRtl ? 'rtl' : 'ltr'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
              
              {/* 1. Destination City */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold-400)', fontWeight: '700', marginBottom: '6px' }}>
                  📍 {isRtl ? 'المدينة المستهدفة' : 'Destination City'}
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all" style={{ background: '#0a0e1a' }}>{isRtl ? '🌟 جميع المدن والمنتجعات' : '🌟 All Cities & Resorts'}</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#0a0e1a' }}>
                      {c.nameAr || c.name} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Check-in Date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold-400)', fontWeight: '700', marginBottom: '6px' }}>
                  📅 {isRtl ? 'تاريخ الوصول' : 'Check-in'}
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* 3. Check-out Date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold-400)', fontWeight: '700', marginBottom: '6px' }}>
                  📅 {isRtl ? 'تاريخ المغادرة' : 'Check-out'}
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  min={checkInDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* 4. Occupancy (Single vs Double) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold-400)', fontWeight: '700', marginBottom: '6px' }}>
                  👥 {isRtl ? 'الإشغال' : 'Occupancy'}
                </label>
                <select
                  value={occupancy}
                  onChange={(e) => setOccupancy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="single" style={{ background: '#0a0e1a' }}>👤 {isRtl ? 'فرد واحد (Single)' : '1 Adult (Single)'}</option>
                  <option value="double" style={{ background: '#0a0e1a' }}>👥 {isRtl ? 'فردين (Double)' : '2 Adults (Double)'}</option>
                </select>
              </div>

              {/* Summary of nights */}
              <div style={{
                background: 'rgba(201, 162, 39, 0.12)',
                border: '1px solid rgba(201, 162, 39, 0.3)',
                borderRadius: '8px',
                padding: '9px 12px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
                  {isRtl ? 'مدة الإقامة' : 'Stay Duration'}
                </span>
                <span style={{ fontSize: '0.95rem', color: 'var(--gold-400)', fontWeight: '800' }}>
                  🌙 {nightsCount} {isRtl ? (nightsCount === 1 ? 'ليلة' : nightsCount === 2 ? 'ليلتان' : 'ليالٍ') : (nightsCount === 1 ? 'Night' : 'Nights')}
                </span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Hotel Cards & Listings Grid */}
      <div className="container" style={{ marginTop: isHotelMode ? '2.5rem' : '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
            {filteredItems.length} {isHotelMode ? (isRtl ? 'فندق ومنتجع متاح' : 'Hotels & Resorts available') : t('common.availableOffers')}
          </span>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '800', margin: 0 }}>
            {isHotelMode ? (isRtl ? '🏨 الفنادق والمنتجعات المتاحة' : '🏨 Available Luxury Hotels') : t('common.availableOffers')}
          </h2>
        </div>

        {filteredItems.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
          }}>
            {filteredItems.map((item, idx) => {
              const currentTierId = selectedTiers[item.id] || 'economy';
              const tiers = getTripTiers(item);
              const activeTier = tiers.find(t => t.id === currentTierId) || tiers[0];
              
              // Hotel rooms configuration
              const hasCustomRooms = item.hotelRooms && Array.isArray(item.hotelRooms) && item.hotelRooms.length > 0;
              const roomsList = hasCustomRooms ? item.hotelRooms : [
                { id: 'standard', nameAr: 'غرفة قياسية (Standard Room)', nameEn: 'Standard Room', priceSingle: activeTier.price, priceDouble: activeTier.price * 1.35, descriptionAr: 'إفطار مجاني وواي فاي فائق السرعة', descriptionEn: 'Breakfast & Free Wi-Fi' }
              ];
              const selectedRoomId = selectedRoomPerHotel[item.id] || roomsList[0].id;
              const activeRoom = roomsList.find(r => r.id === selectedRoomId) || roomsList[0];

              // Price per night based on single vs double occupancy
              const roomNightlyPrice = occupancy === 'single'
                ? (parseFloat(activeRoom.priceSingle) || parseFloat(activeRoom.priceDouble) || parseFloat(activeTier.price) || 80)
                : (parseFloat(activeRoom.priceDouble) || (parseFloat(activeRoom.priceSingle) * 1.35) || parseFloat(activeTier.price) || 120);

              // Discount Calculation
              const discountPercent = parseFloat(item.hotelDiscount) || 0;
              const discountedNightlyPrice = discountPercent > 0
                ? Math.round(roomNightlyPrice * (1 - discountPercent / 100))
                : roomNightlyPrice;
              const totalPriceForStay = discountedNightlyPrice * nightsCount;

              return (
                <div key={item.id} className="glass-card stagger-children" style={{ 
                  padding: '1.5rem', 
                  borderRadius: '16px',
                  overflow: 'hidden', 
                  animationDelay: `${idx * 0.1}s`,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
                  gap: '1.5rem',
                  border: '1.5px solid rgba(201, 162, 39, 0.3)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                  direction: isRtl ? 'rtl' : 'ltr',
                  textAlign: isRtl ? 'right' : 'left'
                }}>
                  {/* Left Column: Image Gallery & Rating */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ position: 'relative', width: '100%', height: '240px', borderRadius: '12px', overflow: 'hidden' }}>
                      <img
                        src={item.image || (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                        alt={item.titleAr || item.titleEn}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {discountPercent > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: isRtl ? '12px' : 'auto',
                          left: isRtl ? 'auto' : '12px',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: '#fff',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
                        }}>
                          🔥 {discountPercent}% {isRtl ? 'خصم خاص' : 'OFF'}
                        </div>
                      )}
                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: isRtl ? 'auto' : '12px',
                        right: isRtl ? '12px' : 'auto',
                        background: 'rgba(10, 14, 26, 0.85)',
                        backdropFilter: 'blur(8px)',
                        color: 'var(--gold-400)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '700'
                      }}>
                        ⭐ {item.hotelRating ? `${item.hotelRating} ${isRtl ? 'نجوم' : 'Stars'}` : '5 Stars Luxury'}
                      </div>
                    </div>

                    {/* Additional small thumbnails */}
                    {item.images && item.images.length > 1 && (
                      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {item.images.slice(0, 4).map((img, imIdx) => (
                          <img
                            key={imIdx}
                            src={img}
                            alt=""
                            style={{ width: '70px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-subtle)', flexShrink: 0 }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Location Link */}
                    {item.locationUrl && (
                      <a
                        href={item.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--gold-400)',
                          textDecoration: 'underline',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        📍 {isRtl ? 'عرض موقع الفندق على خرائط Google' : 'View Hotel Location on Google Maps'}
                      </a>
                    )}
                  </div>

                  {/* Middle Column: Details & 5 Room Categories */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1.5 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: '800', margin: 0 }}>
                          <TranslatedText text={item.titleEn || item.titleAr} />
                        </h3>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                          ({isRtl ? item.titleEn : item.titleAr})
                        </span>
                      </div>
                      {item.hotelAddress && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                          📍 {item.hotelAddress}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <TranslatedText text={item.description || item.tripDescription || ''} />
                    </p>

                    {/* 5 Room Categories Selector (Booking.com style) */}
                    <div>
                      <h4 style={{ fontSize: '0.92rem', color: 'var(--gold-400)', fontWeight: '800', margin: '0 0 8px 0' }}>
                        🛏️ {isRtl ? 'اختر تصنيف الغرفة المتاحة:' : 'Select Available Room Category:'}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {roomsList.map(room => {
                          const isRoomSelected = room.id === selectedRoomId;
                          const roomPrice = occupancy === 'single'
                            ? (parseFloat(room.priceSingle) || parseFloat(room.priceDouble) || 80)
                            : (parseFloat(room.priceDouble) || (parseFloat(room.priceSingle) * 1.35) || 120);
                          const discountedRoomPrice = discountPercent > 0
                            ? Math.round(roomPrice * (1 - discountPercent / 100))
                            : roomPrice;

                          return (
                            <div
                              key={room.id}
                              onClick={() => setSelectedRoomPerHotel(prev => ({ ...prev, [item.id]: room.id }))}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 12px',
                                borderRadius: '10px',
                                border: isRoomSelected ? '1.5px solid var(--gold-500)' : '1px solid rgba(255, 255, 255, 0.08)',
                                background: isRoomSelected ? 'rgba(201, 162, 39, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                gap: '10px'
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <input
                                    type="radio"
                                    name={`room_${item.id}`}
                                    checked={isRoomSelected}
                                    onChange={() => {}}
                                    style={{ accentColor: 'var(--gold-500)', cursor: 'pointer' }}
                                  />
                                  <strong style={{ fontSize: '0.86rem', color: isRoomSelected ? '#fff' : 'var(--text-primary)' }}>
                                    {isRtl ? room.nameAr : room.nameEn}
                                  </strong>
                                </div>
                                <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px', paddingInlineStart: '20px' }}>
                                  {isRtl ? room.descriptionAr : room.descriptionEn}
                                </span>
                              </div>

                              <div style={{ textAlign: isRtl ? 'left' : 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--gold-400)' }}>
                                  €{discountedRoomPrice}
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>
                                    {' '}/ {isRtl ? 'ليلة' : 'night'}
                                  </span>
                                </div>
                                {discountPercent > 0 && (
                                  <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>
                                    €{roomPrice}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hotel Cancellation Policy Notice */}
                    {item.hotelCancellationPolicy && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px dashed rgba(201, 162, 39, 0.3)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.45
                      }}>
                        <strong style={{ color: 'var(--gold-400)', display: 'block', marginBottom: '2px' }}>
                          📜 {isRtl ? 'سياسة الإلغاء الخاصة بهذا الفندق:' : 'Cancellation Policy for this hotel:'}
                        </strong>
                        {item.hotelCancellationPolicy}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Pricing Summary & Book Now */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.25rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'block' }}>
                        {isRtl ? 'الإجمالي لـ' : 'Total for'} {nightsCount} {isRtl ? (nightsCount === 1 ? 'ليلة' : 'ليالٍ') : (nightsCount === 1 ? 'night' : 'nights')} ({occupancy === 'single' ? (isRtl ? 'فرد' : '1 guest') : (isRtl ? 'فردين' : '2 guests')}):
                      </span>
                      <div style={{ margin: '6px 0 10px 0' }}>
                        <DualPrice 
                          amount={totalPriceForStay} 
                          baseCurrency={item.currency || '€'} 
                          layout="stacked"
                          fontSize="1.6rem"
                          color="var(--gold-500)"
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', display: 'block' }}>
                        ✓ {isRtl ? 'الضرائب ورسوم الخدمة مشمولة' : 'Taxes & service fees included'}
                      </span>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                      <Link 
                        href={`/checkout?tripId=${item.id}&price=${totalPriceForStay}&titleAr=${encodeURIComponent(item.titleAr + ' - ' + (activeRoom.nameAr || ''))}&titleEn=${encodeURIComponent((item.titleEn || item.titleAr) + ' - ' + (activeRoom.nameEn || ''))}&type=hotel&category=hotels&tier=${activeRoom.id}&nights=${nightsCount}&checkIn=${checkInDate}&checkOut=${checkOutDate}&occupancy=${occupancy}&discount=${discountPercent}&policy=${encodeURIComponent(item.hotelCancellationPolicy || item.customCancellationPolicy || '')}`}
                        className="btn btn-primary" 
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '12px 18px',
                          fontSize: '0.98rem',
                          fontWeight: '800',
                          borderRadius: '10px',
                          boxShadow: '0 6px 20px rgba(201, 162, 39, 0.35)'
                        }}
                      >
                        <span>🏨 {isRtl ? 'احجز الآن بالأسعار المحدثة' : 'Book Now with Live Rates'}</span>
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
            <span style={{ fontSize: '3rem' }}>🏨</span>
            <h3 style={{ color: '#fff', marginTop: '1rem' }}>
              {isRtl ? 'لا توجد فنادق متاحة حالياً في هذه المدينة' : 'No hotels currently available in this city'}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {isRtl ? 'يرجى اختيار مدينة أخرى أو متابعة التحديثات عبر لوحة التحكم' : 'Please select another city or check back soon'}
            </p>
          </div>
        )}
      </div>

      {/* Rich Description Modal */}
      {modalConfig.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-card animate-scale-in" style={{
            background: 'var(--bg-primary)',
            padding: '2rem',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '1px solid var(--gold-500)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              ×
            </button>
            <h3 style={{ color: 'var(--gold-500)', marginBottom: '1.5rem', marginTop: 0, paddingRight: '20px', textAlign: isRtl ? 'right' : 'left' }}>
              {modalConfig.title}
            </h3>

            {/* Gallery Images */}
            {modalConfig.images && modalConfig.images.length > 0 && (
              <div style={{ 
                display: 'flex', 
                gap: '0.8rem', 
                overflowX: 'auto', 
                paddingBottom: '1rem', 
                marginBottom: '1.5rem',
                borderRadius: '8px'
              }}>
                {modalConfig.images.map((imgSrc, idx) => (
                  <img 
                    key={idx} 
                    src={imgSrc} 
                    alt={`Preview ${idx}`} 
                    style={{ 
                      width: '280px', 
                      height: '180px', 
                      objectFit: 'cover', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-subtle)',
                      flexShrink: 0 
                    }} 
                  />
                ))}
              </div>
            )}

            <div style={{ 
              color: 'var(--text-primary)', 
              lineHeight: '1.8', 
              fontSize: '0.95rem',
              textAlign: isRtl ? 'right' : 'left',
              whiteSpace: 'pre-wrap'
            }}>
              <TranslatedText text={modalConfig.richDesc} />
            </div>
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button className="btn btn-primary" onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}>
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
