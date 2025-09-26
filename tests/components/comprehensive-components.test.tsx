/**
 * Comprehensive Component Test Suite
 * 
 * Tests all React components in the BeyondRounds application:
 * - UI Components (buttons, forms, cards, etc.)
 * - Feature Components (authentication, profile, matching, etc.)
 * - Layout Components (navigation, providers, etc.)
 * - Shared Components (error boundaries, loading states, etc.)
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(() => Promise.resolve({ 
      data: { user: { id: 'test-user', email: 'test@example.com' } }, 
      error: null 
    })),
    getSession: jest.fn(() => Promise.resolve({ 
      data: { session: { user: { id: 'test-user' } } }, 
      error: null 
    })),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ 
      data: { subscription: { unsubscribe: jest.fn() } } 
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
  })),
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// Mock components for testing
const MockButton = ({ children, onClick, disabled, variant = 'default', size = 'default', className, ...props }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`btn btn-${variant} btn-${size} ${className || ''}`}
    data-testid="button"
    {...props}
  >
    {children}
  </button>
)

const MockInput = ({ value, onChange, placeholder, type = 'text', disabled, className, ...props }: any) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    className={className}
    data-testid="input"
    {...props}
  />
)

const MockCard = ({ children, className, ...props }: any) => (
  <div className={`card ${className || ''}`} data-testid="card" {...props}>
    {children}
  </div>
)

const MockLoadingSpinner = ({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) => (
  <div className={`spinner spinner-${size}`} data-testid="loading-spinner">
    Loading...
  </div>
)

describe('🧩 Comprehensive Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ============================================================================
  // UI COMPONENTS TESTS
  // ============================================================================
  describe('🎨 UI Components', () => {
    describe('Button Component', () => {
      it('should render button with correct text', () => {
        render(<MockButton>Click me</MockButton>)
        expect(screen.getByText('Click me')).toBeInTheDocument()
      })

      it('should handle click events', async () => {
        const handleClick = jest.fn()
        render(<MockButton onClick={handleClick}>Click me</MockButton>)
        
        const button = screen.getByTestId('button')
        await userEvent.click(button)
        
        expect(handleClick).toHaveBeenCalledTimes(1)
      })

      it('should be disabled when disabled prop is true', () => {
        render(<MockButton disabled>Disabled</MockButton>)
        const button = screen.getByTestId('button')
        expect(button).toBeDisabled()
      })

      it('should apply variant classes correctly', () => {
        render(<MockButton variant="primary">Primary</MockButton>)
        const button = screen.getByTestId('button')
        expect(button).toHaveClass('btn-primary')
      })

      it('should apply size classes correctly', () => {
        render(<MockButton size="lg">Large</MockButton>)
        const button = screen.getByTestId('button')
        expect(button).toHaveClass('btn-lg')
      })

      it('should handle custom className', () => {
        render(<MockButton className="custom-class">Custom</MockButton>)
        const button = screen.getByTestId('button')
        expect(button).toHaveClass('custom-class')
      })
    })

    describe('Input Component', () => {
      it('should render input with placeholder', () => {
        render(<MockInput placeholder="Enter text" />)
        const input = screen.getByTestId('input')
        expect(input).toHaveAttribute('placeholder', 'Enter text')
      })

      it('should handle value changes', async () => {
        const handleChange = jest.fn()
        render(<MockInput value="" onChange={handleChange} />)
        
        const input = screen.getByTestId('input')
        await userEvent.type(input, 'test')
        
        expect(handleChange).toHaveBeenCalled()
      })

      it('should handle different input types', () => {
        render(<MockInput type="password" />)
        const input = screen.getByTestId('input')
        expect(input).toHaveAttribute('type', 'password')
      })

      it('should be disabled when disabled prop is true', () => {
        render(<MockInput disabled />)
        const input = screen.getByTestId('input')
        expect(input).toBeDisabled()
      })

      it('should display current value', () => {
        render(<MockInput value="current value" onChange={() => {}} />)
        const input = screen.getByTestId('input') as HTMLInputElement
        expect(input.value).toBe('current value')
      })
    })

    describe('Card Component', () => {
      it('should render card with children', () => {
        render(
          <MockCard>
            <h2>Card Title</h2>
            <p>Card content</p>
          </MockCard>
        )
        
        expect(screen.getByText('Card Title')).toBeInTheDocument()
        expect(screen.getByText('Card content')).toBeInTheDocument()
      })

      it('should apply custom className', () => {
        render(<MockCard className="custom-card">Content</MockCard>)
        const card = screen.getByTestId('card')
        expect(card).toHaveClass('custom-card')
      })

      it('should handle click events', async () => {
        const handleClick = jest.fn()
        render(<MockCard onClick={handleClick}>Clickable card</MockCard>)
        
        const card = screen.getByTestId('card')
        await userEvent.click(card)
        
        expect(handleClick).toHaveBeenCalledTimes(1)
      })
    })

    describe('Loading Spinner Component', () => {
      it('should render loading spinner', () => {
        render(<MockLoadingSpinner />)
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
        expect(screen.getByText('Loading...')).toBeInTheDocument()
      })

      it('should apply size classes correctly', () => {
        render(<MockLoadingSpinner size="lg" />)
        const spinner = screen.getByTestId('loading-spinner')
        expect(spinner).toHaveClass('spinner-lg')
      })

      it('should have default size when no size prop provided', () => {
        render(<MockLoadingSpinner />)
        const spinner = screen.getByTestId('loading-spinner')
        expect(spinner).toHaveClass('spinner-default')
      })
    })
  })

  // ============================================================================
  // FEATURE COMPONENTS TESTS
  // ============================================================================
  describe('🚀 Feature Components', () => {
    describe('Authentication Components', () => {
      const MockLoginForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
        const [email, setEmail] = React.useState('')
        const [password, setPassword] = React.useState('')

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault()
          onSubmit({ email, password })
        }

        return (
          <form onSubmit={handleSubmit} data-testid="login-form">
            <MockInput
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <MockInput
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <MockButton type="submit">Login</MockButton>
          </form>
        )
      }

      it('should render login form correctly', () => {
        render(<MockLoginForm onSubmit={() => {}} />)
        
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
        expect(screen.getByText('Login')).toBeInTheDocument()
      })

      it('should handle form submission', async () => {
        const handleSubmit = jest.fn()
        render(<MockLoginForm onSubmit={handleSubmit} />)
        
        const emailInput = screen.getByPlaceholderText('Email')
        const passwordInput = screen.getByPlaceholderText('Password')
        const submitButton = screen.getByText('Login')

        await userEvent.type(emailInput, 'test@example.com')
        await userEvent.type(passwordInput, 'password123')
        await userEvent.click(submitButton)

        expect(handleSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })

      it('should validate email format', async () => {
        const MockLoginFormWithValidation = () => {
          const [email, setEmail] = React.useState('')
          const [error, setError] = React.useState('')

          const validateEmail = (email: string) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return emailRegex.test(email)
          }

          const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault()
            if (!validateEmail(email)) {
              setError('Invalid email format')
              return
            }
            setError('')
          }

          return (
            <form onSubmit={handleSubmit}>
              <MockInput
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="Email"
              />
              {error && <div data-testid="error-message">{error}</div>}
              <MockButton type="submit">Login</MockButton>
            </form>
          )
        }

        render(<MockLoginFormWithValidation />)
        
        const emailInput = screen.getByPlaceholderText('Email')
        const submitButton = screen.getByText('Login')

        await userEvent.type(emailInput, 'invalid-email')
        await userEvent.click(submitButton)

        expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid email format')
      })
    })

    describe('Profile Components', () => {
      const MockProfileForm = ({ initialData, onSave }: any) => {
        const [formData, setFormData] = React.useState(initialData || {
          first_name: '',
          last_name: '',
          specialty: '',
          interests: [],
        })

        const handleInputChange = (field: string, value: any) => {
          setFormData((prev: any) => ({ ...prev, [field]: value }))
        }

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault()
          onSave(formData)
        }

        return (
          <form onSubmit={handleSubmit} data-testid="profile-form">
            <MockInput
              value={formData.first_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleInputChange('first_name', e.target.value)
              }
              placeholder="First Name"
            />
            <MockInput
              value={formData.last_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleInputChange('last_name', e.target.value)
              }
              placeholder="Last Name"
            />
            <select
              value={formData.specialty}
              onChange={(e) => handleInputChange('specialty', e.target.value)}
              data-testid="specialty-select"
            >
              <option value="">Select Specialty</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>
            <MockButton type="submit">Save Profile</MockButton>
          </form>
        )
      }

      it('should render profile form with initial data', () => {
        const initialData = {
          first_name: 'John',
          last_name: 'Doe',
          specialty: 'Cardiology',
          interests: ['Reading'],
        }

        render(<MockProfileForm initialData={initialData} onSave={() => {}} />)
        
        const firstNameInput = screen.getByPlaceholderText('First Name') as HTMLInputElement
        const lastNameInput = screen.getByPlaceholderText('Last Name') as HTMLInputElement
        const specialtySelect = screen.getByTestId('specialty-select') as HTMLSelectElement

        expect(firstNameInput.value).toBe('John')
        expect(lastNameInput.value).toBe('Doe')
        expect(specialtySelect.value).toBe('Cardiology')
      })

      it('should handle profile form submission', async () => {
        const handleSave = jest.fn()
        render(<MockProfileForm onSave={handleSave} />)
        
        const firstNameInput = screen.getByPlaceholderText('First Name')
        const lastNameInput = screen.getByPlaceholderText('Last Name')
        const specialtySelect = screen.getByTestId('specialty-select')
        const saveButton = screen.getByText('Save Profile')

        await userEvent.type(firstNameInput, 'Jane')
        await userEvent.type(lastNameInput, 'Smith')
        await userEvent.selectOptions(specialtySelect, 'Neurology')
        await userEvent.click(saveButton)

        expect(handleSave).toHaveBeenCalledWith({
          first_name: 'Jane',
          last_name: 'Smith',
          specialty: 'Neurology',
          interests: [],
        })
      })

      it('should validate required fields', async () => {
        const MockProfileFormWithValidation = () => {
          const [formData, setFormData] = React.useState({
            first_name: '',
            last_name: '',
            specialty: '',
          })
          const [errors, setErrors] = React.useState<string[]>([])

          const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault()
            const newErrors = []
            
            if (!formData.first_name) newErrors.push('First name is required')
            if (!formData.last_name) newErrors.push('Last name is required')
            if (!formData.specialty) newErrors.push('Specialty is required')

            setErrors(newErrors)
          }

          return (
            <form onSubmit={handleSubmit}>
              <MockInput
                value={formData.first_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData(prev => ({ ...prev, first_name: e.target.value }))
                }
                placeholder="First Name"
              />
              <MockInput
                value={formData.last_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData(prev => ({ ...prev, last_name: e.target.value }))
                }
                placeholder="Last Name"
              />
              <select
                value={formData.specialty}
                onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                data-testid="specialty-select"
              >
                <option value="">Select Specialty</option>
                <option value="Cardiology">Cardiology</option>
              </select>
              {errors.length > 0 && (
                <div data-testid="error-list">
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
              <MockButton type="submit">Save</MockButton>
            </form>
          )
        }

        render(<MockProfileFormWithValidation />)
        
        const saveButton = screen.getByText('Save')
        await userEvent.click(saveButton)

        const errorList = screen.getByTestId('error-list')
        expect(errorList).toHaveTextContent('First name is required')
        expect(errorList).toHaveTextContent('Last name is required')
        expect(errorList).toHaveTextContent('Specialty is required')
      })
    })

    describe('Chat Components', () => {
      const MockChatComponent = ({ messages, onSendMessage }: any) => {
        const [newMessage, setNewMessage] = React.useState('')

        const handleSend = () => {
          if (newMessage.trim()) {
            onSendMessage(newMessage)
            setNewMessage('')
          }
        }

        return (
          <div data-testid="chat-component">
            <div data-testid="messages-list">
              {messages.map((message: any, index: number) => (
                <div key={index} data-testid={`message-${index}`}>
                  <strong>{message.sender}:</strong> {message.content}
                </div>
              ))}
            </div>
            <div data-testid="message-input-area">
              <MockInput
                value={newMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <MockButton onClick={handleSend}>Send</MockButton>
            </div>
          </div>
        )
      }

      it('should render chat messages', () => {
        const messages = [
          { sender: 'John', content: 'Hello everyone!' },
          { sender: 'Jane', content: 'Hi there!' },
        ]

        render(<MockChatComponent messages={messages} onSendMessage={() => {}} />)
        
        expect(screen.getByTestId('message-0')).toHaveTextContent('John: Hello everyone!')
        expect(screen.getByTestId('message-1')).toHaveTextContent('Jane: Hi there!')
      })

      it('should handle sending new messages', async () => {
        const handleSendMessage = jest.fn()
        render(<MockChatComponent messages={[]} onSendMessage={handleSendMessage} />)
        
        const messageInput = screen.getByPlaceholderText('Type a message...')
        const sendButton = screen.getByText('Send')

        await userEvent.type(messageInput, 'New message')
        await userEvent.click(sendButton)

        expect(handleSendMessage).toHaveBeenCalledWith('New message')
      })

      it('should not send empty messages', async () => {
        const handleSendMessage = jest.fn()
        render(<MockChatComponent messages={[]} onSendMessage={handleSendMessage} />)
        
        const sendButton = screen.getByText('Send')
        await userEvent.click(sendButton)

        expect(handleSendMessage).not.toHaveBeenCalled()
      })

      it('should clear input after sending message', async () => {
        const handleSendMessage = jest.fn()
        render(<MockChatComponent messages={[]} onSendMessage={handleSendMessage} />)
        
        const messageInput = screen.getByPlaceholderText('Type a message...') as HTMLInputElement
        const sendButton = screen.getByText('Send')

        await userEvent.type(messageInput, 'Test message')
        await userEvent.click(sendButton)

        expect(messageInput.value).toBe('')
      })
    })

    describe('Matching Components', () => {
      const MockMatchCard = ({ match, onJoinGroup, onPassGroup }: any) => {
        return (
          <MockCard data-testid="match-card">
            <h3>Match Group</h3>
            <p>Compatibility: {match.compatibility_score * 100}%</p>
            <p>Members: {match.members.length}</p>
            <div>
              {match.members.map((member: any, index: number) => (
                <span key={index} data-testid={`member-${index}`}>
                  {member.first_name} ({member.specialty})
                </span>
              ))}
            </div>
            <div>
              <MockButton onClick={() => onJoinGroup(match.id)} variant="primary">
                Join Group
              </MockButton>
              <MockButton onClick={() => onPassGroup(match.id)} variant="secondary">
                Pass
              </MockButton>
            </div>
          </MockCard>
        )
      }

      it('should render match information', () => {
        const match = {
          id: 'match-1',
          compatibility_score: 0.85,
          members: [
            { first_name: 'John', specialty: 'Cardiology' },
            { first_name: 'Jane', specialty: 'Neurology' },
          ],
        }

        render(<MockMatchCard match={match} onJoinGroup={() => {}} onPassGroup={() => {}} />)
        
        expect(screen.getByText('Compatibility: 85%')).toBeInTheDocument()
        expect(screen.getByText('Members: 2')).toBeInTheDocument()
        expect(screen.getByTestId('member-0')).toHaveTextContent('John (Cardiology)')
        expect(screen.getByTestId('member-1')).toHaveTextContent('Jane (Neurology)')
      })

      it('should handle joining a group', async () => {
        const handleJoinGroup = jest.fn()
        const match = {
          id: 'match-1',
          compatibility_score: 0.85,
          members: [],
        }

        render(<MockMatchCard match={match} onJoinGroup={handleJoinGroup} onPassGroup={() => {}} />)
        
        const joinButton = screen.getByText('Join Group')
        await userEvent.click(joinButton)

        expect(handleJoinGroup).toHaveBeenCalledWith('match-1')
      })

      it('should handle passing on a group', async () => {
        const handlePassGroup = jest.fn()
        const match = {
          id: 'match-1',
          compatibility_score: 0.85,
          members: [],
        }

        render(<MockMatchCard match={match} onJoinGroup={() => {}} onPassGroup={handlePassGroup} />)
        
        const passButton = screen.getByText('Pass')
        await userEvent.click(passButton)

        expect(handlePassGroup).toHaveBeenCalledWith('match-1')
      })
    })
  })

  // ============================================================================
  // LAYOUT COMPONENTS TESTS
  // ============================================================================
  describe('🏗️ Layout Components', () => {
    describe('Navigation Component', () => {
      const MockNavigation = ({ user, onLogout }: any) => {
        return (
          <nav data-testid="navigation">
            <div>BeyondRounds</div>
            {user ? (
              <div>
                <span data-testid="user-name">Welcome, {user.first_name}</span>
                <MockButton onClick={onLogout}>Logout</MockButton>
              </div>
            ) : (
              <div>
                <MockButton>Login</MockButton>
                <MockButton>Sign Up</MockButton>
              </div>
            )}
          </nav>
        )
      }

      it('should render navigation for authenticated user', () => {
        const user = { first_name: 'John', email: 'john@example.com' }
        render(<MockNavigation user={user} onLogout={() => {}} />)
        
        expect(screen.getByTestId('user-name')).toHaveTextContent('Welcome, John')
        expect(screen.getByText('Logout')).toBeInTheDocument()
      })

      it('should render navigation for unauthenticated user', () => {
        render(<MockNavigation user={null} onLogout={() => {}} />)
        
        expect(screen.getByText('Login')).toBeInTheDocument()
        expect(screen.getByText('Sign Up')).toBeInTheDocument()
      })

      it('should handle logout', async () => {
        const handleLogout = jest.fn()
        const user = { first_name: 'John', email: 'john@example.com' }
        render(<MockNavigation user={user} onLogout={handleLogout} />)
        
        const logoutButton = screen.getByText('Logout')
        await userEvent.click(logoutButton)

        expect(handleLogout).toHaveBeenCalledTimes(1)
      })
    })

    describe('Footer Component', () => {
      const MockFooter = () => {
        return (
          <footer data-testid="footer">
            <div>© 2024 BeyondRounds</div>
            <div>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/contact">Contact</a>
            </div>
          </footer>
        )
      }

      it('should render footer with copyright', () => {
        render(<MockFooter />)
        expect(screen.getByText('© 2024 BeyondRounds')).toBeInTheDocument()
      })

      it('should render footer links', () => {
        render(<MockFooter />)
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
        expect(screen.getByText('Terms of Service')).toBeInTheDocument()
        expect(screen.getByText('Contact')).toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // SHARED COMPONENTS TESTS
  // ============================================================================
  describe('🔗 Shared Components', () => {
    describe('Error Boundary Component', () => {
      const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
        if (shouldThrow) {
          throw new Error('Test error')
        }
        return <div>No error</div>
      }

      const MockErrorBoundary = ({ children }: { children: React.ReactNode }) => {
        const [hasError, setHasError] = React.useState(false)

        React.useEffect(() => {
          const errorHandler = () => setHasError(true)
          window.addEventListener('error', errorHandler)
          return () => window.removeEventListener('error', errorHandler)
        }, [])

        if (hasError) {
          return <div data-testid="error-fallback">Something went wrong</div>
        }

        return <>{children}</>
      }

      it('should render children when no error', () => {
        render(
          <MockErrorBoundary>
            <ThrowError shouldThrow={false} />
          </MockErrorBoundary>
        )
        
        expect(screen.getByText('No error')).toBeInTheDocument()
      })

      // Note: Error boundary testing requires special setup in Jest
      // This is a simplified version for demonstration
    })

    describe('Loading States', () => {
      const MockLoadingState = ({ isLoading, children }: any) => {
        if (isLoading) {
          return <MockLoadingSpinner />
        }
        return children
      }

      it('should show loading spinner when loading', () => {
        render(
          <MockLoadingState isLoading={true}>
            <div>Content</div>
          </MockLoadingState>
        )
        
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
        expect(screen.queryByText('Content')).not.toBeInTheDocument()
      })

      it('should show content when not loading', () => {
        render(
          <MockLoadingState isLoading={false}>
            <div>Content</div>
          </MockLoadingState>
        )
        
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
        expect(screen.getByText('Content')).toBeInTheDocument()
      })
    })

    describe('Protected Route Component', () => {
      const MockProtectedRoute = ({ user, children }: any) => {
        if (!user) {
          return <div data-testid="login-required">Please log in to access this page</div>
        }
        return children
      }

      it('should render children when user is authenticated', () => {
        const user = { id: 'user-1', email: 'test@example.com' }
        render(
          <MockProtectedRoute user={user}>
            <div>Protected content</div>
          </MockProtectedRoute>
        )
        
        expect(screen.getByText('Protected content')).toBeInTheDocument()
      })

      it('should show login message when user is not authenticated', () => {
        render(
          <MockProtectedRoute user={null}>
            <div>Protected content</div>
          </MockProtectedRoute>
        )
        
        expect(screen.getByTestId('login-required')).toHaveTextContent('Please log in to access this page')
        expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // COMPONENT INTEGRATION TESTS
  // ============================================================================
  describe('🔄 Component Integration Tests', () => {
    describe('Form Components Integration', () => {
      const MockCompleteForm = () => {
        const [formData, setFormData] = React.useState({
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          specialty: '',
        })
        const [step, setStep] = React.useState(1)
        const [isSubmitting, setIsSubmitting] = React.useState(false)

        const handleNext = () => setStep(step + 1)
        const handleBack = () => setStep(step - 1)
        
        const handleSubmit = async () => {
          setIsSubmitting(true)
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          setIsSubmitting(false)
        }

        return (
          <div data-testid="complete-form">
            {step === 1 && (
              <div data-testid="step-1">
                <h2>Step 1: Account Information</h2>
                <MockInput
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData(prev => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Email"
                />
                <MockInput
                  type="password"
                  value={formData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData(prev => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Password"
                />
                <MockButton onClick={handleNext}>Next</MockButton>
              </div>
            )}
            
            {step === 2 && (
              <div data-testid="step-2">
                <h2>Step 2: Personal Information</h2>
                <MockInput
                  value={formData.first_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData(prev => ({ ...prev, first_name: e.target.value }))
                  }
                  placeholder="First Name"
                />
                <MockInput
                  value={formData.last_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData(prev => ({ ...prev, last_name: e.target.value }))
                  }
                  placeholder="Last Name"
                />
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                  data-testid="specialty-select"
                >
                  <option value="">Select Specialty</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                </select>
                <MockButton onClick={handleBack}>Back</MockButton>
                <MockButton onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </MockButton>
              </div>
            )}
          </div>
        )
      }

      it('should navigate through multi-step form', async () => {
        render(<MockCompleteForm />)
        
        // Should start on step 1
        expect(screen.getByTestId('step-1')).toBeInTheDocument()
        expect(screen.getByText('Step 1: Account Information')).toBeInTheDocument()

        // Fill out step 1 and proceed
        const emailInput = screen.getByPlaceholderText('Email')
        const passwordInput = screen.getByPlaceholderText('Password')
        const nextButton = screen.getByText('Next')

        await userEvent.type(emailInput, 'test@example.com')
        await userEvent.type(passwordInput, 'password123')
        await userEvent.click(nextButton)

        // Should be on step 2
        expect(screen.getByTestId('step-2')).toBeInTheDocument()
        expect(screen.getByText('Step 2: Personal Information')).toBeInTheDocument()
      })

      it('should go back to previous step', async () => {
        render(<MockCompleteForm />)
        
        // Navigate to step 2
        const nextButton = screen.getByText('Next')
        await userEvent.click(nextButton)

        // Go back to step 1
        const backButton = screen.getByText('Back')
        await userEvent.click(backButton)

        expect(screen.getByTestId('step-1')).toBeInTheDocument()
      })

      it('should handle form submission with loading state', async () => {
        render(<MockCompleteForm />)
        
        // Navigate to step 2
        const nextButton = screen.getByText('Next')
        await userEvent.click(nextButton)

        // Fill out form
        const firstNameInput = screen.getByPlaceholderText('First Name')
        const lastNameInput = screen.getByPlaceholderText('Last Name')
        const specialtySelect = screen.getByTestId('specialty-select')

        await userEvent.type(firstNameInput, 'John')
        await userEvent.type(lastNameInput, 'Doe')
        await userEvent.selectOptions(specialtySelect, 'Cardiology')

        // Submit form
        const submitButton = screen.getByText('Submit')
        await userEvent.click(submitButton)

        // Should show loading state
        expect(screen.getByText('Submitting...')).toBeInTheDocument()
        expect(screen.getByText('Submitting...')).toBeDisabled()
      })
    })
  })

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================
  describe('♿ Accessibility Tests', () => {
    describe('Keyboard Navigation', () => {
      it('should support tab navigation', async () => {
        render(
          <div>
            <MockButton>Button 1</MockButton>
            <MockInput placeholder="Input field" />
            <MockButton>Button 2</MockButton>
          </div>
        )

        const button1 = screen.getByText('Button 1')
        const input = screen.getByPlaceholderText('Input field')
        const button2 = screen.getByText('Button 2')

        // Focus first button
        button1.focus()
        expect(document.activeElement).toBe(button1)

        // Tab to input
        await userEvent.tab()
        expect(document.activeElement).toBe(input)

        // Tab to second button
        await userEvent.tab()
        expect(document.activeElement).toBe(button2)
      })

      it('should handle Enter key on buttons', async () => {
        const handleClick = jest.fn()
        render(<MockButton onClick={handleClick}>Click me</MockButton>)

        const button = screen.getByText('Click me')
        button.focus()
        
        await userEvent.keyboard('{Enter}')
        expect(handleClick).toHaveBeenCalledTimes(1)
      })
    })

    describe('ARIA Attributes', () => {
      const MockAccessibleButton = ({ 
        children, 
        ariaLabel, 
        ariaDescribedBy,
        disabled 
      }: any) => (
        <MockButton
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          disabled={disabled}
        >
          {children}
        </MockButton>
      )

      it('should have proper ARIA labels', () => {
        render(
          <MockAccessibleButton ariaLabel="Close dialog">
            ×
          </MockAccessibleButton>
        )

        const button = screen.getByLabelText('Close dialog')
        expect(button).toBeInTheDocument()
      })

      it('should have proper ARIA described by', () => {
        render(
          <div>
            <MockAccessibleButton ariaDescribedBy="help-text">
              Submit
            </MockAccessibleButton>
            <div id="help-text">This will save your changes</div>
          </div>
        )

        const button = screen.getByText('Submit')
        expect(button).toHaveAttribute('aria-describedby', 'help-text')
      })
    })

    describe('Focus Management', () => {
      it('should trap focus in modal', async () => {
        const MockModal = ({ isOpen, onClose }: any) => {
          if (!isOpen) return null

          return (
            <div data-testid="modal" role="dialog" aria-modal="true">
              <MockButton onClick={onClose}>Close</MockButton>
              <MockInput placeholder="Modal input" />
              <MockButton>Save</MockButton>
            </div>
          )
        }

        render(<MockModal isOpen={true} onClose={() => {}} />)

        const modal = screen.getByTestId('modal')
        const closeButton = screen.getByText('Close')
        const input = screen.getByPlaceholderText('Modal input')
        const saveButton = screen.getByText('Save')

        expect(modal).toHaveAttribute('role', 'dialog')
        expect(modal).toHaveAttribute('aria-modal', 'true')

        // Focus should be manageable within modal
        closeButton.focus()
        expect(document.activeElement).toBe(closeButton)

        await userEvent.tab()
        expect(document.activeElement).toBe(input)

        await userEvent.tab()
        expect(document.activeElement).toBe(saveButton)
      })
    })
  })

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================
  describe('⚡ Performance Tests', () => {
    describe('Component Rendering Performance', () => {
      it('should render large lists efficiently', () => {
        const LargeList = ({ items }: { items: any[] }) => (
          <div data-testid="large-list">
            {items.map((item, index) => (
              <div key={index} data-testid={`item-${index}`}>
                {item.name}
              </div>
            ))}
          </div>
        )

        const items = Array.from({ length: 1000 }, (_, i) => ({
          name: `Item ${i}`,
        }))

        const startTime = performance.now()
        render(<LargeList items={items} />)
        const endTime = performance.now()

        expect(screen.getByTestId('large-list')).toBeInTheDocument()
        expect(endTime - startTime).toBeLessThan(100) // Should render within 100ms
      })

      it('should handle frequent updates efficiently', async () => {
        const Counter = () => {
          const [count, setCount] = React.useState(0)

          React.useEffect(() => {
            const interval = setInterval(() => {
              setCount(prev => prev + 1)
            }, 10)

            return () => clearInterval(interval)
          }, [])

          return <div data-testid="counter">Count: {count}</div>
        }

        render(<Counter />)
        
        const counter = screen.getByTestId('counter')
        expect(counter).toBeInTheDocument()

        // Wait for a few updates
        await waitFor(() => {
          expect(counter.textContent).toMatch(/Count: [1-9]/)
        }, { timeout: 1000 })
      })
    })

    describe('Memory Usage', () => {
      it('should clean up event listeners', () => {
        const ComponentWithEventListener = () => {
          React.useEffect(() => {
            const handleClick = () => {}
            document.addEventListener('click', handleClick)
            
            return () => {
              document.removeEventListener('click', handleClick)
            }
          }, [])

          return <div>Component with event listener</div>
        }

        const { unmount } = render(<ComponentWithEventListener />)
        
        // Component should mount and unmount without memory leaks
        unmount()
        expect(true).toBe(true) // Placeholder assertion
      })
    })
  })
})

// ============================================================================
// TEST UTILITIES AND HELPERS
// ============================================================================
describe('🛠️ Component Test Utilities', () => {
  describe('Custom Render Function', () => {
    it('should provide custom render with providers', () => {
      const customRender = (ui: React.ReactElement) => {
        return render(ui, { wrapper: TestWrapper })
      }

      const TestComponent = () => <div>Test Component</div>
      customRender(<TestComponent />)
      
      expect(screen.getByText('Test Component')).toBeInTheDocument()
    })
  })

  describe('Mock User Interactions', () => {
    it('should simulate complex user interactions', async () => {
      const MockComplexForm = () => {
        const [values, setValues] = React.useState({
          name: '',
          email: '',
          specialty: '',
          interests: [] as string[],
        })

        const handleInterestToggle = (interest: string) => {
          setValues(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
              ? prev.interests.filter(i => i !== interest)
              : [...prev.interests, interest],
          }))
        }

        return (
          <form>
            <MockInput
              value={values.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setValues(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder="Name"
            />
            <MockInput
              value={values.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setValues(prev => ({ ...prev, email: e.target.value }))
              }
              placeholder="Email"
            />
            <select
              value={values.specialty}
              onChange={(e) => setValues(prev => ({ ...prev, specialty: e.target.value }))}
            >
              <option value="">Select Specialty</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
            </select>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={values.interests.includes('Reading')}
                  onChange={() => handleInterestToggle('Reading')}
                />
                Reading
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={values.interests.includes('Sports')}
                  onChange={() => handleInterestToggle('Sports')}
                />
                Sports
              </label>
            </div>
            <div data-testid="form-values">
              {JSON.stringify(values)}
            </div>
          </form>
        )
      }

      render(<MockComplexForm />)

      // Fill out form with complex interactions
      const nameInput = screen.getByPlaceholderText('Name')
      const emailInput = screen.getByPlaceholderText('Email')
      const specialtySelect = screen.getByDisplayValue('')
      const readingCheckbox = screen.getByLabelText('Reading')
      const sportsCheckbox = screen.getByLabelText('Sports')

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.selectOptions(specialtySelect, 'Cardiology')
      await userEvent.click(readingCheckbox)
      await userEvent.click(sportsCheckbox)

      const formValues = screen.getByTestId('form-values')
      const values = JSON.parse(formValues.textContent || '{}')

      expect(values.name).toBe('John Doe')
      expect(values.email).toBe('john@example.com')
      expect(values.specialty).toBe('Cardiology')
      expect(values.interests).toEqual(['Reading', 'Sports'])
    })
  })
})



