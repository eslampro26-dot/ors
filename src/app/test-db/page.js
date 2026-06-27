'use client';

/**
 * صفحة لاختبار قاعدة البيانات
 */

import { testDatabaseConnection, testDataDeletion } from '@/lib/test-db';

export default function TestDatabasePage() {
  const handleTestConnection = async () => {
    const result = await testDatabaseConnection();
    alert(result ? 'نجح الاتصال بقاعدة البيانات!' : 'فشل الاتصال بقاعدة البيانات');
  };

  const handleTestDeletion = async () => {
    const result = await testDataDeletion();
    alert(result ? 'نجح اختبار حذف البيانات!' : 'فشل اختبار حذف البيانات');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">اختبار قاعدة البيانات</h1>

          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">اختبار الاتصال</h2>
            <p className="text-gray-600 mb-4">
              اضغط على الزر لاختبار الاتصال بقاعدة بيانات Firebase
            </p>
            <button 
              onClick={handleTestConnection}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              اختبار الاتصال
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">اختبار حذف البيانات</h2>
            <p className="text-gray-600 mb-4">
              اضغط على الزر لاختبار حذف البيانات من قاعدة البيانات
            </p>
            <button 
              onClick={handleTestDeletion}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              اختبار حذف البيانات
            </button>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  تأكد من أنك تعمل في بيئة التطوير قبل اختبار عمليات الحذف
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>معرف قاعدة البيانات: {process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || '(default)'}</p>
            <p>يمكنك أيضاً اختبار الاتصال من وحدة تحكم المتصفح باستخدام:</p>
            <code className="bg-gray-100 px-2 py-1 rounded">testDatabaseConnection()</code>
          </div>
        </div>
      </div>
    </div>
  );
}
