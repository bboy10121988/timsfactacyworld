import Script from 'next/script'

interface GoogleAnalyticsProps {
  measurementId?: string
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const gaId = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (!gaId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `,
        }}
      />
    </>
  )
}

interface GoogleSearchConsoleProps {
  verificationCode?: string
}

export function GoogleSearchConsole({ verificationCode }: GoogleSearchConsoleProps) {
  const code = verificationCode || process.env.NEXT_PUBLIC_GSC_VERIFICATION

  if (!code) return null

  return (
    <meta
      name="google-site-verification"
      content={code}
    />
  )
}

interface WebVitalsReportingProps {
  debug?: boolean
}

export function WebVitalsReporting({ debug = false }: WebVitalsReportingProps) {
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return null

  return (
    <Script
      id="web-vitals-reporting"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
          
          function sendToGoogleAnalytics({name, delta, value, id}) {
            gtag('event', name, {
              event_category: 'Web Vitals',
              event_label: id,
              value: Math.round(name === 'CLS' ? delta * 1000 : delta),
              non_interaction: true,
            });
            
            ${debug ? `
            console.log('📊 Core Web Vitals:', {
              metric: name,
              value: Math.round(name === 'CLS' ? delta * 1000 : delta),
              rating: value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor'
            });
            ` : ''}
          }
          
          getCLS(sendToGoogleAnalytics);
          getFID(sendToGoogleAnalytics);
          getFCP(sendToGoogleAnalytics);
          getLCP(sendToGoogleAnalytics);
          getTTFB(sendToGoogleAnalytics);
        `,
      }}
    />
  )
}

// 整合組件
interface GoogleServicesProps {
  gaId?: string
  gscVerification?: string
  enableWebVitals?: boolean
  debug?: boolean
}

export default function GoogleServices({ 
  gaId, 
  gscVerification, 
  enableWebVitals = true,
  debug = false 
}: GoogleServicesProps) {
  return (
    <>
      <GoogleSearchConsole verificationCode={gscVerification} />
      <GoogleAnalytics measurementId={gaId} />
      {enableWebVitals && <WebVitalsReporting debug={debug} />}
    </>
  )
}
