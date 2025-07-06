"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Currency, CURRENCIES, CurrencyFormatter } from '@/lib/currency'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  format: (amount: number, showSymbol?: boolean) => string
  formatWithSign: (amount: number, showSymbol?: boolean) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

interface CurrencyProviderProps {
  children: ReactNode
  defaultCurrency?: Currency
}

export const CurrencyProvider = ({ children, defaultCurrency = 'USD' }: CurrencyProviderProps) => {
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency)

  // Load currency preference from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred-currency') as Currency
    if (savedCurrency && Object.keys(CURRENCIES).includes(savedCurrency)) {
      setCurrencyState(savedCurrency)
    }
  }, [])

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('preferred-currency', newCurrency)
  }

  const format = (amount: number, showSymbol: boolean = true) => {
    const formatter = new CurrencyFormatter(currency)
    return formatter.format(amount, showSymbol)
  }

  const formatWithSign = (amount: number, showSymbol: boolean = true) => {
    const formatter = new CurrencyFormatter(currency)
    return formatter.formatWithSign(amount, showSymbol)
  }

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      format,
      formatWithSign
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrencyContext = () => {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider')
  }
  return context
} 