import { useState, useMemo } from 'react'

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR'

export interface CurrencyConfig {
  code: Currency
  symbol: string
  name: string
  position: 'before' | 'after'
  decimalPlaces: number
  thousandsSeparator: string
  decimalSeparator: string
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    position: 'before',
    decimalPlaces: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: "'",
    decimalSeparator: '.'
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  }
}

export class CurrencyFormatter {
  private currency: CurrencyConfig

  constructor(currency: Currency = 'USD') {
    this.currency = CURRENCIES[currency]
  }

  format(amount: number, showSymbol: boolean = true): string {
    const absAmount = Math.abs(amount)
    const formattedNumber = this.formatNumber(absAmount)
    
    if (!showSymbol) {
      return formattedNumber
    }

    const symbol = this.currency.symbol
    return this.currency.position === 'before' 
      ? `${symbol}${formattedNumber}`
      : `${formattedNumber}${symbol}`
  }

  formatWithSign(amount: number, showSymbol: boolean = true): string {
    const formatted = this.format(amount, showSymbol)
    return amount >= 0 ? `+${formatted}` : `-${formatted}`
  }

  private formatNumber(num: number): string {
    const parts = num.toFixed(this.currency.decimalPlaces).split('.')
    const integerPart = parts[0]
    const decimalPart = parts[1] || ''

    // Add thousands separators
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, this.currency.thousandsSeparator)
    
    if (this.currency.decimalPlaces === 0) {
      return formattedInteger
    }

    return `${formattedInteger}${this.currency.decimalSeparator}${decimalPart}`
  }

  getCurrencyInfo(): CurrencyConfig {
    return { ...this.currency }
  }
}

// Default currency formatter (USD)
export const defaultFormatter = new CurrencyFormatter('USD')

// Utility functions for easy use
export const formatCurrency = (amount: number, currency: Currency = 'USD', showSymbol: boolean = true): string => {
  const formatter = new CurrencyFormatter(currency)
  return formatter.format(amount, showSymbol)
}

export const formatCurrencyWithSign = (amount: number, currency: Currency = 'USD', showSymbol: boolean = true): string => {
  const formatter = new CurrencyFormatter(currency)
  return formatter.formatWithSign(amount, showSymbol)
}

// Hook for currency management
export const useCurrency = (defaultCurrency: Currency = 'USD') => {
  const [currency, setCurrency] = useState<Currency>(defaultCurrency)
  const formatter = useMemo(() => new CurrencyFormatter(currency), [currency])

  return {
    currency,
    setCurrency,
    formatter,
    format: (amount: number, showSymbol: boolean = true) => formatter.format(amount, showSymbol),
    formatWithSign: (amount: number, showSymbol: boolean = true) => formatter.formatWithSign(amount, showSymbol),
    currencies: CURRENCIES
  }
} 