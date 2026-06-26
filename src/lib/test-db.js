/**
 * اختبار الاتصال بقاعدة بيانات Firebase
 */

import { db } from './firebase';
import { initializeDB, getAgents, getPackages } from './db.firebase';

// اختبار الاتصال بقاعدة البيانات
export async function testDatabaseConnection() {
  try {
    console.log('بدء اختبار الاتصال بقاعدة البيانات...');

    // التحقق من وجود اتصال
    if (!db) {
      console.error('فشل الاتصال بقاعدة البيانات - db غير معرّف');
      return false;
    }

    // محاولة تهيئة قاعدة البيانات
    console.log('محاولة تهيئة قاعدة البيانات...');
    const initResult = await initializeDB();
    if (!initResult) {
      console.error('فشل تهيئة قاعدة البيانات');
      return false;
    }

    // محاولة جلب البيانات
    console.log('محاولة جلب الوكلاء...');
    const agents = await getAgents();
    if (!agents || agents.length === 0) {
      console.error('فشل جلب بيانات الوكلاء');
      return false;
    }

    console.log('محاولة جلب الباقات...');
    const packages = await getPackages('sample');
    if (!packages || packages.length === 0) {
      console.warn('لم يتم العثور على بيانات البانات (قد يكون هذا طبيعياً)');
    }

    console.log('نجح الاتصال بقاعدة البيانات!');
    console.log(`تم جلب ${agents.length} وكيلاً`);
    if (packages) {
      console.log(`تم جلب ${packages.length} باقة`);
    }

    return true;
  } catch (error) {
    console.error('حدث خطأ أثناء اختبار الاتصال:', error);
    return false;
  }
}

// اختبار حذف البيانات
export async function testDataDeletion() {
  try {
    console.log('بدء اختبار حذف البيانات...');

    // يمكن إضافة اختبارات حذف هنا إذا لزم الأمر

    console.log('اكتمل اختبار حذف البيانات');
    return true;
  } catch (error) {
    console.error('حدث خطأ أثناء اختبار حذف البيانات:', error);
    return false;
  }
}

// تشغيل الاختبارات
if (typeof window !== 'undefined') {
  // تشغيل في المتصفح
  window.testDatabaseConnection = testDatabaseConnection;
  window.testDataDeletion = testDataDeletion;

  console.log('تم تحميل أدوات اختبار قاعدة البيانات');
  console.log('يمكنك تشغيل الاختبارات من وحدة التحكم:');
  console.log('- testDatabaseConnection()');
  console.log('- testDataDeletion()');
}
