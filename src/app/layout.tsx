import "./globals.css"
import { Header } from "@/components/header"
import { inter } from "@/app/fonts"
import { IntegrationProvider } from "./integration-provider"
import { AuthProvider } from "./auth-provider"

export const metadata = {
  title: {
    default: "Use Case Template",
    template: "%s | Use Case Template",
  },
  description: "Integration.app use case template application",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body
        className={`${inter.className} antialiased bg-white text-gray-900`}
      >
        <AuthProvider>
          <IntegrationProvider>
            <Header />
            <main>
              {children}
            </main>
          </IntegrationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
