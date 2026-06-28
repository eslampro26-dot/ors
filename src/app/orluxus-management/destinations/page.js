'use client';

import { useState, useEffect } from 'react';
import { cities } from '@/lib/data';
import styles from './page.module.css'; // Will use same styles or generic if possible, let's create inline styles to avoid missing module errors or import from another page

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.destinations) {
          setDestinations(data.destinations);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching destinations:', err);
        setIsLoading(false);
      });
  }, []);

  const handleInputChange = (slug, field, value) => {
    setDestinations(prev => ({
      ...prev,
      [slug]: {
        ...(prev[slug] || {}),
        [field]: value
      }
    }));
  };

  const handleImageUpload = (slug, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
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

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        handleInputChange(slug, 'image', dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destinations }),
      });
      
      if (res.ok) {
        alert('تم حفظ البيانات بنجاح!');
      } else {
        alert('حدث خطأ أثناء الحفظ.');
      }
    } catch (err) {
      console.error('Error saving:', err);
      alert('حدث خطأ أثناء الحفظ.');
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return <div style={{ padding: '2rem', color: '#fff' }}>جاري التحميل...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--gold-500)', marginBottom: '0.5rem' }}>إدارة المدن والوجهات</h2>
          <p style={{ color: 'var(--text-secondary)' }}>تعديل الصور والوصف للمدن المعروضة في الصفحة الرئيسية</p>
        </div>
        <button 
          onClick={saveChanges} 
          disabled={isSaving}
          className="btn btn-primary"
          style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}
        >
          {isSaving ? 'جاري الحفظ...' : '💾 حفظ التعديلات'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {cities.map(city => {
          const currentData = destinations[city.slug] || {};
          const displayImage = currentData.image || city.image;
          const displayDescAr = currentData.descriptionAr !== undefined ? currentData.descriptionAr : city.descriptionAr;
          const displayDescEn = currentData.descriptionEn !== undefined ? currentData.descriptionEn : city.descriptionEn;

          return (
            <div key={city.slug} className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              
              {/* Image Preview and Upload */}
              <div style={{ flex: '1 1 300px' }}>
                <h3 style={{ color: 'var(--gold-400)', marginBottom: '1rem', fontSize: '1.2rem' }}>
                  {city.emoji} {city.nameAr} ({city.nameEn})
                </h3>
                
                <div style={{ 
                  width: '100%', 
                  height: '200px', 
                  borderRadius: '12px',
                  backgroundImage: `url(${displayImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  marginBottom: '1rem',
                  border: '1px solid var(--border-medium)'
                }} />
                
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>صورة المدينة:</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(city.slug, e)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}
                />
              </div>

              {/* Descriptions */}
              <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>الوصف (بالعربية)</label>
                  <textarea 
                    value={displayDescAr}
                    onChange={(e) => handleInputChange(city.slug, 'descriptionAr', e.target.value)}
                    style={{ 
                      width: '100%', 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid var(--border-medium)',
                      color: '#fff',
                      padding: '1rem',
                      borderRadius: '8px',
                      minHeight: '120px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>الوصف (بالإنجليزية)</label>
                  <textarea 
                    value={displayDescEn}
                    onChange={(e) => handleInputChange(city.slug, 'descriptionEn', e.target.value)}
                    dir="ltr"
                    style={{ 
                      width: '100%', 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid var(--border-medium)',
                      color: '#fff',
                      padding: '1rem',
                      borderRadius: '8px',
                      minHeight: '120px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
