import { renderHook, act } from '@testing-library/react'
import { useIsClient } from '@/hooks/shared/useIsClient'

describe('useIsClient Hook', () => {
  it('returns false on initial render (server-side)', () => {
    const { result } = renderHook(() => useIsClient())
    expect(result.current).toBe(false)
  })

  it('returns true after hydration (client-side)', () => {
    const { result } = renderHook(() => useIsClient())

    // Simulate hydration
    act(() => {
      // Trigger useEffect
    })

    expect(result.current).toBe(true)
  })

  it('maintains true state after hydration', () => {
    const { result, rerender } = renderHook(() => useIsClient())

    // Simulate hydration
    act(() => {
      // Trigger useEffect
    })

    expect(result.current).toBe(true)

    // Re-render should maintain true state
    rerender()
    expect(result.current).toBe(true)
  })

  it('works correctly with multiple instances', () => {
    const { result: result1 } = renderHook(() => useIsClient())
    const { result: result2 } = renderHook(() => useIsClient())

    // Both should start as false
    expect(result1.current).toBe(false)
    expect(result2.current).toBe(false)

    // Simulate hydration for both
    act(() => {
      // Trigger useEffect for both hooks
    })

    // Both should become true
    expect(result1.current).toBe(true)
    expect(result2.current).toBe(true)
  })

  it('handles unmounting and remounting', () => {
    const { result, unmount } = renderHook(() => useIsClient())

    // Simulate hydration
    act(() => {
      // Trigger useEffect
    })

    expect(result.current).toBe(true)

    // Unmount
    unmount()

    // Remount
    const { result: newResult } = renderHook(() => useIsClient())
    expect(newResult.current).toBe(false)

    // Simulate hydration again
    act(() => {
      // Trigger useEffect
    })

    expect(newResult.current).toBe(true)
  })
})


