'use client';

import { useState, useEffect } from 'react';
import { cities, internalPackages, categoryTranslations } from '@/lib/data';
import { getTrips, addTrip, updateTrip, deleteTrip, getPackages, addPackage, deletePackage } from '@/lib/db';
import { useSettings } from '@/hooks/useSettings';
import styles from './page.module.css';

// Category Icons
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

// Fallback special requests
const PRESET_SPECIAL_REQUESTS = [
  { id: 'veg_food', labelEn: 'Vegetarian Food', labelAr: 'Vegetarian Food' },
  { id: 'halal_food', labelEn: 'Halal Food', labelAr: 'Halal Food' },
  { id: 'kids_menu', labelEn: 'Kids Menu', labelAr: 'Kids Menu' },
  { id: 'wheelchair', labelEn: 'Wheelchair Access', labelAr: 'Wheelchair Access' },
  { id: 'early_checkin', labelEn: 'Early Check-in', labelAr: 'Early Check-in' },
  { id: 'late_checkout', labelEn: 'Late Check-out', labelAr: 'Late Check-out' },
  { id: 'airport_pickup', labelEn: 'Airport Pickup', labelAr: 'Airport Pickup' },
  { id: 'private_guide', labelEn: 'Private Guide', labelAr: 'Private Guide' },
  { id: 'photography', labelEn: 'Professional Photography', labelAr: 'Professional Photography' },
  { id: 'birthday_cake', labelEn: 'Birthday Cake', labelAr: 'Birthday Cake' },
  { id: 'romantic_setup', labelEn: 'Romantic Setup', labelAr: 'Romantic Setup' },
  { id: 'snorkeling_gear', labelEn: 'Snorkeling Gear', labelAr: 'Snorkeling Gear' },
];

export default function AdminServices() {
  const { settings } = useSettings();
  const specialRequestsOptions = settings?.specialRequestsList?.length > 0 ? settings.specialRequestsList : PRESET_SPECIAL_REQUESTS;
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
    titleDe: '',
    titleFr: '',
    titleEs: '',
    titleIt: '',
    titleRu: '',
    titleTr: '',
    titleZh: '',
    titleJa: '',
    price: '',
    economyPrice: '',
    businessPrice: '',
    vipPrice: '',
    childPrice: '',
    economyChildPrice: '',
    businessChildPrice: '',
    vipChildPrice: '',
    infantPrice: '',
    economyInfantPrice: '',
    businessInfantPrice: '',
    vipInfantPrice: '',
    duration: 'Full Day',
    category: '',
    city: '',
    description: '',
    descriptionEn: '',
    tripDescription: '',
    tripDescriptionEn: '',
    icon: '✈️',
    image: '',
    images: [],
    videos: [],
    locationUrl: '',
    videoUrl: '',
    economyDesc: '',
    businessDesc: '',
    vipDesc: '',
    specialRequests: [],
  });
  const [useTierPrices, setUseTierPrices] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState('ar');
  const [isTranslating, setIsTranslating] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

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
    
    // Clear the current city data first to force fresh load
    setTripsData(prev => ({ ...prev, [selectedCity]: undefined }));
    
    const cityTrips = {};
    await Promise.all(
      city.categories.map(async (cat) => {
        const trips = await getTrips(selectedCity, cat.id);
        cityTrips[cat.id] = trips || [];
      })
    );
    setTripsData(prev => ({ ...prev, [selectedCity]: cityTrips }));
  };

  // Translate all existing trips
  const handleTranslateAllTrips = async () => {
    if (!confirm('Do you want to translate all existing trips to 10 languages? This may take a few minutes.')) {
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate-existing-trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceLang: 'en' })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Successfully translated ${data.translatedCount} trips!`);
        await reloadCurrentCity();
      } else {
        alert('Translation failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Translation error:', err);
      alert('An error occurred during translation');
    } finally {
      setIsTranslating(false);
    }
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
          duration: '3 Nights / 4 Days',
        }));
      }
    }
  }, [modalOpen, modalType, selectedCity, selectedPkgType]);

  const uploadImageToStorage = async (file) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch (e) {
      console.error('Cloud upload failed, falling back to base64:', e);
    }
    return await compressImageToBase64(file);
  };

  const compressImageToBase64 = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_DIM) { height = Math.round(height * MAX_DIM / width); width = MAX_DIM; }
        } else {
          if (height > MAX_DIM) { width = Math.round(width * MAX_DIM / height); height = MAX_DIM; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImages(true);
    setUploadProgress('Uploading main image...');
    try {
      const url = await uploadImageToStorage(file);
      setFormData(prev => ({ ...prev, image: url }));
    } finally {
      setUploadingImages(false);
      setUploadProgress('');
    }
  };

  const handleMultipleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadingImages(true);
    for (let i = 0; i < files.length; i++) {
      setUploadProgress(`Uploading image ${i + 1} of ${files.length}...`);
      const url = await uploadImageToStorage(files[i]);
      setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
    }
    setUploadingImages(false);
    setUploadProgress('');
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
    const hasTiers = trip.enableTiers !== undefined ? trip.enableTiers === true : !!(trip.economyPrice && trip.businessPrice && trip.vipPrice && Number(trip.businessPrice) !== Number(trip.economyPrice));
    setUseTierPrices(hasTiers);
    setFormData({
      titleAr: trip.titleAr || '',
      titleEn: trip.titleEn || '',
      titleDe: trip.titleDe || '',
      titleFr: trip.titleFr || '',
      titleEs: trip.titleEs || '',
      titleIt: trip.titleIt || '',
      titleRu: trip.titleRu || '',
      titleTr: trip.titleTr || '',
      titleZh: trip.titleZh || '',
      titleJa: trip.titleJa || '',
      price: String(trip.price || ''),
      economyPrice: String(trip.economyPrice || trip.price || ''),
      businessPrice: String(trip.businessPrice || ''),
      vipPrice: String(trip.vipPrice || ''),
      childPrice: String(trip.childPrice || ''),
      economyChildPrice: String(trip.economyChildPrice || ''),
      businessChildPrice: String(trip.businessChildPrice || ''),
      vipChildPrice: String(trip.vipChildPrice || ''),
      infantPrice: String(trip.infantPrice || ''),
      economyInfantPrice: String(trip.economyInfantPrice || ''),
      businessInfantPrice: String(trip.businessInfantPrice || ''),
      vipInfantPrice: String(trip.vipInfantPrice || ''),
      duration: trip.duration || 'Full Day',
      category: catId,
      city: cityId,
      description: trip.description || '',
      tripDescription: trip.tripDescription || '',
      icon: trip.icon || '✈️',
      image: trip.image || '',
      images: trip.images || [],
      videos: trip.videos || [],
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
      const { city, category, titleEn, titleDe, titleAr, price, economyPrice, businessPrice, vipPrice, childPrice, economyChildPrice, businessChildPrice, vipChildPrice, infantPrice, economyInfantPrice, businessInfantPrice, vipInfantPrice, additionalPersonPrice, duration, image, images, locationUrl, videoUrl, economyDesc, businessDesc, vipDesc, tripDescription, tripDescriptionEn, specialRequests } = formData;
      const basePrice = useTierPrices ? (parseFloat(economyPrice) || 0) : parseFloat(price);
      
      const effectiveTitleEn = titleEn || titleAr || titleDe;
      const effectiveDesc = tripDescriptionEn || tripDescription || '';

      if (!effectiveTitleEn || basePrice <= 0) {
        alert('Please fill in the title and base price!');
        return;
      }

      setIsTranslating(true);

      // Auto-translate to other languages
      let translatedTitles = {
        titleAr: titleAr || effectiveTitleEn,
        titleFr: effectiveTitleEn,
        titleEs: effectiveTitleEn,
        titleIt: effectiveTitleEn,
        titleRu: effectiveTitleEn,
        titleTr: effectiveTitleEn,
        titleZh: effectiveTitleEn,
        titleJa: effectiveTitleEn
      };

      try {
        const translateResponse = await fetch('/api/auto-translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: effectiveTitleEn,
            sourceLang: 'en',
            targetLangs: ['ar', 'de', 'fr', 'es', 'it', 'ru', 'tr', 'zh', 'ja']
          })
        });

        if (translateResponse.ok) {
          const data = await translateResponse.json();
          if (data.success && data.translations) {
            translatedTitles = {
              titleAr: titleAr || data.translations.ar || effectiveTitleEn,
              titleDe: titleDe || data.translations.de || effectiveTitleEn,
              titleFr: data.translations.fr || effectiveTitleEn,
              titleEs: data.translations.es || effectiveTitleEn,
              titleIt: data.translations.it || effectiveTitleEn,
              titleRu: data.translations.ru || effectiveTitleEn,
              titleTr: data.translations.tr || effectiveTitleEn,
              titleZh: data.translations.zh || effectiveTitleEn,
              titleJa: data.translations.ja || effectiveTitleEn
            };
          }
        }
      } catch (err) {
        console.error('Auto-translation failed, using fallbacks:', err);
      }

      // Auto-translate trip description to all languages
      let translatedDescriptions = {
        tripDescriptionAr: effectiveDesc,
        tripDescriptionDe: effectiveDesc,
        tripDescriptionFr: effectiveDesc,
        tripDescriptionEs: effectiveDesc,
        tripDescriptionIt: effectiveDesc,
        tripDescriptionRu: effectiveDesc,
        tripDescriptionTr: effectiveDesc,
        tripDescriptionZh: effectiveDesc,
        tripDescriptionJa: effectiveDesc
      };

      if (effectiveDesc) {
        try {
          const descTranslateResponse = await fetch('/api/auto-translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: effectiveDesc,
              sourceLang: 'en',
              targetLangs: ['ar', 'de', 'fr', 'es', 'it', 'ru', 'tr', 'zh', 'ja']
            })
          });

          if (descTranslateResponse.ok) {
            const data = await descTranslateResponse.json();
            if (data.success && data.translations) {
              translatedDescriptions = {
                tripDescriptionAr: data.translations.ar || effectiveDesc,
                tripDescriptionDe: data.translations.de || effectiveDesc,
                tripDescriptionFr: data.translations.fr || effectiveDesc,
                tripDescriptionEs: data.translations.es || effectiveDesc,
                tripDescriptionIt: data.translations.it || effectiveDesc,
                tripDescriptionRu: data.translations.ru || effectiveDesc,
                tripDescriptionTr: data.translations.tr || effectiveDesc,
                tripDescriptionZh: data.translations.zh || effectiveDesc,
                tripDescriptionJa: data.translations.ja || effectiveDesc
              };
            }
          }
        } catch (err) {
          console.error('Auto-translation of description failed, using fallbacks:', err);
        }
      }

      const tripPayload = {
        slug: city,
        category: category,
        titleAr: translatedTitles.titleAr,
        titleEn: effectiveTitleEn,
        titleDe: titleDe || translatedTitles.titleDe || effectiveTitleEn,
        titleFr: translatedTitles.titleFr,
        titleEs: translatedTitles.titleEs,
        titleIt: translatedTitles.titleIt,
        titleRu: translatedTitles.titleRu,
        titleTr: translatedTitles.titleTr,
        titleZh: translatedTitles.titleZh,
        titleJa: translatedTitles.titleJa,
        price: basePrice,
        enableTiers: useTierPrices,
        economyPrice: useTierPrices ? (parseFloat(economyPrice) || basePrice) : basePrice,
        businessPrice: useTierPrices ? (parseFloat(businessPrice) || null) : null,
        vipPrice: useTierPrices ? (parseFloat(vipPrice) || null) : null,
        childPrice: parseFloat(childPrice) || 0,
        economyChildPrice: useTierPrices ? (parseFloat(economyChildPrice) || 0) : 0,
        businessChildPrice: useTierPrices ? (parseFloat(businessChildPrice) || 0) : 0,
        vipChildPrice: useTierPrices ? (parseFloat(vipChildPrice) || 0) : 0,
        infantPrice: parseFloat(infantPrice) || 0,
        economyInfantPrice: useTierPrices ? (parseFloat(economyInfantPrice) || 0) : 0,
        businessInfantPrice: useTierPrices ? (parseFloat(businessInfantPrice) || 0) : 0,
        vipInfantPrice: useTierPrices ? (parseFloat(vipInfantPrice) || 0) : 0,
        additionalPersonPrice: parseFloat(additionalPersonPrice) || 0,
        duration,
        image: image || '/images/trips/glass-boat.jpg',
        images: images || [],
        videos: formData.videos || [],
        locationUrl: locationUrl || '',
        videoUrl: videoUrl || '',
        tripDescription: effectiveDesc,
        tripDescriptionAr: translatedDescriptions.tripDescriptionAr,
        tripDescriptionEn: effectiveDesc,
        tripDescriptionDe: translatedDescriptions.tripDescriptionDe,
        tripDescriptionFr: translatedDescriptions.tripDescriptionFr,
        tripDescriptionEs: translatedDescriptions.tripDescriptionEs,
        tripDescriptionIt: translatedDescriptions.tripDescriptionIt,
        tripDescriptionRu: translatedDescriptions.tripDescriptionRu,
        tripDescriptionTr: translatedDescriptions.tripDescriptionTr,
        tripDescriptionZh: translatedDescriptions.tripDescriptionZh,
        tripDescriptionJa: translatedDescriptions.tripDescriptionJa,
        economyDesc: economyDesc || '',
        businessDesc: businessDesc || '',
        vipDesc: vipDesc || '',
        specialRequests: specialRequests || [],
      };
      
      try {
        let result;
        if (editingTrip) {
          result = await updateTrip(editingTrip.tripId, tripPayload);
        } else {
          result = await addTrip(city, category, tripPayload);
        }

        setModalOpen(false);
        setEditingTrip(null);
        setFormData({ titleAr:'',titleEn:'',titleDe:'',titleFr:'',titleEs:'',titleIt:'',titleRu:'',titleTr:'',titleZh:'',titleJa:'',price:'',economyPrice:'',businessPrice:'',vipPrice:'',childPrice:'',economyChildPrice:'',businessChildPrice:'',vipChildPrice:'',infantPrice:'',economyInfantPrice:'',businessInfantPrice:'',vipInfantPrice:'',additionalPersonPrice:'',duration:'Full Day',category:'',city:'',description:'',descriptionEn:'',tripDescription:'',tripDescriptionEn:'',icon:'✈️',image:'',images:[],locationUrl:'',videoUrl:'', economyDesc:'', businessDesc:'', vipDesc:'', specialRequests:[] });
        setUseTierPrices(false);
        alert(editingTrip ? '✅ تم تحديث الرحلة بنجاح!' : '✅ تم إضافة الرحلة بنجاح!');
        await reloadCurrentCity();
      } catch (err) {
        console.error('Error saving trip:', err);
        alert('❌ حدث خطأ أثناء حفظ الرحلة.');
      } finally {
        setIsTranslating(false);
      }
    } else {
      const { category, titleAr, titleEn, price, duration, descriptionEn, icon, image, images, economyPrice, businessPrice, vipPrice, childPrice, economyChildPrice, businessChildPrice, vipChildPrice, infantPrice, economyInfantPrice, businessInfantPrice, vipInfantPrice, additionalPersonPrice } = formData;
      const basePrice = useTierPrices ? (parseFloat(economyPrice) || 0) : parseFloat(price);
      
      const effectiveTitleEn = titleEn || titleAr;
      const effectiveTitleAr = titleAr || titleEn;
      if (!effectiveTitleEn || basePrice <= 0) {
        alert('Please fill in the title and price!');
        return;
      }

      setIsTranslating(true);

      // Auto-translate package titles to other languages
      let translatedTitles = {
        titleDe: effectiveTitleEn,
        titleFr: effectiveTitleEn,
        titleEs: effectiveTitleEn,
        titleIt: effectiveTitleEn,
        titleRu: effectiveTitleEn,
        titleTr: effectiveTitleEn,
        titleZh: effectiveTitleEn,
        titleJa: effectiveTitleEn
      };

      try {
        const sourceText = effectiveTitleEn;
        const translateResponse = await fetch('/api/auto-translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: sourceText,
            sourceLang: 'en',
            targetLangs: ['de', 'fr', 'es', 'it', 'ru', 'tr', 'zh', 'ja']
          })
        });

        if (translateResponse.ok) {
          const data = await translateResponse.json();
          if (data.success && data.translations) {
            translatedTitles = {
              titleDe: data.translations.de || effectiveTitleEn,
              titleFr: data.translations.fr || effectiveTitleEn,
              titleEs: data.translations.es || effectiveTitleEn,
              titleIt: data.translations.it || effectiveTitleEn,
              titleRu: data.translations.ru || effectiveTitleEn,
              titleTr: data.translations.tr || effectiveTitleEn,
              titleZh: data.translations.zh || effectiveTitleEn,
              titleJa: data.translations.ja || effectiveTitleEn
            };
          }
        }
      } catch (err) {
        console.error('Auto-translation failed for package, using fallbacks:', err);
      }

      // Auto-translate package description to all languages
      let translatedDescriptions = {
        descriptionAr: descriptionEn,
        descriptionDe: descriptionEn,
        descriptionFr: descriptionEn,
        descriptionEs: descriptionEn,
        descriptionIt: descriptionEn,
        descriptionRu: descriptionEn,
        descriptionTr: descriptionEn,
        descriptionZh: descriptionEn,
        descriptionJa: descriptionEn
      };

      if (descriptionEn) {
        try {
          const descTranslateResponse = await fetch('/api/auto-translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: descriptionEn,
              sourceLang: 'en',
              targetLangs: ['ar', 'de', 'fr', 'es', 'it', 'ru', 'tr', 'zh', 'ja']
            })
          });

          if (descTranslateResponse.ok) {
            const data = await descTranslateResponse.json();
            if (data.success && data.translations) {
              translatedDescriptions = {
                descriptionAr: data.translations.ar || descriptionEn,
                descriptionDe: data.translations.de || descriptionEn,
                descriptionFr: data.translations.fr || descriptionEn,
                descriptionEs: data.translations.es || descriptionEn,
                descriptionIt: data.translations.it || descriptionEn,
                descriptionRu: data.translations.ru || descriptionEn,
                descriptionTr: data.translations.tr || descriptionEn,
                descriptionZh: data.translations.zh || descriptionEn,
                descriptionJa: data.translations.ja || descriptionEn
              };
            }
          }
        } catch (err) {
          console.error('Auto-translation of package description failed, using fallbacks:', err);
        }
      }

      try {
        const packagePayload = {
          titleAr: effectiveTitleAr,
          titleEn: effectiveTitleEn,
          titleDe: translatedTitles.titleDe,
          titleFr: translatedTitles.titleFr,
          titleEs: translatedTitles.titleEs,
          titleIt: translatedTitles.titleIt,
          titleRu: translatedTitles.titleRu,
          titleTr: translatedTitles.titleTr,
          titleZh: translatedTitles.titleZh,
          titleJa: translatedTitles.titleJa,
          price: basePrice,
          enableTiers: useTierPrices,
          economyPrice: useTierPrices ? (parseFloat(economyPrice) || basePrice) : basePrice,
          businessPrice: useTierPrices ? (parseFloat(businessPrice) || null) : null,
          vipPrice: useTierPrices ? (parseFloat(vipPrice) || null) : null,
          childPrice: parseFloat(childPrice) || 0,
          economyChildPrice: useTierPrices ? (parseFloat(economyChildPrice) || 0) : 0,
          businessChildPrice: useTierPrices ? (parseFloat(businessChildPrice) || 0) : 0,
          vipChildPrice: useTierPrices ? (parseFloat(vipChildPrice) || 0) : 0,
          infantPrice: parseFloat(infantPrice) || 0,
          economyInfantPrice: useTierPrices ? (parseFloat(economyInfantPrice) || 0) : 0,
          businessInfantPrice: useTierPrices ? (parseFloat(businessInfantPrice) || 0) : 0,
          vipInfantPrice: useTierPrices ? (parseFloat(vipInfantPrice) || 0) : 0,
          additionalPersonPrice: parseFloat(additionalPersonPrice) || 0,
          duration: duration || '3 Nights / 4 Days',
          description: descriptionEn,
          descriptionAr: translatedDescriptions.descriptionAr,
          descriptionEn: descriptionEn,
          descriptionDe: translatedDescriptions.descriptionDe,
          descriptionFr: translatedDescriptions.descriptionFr,
          descriptionEs: translatedDescriptions.descriptionEs,
          descriptionIt: translatedDescriptions.descriptionIt,
          descriptionRu: translatedDescriptions.descriptionRu,
          descriptionTr: translatedDescriptions.descriptionTr,
          descriptionZh: translatedDescriptions.descriptionZh,
          descriptionJa: translatedDescriptions.descriptionJa,
          icon: icon || '✈️',
          image: image || '',
          images: images || [],
          videos: formData.videos || []
        };

        const success = await addPackage(category, packagePayload);

        if (success) {
          alert('Package added successfully!');
          setModalOpen(false);
          setFormData({ titleAr:'',titleEn:'',titleDe:'',titleFr:'',titleEs:'',titleIt:'',titleRu:'',titleTr:'',titleZh:'',titleJa:'',price:'',economyPrice:'',businessPrice:'',vipPrice:'',childPrice:'',economyChildPrice:'',businessChildPrice:'',vipChildPrice:'',infantPrice:'',economyInfantPrice:'',businessInfantPrice:'',vipInfantPrice:'',additionalPersonPrice:'',duration:'Full Day',category:'',city:'',description:'',descriptionEn:'',tripDescription:'',tripDescriptionEn:'',icon:'✈️',image:'',images:[],videos:[] });
          setUseTierPrices(false);
          await reloadCurrentPackage();
        } else {
          alert('Error saving package.');
        }
      } catch (err) {
        console.error('Error adding package:', err);
        alert('Error saving package.');
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handleDeleteTrip = async (cityId, catId, tripId) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        // Optimistically remove from screen state immediately
        setCityData(prev => {
          if (!prev || !prev.categories) return prev;
          return {
            ...prev,
            categories: prev.categories.map(cat => {
              if (cat.id === catId) {
                return {
                  ...cat,
                  items: (cat.items || []).filter(item => String(item.id) !== String(tripId))
                };
              }
              return cat;
            })
          };
        });

        await deleteTrip(cityId, catId, tripId);
        await reloadCurrentCity();
      } catch (err) {
        console.error('Error deleting trip:', err);
        await reloadCurrentCity();
      }
    }
  };

  const handleDeletePackage = async (pkgId, itemUniqueId) => {
    if (confirm('Are you sure you want to delete this package?')) {
      try {
        const success = await deletePackage(pkgId, itemUniqueId);
        if (success) {
          await reloadCurrentPackage();
        } else {
          alert('Error deleting package.');
        }
      } catch (err) {
        console.error('Error deleting package:', err);
        alert('Error deleting package.');
      }
    }
  };

  return (
    <div className={styles.servicesPage}>
      {/* Top Header */}
      <div className={styles.header}>
        <div>
          <h2>Services & Trips Management</h2>
          <p className={styles.subtitle}>Control all trips and tour packages available on the platform.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => { setModalType('trip'); setModalOpen(true); }}
          >
            <span>➕</span> Add New Trip
          </button>
          <button 
            className="btn btn-ocean" 
            onClick={() => { 
              setModalType('package'); 
              setFormData(prev => ({ ...prev, category: selectedPkgType }));
              setModalOpen(true); 
            }}
          >
            <span>✈️</span> Add New Package
          </button>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-medium)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <button 
          className={`${styles.mainTab} ${activeTab === 'cities' ? styles.activeMainTab : ''}`}
          onClick={() => setActiveTab('cities')}
        >
          🏖️ Trips by Cities
        </button>
        <button 
          className={`${styles.mainTab} ${activeTab === 'packages' ? styles.activeMainTab : ''}`}
          onClick={() => setActiveTab('packages')}
        >
          📦 Egypt Comprehensive Packages
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

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {/* Translate All Button - only show on first category */}
                          {city.categories.indexOf(cat) === 0 && (
                            <button
                              onClick={handleTranslateAllTrips}
                              disabled={isTranslating}
                              className="btn btn-secondary btn-sm"
                              style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.8rem',
                                opacity: isTranslating ? 0.6 : 1,
                                cursor: isTranslating ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {isTranslating ? '⏳ Translating...' : '🌐 Translate All Trips'}
                            </button>
                          )}

                          {/* Active count */}
                          <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                            {trips.length} Active Services
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
                                  {trip.id.toString().startsWith('custom') ? '✏️ Manually Added' : '📌 Default'}
                                </span>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button 
                                    className="btn btn-secondary btn-sm" 
                                    style={{ padding: '2px 8px', color: 'var(--gold-400)', borderColor: 'rgba(251,191,36,0.3)', fontSize: '0.8rem' }}
                                    onClick={() => handleEditTripClick(city.id, cat.id, trip)}
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button 
                                    className="btn btn-secondary btn-sm" 
                                    style={{ padding: '2px 8px', color: 'var(--coral-600)', borderColor: 'rgba(244, 63, 94, 0.2)', fontSize: '0.8rem' }}
                                    onClick={() => handleDeleteTrip(city.id, cat.id, trip.id)}
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', borderStyle: 'dashed', opacity: 0.7 }}>
                          <p style={{ color: 'var(--text-secondary)' }}>No services added to this section yet.</p>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ marginTop: '0.5rem' }}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, city: city.id, category: cat.id }));
                              setModalType('trip');
                              setModalOpen(true);
                            }}
                          >
                            ➕ Add First Service Now
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
                    <span className="badge badge-ocean">{items.length} Active Packages</span>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                      onClick={() => {
                        setModalType('package');
                        setFormData(prev => ({ ...prev, category: pkg.id }));
                        setModalOpen(true);
                      }}
                    >
                      ➕ Add
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
                          <span>⏱️ {item.duration || 'Not specified'}</span>
                          <span>⭐ {item.rating}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.8rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Manually added</span>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ padding: '2px 8px', color: 'var(--coral-600)', borderColor: 'rgba(244, 63, 94, 0.2)' }}
                            onClick={() => handleDeletePackage(pkg.id, item.id)}
                          >
                            🗑️ Delete Package
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', borderStyle: 'dashed', opacity: 0.7 }}>
                    <span style={{ fontSize: '3rem', opacity: 0.5 }}>{pkg.icon}</span>
                    <h3 style={{ marginTop: '1rem', color: 'var(--text-primary)' }}>No packages added to this section yet</h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0.5rem auto 1.5rem auto' }}>
                      You can add comprehensive tourism offers (hotel + flights + trips) and set special prices for them to appear to the public.
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, category: pkg.id }));
                        setModalType('package');
                        setModalOpen(true);
                      }}
                    >
                      ➕ Add package to this section
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
                  ? (editingTrip ? '✏️ Edit trip data' : '➕ Add new tourist trip') 
                  : '✈️ Add new tourism package'}
              </h3>
              <button className={styles.closeBtn} onClick={() => { setModalOpen(false); setEditingTrip(null); }}>×</button>
            </div>
            
            <form onSubmit={handleFormSubmit} className={styles.modalForm}>
              {modalType === 'trip' ? (
                <>
                  {/* Select City */}
                  <div className={styles.formGroup}>
                    <label>Target tourist city</label>
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
                    <label>Trip type (section)</label>
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
                  <label>Package type</label>
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

              {/* Title Section - Only English and German */}
              <div style={{ marginBottom: '1rem' }}>

                <div className={styles.formGroup}>
                  <label>English Title *</label>
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

                <div className={styles.formGroup}>
                  <label>German Title *</label>
                  <input
                    type="text"
                    name="titleDe"
                    value={formData.titleDe}
                    onChange={handleInputChange}
                    placeholder="Beispiel: Luxus-Yacht-Sonnenuntergangskreuzfahrt"
                    className={styles.input}
                    required
                  />
                </div>

                {/* Auto-translate notice */}
                <div style={{
                  background: 'rgba(201, 162, 39, 0.1)',
                  border: '1px solid #c9a227',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px'
                }}>
                  <p style={{ margin: '0', fontSize: '0.85rem', color: '#c9a227' }}>
                    ℹ️ The title will be automatically translated to other languages (Arabic, French, Spanish, Italian, Russian, Turkish, Chinese, Japanese) when saved
                  </p>
                </div>
              </div>

              {/* Trip Description */}
              {modalType === 'trip' && (
                <div className={styles.formGroup}>
                  <label>Detailed trip description in English (shown to customers - will be auto-translated to all languages)</label>
                  <textarea
                    name="tripDescriptionEn"
                    value={formData.tripDescriptionEn}
                    onChange={handleInputChange}
                    placeholder="Write a comprehensive description of the trip: what the program includes, main landmarks, features..."
                    className={styles.input}
                    rows="8"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Duration */}
                <div className={styles.formGroup}>
                  <label>Duration</label>
                  <input 
                    type="text" 
                    name="duration" 
                    value={formData.duration} 
                    onChange={handleInputChange}
                    placeholder={modalType === 'trip' ? "Full day, 3 hours..." : "3 nights / 4 days..."}
                    className={styles.input}
                  />
                </div>

                {/* Base Price */}
                {!useTierPrices && (
                  <div className={styles.formGroup}>
                    <label>Base price (€) * <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>(Price from 1 person)</span></label>
                    <input 
                      type="number" 
                      name="price" 
                      value={formData.price} 
                      onChange={handleInputChange}
                      placeholder="Example: 45"
                      className={styles.input}
                      min="1"
                    />
                  </div>
                )}
              </div>

              {/* Child, Infant, Additional Person Prices — always visible */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div className={styles.formGroup} style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--emerald-400)' }}>👶 Child Price (€) <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Ages 2-12</span></label>
                  <input
                    type="number"
                    name="childPrice"
                    value={formData.childPrice}
                    onChange={handleInputChange}
                    placeholder="e.g. 25"
                    className={styles.input}
                    min="0"
                  />
                </div>
                <div className={styles.formGroup} style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--pink-400)' }}>👼 Infant Price (€) <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Under 2</span></label>
                  <input
                    type="number"
                    name="infantPrice"
                    value={formData.infantPrice}
                    onChange={handleInputChange}
                    placeholder="e.g. 0"
                    className={styles.input}
                    min="0"
                  />
                </div>
                <div className={styles.formGroup} style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--gold-400)' }}>➕ Extra Person (€) <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>2nd+ adult</span></label>
                  <input
                    type="number"
                    name="additionalPersonPrice"
                    value={formData.additionalPersonPrice || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 40"
                    className={styles.input}
                    min="0"
                  />
                </div>
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
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Enable separate prices for each category (Economy / Business / VIP)</span>
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
                          placeholder="Example: 45"
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
                          placeholder="Example: 75"
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
                          placeholder="Example: 120"
                          className={styles.input}
                          min="1"
                        />
                      </div>
                    </div>
                  )}

                  {useTierPrices && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginTop: '0.8rem' }}>
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label style={{ color: 'var(--emerald-400)', fontSize: '0.85rem' }}>👶 Economy Child (€)</label>
                        <input
                          type="number"
                          name="economyChildPrice"
                          value={formData.economyChildPrice}
                          onChange={handleInputChange}
                          placeholder="Example: 25"
                          className={styles.input}
                          min="0"
                        />
                      </div>
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label style={{ color: 'var(--emerald-400)', fontSize: '0.85rem' }}>👶 Business Child (€)</label>
                        <input
                          type="number"
                          name="businessChildPrice"
                          value={formData.businessChildPrice}
                          onChange={handleInputChange}
                          placeholder="Example: 40"
                          className={styles.input}
                          min="0"
                        />
                      </div>
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label style={{ color: 'var(--emerald-400)', fontSize: '0.85rem' }}>👶 VIP Child (€)</label>
                        <input
                          type="number"
                          name="vipChildPrice"
                          value={formData.vipChildPrice}
                          onChange={handleInputChange}
                          placeholder="Example: 60"
                          className={styles.input}
                          min="0"
                        />
                      </div>
                    </div>
                  )}

                  {useTierPrices && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginTop: '0.8rem' }}>
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label style={{ color: 'var(--pink-400)', fontSize: '0.85rem' }}>👼 Economy Infant (€)</label>
                        <input
                          type="number"
                          name="economyInfantPrice"
                          value={formData.economyInfantPrice}
                          onChange={handleInputChange}
                          placeholder="Example: 10"
                          className={styles.input}
                          min="0"
                        />
                      </div>
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label style={{ color: 'var(--pink-400)', fontSize: '0.85rem' }}>👼 Business Infant (€)</label>
                        <input
                          type="number"
                          name="businessInfantPrice"
                          value={formData.businessInfantPrice}
                          onChange={handleInputChange}
                          placeholder="Example: 20"
                          className={styles.input}
                          min="0"
                        />
                      </div>
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label style={{ color: 'var(--pink-400)', fontSize: '0.85rem' }}>👼 VIP Infant (€)</label>
                        <input
                          type="number"
                          name="vipInfantPrice"
                          value={formData.vipInfantPrice}
                          onChange={handleInputChange}
                          placeholder="Example: 30"
                          className={styles.input}
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {modalType === 'trip' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem' }}>Category details and descriptions (Rich Descriptions)</h4>
                  
                  <div className={styles.formGroup}>
                    <label style={{ color: 'var(--text-secondary)' }}>Economy class description (Economy)</label>
                    <textarea 
                      name="economyDesc" 
                      value={formData.economyDesc} 
                      onChange={handleInputChange}
                      placeholder="Write all the details offered by Economy class here..."
                      className={styles.input}
                      rows="6"
                    ></textarea>
                  </div>

                  <div className={styles.formGroup}>
                    <label style={{ color: 'var(--gold-400)' }}>Business class description (Business)</label>
                    <textarea 
                      name="businessDesc" 
                      value={formData.businessDesc} 
                      onChange={handleInputChange}
                      placeholder="Write all the details offered by Business class here..."
                      className={styles.input}
                      rows="6"
                    ></textarea>
                  </div>

                  <div className={styles.formGroup}>
                    <label style={{ color: 'var(--coral-400)' }}>VIP class description (VIP)</label>
                    <textarea 
                      name="vipDesc" 
                      value={formData.vipDesc} 
                      onChange={handleInputChange}
                      placeholder="Write all the details offered by VIP class here..."
                      className={styles.input}
                      rows="6"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Special Requests */}
              {modalType === 'trip' && (
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>🎯 Special requests available to customers (select what applies to your trip)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                    {specialRequestsOptions.map(req => (
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
                        <span>{req.labelEn} ({req.labelAr})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {modalType === 'package' ? (
                <>
                  {/* Description */}
                  <div className={styles.formGroup}>
                    <label>Description in English (will be auto-translated to all languages)</label>
                    <textarea
                      name="descriptionEn"
                      value={formData.descriptionEn}
                      onChange={handleInputChange}
                      placeholder="Example: 5-star hotel accommodation + round-trip flights + airport transfer"
                      className={styles.input}
                      rows="6"
                    ></textarea>
                  </div>

                  {/* Child, Infant, Additional Person Prices for Package */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div className={styles.formGroup} style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.82rem', color: 'var(--emerald-400)' }}>👶 Child Price (€) <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Ages 2-12</span></label>
                      <input
                        type="number"
                        name="childPrice"
                        value={formData.childPrice}
                        onChange={handleInputChange}
                        placeholder="e.g. 25"
                        className={styles.input}
                        min="0"
                      />
                    </div>
                    <div className={styles.formGroup} style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.82rem', color: 'var(--pink-400)' }}>👼 Infant Price (€) <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Under 2</span></label>
                      <input
                        type="number"
                        name="infantPrice"
                        value={formData.infantPrice}
                        onChange={handleInputChange}
                        placeholder="e.g. 0"
                        className={styles.input}
                        min="0"
                      />
                    </div>
                    <div className={styles.formGroup} style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.82rem', color: 'var(--gold-400)' }}>➕ Extra Person (€) <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>2nd+ adult</span></label>
                      <input
                        type="number"
                        name="additionalPersonPrice"
                        value={formData.additionalPersonPrice || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. 40"
                        className={styles.input}
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Tier Prices Toggle for Package */}
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: useTierPrices ? '1rem' : 0 }}>
                      <input
                        type="checkbox"
                        checked={useTierPrices}
                        onChange={(e) => setUseTierPrices(e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Enable separate prices for each category (Economy / Business / VIP)</span>
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
                            placeholder="Example: 45"
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
                            placeholder="Example: 75"
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
                            placeholder="Example: 120"
                            className={styles.input}
                            min="1"
                          />
                        </div>
                      </div>
                    )}

                    {useTierPrices && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginTop: '0.8rem' }}>
                        <div className={styles.formGroup} style={{ margin: 0 }}>
                          <label style={{ color: 'var(--emerald-400)', fontSize: '0.85rem' }}>👶 Economy Child (€)</label>
                          <input
                            type="number"
                            name="economyChildPrice"
                            value={formData.economyChildPrice}
                            onChange={handleInputChange}
                            placeholder="Example: 25"
                            className={styles.input}
                            min="0"
                          />
                        </div>
                        <div className={styles.formGroup} style={{ margin: 0 }}>
                          <label style={{ color: 'var(--emerald-400)', fontSize: '0.85rem' }}>👶 Business Child (€)</label>
                          <input
                            type="number"
                            name="businessChildPrice"
                            value={formData.businessChildPrice}
                            onChange={handleInputChange}
                            placeholder="Example: 40"
                            className={styles.input}
                            min="0"
                          />
                        </div>
                        <div className={styles.formGroup} style={{ margin: 0 }}>
                          <label style={{ color: 'var(--emerald-400)', fontSize: '0.85rem' }}>👶 VIP Child (€)</label>
                          <input
                            type="number"
                            name="vipChildPrice"
                            value={formData.vipChildPrice}
                            onChange={handleInputChange}
                            placeholder="Example: 60"
                            className={styles.input}
                            min="0"
                          />
                        </div>
                      </div>
                    )}

                    {useTierPrices && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginTop: '0.8rem' }}>
                        <div className={styles.formGroup} style={{ margin: 0 }}>
                          <label style={{ color: 'var(--pink-400)', fontSize: '0.85rem' }}>👼 Economy Infant (€)</label>
                          <input
                            type="number"
                            name="economyInfantPrice"
                            value={formData.economyInfantPrice}
                            onChange={handleInputChange}
                            placeholder="Example: 10"
                            className={styles.input}
                            min="0"
                          />
                        </div>
                        <div className={styles.formGroup} style={{ margin: 0 }}>
                          <label style={{ color: 'var(--pink-400)', fontSize: '0.85rem' }}>👼 Business Infant (€)</label>
                          <input
                            type="number"
                            name="businessInfantPrice"
                            value={formData.businessInfantPrice}
                            onChange={handleInputChange}
                            placeholder="Example: 20"
                            className={styles.input}
                            min="0"
                          />
                        </div>
                        <div className={styles.formGroup} style={{ margin: 0 }}>
                          <label style={{ color: 'var(--pink-400)', fontSize: '0.85rem' }}>👼 VIP Infant (€)</label>
                          <input
                            type="number"
                            name="vipInfantPrice"
                            value={formData.vipInfantPrice}
                            onChange={handleInputChange}
                            placeholder="Example: 30"
                            className={styles.input}
                            min="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Icon */}
                  <div className={styles.formGroup}>
                    <label>Distinctive emoji</label>
                    <input 
                      type="text" 
                      name="icon" 
                      value={formData.icon} 
                      onChange={handleInputChange}
                      placeholder="Example: 🛳️, 🧖, 🏨"
                      className={styles.input}
                    />
                  </div>
                  {/* Main Image Upload for Package */}
                  <div className={styles.formGroup}>
                    <label>Main package image (automatically compressed and saved)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className={styles.input}
                    />
                    {formData.image && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={formData.image} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--emerald-400)' }}>Main image attached successfully ✓</span>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: '' }))} style={{ background: 'none', border: 'none', color: 'var(--coral-500)', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Image Upload for Trip */}
                  <div className={styles.formGroup}>
                    <label>Main trip image (automatically compressed and saved)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className={styles.input}
                    />
                    {formData.image && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={formData.image} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--emerald-400)' }}>Main image attached successfully ✓</span>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: '' }))} style={{ background: 'none', border: 'none', color: 'var(--coral-500)', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                      </div>
                    )}
                  </div>

                  {/* Location URL */}
                  <div className={styles.formGroup}>
                    <label>Geographic location link for restaurant/place (Google Maps URL) (optional)</label>
                    <input 
                      type="text" 
                      name="locationUrl" 
                      value={formData.locationUrl} 
                      onChange={handleInputChange}
                      placeholder="Example: https://maps.google.com/..."
                      className={styles.input}
                    />
                  </div>

                  {/* Video URL (main) */}
                  <div className={styles.formGroup}>
                    <label>Trip video link (YouTube/Vimeo or direct link) (optional)</label>
                    <input 
                      type="text" 
                      name="videoUrl" 
                      value={formData.videoUrl} 
                      onChange={handleInputChange}
                      placeholder="Example: https://www.youtube.com/watch?v=..."
                      className={styles.input}
                    />
                  </div>

                  {/* Multiple Video URLs */}
                  <div className={styles.formGroup} style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--border-medium)' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.6rem', color: 'var(--gold-400)' }}>🎬 Additional video links (YouTube/Vimeo - unlimited)</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        value={newVideoUrl}
                        onChange={e => setNewVideoUrl(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newVideoUrl.trim()) {
                              setFormData(prev => ({ ...prev, videos: [...(prev.videos || []), newVideoUrl.trim()] }));
                              setNewVideoUrl('');
                            }
                          }
                        }}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className={styles.input}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ whiteSpace: 'nowrap', padding: '0 1rem', fontSize: '0.9rem' }}
                        onClick={() => {
                          if (newVideoUrl.trim()) {
                            setFormData(prev => ({ ...prev, videos: [...(prev.videos || []), newVideoUrl.trim()] }));
                            setNewVideoUrl('');
                          }
                        }}
                      >+ Add</button>
                    </div>
                    {(formData.videos || []).length === 0 && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', margin: 0 }}>No videos added yet. Paste a YouTube or Vimeo link and click Add.</p>
                    )}
                    {(formData.videos || []).map((vUrl, vIdx) => (
                      <div key={vIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', background: 'rgba(255,255,255,0.04)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <span style={{ flex: 1, fontSize: '0.78rem', color: 'var(--gold-400)', wordBreak: 'break-all', fontFamily: 'var(--font-en)', direction: 'ltr' }}>🎥 {vUrl}</span>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, videos: prev.videos.filter((_, i) => i !== vIdx) }))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>×</button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Multiple Images Gallery for both Trip and Package */}
              <div className={styles.formGroup} style={{ width: '100%', marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--border-medium)', boxSizing: 'border-box' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--gold-400)' }}>📷 Images gallery — unlimited (upload as many as you want)</label>
                {uploadingImages && uploadProgress && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', color: 'var(--gold-400)', fontSize: '0.85rem', fontWeight: '600' }}>
                    <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid var(--gold-400)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    {uploadProgress}
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  disabled={uploadingImages}
                  onChange={handleMultipleImagesUpload}
                  className={styles.input}
                  style={{ marginBottom: '1rem', opacity: uploadingImages ? 0.5 : 1 }}
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
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={isTranslating}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isTranslating}>
                  {isTranslating ? '⏳ Saving & Translating...' : (editingTrip ? '💾 Save Changes' : '➕ Confirm Addition')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
