'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ChevronDownIcon } from 'lucide-react'
import { type DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerRangeProps {
  range?: DateRange | undefined
  onRangeChange?: (range: DateRange | undefined) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  className?: string
}

export function DatePickerRange({
  range,
  onRangeChange,
  placeholder = 'Chọn khoảng thời gian',
  label,
  disabled = false,
  className = 'w-full max-w-xs space-y-2',
}: DatePickerRangeProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (selectedRange: DateRange | undefined) => {
    if (onRangeChange) {
      onRangeChange(selectedRange)
    }
  }

  const formatDateRange = (dateRange: DateRange | undefined): string => {
    if (!dateRange?.from) return placeholder
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'dd/MM/yyyy', { locale: vi })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: vi })}`
    }
    return format(dateRange.from, 'dd/MM/yyyy', { locale: vi })
  }

  return (
    <div className={className}>
      {label && (
        <Label htmlFor='date-range-picker' className='px-1'>
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            id='date-range-picker'
            className='w-full justify-between font-normal'
            disabled={disabled}
          >
            {formatDateRange(range)}
            <ChevronDownIcon className='h-4 w-4' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
          <Calendar
            mode='range'
            selected={range}
            onSelect={handleSelect}
            captionLayout='dropdown'
            fromYear={1900}
            toYear={2100}
            locale={vi}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DatePickerRange

