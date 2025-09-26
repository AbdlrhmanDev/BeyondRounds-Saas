import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChatComponent } from '@/components/features/chat/ChatComponent'

// Mock the chat hook
jest.mock('@/hooks/features/chat/useChat', () => ({
  useChat: () => ({
    messages: [
      {
        id: '1',
        content: 'Hello!',
        sender_id: 'user1',
        sender_name: 'John Doe',
        created_at: new Date().toISOString(),
        is_own: false
      },
      {
        id: '2',
        content: 'Hi there!',
        sender_id: 'user2',
        sender_name: 'Jane Smith',
        created_at: new Date().toISOString(),
        is_own: true
      }
    ],
    sendMessage: jest.fn(),
    isLoading: false,
    error: null,
    isConnected: true
  })
}))

describe('ChatComponent Component', () => {
  it('renders chat interface', () => {
    render(<ChatComponent groupId="test-group" />)
    
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('displays messages', () => {
    render(<ChatComponent groupId="test-group" />)
    
    expect(screen.getByText('Hello!')).toBeInTheDocument()
    expect(screen.getByText('Hi there!')).toBeInTheDocument()
  })

  it('shows sender names', () => {
    render(<ChatComponent groupId="test-group" />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('handles message sending', async () => {
    const mockSendMessage = jest.fn()
    jest.mocked(require('@/hooks/features/chat/useChat')).useChat.mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      isLoading: false,
      error: null,
      isConnected: true
    })

    render(<ChatComponent groupId="test-group" />)
    
    const input = screen.getByRole('textbox')
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)
    
    expect(mockSendMessage).toHaveBeenCalledWith('Test message')
  })

  it('handles Enter key press for sending', async () => {
    const mockSendMessage = jest.fn()
    jest.mocked(require('@/hooks/features/chat/useChat')).useChat.mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      isLoading: false,
      error: null,
      isConnected: true
    })

    render(<ChatComponent groupId="test-group" />)
    
    const input = screen.getByRole('textbox')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    expect(mockSendMessage).toHaveBeenCalledWith('Test message')
  })

  it('does not send empty messages', () => {
    const mockSendMessage = jest.fn()
    jest.mocked(require('@/hooks/features/chat/useChat')).useChat.mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      isLoading: false,
      error: null,
      isConnected: true
    })

    render(<ChatComponent groupId="test-group" />)
    
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    fireEvent.click(sendButton)
    
    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('shows loading state', () => {
    jest.mocked(require('@/hooks/features/chat/useChat')).useChat.mockReturnValue({
      messages: [],
      sendMessage: jest.fn(),
      isLoading: true,
      error: null,
      isConnected: true
    })

    render(<ChatComponent groupId="test-group" />)
    
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows error state', () => {
    jest.mocked(require('@/hooks/features/chat/useChat')).useChat.mockReturnValue({
      messages: [],
      sendMessage: jest.fn(),
      isLoading: false,
      error: 'Failed to load messages',
      isConnected: false
    })

    render(<ChatComponent groupId="test-group" />)
    
    expect(screen.getByText(/failed to load messages/i)).toBeInTheDocument()
  })

  it('shows connection status', () => {
    jest.mocked(require('@/hooks/features/chat/useChat')).useChat.mockReturnValue({
      messages: [],
      sendMessage: jest.fn(),
      isLoading: false,
      error: null,
      isConnected: false
    })

    render(<ChatComponent groupId="test-group" />)
    
    expect(screen.getByText(/connecting/i)).toBeInTheDocument()
  })

  it('disables input when not connected', () => {
    jest.mocked(require('@/hooks/features/chat/useChat')).useChat.mockReturnValue({
      messages: [],
      sendMessage: jest.fn(),
      isLoading: false,
      error: null,
      isConnected: false
    })

    render(<ChatComponent groupId="test-group" />)
    
    const input = screen.getByRole('textbox')
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    expect(input).toBeDisabled()
    expect(sendButton).toBeDisabled()
  })

  it('scrolls to bottom when new messages arrive', () => {
    const mockScrollIntoView = jest.fn()
    Element.prototype.scrollIntoView = mockScrollIntoView

    render(<ChatComponent groupId="test-group" />)
    
    // Simulate new message
    jest.mocked(require('@/hooks/features/chat/useChat')).useChat.mockReturnValue({
      messages: [
        {
          id: '3',
          content: 'New message',
          sender_id: 'user3',
          sender_name: 'Bob',
          created_at: new Date().toISOString(),
          is_own: false
        }
      ],
      sendMessage: jest.fn(),
      isLoading: false,
      error: null,
      isConnected: true
    })

    // Re-render to trigger effect
    render(<ChatComponent groupId="test-group" />)
    
    expect(mockScrollIntoView).toHaveBeenCalled()
  })
})


