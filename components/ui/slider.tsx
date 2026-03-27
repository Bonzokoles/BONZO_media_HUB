'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  // Ensure values are valid numbers, falling back to min
  const sanitizeValues = React.useCallback((vals: number[] | undefined): number[] => {
    if (!Array.isArray(vals) || vals.length === 0) return [min]
    return vals.map(v => (typeof v === 'number' && !isNaN(v) && isFinite(v) ? v : min))
  }, [min])

  const _values = React.useMemo(
    () => {
      if (Array.isArray(value) && value.length > 0) {
        return sanitizeValues(value)
      }
      if (Array.isArray(defaultValue) && defaultValue.length > 0) {
        return sanitizeValues(defaultValue)
      }
      return [min]
    },
    [value, defaultValue, min, sanitizeValues],
  )
  
  // Always provide a valid array for controlled component
  const sanitizedValue = React.useMemo(() => {
    if (value !== undefined) {
      return sanitizeValues(Array.isArray(value) ? value : [value as number])
    }
    return undefined
  }, [value, sanitizeValues])

  const sanitizedDefaultValue = React.useMemo(() => {
    if (defaultValue !== undefined && sanitizedValue === undefined) {
      return sanitizeValues(Array.isArray(defaultValue) ? defaultValue : [defaultValue as number])
    }
    return undefined
  }, [defaultValue, sanitizedValue, sanitizeValues])

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={sanitizedDefaultValue}
      value={sanitizedValue}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={
          'bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5'
        }
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={
            'bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full'
          }
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
