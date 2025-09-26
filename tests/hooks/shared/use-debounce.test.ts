import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/shared/useDebounce'

describe('useDebounce Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    // Change value multiple times quickly
    rerender({ value: 'first', delay: 500 })
    rerender({ value: 'second', delay: 500 })
    rerender({ value: 'third', delay: 500 })

    // Value should still be initial
    expect(result.current).toBe('initial')

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Value should now be the last one
    expect(result.current).toBe('third')
  })

  it('uses custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    )

    rerender({ value: 'changed', delay: 1000 })

    // Value should not change yet
    expect(result.current).toBe('initial')

    // Fast-forward by less than delay
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('initial')

    // Fast-forward by remaining time
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('changed')
  })

  it('handles zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    )

    rerender({ value: 'changed', delay: 0 })

    // Value should change immediately
    expect(result.current).toBe('changed')
  })

  it('clears previous timeout when value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    rerender({ value: 'first', delay: 500 })

    // Fast-forward by less than delay
    act(() => {
      jest.advanceTimersByTime(300)
    })

    // Change value again
    rerender({ value: 'second', delay: 500 })

    // Fast-forward by remaining time from first change
    act(() => {
      jest.advanceTimersByTime(200)
    })

    // Should still be initial because second change reset the timer
    expect(result.current).toBe('initial')

    // Fast-forward by full delay from second change
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('second')
  })

  it('handles undefined and null values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: undefined, delay: 500 } }
    )

    expect(result.current).toBeUndefined()

    rerender({ value: null, delay: 500 })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBeNull()
  })

  it('handles changing delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    rerender({ value: 'changed', delay: 1000 })

    // Fast-forward by original delay
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Should still be initial because delay changed
    expect(result.current).toBe('initial')

    // Fast-forward by remaining time with new delay
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('changed')
  })
})


