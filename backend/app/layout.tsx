import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medusa Store',
  description: 'A performant frontend ecommerce starter template with Next.js 14 and Medusa.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
