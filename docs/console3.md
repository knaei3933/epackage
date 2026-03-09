
> epackage-lab-web@0.1.0 dev
> next dev

 ⚠ Port 3000 is in use by process 290716, using available port 3003 instead.
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
 ⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
 We detected multiple lockfiles and selected the directory of C:\Users\kanei\claudecode\package-lock.json as the root directory.
 To silence this warning, set `turbopack.root` in your Next.js config, or consider removing one of the lockfiles if it's not needed.
   See https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory for more information.
 Detected additional lockfiles: 
   * C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\pnpm-lock.yaml

   ▲ Next.js 16.0.11 (Turbopack)
   - Local:         http://localhost:3003
   - Network:       http://192.168.0.21:3003
   - Environments: .env.local, .env

 ✓ Starting...
 ✓ Ready in 1087ms
 ○ Compiling /quote-simulator ...
[getDefaultPostProcessingOptions] Selected defaults: [
  'zipper-yes',
  'glossy',
  'notch-yes',
  'hang-hole-6mm',
  'corner-round',
  'valve-no',
  'top-open',
  'sealing-width-5mm'
]
[QuoteContext] initialState created: {
  materialWidth: 590,
  filmLayers: [
    { materialId: 'PET', thickness: 12 },
    { materialId: 'AL', thickness: 7 },
    { materialId: 'PET', thickness: 12 },
    { materialId: 'LLDPE', thickness: 70 }
  ],
  filmLayersCount: 4
}
 GET /quote-simulator 200 in 4.3s (compile: 4.0s, render: 312ms)
 GET /api/comparison/save 200 in 205ms (compile: 195ms, render: 10ms)
[Session API] All cookies: [
  { name: '_gcl_au', hasValue: true },
  { name: '_ga', hasValue: true },
  { name: '__next_hmr_refresh_hash__', hasValue: true },
  { name: '_ga_VBCB77P21T', hasValue: true }
]
[Session API] Supabase cookies: []
[Session API] URL: http://localhost:3003/api/auth/current-user
[Session API] Referer: http://localhost:3003/quote-simulator
[Session API] getUser result: { hasUser: false, userId: undefined, error: 'Auth session missing!' }
[Session API] No valid user found Auth session missing!
 GET /api/auth/current-user 200 in 272ms (compile: 264ms, render: 8ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 365ms (compile: 76ms, render: 289ms)
[Config API] Fetching remote config...
 GET /api/health 200 in 113ms (compile: 81ms, render: 32ms)
[Config API] Config fetched successfully
 GET /api/config 200 in 257ms (compile: 2ms, render: 255ms)
 GET /api/health 200 in 6ms (compile: 1678µs, render: 4ms)
 GET /api/pricing/settings 200 in 400ms (compile: 96ms, render: 304ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 540ms (compile: 3ms, render: 537ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 624ms (compile: 2ms, render: 622ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 635ms (compile: 1741µs, render: 633ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 577ms (compile: 1727µs, render: 576ms)
 GET /quote-simulator 200 in 72ms (compile: 4ms, render: 67ms)
 GET /api/comparison/save 200 in 5ms (compile: 2ms, render: 3ms)
[Session API] All cookies: [
  { name: '_ga', hasValue: true },
  { name: '_gcl_au', hasValue: true },
  { name: '__next_hmr_refresh_hash__', hasValue: true },
  { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true },
  { name: '_ga_VBCB77P21T', hasValue: true }
]
[Session API] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[Session API] URL: http://localhost:3003/api/auth/current-user
[Session API] Referer: http://localhost:3003/quote-simulator
[Config API] Fetching remote config...
[Session API] getUser result: {
  hasUser: true,
  userId: '54fd7b31-b805-43cf-b92e-898ddd066875',
  error: undefined
}
[Session API] NEXT_PUBLIC_SUPABASE_URL: https://ijlgpzjdfipzmjvawofp.supabase.co
[Session API] SUPABASE_SERVICE_ROLE_KEY exists: true
[Config API] Config fetched successfully
 GET /api/config 200 in 325ms (compile: 1800µs, render: 323ms)
[Config API] Fetching remote config...
 GET /api/health 200 in 8ms (compile: 1919µs, render: 6ms)
[Session API] User found for: admin@epackage-lab.com Profile: Found
[Session API] Profile data: {
  id: '54fd7b31-b805-43cf-b92e-898ddd066875',
  email: 'admin@epackage-lab.com',
  kanji_last_name: '管理',
  kanji_first_name: '者',
  kana_last_name: 'かんり',
  kana_first_name: 'しゃ',
  corporate_phone: '03-1234-5678',
  personal_phone: '090-1234-5678',
  business_type: 'INDIVIDUAL',
  company_name: 'EPackage Lab',
  legal_entity_number: null,
  position: null,
  department: null,
  company_url: null,
  product_category: 'OTHER',
  acquisition_channel: null,
  postal_code: null,
  prefecture: null,
  city: null,
  street: null,
  role: 'ADMIN',
  status: 'ACTIVE',
  created_at: '2026-01-03T11:32:15.549776+00:00',
  updated_at: '2026-02-16T14:14:16.20664+00:00',
  last_login_at: null,
  user_type: null,
  corporate_number: null,
  founded_year: null,
  capital: null,
  representative_name: null,
  building: null,
  business_document_path: null,
  verification_token: null,
  verification_expires_at: null,
  settings: {
    language: 'ja',
    timezone: 'Asia/Tokyo',
    notifications: {
      order_updates: true,
      security_alerts: true,
      marketing_emails: false,
      quotation_updates: true,
      production_updates: true,
      email_notifications: true,
      login_notifications: true,
      shipment_notifications: true
    }
  },
  markup_rate: 0,
  markup_rate_note: null,
  designer_name_ko: null,
  designer_name_en: null,
  preferred_language: 'ja',
  notification_settings: {}
}
 GET /api/auth/current-user 200 in 862ms (compile: 6ms, render: 856ms)
[Config API] Config fetched successfully
 GET /api/config 200 in 296ms (compile: 3ms, render: 294ms)
 GET /api/health 200 in 9ms (compile: 1455µs, render: 7ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 605ms (compile: 70ms, render: 535ms)
 GET /api/pricing/settings 200 in 363ms (compile: 1353µs, render: 362ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 555ms (compile: 1786µs, render: 553ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 274ms (compile: 1628µs, render: 273ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 554ms (compile: 1646µs, render: 552ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 649ms (compile: 1633µs, render: 647ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 561ms (compile: 3ms, render: 558ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 307ms (compile: 1645µs, render: 305ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 1076ms (compile: 1430µs, render: 1075ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 385ms (compile: 2ms, render: 383ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 582ms (compile: 1891µs, render: 580ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 308ms (compile: 5ms, render: 304ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 594ms (compile: 1480µs, render: 592ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 314ms (compile: 1555µs, render: 312ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 544ms (compile: 1444µs, render: 543ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 301ms (compile: 1947µs, render: 299ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 569ms (compile: 1802µs, render: 567ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 657ms (compile: 1488µs, render: 655ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 668ms (compile: 1737µs, render: 666ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 838ms (compile: 1666µs, render: 836ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 564ms (compile: 1531µs, render: 562ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 325ms (compile: 1485µs, render: 323ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 551ms (compile: 1762µs, render: 550ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 320ms (compile: 1607µs, render: 319ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 632ms (compile: 1704µs, render: 631ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 381ms (compile: 1402µs, render: 380ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 560ms (compile: 1898µs, render: 558ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 281ms (compile: 1533µs, render: 280ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 667ms (compile: 1455µs, render: 665ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 345ms (compile: 1617µs, render: 343ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 542ms (compile: 1491µs, render: 541ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 296ms (compile: 1549µs, render: 295ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 635ms (compile: 1524µs, render: 633ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 307ms (compile: 1461µs, render: 305ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 600ms (compile: 1446µs, render: 599ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 282ms (compile: 1587µs, render: 281ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 604ms (compile: 1428µs, render: 602ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 349ms (compile: 1469µs, render: 347ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 922ms (compile: 1647µs, render: 920ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 287ms (compile: 1608µs, render: 286ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 648ms (compile: 1590µs, render: 647ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 299ms (compile: 1418µs, render: 297ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 581ms (compile: 1746µs, render: 580ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 315ms (compile: 1424µs, render: 314ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 648ms (compile: 1552µs, render: 646ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 366ms (compile: 1563µs, render: 364ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 679ms (compile: 2ms, render: 677ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 658ms (compile: 1531µs, render: 656ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 690ms (compile: 1413µs, render: 688ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 308ms (compile: 1721µs, render: 306ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 671ms (compile: 1520µs, render: 670ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 310ms (compile: 1554µs, render: 308ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 661ms (compile: 1524µs, render: 659ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 407ms (compile: 1358µs, render: 406ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 538ms (compile: 1387µs, render: 536ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 374ms (compile: 1537µs, render: 373ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 913ms (compile: 1431µs, render: 912ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 287ms (compile: 1500µs, render: 285ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 676ms (compile: 1376µs, render: 674ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 295ms (compile: 1406µs, render: 293ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 560ms (compile: 1712µs, render: 559ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 698ms (compile: 1575µs, render: 696ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 644ms (compile: 1585µs, render: 643ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 663ms (compile: 1628µs, render: 662ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 572ms (compile: 2ms, render: 570ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 398ms (compile: 1606µs, render: 396ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 649ms (compile: 1365µs, render: 647ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 530ms (compile: 1470µs, render: 528ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 668ms (compile: 1362µs, render: 666ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 294ms (compile: 1344µs, render: 292ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 650ms (compile: 1346µs, render: 649ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 277ms (compile: 1438µs, render: 276ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 593ms (compile: 1561µs, render: 591ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 332ms (compile: 1978µs, render: 330ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 626ms (compile: 1971µs, render: 624ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 280ms (compile: 1649µs, render: 278ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 818ms (compile: 1439µs, render: 816ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 405ms (compile: 1316µs, render: 404ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 668ms (compile: 1466µs, render: 666ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 306ms (compile: 1508µs, render: 304ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 666ms (compile: 1670µs, render: 664ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 333ms (compile: 1612µs, render: 332ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 583ms (compile: 1761µs, render: 582ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 302ms (compile: 1503µs, render: 300ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 838ms (compile: 1464µs, render: 836ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 352ms (compile: 1354µs, render: 350ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 576ms (compile: 1457µs, render: 575ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 286ms (compile: 1527µs, render: 285ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 917ms (compile: 1872µs, render: 915ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 329ms (compile: 1548µs, render: 327ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 577ms (compile: 1442µs, render: 575ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 300ms (compile: 1452µs, render: 299ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 939ms (compile: 1485µs, render: 938ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 289ms (compile: 1580µs, render: 287ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 584ms (compile: 1459µs, render: 582ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 292ms (compile: 1809µs, render: 290ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 707ms (compile: 1640µs, render: 706ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 308ms (compile: 1523µs, render: 307ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 707ms (compile: 1298µs, render: 705ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 325ms (compile: 1455µs, render: 324ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 577ms (compile: 1344µs, render: 576ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 422ms (compile: 1745µs, render: 420ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 559ms (compile: 1362µs, render: 557ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 294ms (compile: 1735µs, render: 292ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 863ms (compile: 1414µs, render: 861ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 327ms (compile: 1359µs, render: 325ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 562ms (compile: 1458µs, render: 560ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 281ms (compile: 1900µs, render: 279ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 974ms (compile: 3ms, render: 971ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 417ms (compile: 1528µs, render: 416ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 677ms (compile: 1514µs, render: 676ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 313ms (compile: 1329µs, render: 312ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 945ms (compile: 1390µs, render: 944ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 369ms (compile: 1408µs, render: 367ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 570ms (compile: 1432µs, render: 569ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 337ms (compile: 1679µs, render: 336ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 740ms (compile: 1863µs, render: 738ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 341ms (compile: 1631µs, render: 340ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 643ms (compile: 1432µs, render: 642ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 338ms (compile: 1462µs, render: 337ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 1018ms (compile: 1516µs, render: 1016ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 337ms (compile: 1489µs, render: 336ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 612ms (compile: 1398µs, render: 610ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 328ms (compile: 1512µs, render: 326ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 894ms (compile: 1414µs, render: 893ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 692ms (compile: 1432µs, render: 691ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 649ms (compile: 1419µs, render: 648ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 771ms (compile: 1372µs, render: 770ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 571ms (compile: 1469µs, render: 569ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 324ms (compile: 1591µs, render: 322ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 679ms (compile: 1953µs, render: 677ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 325ms (compile: 1322µs, render: 323ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 669ms (compile: 1557µs, render: 668ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 402ms (compile: 1581µs, render: 401ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 1049ms (compile: 1390µs, render: 1048ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 612ms (compile: 1380µs, render: 611ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 602ms (compile: 1454µs, render: 601ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 315ms (compile: 1348µs, render: 313ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 556ms (compile: 1380µs, render: 555ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 291ms (compile: 1420µs, render: 290ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 662ms (compile: 1337µs, render: 661ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 327ms (compile: 1389µs, render: 326ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 567ms (compile: 1463µs, render: 565ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 351ms (compile: 1569µs, render: 349ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 566ms (compile: 1374µs, render: 564ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 316ms (compile: 1397µs, render: 314ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 569ms (compile: 1395µs, render: 568ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 299ms (compile: 1485µs, render: 298ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 588ms (compile: 1470µs, render: 586ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 294ms (compile: 1701µs, render: 292ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 642ms (compile: 1980µs, render: 640ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 391ms (compile: 1667µs, render: 389ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 816ms (compile: 1340µs, render: 814ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 347ms (compile: 1547µs, render: 346ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 759ms (compile: 1377µs, render: 757ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 669ms (compile: 1381µs, render: 668ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 629ms (compile: 1308µs, render: 628ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 311ms (compile: 1517µs, render: 310ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 644ms (compile: 1409µs, render: 642ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 287ms (compile: 1338µs, render: 285ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 618ms (compile: 1620µs, render: 617ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 339ms (compile: 1446µs, render: 337ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 569ms (compile: 1548µs, render: 567ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 299ms (compile: 1389µs, render: 298ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 968ms (compile: 1554µs, render: 966ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 331ms (compile: 1366µs, render: 330ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 963ms (compile: 1392µs, render: 962ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 291ms (compile: 1476µs, render: 290ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 1071ms (compile: 1378µs, render: 1069ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 329ms (compile: 1436µs, render: 328ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 582ms (compile: 1997µs, render: 580ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 279ms (compile: 2ms, render: 276ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 1069ms (compile: 1456µs, render: 1067ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 323ms (compile: 2ms, render: 320ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 658ms (compile: 1323µs, render: 657ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 297ms (compile: 1601µs, render: 295ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 557ms (compile: 1406µs, render: 556ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 300ms (compile: 1423µs, render: 298ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 549ms (compile: 1372µs, render: 547ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 306ms (compile: 1346µs, render: 305ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 730ms (compile: 1349µs, render: 729ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 287ms (compile: 2ms, render: 285ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 722ms (compile: 1468µs, render: 721ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 703ms (compile: 2ms, render: 701ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 924ms (compile: 1443µs, render: 922ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 286ms (compile: 1539µs, render: 285ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 553ms (compile: 1531µs, render: 551ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 277ms (compile: 1947µs, render: 275ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 579ms (compile: 1626µs, render: 577ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 299ms (compile: 1435µs, render: 297ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 656ms (compile: 1479µs, render: 655ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 386ms (compile: 1460µs, render: 384ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 571ms (compile: 1337µs, render: 570ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 278ms (compile: 1292µs, render: 277ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 559ms (compile: 1502µs, render: 557ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 292ms (compile: 1629µs, render: 290ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 572ms (compile: 1346µs, render: 571ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 379ms (compile: 1431µs, render: 378ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 577ms (compile: 1337µs, render: 576ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 427ms (compile: 1537µs, render: 425ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 547ms (compile: 1575µs, render: 545ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 306ms (compile: 2ms, render: 304ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 585ms (compile: 1624µs, render: 583ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 334ms (compile: 1805µs, render: 332ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 1010ms (compile: 1351µs, render: 1009ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 331ms (compile: 1565µs, render: 330ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 1050ms (compile: 1435µs, render: 1049ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 377ms (compile: 1450µs, render: 376ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 554ms (compile: 1423µs, render: 552ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 301ms (compile: 1407µs, render: 300ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 593ms (compile: 1674µs, render: 592ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 347ms (compile: 1475µs, render: 345ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 890ms (compile: 1323µs, render: 889ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 328ms (compile: 1765µs, render: 326ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 624ms (compile: 1396µs, render: 623ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 297ms (compile: 1351µs, render: 296ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 638ms (compile: 1337µs, render: 636ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 292ms (compile: 1883µs, render: 290ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 1089ms (compile: 1324µs, render: 1087ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 334ms (compile: 1347µs, render: 333ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 543ms (compile: 1543µs, render: 542ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 275ms (compile: 1477µs, render: 273ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 800ms (compile: 1427µs, render: 799ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 303ms (compile: 1407µs, render: 302ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 719ms (compile: 1510µs, render: 717ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 673ms (compile: 1339µs, render: 672ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 865ms (compile: 1332µs, render: 864ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 313ms (compile: 1398µs, render: 311ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 592ms (compile: 1371µs, render: 591ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 291ms (compile: 1910µs, render: 290ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 569ms (compile: 1353µs, render: 567ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 289ms (compile: 1857µs, render: 287ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 991ms (compile: 1718µs, render: 989ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 386ms (compile: 1487µs, render: 385ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 560ms (compile: 1241µs, render: 559ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 285ms (compile: 1451µs, render: 284ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 569ms (compile: 1431µs, render: 567ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 300ms (compile: 1399µs, render: 299ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 544ms (compile: 1357µs, render: 542ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 284ms (compile: 1781µs, render: 282ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 870ms (compile: 1442µs, render: 868ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 291ms (compile: 1307µs, render: 290ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 570ms (compile: 1378µs, render: 569ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 302ms (compile: 1468µs, render: 301ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 645ms (compile: 1281µs, render: 644ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 299ms (compile: 2ms, render: 297ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 584ms (compile: 1674µs, render: 582ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 286ms (compile: 1536µs, render: 285ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 904ms (compile: 1560µs, render: 903ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 741ms (compile: 1456µs, render: 740ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 582ms (compile: 1421µs, render: 580ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 793ms (compile: 1671µs, render: 791ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 564ms (compile: 1539µs, render: 562ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 299ms (compile: 1949µs, render: 297ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 614ms (compile: 1309µs, render: 612ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 676ms (compile: 1284µs, render: 675ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 552ms (compile: 1504µs, render: 551ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 283ms (compile: 1250µs, render: 282ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 553ms (compile: 1343µs, render: 551ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 983ms (compile: 1369µs, render: 982ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 685ms (compile: 1465µs, render: 684ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 281ms (compile: 1529µs, render: 280ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 568ms (compile: 1453µs, render: 567ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 278ms (compile: 1532µs, render: 276ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 878ms (compile: 1417µs, render: 877ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 316ms (compile: 1311µs, render: 315ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 556ms (compile: 1341µs, render: 554ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 282ms (compile: 1674µs, render: 281ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 972ms (compile: 1445µs, render: 970ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 365ms (compile: 1436µs, render: 363ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 544ms (compile: 1358µs, render: 543ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 306ms (compile: 1955µs, render: 304ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 531ms (compile: 2ms, render: 529ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 287ms (compile: 1429µs, render: 286ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 1009ms (compile: 1432µs, render: 1007ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 328ms (compile: 1558µs, render: 327ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 559ms (compile: 1338µs, render: 558ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 293ms (compile: 1349µs, render: 292ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 539ms (compile: 1448µs, render: 538ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 291ms (compile: 1475µs, render: 290ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 963ms (compile: 1318µs, render: 962ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 325ms (compile: 1750µs, render: 323ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 1052ms (compile: 1360µs, render: 1051ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 370ms (compile: 1486µs, render: 368ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 950ms (compile: 1350µs, render: 949ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 287ms (compile: 1303µs, render: 285ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 582ms (compile: 1364µs, render: 581ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 279ms (compile: 1709µs, render: 277ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 704ms (compile: 1373µs, render: 703ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 277ms (compile: 1629µs, render: 275ms)
 GET /quote-simulator 200 in 109ms (compile: 4ms, render: 105ms)
 GET /api/comparison/save 200 in 6ms (compile: 3ms, render: 2ms)
[Session API] All cookies: [
  { name: '_ga', hasValue: true },
  { name: '_gcl_au', hasValue: true },
  { name: '__next_hmr_refresh_hash__', hasValue: true },
  { name: '_ga_VBCB77P21T', hasValue: true }
]
[Session API] Supabase cookies: []
[Session API] URL: http://localhost:3003/api/auth/current-user
[Session API] Referer: http://localhost:3003/quote-simulator
[Session API] getUser result: { hasUser: false, userId: undefined, error: 'Auth session missing!' }
[Session API] No valid user found Auth session missing!
 GET /api/auth/current-user 200 in 12ms (compile: 7ms, render: 5ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 324ms (compile: 3ms, render: 321ms)
[Config API] Fetching remote config...
 GET /api/health 200 in 10ms (compile: 1667µs, render: 8ms)
[Config API] Config fetched successfully
 GET /api/config 200 in 287ms (compile: 1974µs, render: 285ms)
 GET /api/health 200 in 7ms (compile: 2ms, render: 5ms)
 GET /api/pricing/settings 200 in 494ms (compile: 1673µs, render: 493ms)
 GET /auth/signin 200 in 1179ms (compile: 1145ms, render: 34ms)
[Signin API] Received signin request
[Signin API] Login attempt for: admin@epackage-lab.com
[Signin API] Creating SSR client...
[Signin API] Attempting signInWithPassword...
[supabase-ssr] setAll called with 1 cookies
[supabase-ssr] Setting cookie: sb-ijlgpzjdfipzmjvawofp-auth-token value length: 2646
[supabase-ssr] Set-Cookie header set for: sb-ijlgpzjdfipzmjvawofp-auth-token
[supabase-ssr] Final response has 1 Set-Cookie headers
[Signin API] Login successful, user ID: 54fd7b31-b805-43cf-b92e-898ddd066875
[Signin API] Redirecting to: /admin/dashboard (role: ADMIN )
[Signin API] Set-Cookie headers from initialResponse: 1
[Signin API] Copied 1 Set-Cookie headers to finalResponse
[Signin API] Login successful, cookies set for: admin@epackage-lab.com
 POST /api/auth/signin/ 200 in 1088ms (compile: 141ms, render: 947ms)
[DashboardContent] START: Rendering dashboard content
[DashboardContent] Calling requireAuth...
[requireAuth] START: Authentication check initiated
[requireAuth] Importing getRBACContext...
[requireAuth] Calling getRBACContext()...
[RBAC] getRBACContext() called
[RBAC] Environment: { NODE_ENV: 'development', NEXT_PHASE: undefined }
[RBAC] Call stack:     at getRBACContext (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__442d2343._.js:279:23)
    at requireAuth (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__911457f1._.js:948:29)
    at async DashboardContent (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__911457f1._.js:5090:16)
[RBAC] Checking middleware headers...
[RBAC] All available headers: [
  [ 'host', 'localhost:3003' ],
  [ 'connection', 'keep-alive' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'x-nextjs-request-id', '48a41403' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-nextjs-html-request-id', 'h6G83h3ZLrU9iLIXP1ukB' ],
  [ 'accept', '*/*' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'referer', 'http://localhost:3003/auth/signin' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=762; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TURreE9EQXlMQ0pwWVhRaU9qRTNOek13T0RneU1ESXNJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpBNE9ESXdNbjFkTENKelpYTnphVzl1WDJsa0lqb2lPR1U0TTJVeVlqQXRObUV6TXkwMFlqY3lMVGxqWm1RdE9URTFOekJtWWpRMll6bGxJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLmlzclB4X0tlWmVvWlFhamRIcVF3WmFpSUVYSm5kX1J3NVV6dG9kYnQyRm9UeXRXUk1JLVJTRzg5WV9mSHlRMW1KY05xMXNJZDMwTEwxUjFEZlNpa0RRIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMwOTE4MDIsInJlZnJlc2hfdG9rZW4iOiJ1bHByZGloaXAyMmIiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTA5VDIwOjMwOjAyLjQwMzc0NDI0WiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJBZG1pbiBVc2VyIn0sImlkZW50aXRpZXMiOlt7ImlkZW50aXR5X2lkIjoiN2ZmMTUzOTgtMWE4Zi00ZTQzLTkwYTEtNzZlZWI5ODVjMzhjIiwiaWQiOiI1NGZkN2IzMS1iODA1LTQzY2YtYjkyZS04OThkZGQwNjY4NzUiLCJ1c2VyX2lkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiaWRlbnRpdHlfZGF0YSI6eyJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1In0sInByb3ZpZGVyIjoiZW1haWwiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQxNVoiLCJjcmVhdGVkX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0ODFaIiwidXBkYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsImVtYWlsIjoiYWRtaW5AZXBhY2thZ2UtbGFiLmNvbSJ9XSwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTUwODA5WiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAzLTA5VDIwOjMwOjAyLjQ5MTk5OFoiLCJpc19hbm9ueW1vdXMiOmZhbHNlfSwid2Vha19wYXNzd29yZCI6bnVsbH0; _ga_VBCB77P21T=GS2.1.s1773088194$o12$g1$t1773088203$j51$l0$h2095708072'
  ],
  [ 'x-forwarded-host', 'localhost:3003' ],
  [ 'x-forwarded-port', '3003' ],
  [ 'x-forwarded-proto', 'http' ],
  [ 'x-forwarded-for', '::1' ]
]
[RBAC] Middleware headers found: {
  hasUserId: false,
  hasUserRole: false,
  hasUserStatus: false,
  userId: null,
  userRole: null,
  userStatus: null
}
[RBAC] Middleware headers incomplete, falling back to cookie auth
[RBAC] Supabase cookies found: [ { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true } ]
[RBAC] Creating Supabase server client...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] Calling supabase.auth.getUser()...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[DashboardContent] START: Rendering dashboard content
[DashboardContent] Calling requireAuth...
[requireAuth] START: Authentication check initiated
[requireAuth] Importing getRBACContext...
[requireAuth] Calling getRBACContext()...
[RBAC] getRBACContext() called
[RBAC] Environment: { NODE_ENV: 'development', NEXT_PHASE: undefined }
[RBAC] Call stack:     at getRBACContext (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__442d2343._.js:279:23)
    at requireAuth (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__911457f1._.js:948:29)
    at async DashboardContent (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__911457f1._.js:5090:16)
[RBAC] Checking middleware headers...
[RBAC] All available headers: [
  [ 'host', 'localhost:3003' ],
  [ 'connection', 'keep-alive' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'x-nextjs-request-id', 'bbe71c3f' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-nextjs-html-request-id', 'h6G83h3ZLrU9iLIXP1ukB' ],
  [ 'accept', '*/*' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'referer', 'http://localhost:3003/auth/signin' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=762; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TURreE9EQXlMQ0pwWVhRaU9qRTNOek13T0RneU1ESXNJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpBNE9ESXdNbjFkTENKelpYTnphVzl1WDJsa0lqb2lPR1U0TTJVeVlqQXRObUV6TXkwMFlqY3lMVGxqWm1RdE9URTFOekJtWWpRMll6bGxJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLmlzclB4X0tlWmVvWlFhamRIcVF3WmFpSUVYSm5kX1J3NVV6dG9kYnQyRm9UeXRXUk1JLVJTRzg5WV9mSHlRMW1KY05xMXNJZDMwTEwxUjFEZlNpa0RRIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMwOTE4MDIsInJlZnJlc2hfdG9rZW4iOiJ1bHByZGloaXAyMmIiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTA5VDIwOjMwOjAyLjQwMzc0NDI0WiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJBZG1pbiBVc2VyIn0sImlkZW50aXRpZXMiOlt7ImlkZW50aXR5X2lkIjoiN2ZmMTUzOTgtMWE4Zi00ZTQzLTkwYTEtNzZlZWI5ODVjMzhjIiwiaWQiOiI1NGZkN2IzMS1iODA1LTQzY2YtYjkyZS04OThkZGQwNjY4NzUiLCJ1c2VyX2lkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiaWRlbnRpdHlfZGF0YSI6eyJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1In0sInByb3ZpZGVyIjoiZW1haWwiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQxNVoiLCJjcmVhdGVkX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0ODFaIiwidXBkYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsImVtYWlsIjoiYWRtaW5AZXBhY2thZ2UtbGFiLmNvbSJ9XSwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTUwODA5WiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAzLTA5VDIwOjMwOjAyLjQ5MTk5OFoiLCJpc19hbm9ueW1vdXMiOmZhbHNlfSwid2Vha19wYXNzd29yZCI6bnVsbH0; _ga_VBCB77P21T=GS2.1.s1773088194$o12$g1$t1773088204$j50$l0$h2095708072'
  ],
  [ 'x-forwarded-host', 'localhost:3003' ],
  [ 'x-forwarded-port', '3003' ],
  [ 'x-forwarded-proto', 'http' ],
  [ 'x-forwarded-for', '::1' ]
]
[RBAC] Middleware headers found: {
  hasUserId: false,
  hasUserRole: false,
  hasUserStatus: false,
  userId: null,
  userRole: null,
  userStatus: null
}
[RBAC] Middleware headers incomplete, falling back to cookie auth
[RBAC] Supabase cookies found: [ { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true } ]
[RBAC] Creating Supabase server client...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] Calling supabase.auth.getUser()...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] User found from Supabase: 54fd7b31-b805-43cf-b92e-898ddd066875 admin@epackage-lab.com
[RBAC] Fetching profile from database...
[RBAC] getRBACContext() called
[RBAC] Environment: { NODE_ENV: 'development', NEXT_PHASE: undefined }
[RBAC] Call stack:     at getRBACContext (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\02_Homepage_Dev_02_epac_homepagever1_1_src_lib_rbac_rbac-helpers_ts_fcb20b10._.js:273:23)
    at getCurrentUserId (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\[root-of-the-server]__246ba720._.js:1245:35)
    at async GET (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\[root-of-the-server]__246ba720._.js:2342:24)
[RBAC] Checking middleware headers...
[RBAC] All available headers: [
  [ 'accept', '*/*' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [ 'connection', 'keep-alive' ],
  [ 'content-type', 'application/json' ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=762; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TURreE9EQXlMQ0pwWVhRaU9qRTNOek13T0RneU1ESXNJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpBNE9ESXdNbjFkTENKelpYTnphVzl1WDJsa0lqb2lPR1U0TTJVeVlqQXRObUV6TXkwMFlqY3lMVGxqWm1RdE9URTFOekJtWWpRMll6bGxJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLmlzclB4X0tlWmVvWlFhamRIcVF3WmFpSUVYSm5kX1J3NVV6dG9kYnQyRm9UeXRXUk1JLVJTRzg5WV9mSHlRMW1KY05xMXNJZDMwTEwxUjFEZlNpa0RRIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMwOTE4MDIsInJlZnJlc2hfdG9rZW4iOiJ1bHByZGloaXAyMmIiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTA5VDIwOjMwOjAyLjQwMzc0NDI0WiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJBZG1pbiBVc2VyIn0sImlkZW50aXRpZXMiOlt7ImlkZW50aXR5X2lkIjoiN2ZmMTUzOTgtMWE4Zi00ZTQzLTkwYTEtNzZlZWI5ODVjMzhjIiwiaWQiOiI1NGZkN2IzMS1iODA1LTQzY2YtYjkyZS04OThkZGQwNjY4NzUiLCJ1c2VyX2lkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiaWRlbnRpdHlfZGF0YSI6eyJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1In0sInByb3ZpZGVyIjoiZW1haWwiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQxNVoiLCJjcmVhdGVkX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0ODFaIiwidXBkYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsImVtYWlsIjoiYWRtaW5AZXBhY2thZ2UtbGFiLmNvbSJ9XSwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTUwODA5WiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAzLTA5VDIwOjMwOjAyLjQ5MTk5OFoiLCJpc19hbm9ueW1vdXMiOmZhbHNlfSwid2Vha19wYXNzd29yZCI6bnVsbH0; _ga_VBCB77P21T=GS2.1.s1773088194$o12$g1$t1773088204$j50$l0$h2095708072'
  ],
  [ 'host', 'localhost:3003' ],
  [ 'referer', 'http://localhost:3003/member/dashboard' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-forwarded-for', '::1' ],
  [ 'x-forwarded-host', 'localhost:3003' ],
  [ 'x-forwarded-port', '3003' ],
  [ 'x-forwarded-proto', 'http' ]
]
[RBAC] Middleware headers found: {
  hasUserId: false,
  hasUserRole: false,
  hasUserStatus: false,
  userId: null,
  userRole: null,
  userStatus: null
}
[RBAC] Middleware headers incomplete, falling back to cookie auth
[RBAC] Supabase cookies found: [ { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true } ]
[RBAC] Creating Supabase server client...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] Calling supabase.auth.getUser()...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] Profile found: ADMIN ACTIVE
[RBAC] Using default permissions for role: admin
[RBAC] User authenticated successfully: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[requireAuth] getRBACContext returned: CONTEXT {
  userId: '54fd7b31-b805-43cf-b92e-898ddd066875',
  role: 'admin',
  status: 'ACTIVE',
  permissions: [
    'user:read',         'user:write',
    'user:approve',      'user:delete',
    'order:read',        'order:create',
    'order:update',      'order:delete',
    'order:approve',     'quotation:read',
    'quotation:create',  'quotation:update',
    'quotation:delete',  'quotation:approve',
    'production:read',   'production:update',
    'production:manage', 'inventory:read',
    'inventory:update',  'inventory:adjust',
    'finance:read',      'finance:approve',
    'shipment:read',     'shipment:create',
    'shipment:update',   'contract:read',
    'contract:sign',     'contract:approve',
    'sample:read',       'sample:create',
    'sample:approve',    'settings:read',
    'settings:write',    'notification:read',
    'notification:send', 'report:read',
    'report:export'
  ],
  isDevMode: false
}
[requireAuth] Got user from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[RBAC] User found from Supabase: 54fd7b31-b805-43cf-b92e-898ddd066875 admin@epackage-lab.com
[RBAC] Fetching profile from database...
[RBAC] User found from Supabase: 54fd7b31-b805-43cf-b92e-898ddd066875 admin@epackage-lab.com
[RBAC] Fetching profile from database...
[DashboardContent] requireAuth SUCCESS: 54fd7b31-b805-43cf-b92e-898ddd066875
[DashboardContent] Fetching stats...
[RBAC] getRBACContext() called
[RBAC] Environment: { NODE_ENV: 'development', NEXT_PHASE: undefined }
[RBAC] Call stack:     at getRBACContext (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__442d2343._.js:279:23)
    at getCurrentUserId (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__911457f1._.js:1096:35)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
[RBAC] Checking middleware headers...
[RBAC] All available headers: [
  [ 'host', 'localhost:3003' ],
  [ 'connection', 'keep-alive' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'x-nextjs-request-id', '48a41403' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-nextjs-html-request-id', 'h6G83h3ZLrU9iLIXP1ukB' ],
  [ 'accept', '*/*' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'referer', 'http://localhost:3003/auth/signin' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=762; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TURreE9EQXlMQ0pwWVhRaU9qRTNOek13T0RneU1ESXNJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpBNE9ESXdNbjFkTENKelpYTnphVzl1WDJsa0lqb2lPR1U0TTJVeVlqQXRObUV6TXkwMFlqY3lMVGxqWm1RdE9URTFOekJtWWpRMll6bGxJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLmlzclB4X0tlWmVvWlFhamRIcVF3WmFpSUVYSm5kX1J3NVV6dG9kYnQyRm9UeXRXUk1JLVJTRzg5WV9mSHlRMW1KY05xMXNJZDMwTEwxUjFEZlNpa0RRIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMwOTE4MDIsInJlZnJlc2hfdG9rZW4iOiJ1bHByZGloaXAyMmIiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTA5VDIwOjMwOjAyLjQwMzc0NDI0WiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJBZG1pbiBVc2VyIn0sImlkZW50aXRpZXMiOlt7ImlkZW50aXR5X2lkIjoiN2ZmMTUzOTgtMWE4Zi00ZTQzLTkwYTEtNzZlZWI5ODVjMzhjIiwiaWQiOiI1NGZkN2IzMS1iODA1LTQzY2YtYjkyZS04OThkZGQwNjY4NzUiLCJ1c2VyX2lkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiaWRlbnRpdHlfZGF0YSI6eyJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1In0sInByb3ZpZGVyIjoiZW1haWwiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQxNVoiLCJjcmVhdGVkX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0ODFaIiwidXBkYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsImVtYWlsIjoiYWRtaW5AZXBhY2thZ2UtbGFiLmNvbSJ9XSwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTUwODA5WiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAzLTA5VDIwOjMwOjAyLjQ5MTk5OFoiLCJpc19hbm9ueW1vdXMiOmZhbHNlfSwid2Vha19wYXNzd29yZCI6bnVsbH0; _ga_VBCB77P21T=GS2.1.s1773088194$o12$g1$t1773088203$j51$l0$h2095708072'
  ],
  [ 'x-forwarded-host', 'localhost:3003' ],
  [ 'x-forwarded-port', '3003' ],
  [ 'x-forwarded-proto', 'http' ],
  [ 'x-forwarded-for', '::1' ]
]
[RBAC] Middleware headers found: {
  hasUserId: false,
  hasUserRole: false,
  hasUserStatus: false,
  userId: null,
  userRole: null,
  userStatus: null
}
[RBAC] Middleware headers incomplete, falling back to cookie auth
[RBAC] Supabase cookies found: [ { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true } ]
[RBAC] Creating Supabase server client...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] Calling supabase.auth.getUser()...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] User found from Supabase: 54fd7b31-b805-43cf-b92e-898ddd066875 admin@epackage-lab.com
[RBAC] Fetching profile from database...
[RBAC] Profile found: ADMIN ACTIVE
[RBAC] Using default permissions for role: admin
[RBAC] User authenticated successfully: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[getCurrentUserId] Server-side: Found user ID from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875
[RBAC] Profile found: ADMIN ACTIVE
[RBAC] Using default permissions for role: admin
[RBAC] User authenticated successfully: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[requireAuth] getRBACContext returned: CONTEXT {
  userId: '54fd7b31-b805-43cf-b92e-898ddd066875',
  role: 'admin',
  status: 'ACTIVE',
  permissions: [
    'user:read',         'user:write',
    'user:approve',      'user:delete',
    'order:read',        'order:create',
    'order:update',      'order:delete',
    'order:approve',     'quotation:read',
    'quotation:create',  'quotation:update',
    'quotation:delete',  'quotation:approve',
    'production:read',   'production:update',
    'production:manage', 'inventory:read',
    'inventory:update',  'inventory:adjust',
    'finance:read',      'finance:approve',
    'shipment:read',     'shipment:create',
    'shipment:update',   'contract:read',
    'contract:sign',     'contract:approve',
    'sample:read',       'sample:create',
    'sample:approve',    'settings:read',
    'settings:write',    'notification:read',
    'notification:send', 'report:read',
    'report:export'
  ],
  isDevMode: false
}
[requireAuth] Got user from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[RBAC] Profile found: ADMIN ACTIVE
[RBAC] Using default permissions for role: admin
[RBAC] User authenticated successfully: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[getCurrentUserId] Server-side: Found user ID from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875
[DashboardContent] requireAuth SUCCESS: 54fd7b31-b805-43cf-b92e-898ddd066875
[DashboardContent] Fetching stats...
[RBAC] getRBACContext() called
[RBAC] Environment: { NODE_ENV: 'development', NEXT_PHASE: undefined }
[RBAC] Call stack:     at getRBACContext (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__442d2343._.js:279:23)
    at getCurrentUserId (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__911457f1._.js:1096:35)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
[RBAC] Checking middleware headers...
[RBAC] All available headers: [
  [ 'host', 'localhost:3003' ],
  [ 'connection', 'keep-alive' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'x-nextjs-request-id', 'bbe71c3f' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-nextjs-html-request-id', 'h6G83h3ZLrU9iLIXP1ukB' ],
  [ 'accept', '*/*' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'referer', 'http://localhost:3003/auth/signin' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=762; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TURreE9EQXlMQ0pwWVhRaU9qRTNOek13T0RneU1ESXNJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpBNE9ESXdNbjFkTENKelpYTnphVzl1WDJsa0lqb2lPR1U0TTJVeVlqQXRObUV6TXkwMFlqY3lMVGxqWm1RdE9URTFOekJtWWpRMll6bGxJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLmlzclB4X0tlWmVvWlFhamRIcVF3WmFpSUVYSm5kX1J3NVV6dG9kYnQyRm9UeXRXUk1JLVJTRzg5WV9mSHlRMW1KY05xMXNJZDMwTEwxUjFEZlNpa0RRIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMwOTE4MDIsInJlZnJlc2hfdG9rZW4iOiJ1bHByZGloaXAyMmIiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTA5VDIwOjMwOjAyLjQwMzc0NDI0WiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJBZG1pbiBVc2VyIn0sImlkZW50aXRpZXMiOlt7ImlkZW50aXR5X2lkIjoiN2ZmMTUzOTgtMWE4Zi00ZTQzLTkwYTEtNzZlZWI5ODVjMzhjIiwiaWQiOiI1NGZkN2IzMS1iODA1LTQzY2YtYjkyZS04OThkZGQwNjY4NzUiLCJ1c2VyX2lkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiaWRlbnRpdHlfZGF0YSI6eyJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1In0sInByb3ZpZGVyIjoiZW1haWwiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQxNVoiLCJjcmVhdGVkX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0ODFaIiwidXBkYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsImVtYWlsIjoiYWRtaW5AZXBhY2thZ2UtbGFiLmNvbSJ9XSwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTUwODA5WiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAzLTA5VDIwOjMwOjAyLjQ5MTk5OFoiLCJpc19hbm9ueW1vdXMiOmZhbHNlfSwid2Vha19wYXNzd29yZCI6bnVsbH0; _ga_VBCB77P21T=GS2.1.s1773088194$o12$g1$t1773088204$j50$l0$h2095708072'
  ],
  [ 'x-forwarded-host', 'localhost:3003' ],
  [ 'x-forwarded-port', '3003' ],
  [ 'x-forwarded-proto', 'http' ],
  [ 'x-forwarded-for', '::1' ]
]
[RBAC] Middleware headers found: {
  hasUserId: false,
  hasUserRole: false,
  hasUserStatus: false,
  userId: null,
  userRole: null,
  userStatus: null
}
[RBAC] Middleware headers incomplete, falling back to cookie auth
[RBAC] Supabase cookies found: [ { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true } ]
[RBAC] Creating Supabase server client...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] Calling supabase.auth.getUser()...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] User found from Supabase: 54fd7b31-b805-43cf-b92e-898ddd066875 admin@epackage-lab.com
[RBAC] Fetching profile from database...
[RBAC] Profile found: ADMIN ACTIVE
[RBAC] Using default permissions for role: admin
[RBAC] User authenticated successfully: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[getCurrentUserId] Server-side: Found user ID from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/notifications?limit=50 200 in 2.3s (compile: 230ms, render: 2.1s)
 GET /member/dashboard 200 in 2.8s (compile: 4ms, render: 2.8s)
 GET /member/dashboard 200 in 4.4s (compile: 1480ms, render: 2.9s)
[DashboardContent] START: Rendering dashboard content
[DashboardContent] Calling requireAuth...
[requireAuth] START: Authentication check initiated
[requireAuth] Importing getRBACContext...
[requireAuth] Calling getRBACContext()...
[RBAC] getRBACContext() called
[RBAC] Environment: { NODE_ENV: 'development', NEXT_PHASE: undefined }
[RBAC] Call stack:     at getRBACContext (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__442d2343._.js:279:23)
    at requireAuth (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__911457f1._.js:948:29)
    at async DashboardContent (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__911457f1._.js:5090:16)
[RBAC] Checking middleware headers...
[RBAC] All available headers: [
  [ 'host', 'localhost:3003' ],
  [ 'connection', 'keep-alive' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'upgrade-insecure-requests', '1' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [
    'accept',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
  ],
  [ 'sec-fetch-site', 'same-origin' ],
  [ 'sec-fetch-mode', 'navigate' ],
  [ 'sec-fetch-user', '?1' ],
  [ 'sec-fetch-dest', 'document' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=762; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TURreE9EQXlMQ0pwWVhRaU9qRTNOek13T0RneU1ESXNJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpBNE9ESXdNbjFkTENKelpYTnphVzl1WDJsa0lqb2lPR1U0TTJVeVlqQXRObUV6TXkwMFlqY3lMVGxqWm1RdE9URTFOekJtWWpRMll6bGxJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLmlzclB4X0tlWmVvWlFhamRIcVF3WmFpSUVYSm5kX1J3NVV6dG9kYnQyRm9UeXRXUk1JLVJTRzg5WV9mSHlRMW1KY05xMXNJZDMwTEwxUjFEZlNpa0RRIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMwOTE4MDIsInJlZnJlc2hfdG9rZW4iOiJ1bHByZGloaXAyMmIiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTA5VDIwOjMwOjAyLjQwMzc0NDI0WiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJBZG1pbiBVc2VyIn0sImlkZW50aXRpZXMiOlt7ImlkZW50aXR5X2lkIjoiN2ZmMTUzOTgtMWE4Zi00ZTQzLTkwYTEtNzZlZWI5ODVjMzhjIiwiaWQiOiI1NGZkN2IzMS1iODA1LTQzY2YtYjkyZS04OThkZGQwNjY4NzUiLCJ1c2VyX2lkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiaWRlbnRpdHlfZGF0YSI6eyJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1In0sInByb3ZpZGVyIjoiZW1haWwiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQxNVoiLCJjcmVhdGVkX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0ODFaIiwidXBkYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsImVtYWlsIjoiYWRtaW5AZXBhY2thZ2UtbGFiLmNvbSJ9XSwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTUwODA5WiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAzLTA5VDIwOjMwOjAyLjQ5MTk5OFoiLCJpc19hbm9ueW1vdXMiOmZhbHNlfSwid2Vha19wYXNzd29yZCI6bnVsbH0; _ga_VBCB77P21T=GS2.1.s1773088194$o12$g1$t1773088206$j48$l0$h2095708072'
  ],
  [ 'x-forwarded-host', 'localhost:3003' ],
  [ 'x-forwarded-port', '3003' ],
  [ 'x-forwarded-proto', 'http' ],
  [ 'x-forwarded-for', '::1' ]
]
[RBAC] Middleware headers found: {
  hasUserId: false,
  hasUserRole: false,
  hasUserStatus: false,
  userId: null,
  userRole: null,
  userStatus: null
}
[RBAC] Middleware headers incomplete, falling back to cookie auth
[RBAC] Supabase cookies found: [ { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true } ]
[RBAC] Creating Supabase server client...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] Calling supabase.auth.getUser()...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] User found from Supabase: 54fd7b31-b805-43cf-b92e-898ddd066875 admin@epackage-lab.com
[RBAC] Fetching profile from database...
[DashboardContent] Stats fetched: {
  initialStats: {
    totalOrders: 6,
    pendingOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingQuotations: 24,
    samples: { total: 0, processing: 0 },
    inquiries: { total: 0, responded: 0 },
    period: 30
  },
  stats: {
    orders: { new: [], processing: [], total: 7 },
    quotations: { pending: [Array], total: 45 },
    samples: { pending: [], total: 0 },
    inquiries: { unread: [], total: 0 },
    announcements: [ [Object] ],
    contracts: { pending: [], total: 0, signed: 0 },
    notifications: []
  }
}
[DashboardContent] userName: 管理
[DashboardContent] About to render JSX
[RBAC] Profile found: ADMIN ACTIVE
[RBAC] Using default permissions for role: admin
[RBAC] User authenticated successfully: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[requireAuth] getRBACContext returned: CONTEXT {
  userId: '54fd7b31-b805-43cf-b92e-898ddd066875',
  role: 'admin',
  status: 'ACTIVE',
  permissions: [
    'user:read',         'user:write',
    'user:approve',      'user:delete',
    'order:read',        'order:create',
    'order:update',      'order:delete',
    'order:approve',     'quotation:read',
    'quotation:create',  'quotation:update',
    'quotation:delete',  'quotation:approve',
    'production:read',   'production:update',
    'production:manage', 'inventory:read',
    'inventory:update',  'inventory:adjust',
    'finance:read',      'finance:approve',
    'shipment:read',     'shipment:create',
    'shipment:update',   'contract:read',
    'contract:sign',     'contract:approve',
    'sample:read',       'sample:create',
    'sample:approve',    'settings:read',
    'settings:write',    'notification:read',
    'notification:send', 'report:read',
    'report:export'
  ],
  isDevMode: false
}
[requireAuth] Got user from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[DashboardContent] requireAuth SUCCESS: 54fd7b31-b805-43cf-b92e-898ddd066875
[DashboardContent] Fetching stats...
[RBAC] getRBACContext() called
[RBAC] Environment: { NODE_ENV: 'development', NEXT_PHASE: undefined }
[RBAC] Call stack:     at getRBACContext (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__442d2343._.js:279:23)
    at getCurrentUserId (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__911457f1._.js:1096:35)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
[RBAC] Checking middleware headers...
[RBAC] All available headers: [
  [ 'host', 'localhost:3003' ],
  [ 'connection', 'keep-alive' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'upgrade-insecure-requests', '1' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [
    'accept',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
  ],
  [ 'sec-fetch-site', 'same-origin' ],
  [ 'sec-fetch-mode', 'navigate' ],
  [ 'sec-fetch-user', '?1' ],
  [ 'sec-fetch-dest', 'document' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=762; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TURreE9EQXlMQ0pwWVhRaU9qRTNOek13T0RneU1ESXNJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpBNE9ESXdNbjFkTENKelpYTnphVzl1WDJsa0lqb2lPR1U0TTJVeVlqQXRObUV6TXkwMFlqY3lMVGxqWm1RdE9URTFOekJtWWpRMll6bGxJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLmlzclB4X0tlWmVvWlFhamRIcVF3WmFpSUVYSm5kX1J3NVV6dG9kYnQyRm9UeXRXUk1JLVJTRzg5WV9mSHlRMW1KY05xMXNJZDMwTEwxUjFEZlNpa0RRIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMwOTE4MDIsInJlZnJlc2hfdG9rZW4iOiJ1bHByZGloaXAyMmIiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTA5VDIwOjMwOjAyLjQwMzc0NDI0WiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJBZG1pbiBVc2VyIn0sImlkZW50aXRpZXMiOlt7ImlkZW50aXR5X2lkIjoiN2ZmMTUzOTgtMWE4Zi00ZTQzLTkwYTEtNzZlZWI5ODVjMzhjIiwiaWQiOiI1NGZkN2IzMS1iODA1LTQzY2YtYjkyZS04OThkZGQwNjY4NzUiLCJ1c2VyX2lkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiaWRlbnRpdHlfZGF0YSI6eyJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1In0sInByb3ZpZGVyIjoiZW1haWwiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQxNVoiLCJjcmVhdGVkX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0ODFaIiwidXBkYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsImVtYWlsIjoiYWRtaW5AZXBhY2thZ2UtbGFiLmNvbSJ9XSwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTUwODA5WiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAzLTA5VDIwOjMwOjAyLjQ5MTk5OFoiLCJpc19hbm9ueW1vdXMiOmZhbHNlfSwid2Vha19wYXNzd29yZCI6bnVsbH0; _ga_VBCB77P21T=GS2.1.s1773088194$o12$g1$t1773088206$j48$l0$h2095708072'
  ],
  [ 'x-forwarded-host', 'localhost:3003' ],
  [ 'x-forwarded-port', '3003' ],
  [ 'x-forwarded-proto', 'http' ],
  [ 'x-forwarded-for', '::1' ]
]
[RBAC] Middleware headers found: {
  hasUserId: false,
  hasUserRole: false,
  hasUserStatus: false,
  userId: null,
  userRole: null,
  userStatus: null
}
[RBAC] Middleware headers incomplete, falling back to cookie auth
[RBAC] Supabase cookies found: [ { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true } ]
[RBAC] Creating Supabase server client...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] Calling supabase.auth.getUser()...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] User found from Supabase: 54fd7b31-b805-43cf-b92e-898ddd066875 admin@epackage-lab.com
[RBAC] Fetching profile from database...
[RBAC] Profile found: ADMIN ACTIVE
[RBAC] Using default permissions for role: admin
[RBAC] User authenticated successfully: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[getCurrentUserId] Server-side: Found user ID from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875
[DashboardContent] Stats fetched: {
  initialStats: {
    totalOrders: 6,
    pendingOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingQuotations: 24,
    samples: { total: 0, processing: 0 },
    inquiries: { total: 0, responded: 0 },
    period: 30
  },
  stats: {
    orders: { new: [], processing: [], total: 7 },
    quotations: { pending: [Array], total: 45 },
    samples: { pending: [], total: 0 },
    inquiries: { unread: [], total: 0 },
    announcements: [ [Object] ],
    contracts: { pending: [], total: 0, signed: 0 },
    notifications: []
  }
}
[DashboardContent] userName: 管理
[DashboardContent] About to render JSX
 GET /api/health 200 in 9ms (compile: 2ms, render: 7ms)
 GET /api/health 200 in 6ms (compile: 1553µs, render: 5ms)
[DashboardContent] Stats fetched: {
  initialStats: {
    totalOrders: 5,
    pendingOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingQuotations: 8,
    samples: { total: 0, processing: 0 },
    inquiries: { total: 0, responded: 0 },
    period: 30
  },
  stats: {
    orders: { new: [], processing: [], total: 7 },
    quotations: { pending: [Array], total: 45 },
    samples: { pending: [], total: 0 },
    inquiries: { unread: [], total: 0 },
    announcements: [ [Object] ],
    contracts: { pending: [], total: 0, signed: 0 },
    notifications: []
  }
}
[DashboardContent] userName: 管理
[DashboardContent] About to render JSX
 GET /member/dashboard 200 in 3.6s (compile: 2ms, render: 3.6s)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 462ms (compile: 1919µs, render: 460ms)
[requireAuth] START: Authentication check initiated
[requireAuth] Importing getRBACContext...
[requireAuth] Calling getRBACContext()...
[RBAC] getRBACContext() called
[RBAC] Environment: { NODE_ENV: 'development', NEXT_PHASE: undefined }
[RBAC] Call stack:     at getRBACContext (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\02_Homepage_Dev_02_epac_homepagever1_1_src_lib_rbac_rbac-helpers_ts_fcb20b10._.js:273:23)
    at requireAuth (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\[root-of-the-server]__246ba720._.js:1097:29)
    at async GET (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\[root-of-the-server]__e9148c33._.js:2195:22)
[RBAC] Checking middleware headers...
[RBAC] All available headers: [
  [ 'accept', '*/*' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [ 'connection', 'keep-alive' ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=762; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TURreE9EQXlMQ0pwWVhRaU9qRTNOek13T0RneU1ESXNJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpBNE9ESXdNbjFkTENKelpYTnphVzl1WDJsa0lqb2lPR1U0TTJVeVlqQXRObUV6TXkwMFlqY3lMVGxqWm1RdE9URTFOekJtWWpRMll6bGxJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLmlzclB4X0tlWmVvWlFhamRIcVF3WmFpSUVYSm5kX1J3NVV6dG9kYnQyRm9UeXRXUk1JLVJTRzg5WV9mSHlRMW1KY05xMXNJZDMwTEwxUjFEZlNpa0RRIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMwOTE4MDIsInJlZnJlc2hfdG9rZW4iOiJ1bHByZGloaXAyMmIiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTA5VDIwOjMwOjAyLjQwMzc0NDI0WiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJBZG1pbiBVc2VyIn0sImlkZW50aXRpZXMiOlt7ImlkZW50aXR5X2lkIjoiN2ZmMTUzOTgtMWE4Zi00ZTQzLTkwYTEtNzZlZWI5ODVjMzhjIiwiaWQiOiI1NGZkN2IzMS1iODA1LTQzY2YtYjkyZS04OThkZGQwNjY4NzUiLCJ1c2VyX2lkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiaWRlbnRpdHlfZGF0YSI6eyJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1In0sInByb3ZpZGVyIjoiZW1haWwiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQxNVoiLCJjcmVhdGVkX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0ODFaIiwidXBkYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsImVtYWlsIjoiYWRtaW5AZXBhY2thZ2UtbGFiLmNvbSJ9XSwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTUwODA5WiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAzLTA5VDIwOjMwOjAyLjQ5MTk5OFoiLCJpc19hbm9ueW1vdXMiOmZhbHNlfSwid2Vha19wYXNzd29yZCI6bnVsbH0; _ga_VBCB77P21T=GS2.1.s1773088194$o12$g1$t1773088209$j45$l0$h2095708072'
  ],
  [ 'host', 'localhost:3003' ],
  [ 'referer', 'http://localhost:3003/member/dashboard' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-forwarded-for', '::1' ],
  [ 'x-forwarded-host', 'localhost:3003' ],
  [ 'x-forwarded-port', '3003' ],
  [ 'x-forwarded-proto', 'http' ]
]
[RBAC] Middleware headers found: {
  hasUserId: false,
  hasUserRole: false,
  hasUserStatus: false,
  userId: null,
  userRole: null,
  userStatus: null
}
[RBAC] Middleware headers incomplete, falling back to cookie auth
[RBAC] Supabase cookies found: [ { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true } ]
[RBAC] Creating Supabase server client...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] Calling supabase.auth.getUser()...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] User found from Supabase: 54fd7b31-b805-43cf-b92e-898ddd066875 admin@epackage-lab.com
[RBAC] Fetching profile from database...
[RBAC] Profile found: ADMIN ACTIVE
[RBAC] Using default permissions for role: admin
[RBAC] User authenticated successfully: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[requireAuth] getRBACContext returned: CONTEXT {
  userId: '54fd7b31-b805-43cf-b92e-898ddd066875',
  role: 'admin',
  status: 'ACTIVE',
  permissions: [
    'user:read',         'user:write',
    'user:approve',      'user:delete',
    'order:read',        'order:create',
    'order:update',      'order:delete',
    'order:approve',     'quotation:read',
    'quotation:create',  'quotation:update',
    'quotation:delete',  'quotation:approve',
    'production:read',   'production:update',
    'production:manage', 'inventory:read',
    'inventory:update',  'inventory:adjust',
    'finance:read',      'finance:approve',
    'shipment:read',     'shipment:create',
    'shipment:update',   'contract:read',
    'contract:sign',     'contract:approve',
    'sample:read',       'sample:create',
    'sample:approve',    'settings:read',
    'settings:write',    'notification:read',
    'notification:send', 'report:read',
    'report:export'
  ],
  isDevMode: false
}
[requireAuth] Got user from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
 GET /api/member/dashboard/unified-stats?period=30&userId=54fd7b31-b805-43cf-b92e-898ddd066875 200 in 1628ms (compile: 129ms, render: 1499ms)
 GET /auth/signin 200 in 25ms (compile: 3ms, render: 22ms)
[Signin API] Received signin request
[Signin API] Login attempt for: admin@epackage-lab.com
[Signin API] Creating SSR client...
[Signin API] Attempting signInWithPassword...
[supabase-ssr] setAll called with 1 cookies
[supabase-ssr] Setting cookie: sb-ijlgpzjdfipzmjvawofp-auth-token value length: 2647
[supabase-ssr] Set-Cookie header set for: sb-ijlgpzjdfipzmjvawofp-auth-token
[supabase-ssr] Final response has 1 Set-Cookie headers
[Signin API] Login successful, user ID: 54fd7b31-b805-43cf-b92e-898ddd066875
[Signin API] Redirecting to: /admin/dashboard (role: ADMIN )
[Signin API] Set-Cookie headers from initialResponse: 1
[Signin API] Copied 1 Set-Cookie headers to finalResponse
[Signin API] Login successful, cookies set for: admin@epackage-lab.com
 POST /api/auth/signin/ 200 in 647ms (compile: 1855µs, render: 646ms)
[DashboardContent] START: Rendering dashboard content
[DashboardContent] Calling requireAuth...
[requireAuth] START: Authentication check initiated
[requireAuth] Importing getRBACContext...
[requireAuth] Calling getRBACContext()...
[RBAC] getRBACContext() called
[RBAC] Environment: { NODE_ENV: 'development', NEXT_PHASE: undefined }
[RBAC] Call stack:     at getRBACContext (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__442d2343._.js:279:23)
    at requireAuth (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__911457f1._.js:948:29)
    at async DashboardContent (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__911457f1._.js:5090:16)
[RBAC] Checking middleware headers...
[RBAC] All available headers: [
  [ 'host', 'localhost:3003' ],
  [ 'connection', 'keep-alive' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'x-nextjs-request-id', '73447c32' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-nextjs-html-request-id', 'yNCvybMZAOhawak4bwWuH' ],
  [ 'accept', '*/*' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'referer', 'http://localhost:3003/auth/signin' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=762; _ga_VBCB77P21T=GS2.1.s1773088194$o12$g1$t1773088276$j60$l0$h2095708072; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TURreE9EYzRMQ0pwWVhRaU9qRTNOek13T0RneU56Z3NJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpBNE9ESTNPSDFkTENKelpYTnphVzl1WDJsa0lqb2laREF5WW1GallXUXRPVGN5T0MwMFpqa3pMVGcyWW1FdE0yVXdNREl4WldJMFltSmhJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLjBhSl9OTnlLQmZpaDZuenllVVA5WUNfemh0bk83SVprVGxFaXJJQ3lUanlSUGRPS2VMTHRpMEo0YklxN2o2VFNlSENqSmctcWZyRG5DOG5aTTdvWmpRIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMwOTE4NzgsInJlZnJlc2hfdG9rZW4iOiJkNzR3dXBwbHBrNjQiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTA5VDIwOjMxOjE4LjY2OTAwMDcyN1oiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiQWRtaW4gVXNlciJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6IjdmZjE1Mzk4LTFhOGYtNGU0My05MGExLTc2ZWViOTg1YzM4YyIsImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwidXNlcl9pZCI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSIsImlkZW50aXR5X2RhdGEiOnsiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSJ9LCJwcm92aWRlciI6ImVtYWlsIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0MTVaIiwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQ4MVoiLCJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20ifV0sImNyZWF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1MDgwOVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wMy0wOVQyMDozMToxOC43MzAxODdaIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0sIndlYWtfcGFzc3dvcmQiOm51bGx9'
  ],
  [ 'x-forwarded-host', 'localhost:3003' ],
  [ 'x-forwarded-port', '3003' ],
  [ 'x-forwarded-proto', 'http' ],
  [ 'x-forwarded-for', '::1' ]
]
[RBAC] Middleware headers found: {
  hasUserId: false,
  hasUserRole: false,
  hasUserStatus: false,
  userId: null,
  userRole: null,
  userStatus: null
}
[RBAC] Middleware headers incomplete, falling back to cookie auth
[RBAC] Supabase cookies found: [ { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true } ]
[RBAC] Creating Supabase server client...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] Calling supabase.auth.getUser()...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[DashboardContent] START: Rendering dashboard content
[DashboardContent] Calling requireAuth...
[requireAuth] START: Authentication check initiated
[requireAuth] Importing getRBACContext...
[requireAuth] Calling getRBACContext()...
[RBAC] getRBACContext() called
[RBAC] Environment: { NODE_ENV: 'development', NEXT_PHASE: undefined }
[RBAC] Call stack:     at getRBACContext (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__442d2343._.js:279:23)
    at requireAuth (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__911457f1._.js:948:29)
    at async DashboardContent (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__911457f1._.js:5090:16)
[RBAC] Checking middleware headers...
[RBAC] All available headers: [
  [ 'host', 'localhost:3003' ],
  [ 'connection', 'keep-alive' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'x-nextjs-request-id', 'b75f3118' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-nextjs-html-request-id', 'yNCvybMZAOhawak4bwWuH' ],
  [ 'accept', '*/*' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'referer', 'http://localhost:3003/auth/signin' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=762; _ga_VBCB77P21T=GS2.1.s1773088194$o12$g1$t1773088276$j60$l0$h2095708072; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TURreE9EYzRMQ0pwWVhRaU9qRTNOek13T0RneU56Z3NJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpBNE9ESTNPSDFkTENKelpYTnphVzl1WDJsa0lqb2laREF5WW1GallXUXRPVGN5T0MwMFpqa3pMVGcyWW1FdE0yVXdNREl4WldJMFltSmhJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLjBhSl9OTnlLQmZpaDZuenllVVA5WUNfemh0bk83SVprVGxFaXJJQ3lUanlSUGRPS2VMTHRpMEo0YklxN2o2VFNlSENqSmctcWZyRG5DOG5aTTdvWmpRIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMwOTE4NzgsInJlZnJlc2hfdG9rZW4iOiJkNzR3dXBwbHBrNjQiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTA5VDIwOjMxOjE4LjY2OTAwMDcyN1oiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiQWRtaW4gVXNlciJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6IjdmZjE1Mzk4LTFhOGYtNGU0My05MGExLTc2ZWViOTg1YzM4YyIsImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwidXNlcl9pZCI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSIsImlkZW50aXR5X2RhdGEiOnsiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSJ9LCJwcm92aWRlciI6ImVtYWlsIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0MTVaIiwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQ4MVoiLCJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20ifV0sImNyZWF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1MDgwOVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wMy0wOVQyMDozMToxOC43MzAxODdaIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0sIndlYWtfcGFzc3dvcmQiOm51bGx9'
  ],
  [ 'x-forwarded-host', 'localhost:3003' ],
  [ 'x-forwarded-port', '3003' ],
  [ 'x-forwarded-proto', 'http' ],
  [ 'x-forwarded-for', '::1' ]
]
[RBAC] Middleware headers found: {
  hasUserId: false,
  hasUserRole: false,
  hasUserStatus: false,
  userId: null,
  userRole: null,
  userStatus: null
}
[RBAC] Middleware headers incomplete, falling back to cookie auth
[RBAC] Supabase cookies found: [ { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true } ]
[RBAC] Creating Supabase server client...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] Calling supabase.auth.getUser()...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getRBACContext() called
[RBAC] Environment: { NODE_ENV: 'development', NEXT_PHASE: undefined }
[RBAC] Call stack:     at getRBACContext (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\02_Homepage_Dev_02_epac_homepagever1_1_src_lib_rbac_rbac-helpers_ts_fcb20b10._.js:273:23)
    at getCurrentUserId (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\[root-of-the-server]__246ba720._.js:1245:35)
    at async GET (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\[root-of-the-server]__246ba720._.js:2342:24)
[RBAC] Checking middleware headers...
[RBAC] All available headers: [
  [ 'accept', '*/*' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [ 'connection', 'keep-alive' ],
  [ 'content-type', 'application/json' ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=762; _ga_VBCB77P21T=GS2.1.s1773088194$o12$g1$t1773088276$j60$l0$h2095708072; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TURreE9EYzRMQ0pwWVhRaU9qRTNOek13T0RneU56Z3NJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpBNE9ESTNPSDFkTENKelpYTnphVzl1WDJsa0lqb2laREF5WW1GallXUXRPVGN5T0MwMFpqa3pMVGcyWW1FdE0yVXdNREl4WldJMFltSmhJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLjBhSl9OTnlLQmZpaDZuenllVVA5WUNfemh0bk83SVprVGxFaXJJQ3lUanlSUGRPS2VMTHRpMEo0YklxN2o2VFNlSENqSmctcWZyRG5DOG5aTTdvWmpRIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMwOTE4NzgsInJlZnJlc2hfdG9rZW4iOiJkNzR3dXBwbHBrNjQiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTA5VDIwOjMxOjE4LjY2OTAwMDcyN1oiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiQWRtaW4gVXNlciJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6IjdmZjE1Mzk4LTFhOGYtNGU0My05MGExLTc2ZWViOTg1YzM4YyIsImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwidXNlcl9pZCI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSIsImlkZW50aXR5X2RhdGEiOnsiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSJ9LCJwcm92aWRlciI6ImVtYWlsIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0MTVaIiwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQ4MVoiLCJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20ifV0sImNyZWF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1MDgwOVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wMy0wOVQyMDozMToxOC43MzAxODdaIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0sIndlYWtfcGFzc3dvcmQiOm51bGx9'
  ],
  [ 'host', 'localhost:3003' ],
  [ 'referer', 'http://localhost:3003/member/dashboard' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-forwarded-for', '::1' ],
  [ 'x-forwarded-host', 'localhost:3003' ],
  [ 'x-forwarded-port', '3003' ],
  [ 'x-forwarded-proto', 'http' ]
]
[RBAC] Middleware headers found: {
  hasUserId: false,
  hasUserRole: false,
  hasUserStatus: false,
  userId: null,
  userRole: null,
  userStatus: null
}
[RBAC] Middleware headers incomplete, falling back to cookie auth
[RBAC] Supabase cookies found: [ { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true } ]
[RBAC] Creating Supabase server client...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] Calling supabase.auth.getUser()...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] User found from Supabase: 54fd7b31-b805-43cf-b92e-898ddd066875 admin@epackage-lab.com
[RBAC] Fetching profile from database...
[RBAC] User found from Supabase: 54fd7b31-b805-43cf-b92e-898ddd066875 admin@epackage-lab.com
[RBAC] Fetching profile from database...
[RBAC] User found from Supabase: 54fd7b31-b805-43cf-b92e-898ddd066875 admin@epackage-lab.com
[RBAC] Fetching profile from database...
[RBAC] Profile found: ADMIN ACTIVE
[RBAC] Using default permissions for role: admin
[RBAC] User authenticated successfully: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[requireAuth] getRBACContext returned: CONTEXT {
  userId: '54fd7b31-b805-43cf-b92e-898ddd066875',
  role: 'admin',
  status: 'ACTIVE',
  permissions: [
    'user:read',         'user:write',
    'user:approve',      'user:delete',
    'order:read',        'order:create',
    'order:update',      'order:delete',
    'order:approve',     'quotation:read',
    'quotation:create',  'quotation:update',
    'quotation:delete',  'quotation:approve',
    'production:read',   'production:update',
    'production:manage', 'inventory:read',
    'inventory:update',  'inventory:adjust',
    'finance:read',      'finance:approve',
    'shipment:read',     'shipment:create',
    'shipment:update',   'contract:read',
    'contract:sign',     'contract:approve',
    'sample:read',       'sample:create',
    'sample:approve',    'settings:read',
    'settings:write',    'notification:read',
    'notification:send', 'report:read',
    'report:export'
  ],
  isDevMode: false
}
[requireAuth] Got user from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[RBAC] Profile found: ADMIN ACTIVE
[RBAC] Using default permissions for role: admin
[RBAC] User authenticated successfully: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[requireAuth] getRBACContext returned: CONTEXT {
  userId: '54fd7b31-b805-43cf-b92e-898ddd066875',
  role: 'admin',
  status: 'ACTIVE',
  permissions: [
    'user:read',         'user:write',
    'user:approve',      'user:delete',
    'order:read',        'order:create',
    'order:update',      'order:delete',
    'order:approve',     'quotation:read',
    'quotation:create',  'quotation:update',
    'quotation:delete',  'quotation:approve',
    'production:read',   'production:update',
    'production:manage', 'inventory:read',
    'inventory:update',  'inventory:adjust',
    'finance:read',      'finance:approve',
    'shipment:read',     'shipment:create',
    'shipment:update',   'contract:read',
    'contract:sign',     'contract:approve',
    'sample:read',       'sample:create',
    'sample:approve',    'settings:read',
    'settings:write',    'notification:read',
    'notification:send', 'report:read',
    'report:export'
  ],
  isDevMode: false
}
[requireAuth] Got user from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[RBAC] Profile found: ADMIN ACTIVE
[RBAC] Using default permissions for role: admin
[RBAC] User authenticated successfully: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[getCurrentUserId] Server-side: Found user ID from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875
[DashboardContent] requireAuth SUCCESS: 54fd7b31-b805-43cf-b92e-898ddd066875
[DashboardContent] Fetching stats...
[RBAC] getRBACContext() called
[RBAC] Environment: { NODE_ENV: 'development', NEXT_PHASE: undefined }
[RBAC] Call stack:     at getRBACContext (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__442d2343._.js:279:23)
    at getCurrentUserId (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__911457f1._.js:1096:35)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
[RBAC] Checking middleware headers...
[RBAC] All available headers: [
  [ 'host', 'localhost:3003' ],
  [ 'connection', 'keep-alive' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'x-nextjs-request-id', '73447c32' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-nextjs-html-request-id', 'yNCvybMZAOhawak4bwWuH' ],
  [ 'accept', '*/*' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'referer', 'http://localhost:3003/auth/signin' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=762; _ga_VBCB77P21T=GS2.1.s1773088194$o12$g1$t1773088276$j60$l0$h2095708072; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TURreE9EYzRMQ0pwWVhRaU9qRTNOek13T0RneU56Z3NJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpBNE9ESTNPSDFkTENKelpYTnphVzl1WDJsa0lqb2laREF5WW1GallXUXRPVGN5T0MwMFpqa3pMVGcyWW1FdE0yVXdNREl4WldJMFltSmhJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLjBhSl9OTnlLQmZpaDZuenllVVA5WUNfemh0bk83SVprVGxFaXJJQ3lUanlSUGRPS2VMTHRpMEo0YklxN2o2VFNlSENqSmctcWZyRG5DOG5aTTdvWmpRIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMwOTE4NzgsInJlZnJlc2hfdG9rZW4iOiJkNzR3dXBwbHBrNjQiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTA5VDIwOjMxOjE4LjY2OTAwMDcyN1oiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiQWRtaW4gVXNlciJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6IjdmZjE1Mzk4LTFhOGYtNGU0My05MGExLTc2ZWViOTg1YzM4YyIsImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwidXNlcl9pZCI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSIsImlkZW50aXR5X2RhdGEiOnsiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSJ9LCJwcm92aWRlciI6ImVtYWlsIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0MTVaIiwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQ4MVoiLCJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20ifV0sImNyZWF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1MDgwOVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wMy0wOVQyMDozMToxOC43MzAxODdaIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0sIndlYWtfcGFzc3dvcmQiOm51bGx9'
  ],
  [ 'x-forwarded-host', 'localhost:3003' ],
  [ 'x-forwarded-port', '3003' ],
  [ 'x-forwarded-proto', 'http' ],
  [ 'x-forwarded-for', '::1' ]
]
[RBAC] Middleware headers found: {
  hasUserId: false,
  hasUserRole: false,
  hasUserStatus: false,
  userId: null,
  userRole: null,
  userStatus: null
}
[RBAC] Middleware headers incomplete, falling back to cookie auth
[RBAC] Supabase cookies found: [ { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true } ]
[RBAC] Creating Supabase server client...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] Calling supabase.auth.getUser()...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] User found from Supabase: 54fd7b31-b805-43cf-b92e-898ddd066875 admin@epackage-lab.com
[RBAC] Fetching profile from database...
[RBAC] Profile found: ADMIN ACTIVE
[RBAC] Using default permissions for role: admin
[RBAC] User authenticated successfully: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[getCurrentUserId] Server-side: Found user ID from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875
[DashboardContent] requireAuth SUCCESS: 54fd7b31-b805-43cf-b92e-898ddd066875
[DashboardContent] Fetching stats...
[RBAC] getRBACContext() called
[RBAC] Environment: { NODE_ENV: 'development', NEXT_PHASE: undefined }
[RBAC] Call stack:     at getRBACContext (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__442d2343._.js:279:23)
    at getCurrentUserId (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__911457f1._.js:1096:35)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
[RBAC] Checking middleware headers...
[RBAC] All available headers: [
  [ 'host', 'localhost:3003' ],
  [ 'connection', 'keep-alive' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'x-nextjs-request-id', 'b75f3118' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-nextjs-html-request-id', 'yNCvybMZAOhawak4bwWuH' ],
  [ 'accept', '*/*' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'referer', 'http://localhost:3003/auth/signin' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=762; _ga_VBCB77P21T=GS2.1.s1773088194$o12$g1$t1773088276$j60$l0$h2095708072; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TURreE9EYzRMQ0pwWVhRaU9qRTNOek13T0RneU56Z3NJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpBNE9ESTNPSDFkTENKelpYTnphVzl1WDJsa0lqb2laREF5WW1GallXUXRPVGN5T0MwMFpqa3pMVGcyWW1FdE0yVXdNREl4WldJMFltSmhJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLjBhSl9OTnlLQmZpaDZuenllVVA5WUNfemh0bk83SVprVGxFaXJJQ3lUanlSUGRPS2VMTHRpMEo0YklxN2o2VFNlSENqSmctcWZyRG5DOG5aTTdvWmpRIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMwOTE4NzgsInJlZnJlc2hfdG9rZW4iOiJkNzR3dXBwbHBrNjQiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTA5VDIwOjMxOjE4LjY2OTAwMDcyN1oiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiQWRtaW4gVXNlciJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6IjdmZjE1Mzk4LTFhOGYtNGU0My05MGExLTc2ZWViOTg1YzM4YyIsImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwidXNlcl9pZCI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSIsImlkZW50aXR5X2RhdGEiOnsiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSJ9LCJwcm92aWRlciI6ImVtYWlsIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0MTVaIiwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQ4MVoiLCJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20ifV0sImNyZWF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1MDgwOVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wMy0wOVQyMDozMToxOC43MzAxODdaIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0sIndlYWtfcGFzc3dvcmQiOm51bGx9'
  ],
  [ 'x-forwarded-host', 'localhost:3003' ],
  [ 'x-forwarded-port', '3003' ],
  [ 'x-forwarded-proto', 'http' ],
  [ 'x-forwarded-for', '::1' ]
]
[RBAC] Middleware headers found: {
  hasUserId: false,
  hasUserRole: false,
  hasUserStatus: false,
  userId: null,
  userRole: null,
  userStatus: null
}
[RBAC] Middleware headers incomplete, falling back to cookie auth
[RBAC] Supabase cookies found: [ { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true } ]
[RBAC] Creating Supabase server client...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] Calling supabase.auth.getUser()...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] User found from Supabase: 54fd7b31-b805-43cf-b92e-898ddd066875 admin@epackage-lab.com
[RBAC] Fetching profile from database...
[RBAC] Profile found: ADMIN ACTIVE
[RBAC] Using default permissions for role: admin
[RBAC] User authenticated successfully: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[getCurrentUserId] Server-side: Found user ID from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/notifications?limit=50 200 in 971ms (compile: 1887µs, render: 970ms)
[DashboardContent] Stats fetched: {
  initialStats: {
    totalOrders: 5,
    pendingOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingQuotations: 8,
    samples: { total: 0, processing: 0 },
    inquiries: { total: 0, responded: 0 },
    period: 30
  },
  stats: {
    orders: { new: [], processing: [], total: 7 },
    quotations: { pending: [Array], total: 45 },
    samples: { pending: [], total: 0 },
    inquiries: { unread: [], total: 0 },
    announcements: [ [Object] ],
    contracts: { pending: [], total: 0, signed: 0 },
    notifications: []
  }
}
[DashboardContent] userName: 管理
[DashboardContent] About to render JSX
 GET /member/dashboard 200 in 3.4s (compile: 2ms, render: 3.4s)
[requireAuth] START: Authentication check initiated
[requireAuth] Importing getRBACContext...
[requireAuth] Calling getRBACContext()...
[RBAC] getRBACContext() called
[RBAC] Environment: { NODE_ENV: 'development', NEXT_PHASE: undefined }
[RBAC] Call stack:     at getRBACContext (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\02_Homepage_Dev_02_epac_homepagever1_1_src_lib_rbac_rbac-helpers_ts_fcb20b10._.js:273:23)
    at requireAuth (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\[root-of-the-server]__246ba720._.js:1097:29)
    at async GET (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\[root-of-the-server]__e9148c33._.js:2195:22)
[RBAC] Checking middleware headers...
[RBAC] All available headers: [
  [ 'accept', '*/*' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [ 'connection', 'keep-alive' ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=762; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TURreE9EYzRMQ0pwWVhRaU9qRTNOek13T0RneU56Z3NJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpBNE9ESTNPSDFkTENKelpYTnphVzl1WDJsa0lqb2laREF5WW1GallXUXRPVGN5T0MwMFpqa3pMVGcyWW1FdE0yVXdNREl4WldJMFltSmhJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLjBhSl9OTnlLQmZpaDZuenllVVA5WUNfemh0bk83SVprVGxFaXJJQ3lUanlSUGRPS2VMTHRpMEo0YklxN2o2VFNlSENqSmctcWZyRG5DOG5aTTdvWmpRIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMwOTE4NzgsInJlZnJlc2hfdG9rZW4iOiJkNzR3dXBwbHBrNjQiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTA5VDIwOjMxOjE4LjY2OTAwMDcyN1oiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiQWRtaW4gVXNlciJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6IjdmZjE1Mzk4LTFhOGYtNGU0My05MGExLTc2ZWViOTg1YzM4YyIsImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwidXNlcl9pZCI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSIsImlkZW50aXR5X2RhdGEiOnsiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSJ9LCJwcm92aWRlciI6ImVtYWlsIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0MTVaIiwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQ4MVoiLCJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20ifV0sImNyZWF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1MDgwOVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wMy0wOVQyMDozMToxOC43MzAxODdaIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0sIndlYWtfcGFzc3dvcmQiOm51bGx9; _ga_VBCB77P21T=GS2.1.s1773088194$o12$g1$t1773088279$j57$l0$h2095708072'
  ],
  [ 'host', 'localhost:3003' ],
  [ 'referer', 'http://localhost:3003/member/dashboard' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-forwarded-for', '::1' ],
  [ 'x-forwarded-host', 'localhost:3003' ],
  [ 'x-forwarded-port', '3003' ],
  [ 'x-forwarded-proto', 'http' ]
]
[RBAC] Middleware headers found: {
  hasUserId: false,
  hasUserRole: false,
  hasUserStatus: false,
  userId: null,
  userRole: null,
  userStatus: null
}
[RBAC] Middleware headers incomplete, falling back to cookie auth
[DashboardContent] Stats fetched: {
  initialStats: {
    totalOrders: 5,
    pendingOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingQuotations: 8,
    samples: { total: 0, processing: 0 },
    inquiries: { total: 0, responded: 0 },
    period: 30
  },
  stats: {
    orders: { new: [], processing: [], total: 7 },
    quotations: { pending: [Array], total: 45 },
    samples: { pending: [], total: 0 },
    inquiries: { unread: [], total: 0 },
    announcements: [ [Object] ],
    contracts: { pending: [], total: 0, signed: 0 },
    notifications: []
  }
}
[DashboardContent] userName: 管理
[DashboardContent] About to render JSX
[RBAC] Supabase cookies found: [ { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true } ]
[RBAC] Creating Supabase server client...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] Calling supabase.auth.getUser()...
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[RBAC] getAll() called, found 5 cookies
[RBAC] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
 GET /member/dashboard 200 in 3.5s (compile: 1993µs, render: 3.5s)
[RBAC] User found from Supabase: 54fd7b31-b805-43cf-b92e-898ddd066875 admin@epackage-lab.com
[RBAC] Fetching profile from database...
[RBAC] Profile found: ADMIN ACTIVE
[RBAC] Using default permissions for role: admin
[RBAC] User authenticated successfully: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[requireAuth] getRBACContext returned: CONTEXT {
  userId: '54fd7b31-b805-43cf-b92e-898ddd066875',
  role: 'admin',
  status: 'ACTIVE',
  permissions: [
    'user:read',         'user:write',
    'user:approve',      'user:delete',
    'order:read',        'order:create',
    'order:update',      'order:delete',
    'order:approve',     'quotation:read',
    'quotation:create',  'quotation:update',
    'quotation:delete',  'quotation:approve',
    'production:read',   'production:update',
    'production:manage', 'inventory:read',
    'inventory:update',  'inventory:adjust',
    'finance:read',      'finance:approve',
    'shipment:read',     'shipment:create',
    'shipment:update',   'contract:read',
    'contract:sign',     'contract:approve',
    'sample:read',       'sample:create',
    'sample:approve',    'settings:read',
    'settings:write',    'notification:read',
    'notification:send', 'report:read',
    'report:export'
  ],
  isDevMode: false
}
[requireAuth] Got user from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
 GET /api/member/dashboard/unified-stats?period=30&userId=54fd7b31-b805-43cf-b92e-898ddd066875 200 in 693ms (compile: 1942µs, render: 691ms)
 GET /quote-simulator 200 in 16ms (compile: 2ms, render: 13ms)
 GET /api/comparison/save 200 in 5ms (compile: 1847µs, render: 3ms)
 GET /api/comparison/save 200 in 4ms (compile: 1447µs, render: 2ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 440ms (compile: 1926µs, render: 438ms)
 GET /api/pricing/settings 200 in 236ms (compile: 1576µs, render: 235ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 433ms (compile: 1645µs, render: 432ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 409ms (compile: 1387µs, render: 408ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 1053ms (compile: 1956µs, render: 1051ms)
 GET /quote-simulator 200 in 93ms (compile: 2ms, render: 91ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 524ms (compile: 2ms, render: 521ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 407ms (compile: 1502µs, render: 406ms)
 GET / 200 in 1161ms (compile: 1110ms, render: 51ms)
 GET /api/announcements 404 in 1023ms (compile: 867ms, render: 156ms)
 GET /api/announcements 404 in 77ms (compile: 6ms, render: 71ms)
 ✓ Compiled in 29ms
 GET /api/comparison/save 200 in 9ms (compile: 4ms, render: 5ms)
 GET /api/comparison/save 200 in 4ms (compile: 1929µs, render: 2ms)
 ✓ Compiled in 22ms
 ✓ Compiled in 20ms
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 237ms (compile: 3ms, render: 235ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 264ms (compile: 1431µs, render: 263ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 365ms (compile: 2ms, render: 362ms)
 ✓ Compiled in 30ms
 ✓ Compiled in 24ms
 ✓ Compiled in 21ms
 ✓ Compiled in 18ms
 ✓ Compiled in 21ms
 ✓ Compiled in 24ms
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 247ms (compile: 1810µs, render: 245ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 349ms (compile: 2ms, render: 347ms)
 ⚠ Found a change in next.config.ts. Restarting the server to apply the changes...
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
 ⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
 We detected multiple lockfiles and selected the directory of C:\Users\kanei\claudecode\package-lock.json as the root directory.
 To silence this warning, set `turbopack.root` in your Next.js config, or consider removing one of the lockfiles if it's not needed.
   See https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory for more information.
 Detected additional lockfiles: 
   * C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\pnpm-lock.yaml

   ▲ Next.js 16.0.11 (Turbopack)
   - Local:         http://localhost:3003
   - Network:       http://192.168.0.21:3003
   - Environments: .env.local, .env

 ✓ Starting...
 ⨯ Unable to acquire lock at C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\lock, is another instance of next dev running?
   Suggestion: If you intended to restart next dev, terminate the other process, and then try again.
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[?25h
