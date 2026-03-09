
> epackage-lab-web@0.1.0 dev
> next dev

 ⚠ Port 3000 is in use by process 290716, using available port 3004 instead.
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
 ⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
 We detected multiple lockfiles and selected the directory of C:\Users\kanei\claudecode\package-lock.json as the root directory.
 To silence this warning, set `turbopack.root` in your Next.js config, or consider removing one of the lockfiles if it's not needed.
   See https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory for more information.
 Detected additional lockfiles: 
   * C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\pnpm-lock.yaml

   ▲ Next.js 16.0.11 (Turbopack)
   - Local:         http://localhost:3004
   - Network:       http://192.168.0.21:3004
   - Environments: .env.local, .env

 ✓ Starting...
 ✓ Ready in 1295ms
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
 GET /quote-simulator 200 in 5.1s (compile: 4.7s, render: 425ms)
[Session API] All cookies: [
  { name: '_gcl_au', hasValue: true },
  { name: '_ga', hasValue: true },
  { name: '__next_hmr_refresh_hash__', hasValue: true },
  { name: '_ga_VBCB77P21T', hasValue: true }
]
[Session API] Supabase cookies: []
[Session API] URL: http://localhost:3004/api/auth/current-user
[Session API] Referer: http://localhost:3004/quote-simulator
[Session API] getUser result: { hasUser: false, userId: undefined, error: 'Auth session missing!' }
[Session API] No valid user found Auth session missing!
 GET /api/auth/current-user 200 in 391ms (compile: 374ms, render: 17ms)
[Config API] Fetching remote config...
 GET /api/comparison/save 200 in 453ms (compile: 449ms, render: 5ms)
[Config API] Config fetched successfully
 GET /api/config 200 in 489ms (compile: 204ms, render: 285ms)
[Config API] Fetching remote config...
 GET /api/health 200 in 161ms (compile: 111ms, render: 50ms)
[Config API] Config fetched successfully
 GET /api/config 200 in 237ms (compile: 3ms, render: 234ms)
 GET /api/health 200 in 8ms (compile: 2ms, render: 6ms)
 GET /api/pricing/settings 200 in 397ms (compile: 115ms, render: 283ms)
 GET /quote-simulator 200 in 75ms (compile: 4ms, render: 71ms)
 GET /api/comparison/save 200 in 8ms (compile: 5ms, render: 3ms)
[Session API] All cookies: [
  { name: '_ga', hasValue: true },
  { name: '_gcl_au', hasValue: true },
  { name: '__next_hmr_refresh_hash__', hasValue: true },
  { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true },
  { name: '_ga_VBCB77P21T', hasValue: true }
]
[Session API] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[Session API] URL: http://localhost:3004/api/auth/current-user
[Session API] Referer: http://localhost:3004/quote-simulator
[Config API] Fetching remote config...
[Session API] getUser result: {
  hasUser: true,
  userId: '54fd7b31-b805-43cf-b92e-898ddd066875',
  error: undefined
}
[Session API] NEXT_PUBLIC_SUPABASE_URL: https://ijlgpzjdfipzmjvawofp.supabase.co
[Session API] SUPABASE_SERVICE_ROLE_KEY exists: true
[Config API] Config fetched successfully
 GET /api/config 200 in 658ms (compile: 3ms, render: 656ms)
[Config API] Fetching remote config...
 GET /api/health 200 in 8ms (compile: 1693µs, render: 6ms)
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
 GET /api/auth/current-user 200 in 1214ms (compile: 9ms, render: 1205ms)
[Config API] Config fetched successfully
 GET /api/config 200 in 294ms (compile: 2ms, render: 291ms)
 GET /api/health 200 in 7ms (compile: 2ms, render: 5ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 718ms (compile: 204ms, render: 514ms)
 GET /api/pricing/settings 200 in 343ms (compile: 1748µs, render: 341ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 553ms (compile: 2ms, render: 551ms)
 GET /api/pricing/settings 200 in 298ms (compile: 1839µs, render: 297ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 585ms (compile: 2ms, render: 583ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 523ms (compile: 3ms, render: 521ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 580ms (compile: 1582µs, render: 578ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 532ms (compile: 1427µs, render: 531ms)
 GET /api/pricing/settings 200 in 336ms (compile: 8ms, render: 329ms)
 GET /api/pricing/settings 200 in 347ms (compile: 3ms, render: 345ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 599ms (compile: 1674µs, render: 597ms)
 ✓ Compiled in 30ms
 GET /api/comparison/save 200 in 6ms (compile: 3ms, render: 4ms)
 GET /api/comparison/save 200 in 5ms (compile: 1756µs, render: 3ms)
 GET /api/comparison/save 200 in 5ms (compile: 1988µs, render: 3ms)
 GET /api/comparison/save 200 in 5ms (compile: 1915µs, render: 3ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 598ms (compile: 1896µs, render: 596ms)
 ✓ Compiled in 23ms
 GET /api/comparison/save 200 in 6ms (compile: 2ms, render: 4ms)
 GET /api/comparison/save 200 in 6ms (compile: 3ms, render: 3ms)
 GET /api/comparison/save 200 in 5ms (compile: 1825µs, render: 3ms)
 GET /api/comparison/save 200 in 5ms (compile: 1666µs, render: 3ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 523ms (compile: 3ms, render: 520ms)
 ✓ Compiled in 20ms
 GET /api/comparison/save 200 in 4ms (compile: 1785µs, render: 2ms)
 GET /api/comparison/save 200 in 5ms (compile: 1751µs, render: 3ms)
 GET /api/comparison/save 200 in 6ms (compile: 1921µs, render: 4ms)
 GET /api/comparison/save 200 in 4ms (compile: 1837µs, render: 3ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 524ms (compile: 1700µs, render: 522ms)
 ✓ Compiled in 18ms
 GET /api/comparison/save 200 in 4ms (compile: 1702µs, render: 2ms)
 GET /api/comparison/save 200 in 4ms (compile: 1480µs, render: 3ms)
 GET /api/comparison/save 200 in 6ms (compile: 2ms, render: 4ms)
 GET /api/comparison/save 200 in 4ms (compile: 1543µs, render: 3ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 513ms (compile: 1738µs, render: 511ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 244ms (compile: 3ms, render: 242ms)
 ✓ Compiled in 22ms
 GET /api/comparison/save 200 in 4ms (compile: 1950µs, render: 3ms)
 GET /api/comparison/save 200 in 4ms (compile: 1391µs, render: 3ms)
 GET /api/comparison/save 200 in 4ms (compile: 1644µs, render: 2ms)
 GET /api/comparison/save 200 in 4ms (compile: 1598µs, render: 3ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 508ms (compile: 2ms, render: 506ms)
 GET /api/comparison/save 200 in 4ms (compile: 1604µs, render: 3ms)
 GET /api/comparison/save 200 in 5ms (compile: 1709µs, render: 3ms)
 GET /api/comparison/save 200 in 5ms (compile: 1680µs, render: 4ms)
 GET /api/comparison/save 200 in 5ms (compile: 1996µs, render: 3ms)
 ✓ Compiled in 22ms
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 455ms (compile: 1949µs, render: 453ms)
[Config API] Fetching remote config...
[Config API] Config fetched successfully
 GET /api/config 200 in 638ms (compile: 3ms, render: 635ms)
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
 GET /quote-simulator 200 in 371ms (compile: 75ms, render: 296ms)
 GET /api/comparison/save 200 in 6ms (compile: 2ms, render: 4ms)
[Session API] All cookies: [
  { name: '_ga', hasValue: true },
  { name: '_gcl_au', hasValue: true },
  { name: '__next_hmr_refresh_hash__', hasValue: true },
  { name: 'sb-ijlgpzjdfipzmjvawofp-auth-token', hasValue: true },
  { name: '_ga_VBCB77P21T', hasValue: true }
]
[Session API] Supabase cookies: [ 'sb-ijlgpzjdfipzmjvawofp-auth-token' ]
[Session API] URL: http://localhost:3004/api/auth/current-user
[Session API] Referer: http://localhost:3004/quote-simulator
[Config API] Fetching remote config...
[Config API] Fetching remote config...
[Session API] getUser result: {
  hasUser: true,
  userId: '54fd7b31-b805-43cf-b92e-898ddd066875',
  error: undefined
}
[Session API] NEXT_PUBLIC_SUPABASE_URL: https://ijlgpzjdfipzmjvawofp.supabase.co
[Session API] SUPABASE_SERVICE_ROLE_KEY exists: true
[Config API] Config fetched successfully
 GET /api/config 200 in 379ms (compile: 2ms, render: 377ms)
[Config API] Config fetched successfully
 GET /api/config 200 in 394ms (compile: 1986µs, render: 392ms)
 GET /api/health 200 in 11ms (compile: 3ms, render: 8ms)
 GET /api/health 200 in 9ms (compile: 3ms, render: 6ms)
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
 GET /api/auth/current-user 200 in 760ms (compile: 1596µs, render: 759ms)
 GET /api/user/markup-rate 404 in 1310ms (compile: 1195ms, render: 115ms)
 GET /api/pricing/settings 200 in 404ms (compile: 4ms, render: 401ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 539ms (compile: 3ms, render: 536ms)
 GET /api/pricing/settings 200 in 335ms (compile: 1716µs, render: 333ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 925ms (compile: 2ms, render: 923ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 568ms (compile: 1844µs, render: 566ms)
[getAuthenticatedUser] Found user via cookie auth: 54fd7b31-b805-43cf-b92e-898ddd066875
 GET /api/user/markup-rate 200 in 542ms (compile: 1540µs, render: 540ms)
 ⚠ Found a change in next.config.ts. Restarting the server to apply the changes...
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
 ⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
 We detected multiple lockfiles and selected the directory of C:\Users\kanei\claudecode\package-lock.json as the root directory.
 To silence this warning, set `turbopack.root` in your Next.js config, or consider removing one of the lockfiles if it's not needed.
   See https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory for more information.
 Detected additional lockfiles: 
   * C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\pnpm-lock.yaml

   ▲ Next.js 16.0.11 (Turbopack)
   - Local:         http://localhost:3004
   - Network:       http://192.168.0.21:3004
   - Environments: .env.local, .env

 ✓ Starting...
 ⨯ Unable to acquire lock at C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\lock, is another instance of next dev running?
   Suggestion: If you intended to restart next dev, terminate the other process, and then try again.
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[?25h
