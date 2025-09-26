import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('handles conditional classes', () => {
    expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
    expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
  })

  it('handles undefined and null values', () => {
    expect(cn('base-class', undefined, null)).toBe('base-class')
  })

  it('handles empty strings', () => {
    expect(cn('base-class', '')).toBe('base-class')
  })

  it('handles arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
  })

  it('handles objects with boolean values', () => {
    expect(cn({
      'class1': true,
      'class2': false,
      'class3': true
    })).toBe('class1 class3')
  })

  it('handles mixed input types', () => {
    expect(cn(
      'base-class',
      ['array-class1', 'array-class2'],
      {
        'object-class': true,
        'object-class-false': false
      },
      'string-class'
    )).toBe('base-class array-class1 array-class2 object-class string-class')
  })

  it('resolves Tailwind conflicts correctly', () => {
    expect(cn('px-2 px-4')).toBe('px-4')
    expect(cn('bg-red-500 bg-blue-500')).toBe('bg-blue-500')
    expect(cn('text-sm text-lg')).toBe('text-lg')
  })

  it('handles complex Tailwind merging', () => {
    expect(cn('px-2 py-1 bg-red-500', 'px-4 bg-blue-500')).toBe('py-1 px-4 bg-blue-500')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })

  it('handles single class', () => {
    expect(cn('single-class')).toBe('single-class')
  })

  it('handles nested arrays', () => {
    expect(cn(['class1', ['class2', 'class3']])).toBe('class1 class2 class3')
  })

  it('handles deeply nested objects', () => {
    expect(cn({
      'level1': {
        'level2': true,
        'level2-false': false
      }
    })).toBe('level1')
  })
})


