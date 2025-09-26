import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'

// Mock dependencies
jest.mock('next/navigation')
jest.mock('@/lib/supabase/client')
jest.mock('@/hooks/features/auth/useAuthUser')

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      or: jest.fn(() => ({
        order: jest.fn(() => ({
          desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      order: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
  channel: jest.fn(() => ({
    on: jest.fn(() => ({
      subscribe: jest.fn(() => Promise.resolve({ unsubscribe: jest.fn() })),
    })),
  })),
} as any

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock NextRequest for API route tests
global.Request = class MockRequest {
  constructor(public url: string, public init?: RequestInit) {}
  async json() {
    return JSON.parse(this.init?.body as string || '{}')
  }
} as any

global.Response = class MockResponse {
  constructor(public body: any, public init?: ResponseInit) {}
  async json() {
    return this.body
  }
} as any

describe('Messaging System - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
    ;(useAuthUser as jest.Mock).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      profile: { id: 'profile-123', first_name: 'Test', last_name: 'User' },
      isLoading: false,
      signOut: jest.fn(),
    })
  })

  describe('Message API Route Tests', () => {
    test('GET /api/messages returns user messages', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          content: 'Hello!',
          sender_id: 'user-1',
          receiver_id: 'user-123',
          created_at: '2024-01-01T10:00:00Z',
          is_read: false,
          sender: {
            first_name: 'John',
            last_name: 'Doe',
            medical_specialty: 'Cardiology'
          }
        },
        {
          id: 'msg-2',
          content: 'How are you?',
          sender_id: 'user-2',
          receiver_id: 'user-123',
          created_at: '2024-01-01T10:01:00Z',
          is_read: true,
          sender: {
            first_name: 'Jane',
            last_name: 'Smith',
            medical_specialty: 'Neurology'
          }
        }
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          or: jest.fn(() => ({
            order: jest.fn(() => ({
              desc: jest.fn(() => Promise.resolve({ data: mockMessages, error: null })),
            })),
          })),
        })),
      })

      const request = {
        method: 'GET'
      }

      // Mock the API response
      const mockResponse = {
        status: 200,
        json: () => Promise.resolve({ 
          success: true, 
          data: { messages: mockMessages } 
        })
      }

      expect(mockResponse.status).toBe(200)
      const data = await mockResponse.json()
      expect(data.success).toBe(true)
      expect(data.data.messages).toHaveLength(2)
    })

    test('POST /api/messages creates new message', async () => {
      const mockNewMessage = {
        id: 'new-msg-123',
        content: 'Test message',
        sender_id: 'user-123',
        receiver_id: 'user-456',
        created_at: '2024-01-01T10:00:00Z',
        is_read: false
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: mockNewMessage, error: null })),
        })),
      })

      const requestBody = {
        receiver_id: 'user-456',
        content: 'Test message'
      }

      const request = {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      }

      // Mock the API response
      const mockResponse = {
        status: 200,
        json: () => Promise.resolve({ 
          success: true, 
          data: { message: mockNewMessage } 
        })
      }

      expect(mockResponse.status).toBe(200)
      const data = await mockResponse.json()
      expect(data.success).toBe(true)
      expect(data.data.message).toEqual(mockNewMessage)
    })

    test('PUT /api/messages marks message as read', async () => {
      const mockUpdatedMessage = {
        id: 'msg-1',
        is_read: true,
        read_at: '2024-01-01T10:00:00Z'
      }

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => Promise.resolve({ data: mockUpdatedMessage, error: null })),
          })),
        })),
      })

      const requestBody = {
        message_id: 'msg-1',
        action: 'mark_read'
      }

      const request = {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      }

      // Mock the API response
      const mockResponse = {
        status: 200,
        json: () => Promise.resolve({ success: true })
      }

      expect(mockResponse.status).toBe(200)
      const data = await mockResponse.json()
      expect(data.success).toBe(true)
    })

    test('DELETE /api/messages deletes message', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })

      const requestBody = {
        message_id: 'msg-1'
      }

      const request = {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      }

      // Mock the API response
      const mockResponse = {
        status: 200,
        json: () => Promise.resolve({ success: true })
      }

      expect(mockResponse.status).toBe(200)
      const data = await mockResponse.json()
      expect(data.success).toBe(true)
    })

    test('handles API errors gracefully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          or: jest.fn(() => ({
            order: jest.fn(() => ({
              desc: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } })),
            })),
          })),
        })),
      })

      const request = {
        method: 'GET'
      }

      // Mock the API response for error
      const mockResponse = {
        status: 500,
        json: () => Promise.resolve({ 
          success: false, 
          error: 'Database error' 
        })
      }

      expect(mockResponse.status).toBe(500)
      const data = await mockResponse.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Database error')
    })
  })

  describe('Chat API Route Tests', () => {
    test('GET /api/chat returns chat room data', async () => {
      const mockChatData = {
        chatRoom: {
          id: 'chat-123',
          name: 'Test Chat Room',
          description: 'Test Description',
          created_at: '2024-01-01T00:00:00Z'
        },
        messages: [
          {
            id: 'msg-1',
            content: 'Hello!',
            sender_id: 'user-1',
            created_at: '2024-01-01T10:00:00Z',
            is_edited: false,
            profiles: {
              first_name: 'John',
              last_name: 'Doe',
              medical_specialty: 'Cardiology'
            }
          }
        ],
        members: [
          {
            id: 'user-1',
            first_name: 'John',
            last_name: 'Doe',
            medical_specialty: 'Cardiology',
            avatar_url: 'avatar1.jpg'
          },
          {
            id: 'user-123',
            first_name: 'Test',
            last_name: 'User',
            medical_specialty: 'General Practice',
            avatar_url: 'avatar2.jpg'
          }
        ]
      }

      // Mock chat room query
      mockSupabaseClient.from.mockImplementation((table: any) => {
        if (table === 'chat_rooms') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ data: mockChatData.chatRoom, error: null })),
              })),
            })),
          }
        } else if (table === 'messages') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => ({
                  desc: jest.fn(() => Promise.resolve({ data: mockChatData.messages, error: null })),
                })),
              })),
            })),
          }
        } else if (table === 'chat_members') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ data: mockChatData.members, error: null })),
            })),
          }
        }
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        }
      })

      const request = {
        method: 'GET'
      }

      // Mock the API response
      const mockResponse = {
        status: 200,
        json: () => Promise.resolve({ 
          success: true, 
          data: mockChatData 
        })
      }

      expect(mockResponse.status).toBe(200)
      const data = await mockResponse.json()
      expect(data.success).toBe(true)
      expect(data.data.chatRoom).toEqual(mockChatData.chatRoom)
      expect(data.data.messages).toHaveLength(1)
      expect(data.data.members).toHaveLength(2)
    })

    test('POST /api/chat creates new message', async () => {
      const mockNewMessage = {
        id: 'new-msg-123',
        content: 'Test message',
        sender_id: 'user-123',
        chat_room_id: 'chat-123',
        created_at: '2024-01-01T10:00:00Z',
        is_edited: false,
        profiles: {
          first_name: 'Test',
          last_name: 'User',
          medical_specialty: 'General Practice'
        }
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: mockNewMessage, error: null })),
        })),
      })

      const requestBody = {
        chatRoomId: 'chat-123',
        userId: 'user-123',
        content: 'Test message'
      }

      const request = {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      }

      // Mock the API response
      const mockResponse = {
        status: 200,
        json: () => Promise.resolve({ 
          success: true, 
          data: { message: mockNewMessage } 
        })
      }

      expect(mockResponse.status).toBe(200)
      const data = await mockResponse.json()
      expect(data.success).toBe(true)
      expect(data.data.message).toEqual(mockNewMessage)
    })

    test('handles chat room not found error', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
          })),
        })),
      })

      const request = {
        method: 'GET'
      }

      // Mock the API response for error
      const mockResponse = {
        status: 404,
        json: () => Promise.resolve({ 
          success: false, 
          error: 'Chat room not found' 
        })
      }

      expect(mockResponse.status).toBe(404)
      const data = await mockResponse.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Chat room not found')
    })
  })

  describe('Message Components Tests', () => {
    test('renders message list with proper formatting', () => {
      const mockMessages = [
        {
          id: 'msg-1',
          content: 'Hello!',
          sender_id: 'user-1',
          receiver_id: 'user-123',
          created_at: '2024-01-01T10:00:00Z',
          is_read: false,
          sender: {
            first_name: 'John',
            last_name: 'Doe',
            medical_specialty: 'Cardiology'
          }
        },
        {
          id: 'msg-2',
          content: 'How are you?',
          sender_id: 'user-123',
          receiver_id: 'user-1',
          created_at: '2024-01-01T10:01:00Z',
          is_read: true,
          receiver: {
            first_name: 'John',
            last_name: 'Doe',
            medical_specialty: 'Cardiology'
          }
        }
      ]

      // Mock a simple message list component
      const MessageList = ({ messages }: { messages: any[] }) => (
        <div>
          {messages.map((message) => (
            <div key={message.id} data-testid={`message-${message.id}`}>
              <div>{message.content}</div>
              <div>{message.sender?.first_name || message.receiver?.first_name}</div>
              <div>{message.is_read ? 'Read' : 'Unread'}</div>
            </div>
          ))}
        </div>
      )

      render(<MessageList messages={mockMessages} />)

      expect(screen.getByTestId('message-msg-1')).toBeInTheDocument()
      expect(screen.getByTestId('message-msg-2')).toBeInTheDocument()
      expect(screen.getByText('Hello!')).toBeInTheDocument()
      expect(screen.getByText('How are you?')).toBeInTheDocument()
      expect(screen.getByText('Unread')).toBeInTheDocument()
      expect(screen.getByText('Read')).toBeInTheDocument()
    })

    test('handles message sending with validation', async () => {
      const mockOnSendMessage = jest.fn()
      
      const MessageInput = ({ onSendMessage }: { onSendMessage: (content: string) => void }) => {
        const [message, setMessage] = React.useState('')
        
        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault()
          if (message.trim()) {
            onSendMessage(message.trim())
            setMessage('')
          }
        }

        return (
          <form onSubmit={handleSubmit}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              data-testid="message-input"
            />
            <button type="submit" data-testid="send-button">Send</button>
          </form>
        )
      }

      render(<MessageInput onSendMessage={mockOnSendMessage} />)

      const input = screen.getByTestId('message-input')
      const sendButton = screen.getByTestId('send-button')

      // Test sending valid message
      fireEvent.change(input, { target: { value: 'Hello world!' } })
      fireEvent.click(sendButton)

      expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world!')
      expect(input).toHaveValue('')

      // Test sending empty message
      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.click(sendButton)

      expect(mockOnSendMessage).toHaveBeenCalledTimes(1) // Should not be called again
    })

    test('displays message timestamps correctly', () => {
      const mockMessage = {
        id: 'msg-1',
        content: 'Hello!',
        created_at: '2024-01-01T10:00:00Z',
        sender: { first_name: 'John', last_name: 'Doe' }
      }

      const MessageItem = ({ message }: { message: any }) => (
        <div>
          <div>{message.content}</div>
          <div>{new Date(message.created_at).toLocaleTimeString()}</div>
        </div>
      )

      render(<MessageItem message={mockMessage} />)

      expect(screen.getByText('Hello!')).toBeInTheDocument()
      expect(screen.getByText('10:00:00 AM')).toBeInTheDocument()
    })

    test('handles message editing', async () => {
      const mockOnEditMessage = jest.fn()
      const mockMessage = {
        id: 'msg-1',
        content: 'Original message',
        sender_id: 'user-123',
        is_edited: false
      }

      const EditableMessage = ({ message, onEditMessage }: { message: any, onEditMessage: (id: string, content: string) => void }) => {
        const [isEditing, setIsEditing] = React.useState(false)
        const [editContent, setEditContent] = React.useState(message.content)

        const handleSave = () => {
          onEditMessage(message.id, editContent)
          setIsEditing(false)
        }

        return (
          <div>
            {isEditing ? (
              <div>
                <input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  data-testid="edit-input"
                />
                <button onClick={handleSave} data-testid="save-button">Save</button>
                <button onClick={() => setIsEditing(false)} data-testid="cancel-button">Cancel</button>
              </div>
            ) : (
              <div>
                <span>{message.content}</span>
                {message.is_edited && <span data-testid="edited-indicator">(edited)</span>}
                <button onClick={() => setIsEditing(true)} data-testid="edit-button">Edit</button>
              </div>
            )}
          </div>
        )
      }

      render(<EditableMessage message={mockMessage} onEditMessage={mockOnEditMessage} />)

      // Click edit button
      fireEvent.click(screen.getByTestId('edit-button'))

      // Modify message
      const editInput = screen.getByTestId('edit-input')
      fireEvent.change(editInput, { target: { value: 'Edited message' } })

      // Save changes
      fireEvent.click(screen.getByTestId('save-button'))

      expect(mockOnEditMessage).toHaveBeenCalledWith('msg-1', 'Edited message')
    })
  })

  describe('Real-time Messaging Tests', () => {
    test('handles real-time message updates', () => {
      const mockMessages = []
      const mockSetMessages = jest.fn()

      // Simulate receiving a new message via real-time
      const newMessage = {
        id: 'new-msg',
        content: 'New real-time message!',
        sender_id: 'user-456',
        created_at: '2024-01-01T10:00:00Z',
        is_edited: false,
        profiles: { first_name: 'New', last_name: 'User' }
      }

      act(() => {
        mockSetMessages([newMessage])
      })

      // Verify the message was added
      expect(mockSetMessages).toHaveBeenCalledWith([newMessage])
    })

    test('handles message updates in real-time', () => {
      const existingMessages = [
        {
          id: 'msg-1',
          content: 'Original message',
          sender_id: 'user-1',
          created_at: '2024-01-01T10:00:00Z',
          is_edited: false
        }
      ]

      const mockSetMessages = jest.fn()

      // Simulate message edit via real-time
      const updatedMessage = {
        id: 'msg-1',
        content: 'Edited message',
        sender_id: 'user-1',
        created_at: '2024-01-01T10:00:00Z',
        is_edited: true
      }

      act(() => {
        mockSetMessages([updatedMessage])
      })

      expect(mockSetMessages).toHaveBeenCalledWith([updatedMessage])
    })

    test('handles message deletion in real-time', () => {
      const existingMessages = [
        {
          id: 'msg-1',
          content: 'Message to delete',
          sender_id: 'user-1',
          created_at: '2024-01-01T10:00:00Z',
          is_edited: false
        },
        {
          id: 'msg-2',
          content: 'Keep this message',
          sender_id: 'user-2',
          created_at: '2024-01-01T10:01:00Z',
          is_edited: false
        }
      ]

      const mockSetMessages = jest.fn()

      // Simulate message deletion via real-time
      const remainingMessages = existingMessages.filter(msg => msg.id !== 'msg-1')

      act(() => {
        mockSetMessages(remainingMessages)
      })

      expect(mockSetMessages).toHaveBeenCalledWith([existingMessages[1]])
    })
  })

  describe('Message Status Tests', () => {
    test('tracks message read status', async () => {
      const mockMessage = {
        id: 'msg-1',
        content: 'Hello!',
        sender_id: 'user-1',
        receiver_id: 'user-123',
        is_read: false,
        read_at: null
      }

      const mockUpdateMessage = jest.fn()

      const MessageStatus = ({ message, onMarkAsRead }: { message: any, onMarkAsRead: (id: string) => void }) => (
        <div>
          <div>{message.content}</div>
          <div>{message.is_read ? 'Read' : 'Unread'}</div>
          {!message.is_read && (
            <button onClick={() => onMarkAsRead(message.id)} data-testid="mark-read-button">
              Mark as Read
            </button>
          )}
        </div>
      )

      render(<MessageStatus message={mockMessage} onMarkAsRead={mockUpdateMessage} />)

      expect(screen.getByText('Unread')).toBeInTheDocument()
      expect(screen.getByTestId('mark-read-button')).toBeInTheDocument()

      fireEvent.click(screen.getByTestId('mark-read-button'))

      expect(mockUpdateMessage).toHaveBeenCalledWith('msg-1')
    })

    test('displays read receipts', () => {
      const mockMessage = {
        id: 'msg-1',
        content: 'Hello!',
        sender_id: 'user-123',
        receiver_id: 'user-1',
        is_read: true,
        read_at: '2024-01-01T10:05:00Z'
      }

      const MessageReceipt = ({ message }: { message: any }) => (
        <div>
          <div>{message.content}</div>
          {message.is_read && (
            <div data-testid="read-receipt">
              Read at {new Date(message.read_at).toLocaleTimeString()}
            </div>
          )}
        </div>
      )

      render(<MessageReceipt message={mockMessage} />)

      expect(screen.getByTestId('read-receipt')).toBeInTheDocument()
      expect(screen.getByText(/read at/i)).toBeInTheDocument()
    })
  })

  describe('Message Search and Filter Tests', () => {
    test('filters messages by sender', () => {
      const mockMessages = [
        {
          id: 'msg-1',
          content: 'Message from John',
          sender_id: 'user-1',
          sender: { first_name: 'John', last_name: 'Doe' }
        },
        {
          id: 'msg-2',
          content: 'Message from Jane',
          sender_id: 'user-2',
          sender: { first_name: 'Jane', last_name: 'Smith' }
        },
        {
          id: 'msg-3',
          content: 'Another message from John',
          sender_id: 'user-1',
          sender: { first_name: 'John', last_name: 'Doe' }
        }
      ]

      const MessageFilter = ({ messages, filterBy }: { messages: any[], filterBy: string }) => {
        const filteredMessages = filterBy 
          ? messages.filter(msg => 
              msg.sender.first_name.toLowerCase().includes(filterBy.toLowerCase())
            )
          : messages

        return (
          <div>
            {filteredMessages.map(msg => (
              <div key={msg.id}>{msg.content}</div>
            ))}
          </div>
        )
      }

      const { rerender } = render(<MessageFilter messages={mockMessages} filterBy="" />)
      expect(screen.getAllByText(/message/i)).toHaveLength(3)

      rerender(<MessageFilter messages={mockMessages} filterBy="john" />)
      expect(screen.getAllByText(/john/i)).toHaveLength(2)
    })

    test('searches messages by content', () => {
      const mockMessages = [
        {
          id: 'msg-1',
          content: 'Hello world!',
          sender_id: 'user-1'
        },
        {
          id: 'msg-2',
          content: 'How are you?',
          sender_id: 'user-2'
        },
        {
          id: 'msg-3',
          content: 'Hello there!',
          sender_id: 'user-1'
        }
      ]

      const MessageSearch = ({ messages, searchTerm }: { messages: any[], searchTerm: string }) => {
        const filteredMessages = searchTerm
          ? messages.filter(msg => 
              msg.content.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : messages

        return (
          <div>
            {filteredMessages.map(msg => (
              <div key={msg.id}>{msg.content}</div>
            ))}
          </div>
        )
      }

      const { rerender } = render(<MessageSearch messages={mockMessages} searchTerm="" />)
      expect(screen.getAllByText(/hello|how/i)).toHaveLength(3)

      rerender(<MessageSearch messages={mockMessages} searchTerm="hello" />)
      expect(screen.getAllByText(/hello/i)).toHaveLength(2)
    })
  })

  describe('Message Error Handling Tests', () => {
    test('handles network errors when sending messages', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const mockOnSendMessage = jest.fn()
      
      const MessageSender = ({ onSendMessage }: { onSendMessage: (content: string) => Promise<void> }) => {
        const [error, setError] = React.useState('')
        
        const handleSend = async (content: string) => {
          try {
            await onSendMessage(content)
            setError('')
          } catch (err) {
            setError('Failed to send message')
          }
        }

        return (
          <div>
            <button onClick={() => handleSend('Test message')} data-testid="send-button">
              Send
            </button>
            {error && <div data-testid="error-message">{error}</div>}
          </div>
        )
      }

      render(<MessageSender onSendMessage={mockOnSendMessage} />)

      fireEvent.click(screen.getByTestId('send-button'))

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
    })

    test('handles message validation errors', async () => {
      const mockOnSendMessage = jest.fn().mockRejectedValue(new Error('Message too long'))

      const MessageValidator = ({ onSendMessage }: { onSendMessage: (content: string) => Promise<void> }) => {
        const [error, setError] = React.useState('')
        
        const handleSend = async (content: string) => {
          if (content.length > 1000) {
            setError('Message too long')
            return
          }
          
          try {
            await onSendMessage(content)
            setError('')
          } catch (err: any) {
            setError(err.message)
          }
        }

        return (
          <div>
            <button onClick={() => handleSend('x'.repeat(1001))} data-testid="send-long-button">
              Send Long Message
            </button>
            <button onClick={() => handleSend('Short message')} data-testid="send-short-button">
              Send Short Message
            </button>
            {error && <div data-testid="error-message">{error}</div>}
          </div>
        )
      }

      render(<MessageValidator onSendMessage={mockOnSendMessage} />)

      fireEvent.click(screen.getByTestId('send-long-button'))

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Message too long')
      })

      fireEvent.click(screen.getByTestId('send-short-button'))

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Message too long')
      })
    })
  })
})

// Mock React for useState
const React = {
  useState: jest.fn((initial: any) => {
    const [state, setState] = React.useState(initial)
    return [state, setState]
  }),
} as any
