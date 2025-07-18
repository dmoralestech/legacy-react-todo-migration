import type { Metadata } from 'next'
import { JotaiProvider } from '../src/utils/providers'
import Navigation from '../src/components/Navigation'
import '../src/App.css'

export const metadata: Metadata = {
  title: 'Modern TODO App',
  description: 'Next.js 15 + React 19 + Jotai TODO application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <JotaiProvider>
          <div className="App">
            <Navigation />
            {children}
          </div>
        </JotaiProvider>
      </body>
    </html>
  )
}