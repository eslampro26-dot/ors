/**
 * Search Engine Indexing & Pinger Service
 * Connects changes to Google Search Console and Bing IndexNow for instant crawling.
 */

export async function notifySearchEngines({ url, type = 'URL_UPDATED' }) {
  const SITE_URL = 'https://orluxus.com';
  const targetUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;
  
  console.log(`[Indexing Pinger] Starting notifications for URL: ${targetUrl}`);

  // 1. Google Sitemap Ping
  try {
    const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
    const googlePingUrl = `https://www.google.com/ping?sitemap=${sitemapUrl}`;
    
    // Perform fetch in background to avoid blocking user response
    fetch(googlePingUrl, { method: 'GET', mode: 'no-cors' })
      .then(res => {
        console.log(`[Indexing Pinger] Google Sitemap Ping successful (Sitemap submitted).`);
      })
      .catch(err => {
        console.warn(`[Indexing Pinger] Google Sitemap Ping error:`, err.message);
      });
  } catch (err) {
    console.warn(`[Indexing Pinger] Failed to setup Google Ping:`, err.message);
  }

  // 2. Bing & Yandex IndexNow API
  // IndexNow lets you notify multiple search engines about URL changes instantly
  try {
    const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'orluxus_indexnow_default_key';
    const indexNowPayload = {
      host: 'orluxus.com',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: [targetUrl]
    };

    fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(indexNowPayload)
    })
      .then(async (res) => {
        if (res.ok) {
          console.log(`[Indexing Pinger] IndexNow URL submit successful (Bing/Yandex notified).`);
        } else {
          console.warn(`[Indexing Pinger] IndexNow API returned status: ${res.status}`);
        }
      })
      .catch(err => {
        console.warn(`[Indexing Pinger] IndexNow API error:`, err.message);
      });
  } catch (err) {
    console.warn(`[Indexing Pinger] Failed to submit to IndexNow:`, err.message);
  }
}
