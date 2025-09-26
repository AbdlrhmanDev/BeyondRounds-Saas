import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  it('renders with custom size', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    let spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('h-4', 'w-4')

    rerender(<LoadingSpinner size="lg" />)
    spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('h-8', 'w-8')

    rerender(<LoadingSpinner size="xl" />)
    spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('h-12', 'w-12')
  })

  it('renders with custom className', () => {
    render(<LoadingSpinner className="custom-spinner" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('custom-spinner')
  })

  it('renders with custom aria-label', () => {
    render(<LoadingSpinner ariaLabel="Custom loading" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Custom loading')
  })

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Please wait..." />)
    expect(screen.getByText('Please wait...')).toBeInTheDocument()
  })

  it('renders without text when text is not provided', () => {
    render(<LoadingSpinner />)
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it('combines size and custom className', () => {
    render(<LoadingSpinner size="lg" className="custom-class" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('h-8', 'w-8', 'custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<LoadingSpinner ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it('renders with all props combined', () => {
    render(
      <LoadingSpinner 
        size="xl" 
        className="custom-spinner" 
        ariaLabel="Loading data"
        text="Loading your data..."
      />
    )
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('h-12', 'w-12', 'custom-spinner')
    expect(spinner).toHaveAttribute('aria-label', 'Loading data')
    expect(screen.getByText('Loading your data...')).toBeInTheDocument()
  })
})


