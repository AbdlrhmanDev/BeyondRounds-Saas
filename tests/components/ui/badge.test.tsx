import { render, screen, fireEvent } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge Component', () => {
  it('renders with default props', () => {
    render(<Badge>Default Badge</Badge>)
    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('inline-flex', 'items-center')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>)
    expect(screen.getByText('Default')).toHaveClass('bg-primary')

    rerender(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary')

    rerender(<Badge variant="destructive">Destructive</Badge>)
    expect(screen.getByText('Destructive')).toHaveClass('bg-destructive')

    rerender(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText('Outline')).toHaveClass('border')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-badge')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Badge ref={ref}>Ref test</Badge>)
    expect(ref).toHaveBeenCalled()
  })

  it('renders with different content types', () => {
    render(
      <Badge>
        <span>Span content</span>
      </Badge>
    )
    expect(screen.getByText('Span content')).toBeInTheDocument()

    render(
      <Badge>
        <strong>Strong content</strong>
      </Badge>
    )
    expect(screen.getByText('Strong content')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Badge onClick={handleClick}>Clickable Badge</Badge>)
    
    fireEvent.click(screen.getByText('Clickable Badge'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders as different HTML elements', () => {
    render(<Badge asChild><a href="/test">Link Badge</a></Badge>)
    expect(screen.getByRole('link')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveTextContent('Link Badge')
  })

  it('combines variant and custom classes', () => {
    render(<Badge variant="secondary" className="custom-class">Combined</Badge>)
    const badge = screen.getByText('Combined')
    expect(badge).toHaveClass('bg-secondary', 'custom-class')
  })
})


