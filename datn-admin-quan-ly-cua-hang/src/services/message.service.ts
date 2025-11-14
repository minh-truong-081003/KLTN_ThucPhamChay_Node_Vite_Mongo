import http from '../configs/instances'

export interface IMessage {
  _id: string
  text: string
  sender: {
    _id: string
    username: string
    account?: string
    avatar?: string
  }
  receiver?: {
    _id: string
    username: string
    account?: string
    avatar?: string
  }
  senderModel: 'User' | 'Admin'
  conversationId: string
  status: 'sent' | 'delivered' | 'read'
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

export interface IConversation {
  _id: string
  participants: string[]
  customer: {
    _id: string
    username: string
    account?: string
    avatar?: string
  }
  assignedStaff?: {
    _id: string
    username: string
    account?: string
    avatar?: string
  }
  lastMessage?: IMessage
  lastMessageTime: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  unreadCount: {
    admin: number
    customer: number
  }
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface ISendMessagePayload {
  conversationId: string
  text: string
  attachments?: string[]
}

export interface IUpdateConversationPayload {
  status?: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  tags?: string[]
}

class MessageService {
  // Lấy danh sách conversations cho admin/staff
  async getConversationsForAdmin(params?: { status?: string; page?: number; limit?: number; search?: string }) {
    const response = await http.get('/messages/conversations', { params })
    return response.data
  }

  // Lấy conversation cụ thể (for customer)
  async getOrCreateConversation(customerId: string) {
    const response = await http.get(`/messages/conversation/init/${customerId}`)
    return response.data
  }

  // Lấy thông tin conversation theo ID (for admin)
  async getConversationById(conversationId: string) {
    const response = await http.get(`/messages/conversation/${conversationId}`)
    return response.data
  }

  // Gửi tin nhắn
  async sendMessage(payload: ISendMessagePayload) {
    const response = await http.post('/messages/send', payload)
    return response.data
  }

  // Lấy danh sách tin nhắn của một conversation
  async getMessages(conversationId: string, params?: { page?: number; limit?: number }) {
    const response = await http.get(`/messages/conversation/${conversationId}/messages`, {
      params
    })
    return response.data
  }

  // Đánh dấu tin nhắn đã đọc
  async markMessagesAsRead(conversationId: string) {
    const response = await http.put(`/messages/conversation/${conversationId}/mark-read`)
    return response.data
  }

  // Cập nhật trạng thái conversation
  async updateConversationStatus(conversationId: string, payload: IUpdateConversationPayload) {
    const response = await http.put(`/messages/conversation/${conversationId}/status`, payload)
    return response.data
  }

  // Assign staff cho conversation
  async assignStaffToConversation(conversationId: string, staffId: string) {
    const response = await http.put(`/messages/conversation/${conversationId}/assign`, {
      staffId
    })
    return response.data
  }

  // Lấy số lượng tin nhắn chưa đọc
  async getUnreadCount() {
    const response = await http.get('/messages/unread-count')
    return response.data
  }

  // Xóa tin nhắn
  async deleteMessage(messageId: string) {
    const response = await http.delete(`/messages/${messageId}`)
    return response.data
  }
}

export const messageService = new MessageService()
