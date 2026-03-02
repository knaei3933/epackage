

GTM 태그 관리자
1. 페이지의 **<head>**에서 최대한 위에 이 코드를 붙여넣으세요.
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T4PL5XMC');</script>
<!-- End Google Tag Manager -->

2. 여는 **<body>** 태그 바로 뒤에 코드를 붙여넣으세요.
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T4PL5XMC"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->

구글 애널리틱스

아래에 이 계정의 Google 태그가 있습니다. 태그를 복사한 후 웹사이트의 각 페이지 코드에서 <head> 요소 바로 다음에 붙여넣으세요. Google 태그는 각 페이지에 하나씩만 추가합니다.

<!-- Google tag (gtag.js) --> <script async src="https://www.googletagmanager.com/gtag/js?id=G-VBCB77P21T"></script> <script> window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-VBCB77P21T'); </script>

## 스트림 세부정보

스트림 이름 package-lab

스트림 URL https://www.package-lab.com/

스트림 ID 13686687864

측정 ID G-VBCB77P21T



페이스북 : https://www.facebook.com/profile.php?id=61588266725454
인스타 : https://www.instagram.com/epackagelab/

---

## Google Ads (2026-03-02 추가)

전환추적 태그 정보:
- **Google Ads ID**: AW-17981675917
- **전환 라벨**: iBi-CJv-44EcEI2zqv5C

### Google Ads gtag.js 코드

```html
<!-- Google Ads gtag.js -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17981675917"></script>
<script>
  gtag('config', 'AW-17981675917');
</script>
```

### 전환 이벤트 스니펫

```html
<!-- Event snippet for 페이지 조회 conversion page -->
<script>
  gtag('event', 'conversion', {
    'send_to': 'AW-17981675917/iBi-CJv-44EcEI2zqv5C',
    'value': 1.0,
    'currency': 'JPY'
  });
</script>
```

### dataLayer 함수 (src/lib/analytics/dataLayer.ts)

```typescript
// Google Ads 컨버전 추적
export const trackGoogleAdsConversion = (value: number = 1.0, currency: string = 'JPY') => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      'send_to': 'AW-17981675917/iBi-CJv-44EcEI2zqv5C',
      'value': value,
      'currency': currency
    });
  }
};

export const trackGoogleAdsPageView = () => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      'send_to': 'AW-17981675917'
    });
  }
};
```
