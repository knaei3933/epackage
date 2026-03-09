
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
