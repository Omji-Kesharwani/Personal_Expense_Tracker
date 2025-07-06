"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CURRENCIES, type Currency } from '@/lib/currency'

interface CurrencySelectorProps {
  selectedCurrency: Currency
  onCurrencyChange: (currency: Currency) => void
  className?: string
}

export const CurrencySelector = ({ 
  selectedCurrency, 
  onCurrencyChange, 
  className = '' 
}: CurrencySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`flex items-center gap-2 ${className}`}
        >
          <Globe className="h-4 w-4" />
          <span className="font-medium">{CURRENCIES[selectedCurrency].symbol}</span>
          <span className="text-sm text-muted-foreground">
            {CURRENCIES[selectedCurrency].code}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {Object.entries(CURRENCIES).map(([code, config]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => {
              onCurrencyChange(code as Currency)
              setIsOpen(false)
            }}
            className={`flex items-center justify-between cursor-pointer ${
              selectedCurrency === code ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-medium">{config.symbol}</span>
              <div className="flex flex-col">
                <span className="font-medium">{config.name}</span>
                <span className="text-xs text-muted-foreground">{code}</span>
              </div>
            </div>
            {selectedCurrency === code && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-primary rounded-full"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 