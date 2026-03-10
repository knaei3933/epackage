
> epackage-lab-web@0.1.0 dev
> next dev

[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
 ⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
 We detected multiple lockfiles and selected the directory of C:\Users\kanei\claudecode\package-lock.json as the root directory.
 To silence this warning, set `turbopack.root` in your Next.js config, or consider removing one of the lockfiles if it's not needed.
   See https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory for more information.
 Detected additional lockfiles: 
   * C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\pnpm-lock.yaml

   ▲ Next.js 16.0.11 (Turbopack)
   - Local:         http://localhost:3000
   - Network:       http://192.168.0.21:3000
   - Environments: .env.local, .env

 ✓ Starting...
 ✓ Ready in 1186ms
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
 GET /quote-simulator 200 in 5.3s (compile: 4.9s, render: 363ms)
[Session API] All cookies: [
  { name: '_gcl_au', hasValue: true },
  { name: '_ga', hasValue: true },
  { name: '__next_hmr_refresh_hash__', hasValue: true },
  { name: '_ga_VBCB77P21T', hasValue: true }
]
[Session API] Supabase cookies: []
[Session API] URL: http://localhost:3000/api/auth/current-user
[Session API] Referer: http://localhost:3000/quote-simulator
[Session API] getUser result: { hasUser: false, userId: undefined, error: 'Auth session missing!' }
[Session API] No valid user found Auth session missing!
 GET /api/auth/current-user 200 in 260ms (compile: 241ms, render: 19ms)
 GET /api/comparison/save 200 in 289ms (compile: 284ms, render: 4ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 896ms (compile: 96ms, render: 801ms)
[Config API] Fetching remote config...
 GET /api/health 200 in 90ms (compile: 81ms, render: 9ms)
 GET /api/pricing/settings 200 in 590ms (compile: 107ms, render: 483ms)
[Config API] Config fetched successfully
 GET /api/config 200 in 290ms (compile: 4ms, render: 287ms)
 GET /api/health 200 in 7ms (compile: 1992µs, render: 5ms)
Image with src "/images/main/main15.png" is using quality "95" which is not configured in images.qualities [75]. Please update your config to [75, 95].
Read more: https://nextjs.org/docs/messages/next-image-unconfigured-qualities
Image with src "/images/products/granola-standpouch-real.jpg" is using quality "95" which is not configured in images.qualities [75]. Please update your config to [75, 95].
Read more: https://nextjs.org/docs/messages/next-image-unconfigured-qualities
 GET / 200 in 1524ms (compile: 1266ms, render: 258ms)
[Session API] All cookies: [
  { name: '_ga', hasValue: true },
  { name: '_gcl_au', hasValue: true },
  { name: '__next_hmr_refresh_hash__', hasValue: true },
  { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true },
  { name: '_ga_VBCB77P21T', hasValue: true }
]
[Session API] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[Session API] URL: http://localhost:3000/api/auth/current-user
[Session API] Referer: http://localhost:3000/
[Config API] Fetching remote config...
[Session API] getUser result: {
  hasUser: true,
  userId: '54fd7b31-b805-43cf-b92e-898ddd066875',
  error: undefined
}
[Session API] NEXT_PUBLIC_SUPABASE_URL: https://ijlgpzjdfipzmjvawofp.supabase.co
[Session API] SUPABASE_SERVICE_ROLE_KEY exists: true
[Config API] Config fetched successfully
 GET /api/config 200 in 477ms (compile: 3ms, render: 474ms)
[Config API] Fetching remote config...
 GET /api/health 200 in 10ms (compile: 2ms, render: 8ms)
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
 GET /api/auth/current-user 200 in 799ms (compile: 2ms, render: 797ms)
[Config API] Config fetched successfully
 GET /api/config 200 in 300ms (compile: 3ms, render: 298ms)
 GET /api/health 200 in 8ms (compile: 1830µs, render: 6ms)
 GET /api/announcements 404 in 1013ms (compile: 927ms, render: 85ms)
 GET /quote-simulator 200 in 21ms (compile: 3ms, render: 18ms)
 GET /api/comparison/save 200 in 4ms (compile: 1795µs, render: 2ms)
 GET /api/comparison/save 200 in 4ms (compile: 1777µs, render: 3ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 675ms (compile: 106ms, render: 569ms)
 GET /api/pricing/settings 200 in 377ms (compile: 2ms, render: 375ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 767ms (compile: 3ms, render: 764ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 933ms (compile: 1947µs, render: 932ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 1013ms (compile: 1480µs, render: 1011ms)
 GET /api/pricing/settings 200 in 393ms (compile: 1566µs, render: 391ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 544ms (compile: 1538µs, render: 542ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 503ms (compile: 1662µs, render: 501ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 583ms (compile: 1778µs, render: 582ms)
 GET /api/pricing/settings 200 in 358ms (compile: 3ms, render: 355ms)
 GET /api/pricing/settings 200 in 395ms (compile: 7ms, render: 389ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 689ms (compile: 3ms, render: 686ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 520ms (compile: 2ms, render: 518ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 880ms (compile: 1959µs, render: 878ms)
 ✓ Compiled in 18ms
 GET /api/comparison/save 200 in 4ms (compile: 1470µs, render: 3ms)
 GET /api/comparison/save 200 in 4ms (compile: 1587µs, render: 3ms)
[supabase-ssr] setAll called with 1 cookies
[supabase-ssr] Setting cookie: sb-ijlgpzjdfipzmjvawofp-auth-token value length: 2611
[supabase-ssr] Set-Cookie header set for: sb-ijlgpzjdfipzmjvawofp-auth-token
[supabase-ssr] Final response has 1 Set-Cookie headers
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 1098ms (compile: 1786µs, render: 1096ms)
 ✓ Compiled in 17ms
 GET /api/comparison/save 200 in 5ms (compile: 2ms, render: 3ms)
 GET /api/comparison/save 200 in 4ms (compile: 1666µs, render: 3ms)
[supabase-ssr] setAll called with 1 cookies
[supabase-ssr] Setting cookie: sb-ijlgpzjdfipzmjvawofp-auth-token value length: 2611
[supabase-ssr] Set-Cookie header set for: sb-ijlgpzjdfipzmjvawofp-auth-token
[supabase-ssr] Final response has 1 Set-Cookie headers
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 721ms (compile: 1763µs, render: 719ms)
 ✓ Compiled in 17ms
 GET /api/comparison/save 200 in 5ms (compile: 2ms, render: 3ms)
 GET /api/comparison/save 200 in 4ms (compile: 1554µs, render: 2ms)
[supabase-ssr] setAll called with 1 cookies
[supabase-ssr] Setting cookie: sb-ijlgpzjdfipzmjvawofp-auth-token value length: 2611
[supabase-ssr] Set-Cookie header set for: sb-ijlgpzjdfipzmjvawofp-auth-token
[supabase-ssr] Final response has 1 Set-Cookie headers
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 753ms (compile: 1560µs, render: 751ms)
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
 GET /quote-simulator 200 in 447ms (compile: 255ms, render: 193ms)
 GET /quote-simulator 200 in 406ms (compile: 173ms, render: 233ms)
 GET /api/comparison/save 200 in 4ms (compile: 1748µs, render: 3ms)
 GET /api/comparison/save 200 in 4ms (compile: 1646µs, render: 2ms)
 ✓ Compiled in 17ms
 ✓ Compiled in 19ms
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
 GET /quote-simulator 200 in 310ms (compile: 81ms, render: 229ms)
 GET /api/comparison/save 200 in 7ms (compile: 3ms, render: 4ms)
[Session API] All cookies: []
[Session API] Supabase cookies: []
[Session API] URL: http://localhost:3000/api/auth/current-user
[Session API] Referer: http://localhost:3000/quote-simulator
[Session API] getUser result: { hasUser: false, userId: undefined, error: 'Auth session missing!' }
[Session API] No valid user found Auth session missing!
 GET /api/auth/current-user 200 in 8ms (compile: 2ms, render: 5ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 989ms (compile: 2ms, render: 986ms)
[Config API] Fetching remote config...
 GET /api/health 200 in 63ms (compile: 1484µs, render: 62ms)
 GET /api/pricing/settings 200 in 838ms (compile: 2ms, render: 836ms)
[Config API] Config fetched successfully
 GET /api/config 200 in 307ms (compile: 1712µs, render: 306ms)
 GET /api/health 200 in 7ms (compile: 1557µs, render: 5ms)
 GET /quote-simulator 200 in 124ms (compile: 64ms, render: 60ms)
 GET /quote-simulator 200 in 19ms (compile: 2ms, render: 17ms)
 GET /quote-simulator 200 in 19ms (compile: 2ms, render: 16ms)
 GET /api/comparison/save 200 in 6ms (compile: 3ms, render: 3ms)
[Session API] All cookies: [
  { name: '_ga', hasValue: true },
  { name: '_gcl_au', hasValue: true },
  { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true },
  { name: '_ga_VBCB77P21T', hasValue: true },
  { name: '__next_hmr_refresh_hash__', hasValue: true }
]
[Session API] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[Session API] URL: http://localhost:3000/api/auth/current-user
[Session API] Referer: http://localhost:3000/quote-simulator
[supabase-ssr] setAll called with 1 cookies
[supabase-ssr] Setting cookie: sb-ijlgpzjdfipzmjvawofp-auth-token value length: 2611
[supabase-ssr] Set-Cookie header set for: sb-ijlgpzjdfipzmjvawofp-auth-token
[supabase-ssr] Final response has 1 Set-Cookie headers
[Config API] Fetching remote config...
[Session API] getUser result: {
  hasUser: true,
  userId: '54fd7b31-b805-43cf-b92e-898ddd066875',
  error: undefined
}
[Session API] NEXT_PUBLIC_SUPABASE_URL: https://ijlgpzjdfipzmjvawofp.supabase.co
[Session API] SUPABASE_SERVICE_ROLE_KEY exists: true
[Config API] Config fetched successfully
 GET /api/config 200 in 243ms (compile: 1990µs, render: 241ms)
[Config API] Fetching remote config...
 GET /api/health 200 in 8ms (compile: 1664µs, render: 7ms)
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
 GET /api/auth/current-user 200 in 958ms (compile: 1640µs, render: 956ms)
[Config API] Config fetched successfully
 GET /api/config 200 in 225ms (compile: 1577µs, render: 223ms)
 GET /api/health 200 in 7ms (compile: 1748µs, render: 5ms)
[supabase-ssr] setAll called with 1 cookies
[supabase-ssr] Setting cookie: sb-ijlgpzjdfipzmjvawofp-auth-token value length: 2611
[supabase-ssr] Set-Cookie header set for: sb-ijlgpzjdfipzmjvawofp-auth-token
[supabase-ssr] Final response has 1 Set-Cookie headers
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 655ms (compile: 1951µs, render: 653ms)
 GET /api/pricing/settings 200 in 227ms (compile: 1494µs, render: 225ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 750ms (compile: 1737µs, render: 748ms)
 GET /quote-simulator 200 in 93ms (compile: 55ms, render: 38ms)
 GET /quote-simulator 200 in 27ms (compile: 3ms, render: 24ms)
 GET /quote-simulator 200 in 18ms (compile: 2ms, render: 16ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 795ms (compile: 2ms, render: 793ms)
[Signout] Found Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[Signout] Deleting cookie: sb-ijlgpzjdfipzmjvawofp-auth-token
[Signout] All cookies deleted, sending 2 Set-Cookie headers
 POST /api/auth/signout/ 200 in 449ms (compile: 444ms, render: 5ms)
 GET /auth/signin 200 in 742ms (compile: 700ms, render: 42ms)
 GET /auth/signin?session_expired=true 200 in 675ms (compile: 663ms, render: 13ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 601ms (compile: 1548µs, render: 600ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 802ms (compile: 1478µs, render: 800ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 938ms (compile: 1486µs, render: 937ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 897ms (compile: 1431µs, render: 895ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 567ms (compile: 1609µs, render: 565ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 572ms (compile: 1695µs, render: 570ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 1010ms (compile: 1946µs, render: 1008ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 1250ms (compile: 1656µs, render: 1249ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 577ms (compile: 1552µs, render: 575ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 910ms (compile: 1378µs, render: 909ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 527ms (compile: 1437µs, render: 525ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 520ms (compile: 1436µs, render: 519ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 913ms (compile: 2ms, render: 911ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 912ms (compile: 1644µs, render: 911ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 746ms (compile: 2ms, render: 744ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 906ms (compile: 1542µs, render: 905ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 901ms (compile: 1889µs, render: 899ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 697ms (compile: 1488µs, render: 695ms)
 ✓ Compiled in 254ms
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 554ms (compile: 1738µs, render: 553ms)
 ✓ Compiled in 134ms
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 617ms (compile: 2ms, render: 615ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 664ms (compile: 1928µs, render: 662ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 565ms (compile: 2ms, render: 563ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 916ms (compile: 1927µs, render: 914ms)
 ✓ Compiled in 110ms
 ✓ Compiled in 232ms
 ✓ Compiled in 90ms
 ✓ Compiled in 110ms
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 583ms (compile: 1504µs, render: 581ms)
 ✓ Compiled in 78ms
 ✓ Compiled in 93ms
 ✓ Compiled in 90ms
 ✓ Compiled in 100ms
 ✓ Compiled in 109ms
 ✓ Compiled in 134ms
 ✓ Compiled in 88ms
 ✓ Compiled in 92ms
 ✓ Compiled in 110ms
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 560ms (compile: 1703µs, render: 558ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 919ms (compile: 3ms, render: 916ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 601ms (compile: 1423µs, render: 600ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 928ms (compile: 1476µs, render: 927ms)
[RBAC] getRBACContext() called
[RBAC] Environment: { NODE_ENV: 'development', NEXT_PHASE: undefined }
[RBAC] Call stack:     at getRBACContext (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__04ceb636._.js:601:23)
    at requireAdminAuth (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__04ceb636._.js:834:237)
    at OrderDetailContent (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__04ceb636._.js:1001:233)
[RBAC] Checking middleware headers...
[RBAC] All available headers: [
  [ 'host', 'localhost:3000' ],
  [ 'connection', 'keep-alive' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'sec-ch-ua-platform-version', '"19.0.0"' ],
  [ 'upgrade-insecure-requests', '1' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'sec-purpose', 'prefetch;prerender' ],
  [
    'accept',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
  ],
  [ 'sec-fetch-site', 'none' ],
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
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=256; _ga_VBCB77P21T=GS2.1.s1773094622$o13$g0$t1773094622$j60$l0$h1087210839'
  ],
  [ 'x-forwarded-host', 'localhost:3000' ],
  [ 'x-forwarded-port', '3000' ],
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
[RBAC] Supabase cookies found: []
[RBAC] Creating Supabase server client...
[RBAC] getAll() called, found 4 cookies
[RBAC] Supabase cookies: []
[RBAC] Calling supabase.auth.getUser()...
[RBAC] getAll() called, found 4 cookies
[RBAC] Supabase cookies: []
[RBAC] getAll() called, found 4 cookies
[RBAC] Supabase cookies: []
[RBAC] getAll() called, found 4 cookies
[RBAC] Supabase cookies: []
[RBAC] Supabase auth error: Auth session missing! 400
 GET /admin/orders/06eb05e8-f205-4771-a13e-ba746dacaab4 200 in 1851ms (compile: 1597ms, render: 254ms)
[Session API] All cookies: [
  { name: '_ga', hasValue: true },
  { name: '_gcl_au', hasValue: true },
  { name: '__next_hmr_refresh_hash__', hasValue: true },
  { name: '_ga_VBCB77P21T', hasValue: true }
]
[Session API] Supabase cookies: []
[Session API] URL: http://localhost:3000/api/auth/current-user
[Session API] Referer: http://localhost:3000/admin/orders/06eb05e8-f205-4771-a13e-ba746dacaab4
[Session API] getUser result: { hasUser: false, userId: undefined, error: 'Auth session missing!' }
[Session API] No valid user found Auth session missing!
 GET /api/auth/current-user 200 in 9ms (compile: 1936µs, render: 7ms)
 ✓ Compiled in 485ms
[Config API] Fetching remote config...
 GET /auth/signin?redirect=/admin/dashboard 200 in 402ms (compile: 142ms, render: 260ms)
[RBAC] getRBACContext() called
[RBAC] Environment: { NODE_ENV: 'development', NEXT_PHASE: undefined }
[RBAC] Call stack:     at getRBACContext (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__04ceb636._.js:601:23)
    at requireAdminAuth (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__04ceb636._.js:834:237)
    at OrderDetailContent (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\chunks\ssr\[root-of-the-server]__04ceb636._.js:1001:233)
[RBAC] Checking middleware headers...
[RBAC] All available headers: [
  [ 'host', 'localhost:3000' ],
  [ 'connection', 'keep-alive' ],
  [ 'cache-control', 'max-age=0' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'sec-ch-ua-platform-version', '"19.0.0"' ],
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
  [ 'sec-fetch-dest', 'document' ],
  [
    'referer',
    'http://localhost:3000/admin/orders/06eb05e8-f205-4771-a13e-ba746dacaab4'
  ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; _ga_VBCB77P21T=GS2.1.s1773102943$o14$g0$t1773102943$j60$l0$h2144354839; __next_hmr_refresh_hash__=372'
  ],
  [ 'x-forwarded-host', 'localhost:3000' ],
  [ 'x-forwarded-port', '3000' ],
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
 GET /api/config 200 in 341ms (compile: 12ms, render: 329ms)
 GET /auth/signin?redirect=%2Fadmin%2Fdashboard 200 in 333ms (compile: 13ms, render: 320ms)
 GET /admin/orders/06eb05e8-f205-4771-a13e-ba746dacaab4 200 in 289ms (compile: 84ms, render: 205ms)
[RBAC] Supabase cookies found: []
[RBAC] Creating Supabase server client...
[RBAC] getAll() called, found 4 cookies
[RBAC] Supabase cookies: []
[RBAC] Calling supabase.auth.getUser()...
[RBAC] getAll() called, found 4 cookies
[RBAC] Supabase cookies: []
[RBAC] getAll() called, found 4 cookies
[RBAC] Supabase cookies: []
[RBAC] getAll() called, found 4 cookies
[RBAC] Supabase cookies: []
[RBAC] Supabase auth error: Auth session missing! 400
[Config API] Config fetched successfully
Image with src "/images/main/main15.png" is using quality "95" which is not configured in images.qualities [75]. Please update your config to [75, 95].
Read more: https://nextjs.org/docs/messages/next-image-unconfigured-qualities
Image with src "/images/products/granola-standpouch-real.jpg" is using quality "95" which is not configured in images.qualities [75]. Please update your config to [75, 95].
Read more: https://nextjs.org/docs/messages/next-image-unconfigured-qualities
 GET / 200 in 401ms (compile: 107ms, render: 294ms)
[Session API] All cookies: [
  { name: '_ga', hasValue: true },
  { name: '_gcl_au', hasValue: true },
  { name: '_ga_VBCB77P21T', hasValue: true },
  { name: '__next_hmr_refresh_hash__', hasValue: true }
]
[Session API] Supabase cookies: []
[Session API] URL: http://localhost:3000/api/auth/current-user
[Session API] Referer: http://localhost:3000/
[Session API] getUser result: { hasUser: false, userId: undefined, error: 'Auth session missing!' }
[Session API] No valid user found Auth session missing!
 GET /api/auth/current-user 200 in 6ms (compile: 2ms, render: 4ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 274ms (compile: 1505µs, render: 272ms)
[Config API] Fetching remote config...
 GET /api/health 200 in 7ms (compile: 1173µs, render: 6ms)
[Config API] Config fetched successfully
 GET /api/config 200 in 284ms (compile: 1720µs, render: 282ms)
 GET /api/health 200 in 6ms (compile: 1425µs, render: 4ms)
 GET /auth/signin 200 in 20ms (compile: 3ms, render: 16ms)
 GET /auth/signin 200 in 16ms (compile: 3ms, render: 14ms)
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
 POST /api/auth/signin/ 200 in 1040ms (compile: 320ms, render: 721ms)
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
  [ 'host', 'localhost:3000' ],
  [ 'connection', 'keep-alive' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'x-nextjs-request-id', '85077f76' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-nextjs-html-request-id', 'Hs2adv5urxY8vjMj-ubww' ],
  [ 'sec-ch-ua-platform-version', '"19.0.0"' ],
  [ 'accept', '*/*' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'referer', 'http://localhost:3000/auth/signin' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=372; _ga_VBCB77P21T=GS2.1.s1773102943$o14$g1$t1773102991$j12$l0$h2144354839; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TVRBMk5UazNMQ0pwWVhRaU9qRTNOek14TURJNU9UY3NJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpFd01qazVOMzFkTENKelpYTnphVzl1WDJsa0lqb2laVFF4TnpSbU1UUXRPV0ZqTXkwME1UZGlMVGxtTVRNdFpHRXpaV000WXpReFptRmhJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLlNobnNUU21lX0VXQmFrV2hVZk9kYTFjd1R0UXcteFVwdmdDYktoOWFVMmQwVlZQQ1dtUlNmSW1TblpXczVBZXZhT2JyMXRUc2Y1RzgzWVl4LUNKRWlBIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMxMDY1OTcsInJlZnJlc2hfdG9rZW4iOiJudnd0d3Q2amFiYXQiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTEwVDAwOjM2OjM3LjY2MzM2NDY0MloiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiQWRtaW4gVXNlciJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6IjdmZjE1Mzk4LTFhOGYtNGU0My05MGExLTc2ZWViOTg1YzM4YyIsImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwidXNlcl9pZCI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSIsImlkZW50aXR5X2RhdGEiOnsiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSJ9LCJwcm92aWRlciI6ImVtYWlsIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0MTVaIiwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQ4MVoiLCJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20ifV0sImNyZWF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1MDgwOVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wMy0xMFQwMDozNjozNy43MTYyMThaIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0sIndlYWtfcGFzc3dvcmQiOm51bGx9'
  ],
  [ 'x-forwarded-host', 'localhost:3000' ],
  [ 'x-forwarded-port', '3000' ],
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
  [ 'host', 'localhost:3000' ],
  [ 'connection', 'keep-alive' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'x-nextjs-request-id', 'b763f9db' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-nextjs-html-request-id', 'Hs2adv5urxY8vjMj-ubww' ],
  [ 'sec-ch-ua-platform-version', '"19.0.0"' ],
  [ 'accept', '*/*' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'referer', 'http://localhost:3000/auth/signin' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=372; _ga_VBCB77P21T=GS2.1.s1773102943$o14$g1$t1773102991$j12$l0$h2144354839; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TVRBMk5UazNMQ0pwWVhRaU9qRTNOek14TURJNU9UY3NJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpFd01qazVOMzFkTENKelpYTnphVzl1WDJsa0lqb2laVFF4TnpSbU1UUXRPV0ZqTXkwME1UZGlMVGxtTVRNdFpHRXpaV000WXpReFptRmhJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLlNobnNUU21lX0VXQmFrV2hVZk9kYTFjd1R0UXcteFVwdmdDYktoOWFVMmQwVlZQQ1dtUlNmSW1TblpXczVBZXZhT2JyMXRUc2Y1RzgzWVl4LUNKRWlBIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMxMDY1OTcsInJlZnJlc2hfdG9rZW4iOiJudnd0d3Q2amFiYXQiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTEwVDAwOjM2OjM3LjY2MzM2NDY0MloiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiQWRtaW4gVXNlciJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6IjdmZjE1Mzk4LTFhOGYtNGU0My05MGExLTc2ZWViOTg1YzM4YyIsImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwidXNlcl9pZCI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSIsImlkZW50aXR5X2RhdGEiOnsiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSJ9LCJwcm92aWRlciI6ImVtYWlsIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0MTVaIiwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQ4MVoiLCJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20ifV0sImNyZWF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1MDgwOVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wMy0xMFQwMDozNjozNy43MTYyMThaIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0sIndlYWtfcGFzc3dvcmQiOm51bGx9'
  ],
  [ 'x-forwarded-host', 'localhost:3000' ],
  [ 'x-forwarded-port', '3000' ],
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
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=372; _ga_VBCB77P21T=GS2.1.s1773102943$o14$g1$t1773102991$j12$l0$h2144354839; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TVRBMk5UazNMQ0pwWVhRaU9qRTNOek14TURJNU9UY3NJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpFd01qazVOMzFkTENKelpYTnphVzl1WDJsa0lqb2laVFF4TnpSbU1UUXRPV0ZqTXkwME1UZGlMVGxtTVRNdFpHRXpaV000WXpReFptRmhJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLlNobnNUU21lX0VXQmFrV2hVZk9kYTFjd1R0UXcteFVwdmdDYktoOWFVMmQwVlZQQ1dtUlNmSW1TblpXczVBZXZhT2JyMXRUc2Y1RzgzWVl4LUNKRWlBIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMxMDY1OTcsInJlZnJlc2hfdG9rZW4iOiJudnd0d3Q2amFiYXQiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTEwVDAwOjM2OjM3LjY2MzM2NDY0MloiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiQWRtaW4gVXNlciJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6IjdmZjE1Mzk4LTFhOGYtNGU0My05MGExLTc2ZWViOTg1YzM4YyIsImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwidXNlcl9pZCI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSIsImlkZW50aXR5X2RhdGEiOnsiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSJ9LCJwcm92aWRlciI6ImVtYWlsIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0MTVaIiwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQ4MVoiLCJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20ifV0sImNyZWF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1MDgwOVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wMy0xMFQwMDozNjozNy43MTYyMThaIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0sIndlYWtfcGFzc3dvcmQiOm51bGx9'
  ],
  [ 'host', 'localhost:3000' ],
  [ 'referer', 'http://localhost:3000/member/dashboard' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'sec-ch-ua-platform-version', '"19.0.0"' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-forwarded-for', '::1' ],
  [ 'x-forwarded-host', 'localhost:3000' ],
  [ 'x-forwarded-port', '3000' ],
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
  [ 'host', 'localhost:3000' ],
  [ 'connection', 'keep-alive' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'x-nextjs-request-id', '85077f76' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-nextjs-html-request-id', 'Hs2adv5urxY8vjMj-ubww' ],
  [ 'sec-ch-ua-platform-version', '"19.0.0"' ],
  [ 'accept', '*/*' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'referer', 'http://localhost:3000/auth/signin' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=372; _ga_VBCB77P21T=GS2.1.s1773102943$o14$g1$t1773102991$j12$l0$h2144354839; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TVRBMk5UazNMQ0pwWVhRaU9qRTNOek14TURJNU9UY3NJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpFd01qazVOMzFkTENKelpYTnphVzl1WDJsa0lqb2laVFF4TnpSbU1UUXRPV0ZqTXkwME1UZGlMVGxtTVRNdFpHRXpaV000WXpReFptRmhJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLlNobnNUU21lX0VXQmFrV2hVZk9kYTFjd1R0UXcteFVwdmdDYktoOWFVMmQwVlZQQ1dtUlNmSW1TblpXczVBZXZhT2JyMXRUc2Y1RzgzWVl4LUNKRWlBIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMxMDY1OTcsInJlZnJlc2hfdG9rZW4iOiJudnd0d3Q2amFiYXQiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTEwVDAwOjM2OjM3LjY2MzM2NDY0MloiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiQWRtaW4gVXNlciJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6IjdmZjE1Mzk4LTFhOGYtNGU0My05MGExLTc2ZWViOTg1YzM4YyIsImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwidXNlcl9pZCI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSIsImlkZW50aXR5X2RhdGEiOnsiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSJ9LCJwcm92aWRlciI6ImVtYWlsIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0MTVaIiwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQ4MVoiLCJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20ifV0sImNyZWF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1MDgwOVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wMy0xMFQwMDozNjozNy43MTYyMThaIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0sIndlYWtfcGFzc3dvcmQiOm51bGx9'
  ],
  [ 'x-forwarded-host', 'localhost:3000' ],
  [ 'x-forwarded-port', '3000' ],
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
  [ 'host', 'localhost:3000' ],
  [ 'connection', 'keep-alive' ],
  [ 'sec-ch-ua-platform', '"Windows"' ],
  [ 'x-nextjs-request-id', 'b763f9db' ],
  [
    'sec-ch-ua',
    '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"'
  ],
  [ 'sec-ch-ua-mobile', '?0' ],
  [
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  ],
  [ 'x-nextjs-html-request-id', 'Hs2adv5urxY8vjMj-ubww' ],
  [ 'sec-ch-ua-platform-version', '"19.0.0"' ],
  [ 'accept', '*/*' ],
  [ 'sec-fetch-site', 'same-origin' ],
  [ 'sec-fetch-mode', 'cors' ],
  [ 'sec-fetch-dest', 'empty' ],
  [ 'referer', 'http://localhost:3000/auth/signin' ],
  [ 'accept-encoding', 'gzip, deflate, br, zstd' ],
  [
    'accept-language',
    'ko-KR,ko;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5'
  ],
  [
    'cookie',
    '_ga=GA1.1.1420022109.1772485327; _gcl_au=1.1.2015850561.1772488584; __next_hmr_refresh_hash__=372; _ga_VBCB77P21T=GS2.1.s1773102943$o14$g1$t1773102991$j12$l0$h2144354839; sb-ijlgpzjdfipzmjvawofp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVM09URm1aREUxTFRBNVkyUXROREZqTWkwNVpUUXhMV1ZtWTJJM1pEWTJPRE0zWWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmxxYkdkd2VtcGtabWx3ZW0xcWRtRjNiMlp3TG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMU5HWmtOMkl6TVMxaU9EQTFMVFF6WTJZdFlqa3laUzA0T1Roa1pHUXdOalk0TnpVaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemN6TVRBMk5UazNMQ0pwWVhRaU9qRTNOek14TURJNU9UY3NJbVZ0WVdsc0lqb2lZV1J0YVc1QVpYQmhZMnRoWjJVdGJHRmlMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXeGZkbVZ5YVdacFpXUWlPblJ5ZFdVc0ltWjFiR3hmYm1GdFpTSTZJa0ZrYldsdUlGVnpaWElpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGMzTXpFd01qazVOMzFkTENKelpYTnphVzl1WDJsa0lqb2laVFF4TnpSbU1UUXRPV0ZqTXkwME1UZGlMVGxtTVRNdFpHRXpaV000WXpReFptRmhJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLlNobnNUU21lX0VXQmFrV2hVZk9kYTFjd1R0UXcteFVwdmdDYktoOWFVMmQwVlZQQ1dtUlNmSW1TblpXczVBZXZhT2JyMXRUc2Y1RzgzWVl4LUNKRWlBIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NzMxMDY1OTcsInJlZnJlc2hfdG9rZW4iOiJudnd0d3Q2amFiYXQiLCJ1c2VyIjp7ImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMi0xMFQxMzowNjo0Ni43NTY2NzNaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAyLTEwVDEzOjA2OjQ2Ljc1NjY3M1oiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAzLTEwVDAwOjM2OjM3LjY2MzM2NDY0MloiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiQWRtaW4gVXNlciJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6IjdmZjE1Mzk4LTFhOGYtNGU0My05MGExLTc2ZWViOTg1YzM4YyIsImlkIjoiNTRmZDdiMzEtYjgwNS00M2NmLWI5MmUtODk4ZGRkMDY2ODc1IiwidXNlcl9pZCI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSIsImlkZW50aXR5X2RhdGEiOnsiZW1haWwiOiJhZG1pbkBlcGFja2FnZS1sYWIuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjU0ZmQ3YjMxLWI4MDUtNDNjZi1iOTJlLTg5OGRkZDA2Njg3NSJ9LCJwcm92aWRlciI6ImVtYWlsIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNi0wMS0wM1QxMTozMjoxNS41NTY0MTVaIiwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMDNUMTE6MzI6MTUuNTU2NDgxWiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1NjQ4MVoiLCJlbWFpbCI6ImFkbWluQGVwYWNrYWdlLWxhYi5jb20ifV0sImNyZWF0ZWRfYXQiOiIyMDI2LTAxLTAzVDExOjMyOjE1LjU1MDgwOVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wMy0xMFQwMDozNjozNy43MTYyMThaIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0sIndlYWtfcGFzc3dvcmQiOm51bGx9'
  ],
  [ 'x-forwarded-host', 'localhost:3000' ],
  [ 'x-forwarded-port', '3000' ],
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
[RBAC] User found from Supabase: 54fd7b31-b805-43cf-b92e-898ddd066875 admin@epackage-lab.com
[RBAC] Fetching profile from database...
[RBAC] Profile found: ADMIN ACTIVE
[RBAC] Using default permissions for role: admin
[RBAC] User authenticated successfully: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
[getCurrentUserId] Server-side: Found user ID from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/notifications?limit=50 200 in 2.1s (compile: 239ms, render: 1861ms)
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
 GET /quote-simulator 200 in 111ms (compile: 67ms, render: 44ms)
 GET /member/dashboard 200 in 4.9s (compile: 905ms, render: 4.0s)
 GET /api/comparison/save 200 in 6ms (compile: 2ms, render: 3ms)
 GET /api/comparison/save 200 in 5ms (compile: 1910µs, render: 3ms)
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
 GET /member/dashboard 200 in 4.1s (compile: 4ms, render: 4.1s)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 462ms (compile: 1993µs, render: 460ms)
 GET /api/pricing/settings 200 in 244ms (compile: 1880µs, render: 242ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 445ms (compile: 1490µs, render: 444ms)
 GET /api/pricing/settings 200 in 223ms (compile: 1654µs, render: 222ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 419ms (compile: 1639µs, render: 418ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 722ms (compile: 2ms, render: 720ms)
 GET /api/pricing/settings 200 in 327ms (compile: 1465µs, render: 326ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 536ms (compile: 1742µs, render: 534ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 553ms (compile: 1627µs, render: 552ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 488ms (compile: 2ms, render: 486ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 478ms (compile: 1648µs, render: 476ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 480ms (compile: 1873µs, render: 478ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 494ms (compile: 1463µs, render: 492ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 459ms (compile: 1669µs, render: 457ms)
 GET /api/comparison/save 200 in 5ms (compile: 1863µs, render: 3ms)
 GET /api/comparison/save 200 in 4ms (compile: 1516µs, render: 2ms)
 ✓ Compiled in 27ms
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 916ms (compile: 1573µs, render: 914ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 444ms (compile: 1712µs, render: 443ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 641ms (compile: 1727µs, render: 639ms)
 GET /api/pricing/settings 200 in 317ms (compile: 1875µs, render: 315ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 514ms (compile: 1464µs, render: 512ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 514ms (compile: 1560µs, render: 512ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 483ms (compile: 1678µs, render: 481ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 527ms (compile: 1965µs, render: 525ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 482ms (compile: 1577µs, render: 480ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 479ms (compile: 1492µs, render: 477ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 464ms (compile: 2ms, render: 461ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 564ms (compile: 1886µs, render: 563ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 452ms (compile: 3ms, render: 450ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 447ms (compile: 1807µs, render: 446ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 435ms (compile: 2ms, render: 433ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 442ms (compile: 1439µs, render: 440ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 441ms (compile: 1542µs, render: 439ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 415ms (compile: 1856µs, render: 413ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 441ms (compile: 1648µs, render: 440ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 734ms (compile: 1458µs, render: 732ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 800ms (compile: 1889µs, render: 798ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 639ms (compile: 1889µs, render: 637ms)
 GET /api/pricing/settings 200 in 365ms (compile: 1529µs, render: 364ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 578ms (compile: 1461µs, render: 576ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 540ms (compile: 1828µs, render: 538ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 392ms (compile: 1661µs, render: 391ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 565ms (compile: 3ms, render: 562ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 590ms (compile: 2ms, render: 587ms)
 GET /api/pricing/settings 200 in 320ms (compile: 1632µs, render: 318ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 531ms (compile: 1869µs, render: 529ms)
 ✓ Compiled in 25ms
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 524ms (compile: 2ms, render: 521ms)
 GET /api/pricing/settings 200 in 311ms (compile: 1491µs, render: 309ms)
 GET /api/pricing/settings 200 in 409ms (compile: 1818µs, render: 407ms)
 ✓ Compiled in 95ms
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 986ms (compile: 1818µs, render: 984ms)
 GET /api/pricing/settings 200 in 316ms (compile: 1510µs, render: 314ms)
 ✓ Compiled in 31ms
 GET /api/user/markup-rate 500 in 1023ms (compile: 941ms, render: 82ms)
 GET /api/pricing/settings 500 in 27ms (compile: 18ms, render: 10ms)
 GET /api/pricing/settings 500 in 41ms (compile: 14ms, render: 27ms)
 GET /api/pricing/settings 500 in 21ms (compile: 15ms, render: 5ms)
 GET /api/pricing/settings 500 in 15ms (compile: 10ms, render: 5ms)
 GET /api/pricing/settings 500 in 15ms (compile: 10ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 15ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 13ms (compile: 8ms, render: 5ms)
 GET /api/pricing/settings 500 in 13ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 8ms, render: 5ms)
 GET /api/pricing/settings 500 in 17ms (compile: 11ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 15ms (compile: 10ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 15ms (compile: 10ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 15ms (compile: 10ms, render: 5ms)
 GET /api/pricing/settings 500 in 16ms (compile: 11ms, render: 5ms)
 GET /api/pricing/settings 500 in 15ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 15ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 15ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 15ms (compile: 8ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 15ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 15ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 8ms, render: 6ms)
 GET /api/pricing/settings 500 in 15ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 8ms, render: 6ms)
 GET /api/pricing/settings 500 in 15ms (compile: 10ms, render: 5ms)
 GET /api/pricing/settings 500 in 13ms (compile: 8ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 8ms, render: 5ms)
 GET /api/pricing/settings 500 in 16ms (compile: 10ms, render: 6ms)
 GET /api/pricing/settings 500 in 15ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 13ms (compile: 8ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 13ms (compile: 8ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 8ms, render: 6ms)
 GET /api/pricing/settings 500 in 15ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 13ms (compile: 8ms, render: 5ms)
 GET /api/pricing/settings 500 in 16ms (compile: 9ms, render: 7ms)
 GET /api/pricing/settings 500 in 14ms (compile: 8ms, render: 6ms)
 GET /api/pricing/settings 500 in 15ms (compile: 8ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 8ms, render: 6ms)
 GET /api/pricing/settings 500 in 16ms (compile: 9ms, render: 7ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 15ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 15ms (compile: 10ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 16ms (compile: 10ms, render: 6ms)
 GET /api/pricing/settings 500 in 15ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 15ms (compile: 10ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 17ms (compile: 11ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 15ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 17ms (compile: 10ms, render: 7ms)
 GET /api/pricing/settings 500 in 17ms (compile: 12ms, render: 5ms)
 GET /api/pricing/settings 500 in 16ms (compile: 10ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 16ms (compile: 10ms, render: 6ms)
 GET /api/pricing/settings 500 in 17ms (compile: 12ms, render: 5ms)
 GET /api/pricing/settings 500 in 19ms (compile: 9ms, render: 10ms)
 GET /api/pricing/settings 500 in 16ms (compile: 10ms, render: 6ms)
 GET /api/pricing/settings 500 in 15ms (compile: 10ms, render: 6ms)
 GET /api/pricing/settings 500 in 16ms (compile: 11ms, render: 5ms)
 GET /api/pricing/settings 500 in 16ms (compile: 10ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 15ms (compile: 10ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 8ms, render: 5ms)
 GET /api/pricing/settings 500 in 13ms (compile: 8ms, render: 5ms)
 GET /api/pricing/settings 500 in 15ms (compile: 10ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 8ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 15ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 8ms, render: 6ms)
 GET /api/pricing/settings 500 in 15ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 16ms (compile: 11ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 5ms)
 GET /api/pricing/settings 500 in 16ms (compile: 10ms, render: 6ms)
 GET /api/pricing/settings 500 in 17ms (compile: 11ms, render: 6ms)
 GET /api/pricing/settings 500 in 15ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 13ms (compile: 8ms, render: 5ms)
 GET /api/pricing/settings 500 in 15ms (compile: 9ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 8ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 8ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 8ms, render: 6ms)
 GET /api/pricing/settings 500 in 15ms (compile: 10ms, render: 6ms)
 GET /api/pricing/settings 500 in 14ms (compile: 8ms, render: 6ms)
 GET /api/config 500 in 17ms (compile: 11ms, render: 6ms)
 ✓ Compiled in 11ms
 ✓ Compiled in 10ms
 GET /quote-simulator 200 in 108ms (compile: 66ms, render: 42ms)
 GET /quote-simulator 200 in 21ms (compile: 2ms, render: 19ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 1157ms (compile: 1840µs, render: 1155ms)
 GET /api/pricing/settings 200 in 364ms (compile: 1596µs, render: 362ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 316ms (compile: 1456µs, render: 315ms)
 ✓ Compiled in 20ms
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 581ms (compile: 1518µs, render: 580ms)
 GET /api/pricing/settings 200 in 319ms (compile: 1546µs, render: 317ms)
 ✓ Compiled in 10ms
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 520ms (compile: 2ms, render: 518ms)
 GET /api/pricing/settings 200 in 319ms (compile: 1444µs, render: 317ms)
 ✓ Compiled in 11ms
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 548ms (compile: 1559µs, render: 546ms)
 GET /api/pricing/settings 200 in 306ms (compile: 1252µs, render: 305ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 543ms (compile: 45ms, render: 499ms)
 GET /api/pricing/settings 200 in 215ms (compile: 1583µs, render: 214ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 1099ms (compile: 1532µs, render: 1097ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 1141ms (compile: 1710µs, render: 1139ms)
 GET /api/pricing/settings 200 in 415ms (compile: 1341µs, render: 413ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 587ms (compile: 1632µs, render: 586ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 596ms (compile: 1358µs, render: 594ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 418ms (compile: 1313µs, render: 417ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 657ms (compile: 3ms, render: 654ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 531ms (compile: 1823µs, render: 529ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 663ms (compile: 1931µs, render: 661ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 645ms (compile: 2ms, render: 643ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 1165ms (compile: 1646µs, render: 1164ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 620ms (compile: 1374µs, render: 619ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 896ms (compile: 1661µs, render: 894ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 957ms (compile: 1678µs, render: 955ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 609ms (compile: 1468µs, render: 607ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 907ms (compile: 1669µs, render: 906ms)
[Session API] All cookies: [
  { name: '_ga', hasValue: true },
  { name: '_gcl_au', hasValue: true },
  { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true },
  { name: '_ga_VBCB77P21T', hasValue: true },
  { name: '__next_hmr_refresh_hash__', hasValue: true }
]
[Session API] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[Session API] URL: http://localhost:3000/api/auth/current-user
[Session API] Referer: http://localhost:3000/quote-simulator
[supabase-ssr] setAll called with 1 cookies
[supabase-ssr] Setting cookie: sb-ijlgpzjdfipzmjvawofp-auth-token value length: 2615
[supabase-ssr] Set-Cookie header set for: sb-ijlgpzjdfipzmjvawofp-auth-token
[supabase-ssr] Final response has 1 Set-Cookie headers
[Session API] getUser result: {
  hasUser: true,
  userId: '54fd7b31-b805-43cf-b92e-898ddd066875',
  error: undefined
}
[Session API] NEXT_PUBLIC_SUPABASE_URL: https://ijlgpzjdfipzmjvawofp.supabase.co
[Session API] SUPABASE_SERVICE_ROLE_KEY exists: true
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
 GET /api/auth/current-user 200 in 1499ms (compile: 1742µs, render: 1497ms)
[supabase-ssr] setAll called with 1 cookies
[supabase-ssr] Setting cookie: sb-ijlgpzjdfipzmjvawofp-auth-token value length: 2615
[supabase-ssr] Set-Cookie header set for: sb-ijlgpzjdfipzmjvawofp-auth-token
[supabase-ssr] Final response has 1 Set-Cookie headers
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 811ms (compile: 1405µs, render: 809ms)
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
 GET /quote-simulator 200 in 419ms (compile: 133ms, render: 286ms)
 GET /api/comparison/save 200 in 8ms (compile: 2ms, render: 5ms)
[Session API] All cookies: []
[Session API] Supabase cookies: []
[Session API] URL: http://localhost:3000/api/auth/current-user
[Session API] Referer: http://localhost:3000/quote-simulator
[Session API] getUser result: { hasUser: false, userId: undefined, error: 'Auth session missing!' }
[Session API] No valid user found Auth session missing!
 GET /api/auth/current-user 200 in 5ms (compile: 1957µs, render: 3ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 406ms (compile: 2ms, render: 404ms)
[Config API] Fetching remote config...
 GET /api/health 200 in 10ms (compile: 1569µs, render: 8ms)
[Config API] Config fetched successfully
 GET /api/config 200 in 294ms (compile: 1668µs, render: 292ms)
 GET /api/health 200 in 6ms (compile: 1824µs, render: 4ms)
 GET /api/pricing/settings 200 in 796ms (compile: 1515µs, render: 795ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 833ms (compile: 4ms, render: 828ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 260ms (compile: 8ms, render: 252ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 504ms (compile: 3ms, render: 501ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 292ms (compile: 1700µs, render: 290ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 358ms (compile: 1978µs, render: 356ms)
 ✓ Compiled in 25ms
 GET /api/user/markup-rate 404 in 140ms
 GET /api/pricing/settings 200 in 410ms (compile: 1798µs, render: 409ms)
 GET /api/pricing/settings 200 in 458ms (compile: 2ms, render: 455ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 557ms (compile: 1531µs, render: 556ms)
 ✓ Compiled in 31ms
 GET /api/user/markup-rate 404 in 18ms
 GET /api/pricing/settings 200 in 390ms (compile: 1605µs, render: 388ms)
 GET /api/pricing/settings 200 in 425ms (compile: 3ms, render: 422ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 269ms (compile: 1629µs, render: 267ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 574ms (compile: 1914µs, render: 572ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 265ms (compile: 1885µs, render: 263ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 1020ms (compile: 1580µs, render: 1019ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 285ms (compile: 1527µs, render: 283ms)
[Session API] All cookies: [
  { name: '_ga', hasValue: true },
  { name: '_gcl_au', hasValue: true },
  { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true },
  { name: '_ga_VBCB77P21T', hasValue: true },
  { name: '__next_hmr_refresh_hash__', hasValue: true }
]
[Session API] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[Session API] URL: http://localhost:3000/api/auth/current-user
[Session API] Referer: http://localhost:3000/quote-simulator
[supabase-ssr] setAll called with 1 cookies
[supabase-ssr] Setting cookie: sb-ijlgpzjdfipzmjvawofp-auth-token value length: 2615
[supabase-ssr] Set-Cookie header set for: sb-ijlgpzjdfipzmjvawofp-auth-token
[supabase-ssr] Final response has 1 Set-Cookie headers
[Session API] getUser result: {
  hasUser: true,
  userId: '54fd7b31-b805-43cf-b92e-898ddd066875',
  error: undefined
}
[Session API] NEXT_PUBLIC_SUPABASE_URL: https://ijlgpzjdfipzmjvawofp.supabase.co
[Session API] SUPABASE_SERVICE_ROLE_KEY exists: true
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
 GET /api/auth/current-user 200 in 1247ms (compile: 2ms, render: 1245ms)
 GET /api/user/markup-rate 404 in 8ms
 GET /api/user/markup-rate 404 in 8ms
 GET /api/pricing/settings 200 in 378ms (compile: 1220µs, render: 376ms)
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
 GET /quote-simulator 200 in 272ms (compile: 66ms, render: 206ms)
[Session API] All cookies: [
  { name: '_ga', hasValue: true },
  { name: '_gcl_au', hasValue: true },
  { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true },
  { name: '__next_hmr_refresh_hash__', hasValue: true },
  { name: '_ga_VBCB77P21T', hasValue: true }
]
[Session API] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[Session API] URL: http://localhost:3000/api/auth/current-user
[Session API] Referer: http://localhost:3000/quote-simulator
 GET /api/comparison/save 200 in 12ms (compile: 9ms, render: 2ms)
[Config API] Fetching remote config...
[Config API] Fetching remote config...
[supabase-ssr] setAll called with 1 cookies
[supabase-ssr] Setting cookie: sb-ijlgpzjdfipzmjvawofp-auth-token value length: 2615
[supabase-ssr] Set-Cookie header set for: sb-ijlgpzjdfipzmjvawofp-auth-token
[supabase-ssr] Final response has 1 Set-Cookie headers
[Session API] getUser result: {
  hasUser: true,
  userId: '54fd7b31-b805-43cf-b92e-898ddd066875',
  error: undefined
}
[Session API] NEXT_PUBLIC_SUPABASE_URL: https://ijlgpzjdfipzmjvawofp.supabase.co
[Session API] SUPABASE_SERVICE_ROLE_KEY exists: true
[Config API] Config fetched successfully
 GET /api/config 200 in 339ms (compile: 1717µs, render: 338ms)
 GET /api/health 200 in 8ms (compile: 1800µs, render: 6ms)
[Config API] Config fetched successfully
 GET /api/config 200 in 417ms (compile: 6ms, render: 411ms)
 GET /api/health 200 in 6ms (compile: 1520µs, render: 4ms)
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
 GET /api/auth/current-user 200 in 828ms (compile: 2ms, render: 825ms)
 GET /api/user/markup-rate 404 in 6ms
 GET /api/pricing/settings 200 in 324ms (compile: 1225µs, render: 323ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 297ms (compile: 1725µs, render: 295ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 310ms (compile: 1846µs, render: 308ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 811ms (compile: 2ms, render: 809ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 835ms (compile: 2ms, render: 833ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 311ms (compile: 1914µs, render: 309ms)
 ✓ Compiled in 208ms
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 667ms (compile: 1740µs, render: 665ms)
 GET /quote-simulator 200 in 61ms (compile: 4ms, render: 57ms)
 GET /api/comparison/save 200 in 5ms (compile: 2ms, render: 2ms)
[Session API] All cookies: [
  { name: '_gcl_au', hasValue: true },
  { name: '_ga', hasValue: true },
  { name: '_ga_VBCB77P21T', hasValue: true }
]
[Session API] Supabase cookies: []
[Session API] URL: http://localhost:3000/api/auth/current-user
[Session API] Referer: http://localhost:3000/quote-simulator
[Session API] getUser result: { hasUser: false, userId: undefined, error: 'Auth session missing!' }
[Session API] No valid user found Auth session missing!
 GET /api/auth/current-user 200 in 7ms (compile: 2ms, render: 5ms)
[Config API] Fetching remote config...
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 360ms (compile: 6ms, render: 354ms)
 GET /api/health 200 in 10ms (compile: 2ms, render: 8ms)
[Config API] Config fetched successfully
 GET /api/config 200 in 379ms (compile: 2ms, render: 377ms)
 GET /api/health 200 in 6ms (compile: 1856µs, render: 4ms)
 GET /api/pricing/settings 200 in 377ms (compile: 2ms, render: 374ms)
 GET /quote-simulator 200 in 55ms (compile: 3ms, render: 52ms)
 GET /api/comparison/save 200 in 5ms (compile: 2ms, render: 3ms)
[Session API] All cookies: [
  { name: '_gcl_au', hasValue: true },
  { name: '_ga', hasValue: true },
  { name: '_ga_VBCB77P21T', hasValue: true }
]
[Session API] Supabase cookies: []
[Session API] URL: http://localhost:3000/api/auth/current-user
[Session API] Referer: http://localhost:3000/quote-simulator
[Session API] getUser result: { hasUser: false, userId: undefined, error: 'Auth session missing!' }
[Session API] No valid user found Auth session missing!
 GET /api/auth/current-user 200 in 6ms (compile: 3ms, render: 3ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 444ms (compile: 2ms, render: 442ms)
[Config API] Fetching remote config...
 GET /api/health 200 in 6ms (compile: 1362µs, render: 5ms)
[Config API] Config fetched successfully
 GET /api/config 200 in 296ms (compile: 3ms, render: 293ms)
 GET /api/health 200 in 5ms (compile: 1239µs, render: 4ms)
 GET /api/pricing/settings 200 in 689ms (compile: 1721µs, render: 688ms)
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\shared\lib\turbopack\manifest-loader.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\turbopack-utils.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\hot-reloader-turbopack.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\trace\trace.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\dev-bundler-service.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\next-dev-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\route-matcher-managers\dev-route-matcher-manager.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\route-matcher-managers\default-route-matcher-manager.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\next-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\base-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\router-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\start-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
 ⨯ Error: ENOENT: no such file or directory, open 'C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\app\quote-simulator\page\build-manifest.json'
    at ignore-listed frames {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'open',
  path: 'C:\\Users\\kanei\\claudecode\\02.Homepage_Dev\\02.epac_homepagever1.1\\.next\\dev\\server\\app\\quote-simulator\\page\\build-manifest.json'
}
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\shared\lib\turbopack\manifest-loader.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\turbopack-utils.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\hot-reloader-turbopack.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\trace\trace.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\dev-bundler-service.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\next-dev-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\base-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\next-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\router-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\start-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
 ⨯ Error: ENOENT: no such file or directory, open 'C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\pages\_app\build-manifest.json'
    at ignore-listed frames {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'open',
  path: 'C:\\Users\\kanei\\claudecode\\02.Homepage_Dev\\02.epac_homepagever1.1\\.next\\dev\\server\\pages\\_app\\build-manifest.json'
}
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\shared\lib\turbopack\manifest-loader.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\turbopack-utils.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\hot-reloader-turbopack.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\trace\trace.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\dev-bundler-service.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\next-dev-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\route-matcher-managers\dev-route-matcher-manager.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\route-matcher-managers\default-route-matcher-manager.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\next-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\base-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\router-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\start-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
Error: ENOENT: no such file or directory, open 'C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\app\quote-simulator\page\build-manifest.json'
    at ignore-listed frames {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'open',
  path: 'C:\\Users\\kanei\\claudecode\\02.Homepage_Dev\\02.epac_homepagever1.1\\.next\\dev\\server\\app\\quote-simulator\\page\\build-manifest.json'
}
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\shared\lib\turbopack\manifest-loader.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\turbopack-utils.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\hot-reloader-turbopack.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\trace\trace.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\dev-bundler-service.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\next-dev-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\base-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\router-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\start-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
 ⨯ Error: ENOENT: no such file or directory, open 'C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\pages\_app\build-manifest.json'
    at ignore-listed frames {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'open',
  path: 'C:\\Users\\kanei\\claudecode\\02.Homepage_Dev\\02.epac_homepagever1.1\\.next\\dev\\server\\pages\\_app\\build-manifest.json'
}
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\shared\lib\turbopack\manifest-loader.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\turbopack-utils.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\hot-reloader-turbopack.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\trace\trace.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\dev-bundler-service.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\next-dev-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\base-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\router-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\start-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
Error: ENOENT: no such file or directory, open 'C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\pages\_app\build-manifest.json'
    at ignore-listed frames {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'open',
  path: 'C:\\Users\\kanei\\claudecode\\02.Homepage_Dev\\02.epac_homepagever1.1\\.next\\dev\\server\\pages\\_app\\build-manifest.json'
}
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\shared\lib\turbopack\manifest-loader.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\turbopack-utils.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\hot-reloader-turbopack.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\trace\trace.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\dev-bundler-service.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\next-dev-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\route-matcher-managers\dev-route-matcher-manager.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\route-matcher-managers\default-route-matcher-manager.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\next-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\base-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\router-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\start-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
 ⨯ Error: ENOENT: no such file or directory, open 'C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\app\quote-simulator\page\build-manifest.json'
    at ignore-listed frames {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'open',
  path: 'C:\\Users\\kanei\\claudecode\\02.Homepage_Dev\\02.epac_homepagever1.1\\.next\\dev\\server\\app\\quote-simulator\\page\\build-manifest.json'
}
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\require-hook.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\require.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\load-components.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\next-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\trace\tracer.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\build\src\context\NoopContextManager.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\build\src\api\context.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\build\src\trace\NoopTracer.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\build\src\trace\ProxyTracer.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\dev\next-dev-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\base-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\trace\trace.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\router-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\start-server.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed
 ⨯ Error: Cannot find module '../chunks/ssr/[turbopack]_runtime.js'
Require stack:
- C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\pages\_document.js
- C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\require.js
- C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\load-components.js
- C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\build\utils.js
- C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\build\swc\options.js
- C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\build\swc\index.js
- C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\build\next-config-ts\transpile-config.js
- C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\config.js
- C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\next.js
- C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\.pnpm\next@16.0.11_@babel+core@7._d74ccc27c1e3aba77c5a486be08e296c\node_modules\next\dist\server\lib\start-server.js
    at Object.<anonymous> (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\server\pages\_document.js:1:7) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [Array]
}
 GET /quote-simulator 500 in 66ms (compile: 59ms, render: 7ms)
