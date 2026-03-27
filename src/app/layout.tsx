import type { Metadata } from "next";
import "./globals.css";
import { NurseProvider } from '@/contexts/NurseContext'
import { NurseSwitcher } from '@/components/NurseSwitcher'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: "Nurse Context Engine",
  description: "AI-native patient context system for clinical workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <NurseProvider>
          <header className="border-b border-border bg-surface">
            <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                  </svg>
                </div>
                <h1 className="text-lg font-semibold text-primary">Nurse Context Engine</h1>
              </div>
              <NurseSwitcher />
            </div>
          </header>
          <main>{children}</main>
          <Toaster position="bottom-right" richColors />
        </NurseProvider>
      </body>
    </html>
  );
}
