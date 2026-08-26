const regions = [
  'https://secure-egypt.paytabs.com/payment/request',
  'https://secure.paytabs.com/payment/request',
  'https://secure.paytabs.sa/payment/request',
  'https://secure-oman.paytabs.com/payment/request',
  'https://secure-jordan.paytabs.com/payment/request',
  'https://secure-global.paytabs.com/payment/request',
  'https://secure-iraq.paytabs.com/payment/request',
  'https://secure-palestine.paytabs.com/payment/request'
];

const keys = [
  'SGJ9TZMKZW-J92RJLWRLL-K92HRBZRKN',
  'S6J9TZMKZW-J92RJLWRLL-K92HRBZRKN',
  'SGJ9TZMK2W-J92RJLWRLL-K92HRBZRKN',
  'S6J9TZMK2W-J92RJLWRLL-K92HRBZRKN',
  'SHJ9TZMKGJ-J92RJLWRW2-LJNGHG2RK9',
  'S6J9TZMKGJ-J92RJLWRW2-LJNGHG2RK9',
  'SGJ9TZMKGJ-J92RJLWRW2-LJNGHG2RK9',
  'SGJ9TZMKZW-J92RJLWRWL-K92HRBZRKN',
  'S6J9TZMKZW-J92RJLWRWL-K92HRBZRKN',
  'SGJ9TZMKZW-J92RJLWRW2-K92HRBZRKN',
  'S6J9TZMKZW-J92RJLWRW2-K92HRBZRKN',
  'SGJ9TZMKZW-J92RJLWRLL-K92HR8ZRKN',
  'S6J9TZMKZW-J92RJLWRLL-K92HR8ZRKN',
  'SGJ9TZMKZW-J92RJLWRLL-K92HRB2RKN',
  'S6J9TZMKZW-J92RJLWRLL-K92HRB2RKN'
];

async function testAll() {
  for (const url of regions) {
    for (const key of keys) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': key
          },
          body: JSON.stringify({
            profile_id: 152340,
            tran_type: 'sale',
            tran_class: 'ecom',
            cart_id: 'test_123',
            cart_description: 'Test',
            cart_currency: 'EGP',
            cart_amount: 10,
            callback: 'https://orluxus.com/api/paytabs/callback',
            return: 'https://orluxus.com/booking-confirmation'
          })
        });
        const data = await res.json();
        if (res.status === 200 || data.paypage_url || data.code !== 1) {
          console.log('>>> SUCCESS / MATCH FOUND! <<<');
          console.log('Region URL:', url);
          console.log('Key:', key);
          console.log('Result:', JSON.stringify(data, null, 2));
          process.exit(0);
        }
      } catch (e) {
        // network error
      }
    }
  }
  console.log('No direct match found in tested combinations.');
}

testAll();
