import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Finance Tracker - Personal Finance Management",
  description: "A modern personal finance tracker to manage your income, expenses, and financial goals with beautiful charts and insights.",
  keywords: "finance, budget, expenses, income, personal finance, money management",
  authors: [{ name: "Finance Tracker Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased">
        <ErrorBoundary>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
