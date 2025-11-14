# Tính Năng Chat Hỗ Trợ Khách Hàng

## Tổng Quan
Hệ thống chat real-time giữa khách hàng và admin/nhân viên hỗ trợ, sử dụng Socket.io để giao tiếp thời gian thực.

## Cấu Trúc

### Backend (datn-backend)

#### Models
- **Message Model** (`src/models/message.model.js`): Quản lý tin nhắn
  - text: Nội dung tin nhắn
  - sender: Người gửi (ref User)
  - receiver: Người nhận (ref User)
  - senderModel: 'User' | 'Admin'
  - conversationId: ID cuộc hội thoại
  - status: 'sent' | 'delivered' | 'read'
  - attachments: Danh sách file đính kèm
  - timestamps: createdAt, updatedAt

- **Conversation Model** (`src/models/conversation.model.js`): Quản lý cuộc hội thoại
  - customer: Khách hàng (ref User)
  - assignedStaff: Nhân viên được phân công (ref User)
  - lastMessage: Tin nhắn cuối cùng
  - status: 'open' | 'in-progress' | 'resolved' | 'closed'
  - priority: 'low' | 'medium' | 'high' | 'urgent'
  - unreadCount: Số tin nhắn chưa đọc (admin, customer)

#### Controllers (`src/controllers/message.controller.js`)
- `getOrCreateConversation`: Tạo hoặc lấy conversation
- `sendMessage`: Gửi tin nhắn
- `getMessages`: Lấy danh sách tin nhắn
- `markMessagesAsRead`: Đánh dấu đã đọc
- `getConversationsForAdmin`: Lấy danh sách conversations cho admin
- `getConversationForCustomer`: Lấy conversation của customer
- `updateConversationStatus`: Cập nhật trạng thái
- `assignStaffToConversation`: Phân công nhân viên
- `getUnreadCount`: Lấy số tin nhắn chưa đọc
- `deleteMessage`: Xóa tin nhắn

#### Routes (`src/routes/message.routes.js`)
```
POST   /api/messages/send
GET    /api/messages/conversation/:conversationId/messages
PUT    /api/messages/conversation/:conversationId/mark-read
GET    /api/messages/unread-count
DELETE /api/messages/:messageId
GET    /api/messages/conversation/my
GET    /api/messages/conversation/init/:customerId
GET    /api/messages/conversations (Admin/Staff only)
PUT    /api/messages/conversation/:conversationId/status (Admin/Staff only)
PUT    /api/messages/conversation/:conversationId/assign (Admin/Staff only)
```

#### Socket Events (`src/configs/socket.js`)
**Client -> Server:**
- `user:join`: Join room theo userId
- `conversation:join`: Join conversation room
- `conversation:leave`: Leave conversation room
- `typing:start`: Bắt đầu nhập
- `typing:stop`: Dừng nhập

**Server -> Client:**
- `new-message`: Tin nhắn mới
- `new-customer-message`: Tin nhắn mới từ customer (broadcast đến admin)
- `messages-read`: Tin nhắn đã được đọc
- `conversation-updated`: Conversation đã được cập nhật
- `staff-assigned`: Nhân viên đã được phân công
- `conversation-assigned`: Conversation đã được phân công cho nhân viên
- `user-typing`: Người dùng đang nhập
- `user-stop-typing`: Người dùng dừng nhập

### Frontend (datn-frontend)

#### Service (`src/api/message.service.ts`)
```typescript
messageService.getOrCreateConversation(customerId)
messageService.getMyConversation()
messageService.sendMessage({ conversationId, text, attachments })
messageService.getMessages(conversationId, { page, limit })
messageService.markMessagesAsRead(conversationId)
messageService.getUnreadCount()
messageService.deleteMessage(messageId)
```

#### Components
- **CustomerChat** (`src/features/chat/components/CustomerChat.tsx`): 
  - Component chat chính cho khách hàng
  - Hiển thị lịch sử tin nhắn
  - Gửi/nhận tin nhắn real-time
  - Typing indicator

- **ChatWidget** (`src/features/chat/components/ChatWidget.tsx`):
  - Nút chat floating ở góc màn hình
  - Hiển thị số tin nhắn chưa đọc
  - Mở/đóng popup chat

### Admin Panel (datn-admin-quan-ly-cua-hang)

#### Service (`src/services/message.service.ts`)
Tương tự như Frontend nhưng có thêm:
```typescript
messageService.getConversationsForAdmin({ status, page, limit, search })
messageService.updateConversationStatus(conversationId, { status, priority, tags })
messageService.assignStaffToConversation(conversationId, staffId)
```

#### Pages
- **ConversationList** (`src/pages/Chat/ConversationList.tsx`):
  - Danh sách tất cả cuộc hội thoại
  - Filter theo trạng thái (open, in-progress, resolved, closed)
  - Search theo tên khách hàng
  - Hiển thị số tin nhắn chưa đọc

- **ChatRoom** (`src/pages/Chat/ChatRoom.tsx`):
  - Phòng chat với khách hàng cụ thể
  - Gửi/nhận tin nhắn real-time
  - Cập nhật trạng thái conversation
  - Typing indicator

## Cách Sử Dụng

### 1. Tích hợp vào Frontend (Customer)

#### Bước 1: Import ChatWidget vào App
```tsx
// src/App.tsx
import { ChatWidget } from './features/chat'

function App() {
  return (
    <div>
      {/* Your app content */}
      <ChatWidget />
    </div>
  )
}
```

#### Bước 2: Khách hàng sử dụng
- Click vào nút chat floating ở góc phải màn hình
- Nhập tin nhắn và gửi
- Nhận phản hồi từ admin/nhân viên real-time

### 2. Tích hợp vào Admin Panel

#### Bước 1: Thêm routes
```tsx
// src/routes/index.tsx
import ConversationList from '../pages/Chat/ConversationList'
import ChatRoom from '../pages/Chat/ChatRoom'

const routes = [
  // ... other routes
  {
    path: '/admin/chat',
    component: ConversationList,
  },
  {
    path: '/admin/chat/:conversationId',
    component: ChatRoom,
  },
]
```

#### Bước 2: Thêm menu navigation
```tsx
<Link to="/admin/chat">
  <Icon name="chat" />
  Hỗ trợ khách hàng
  {unreadCount > 0 && <Badge count={unreadCount} />}
</Link>
```

#### Bước 3: Admin sử dụng
1. Vào trang "Hỗ trợ khách hàng"
2. Xem danh sách cuộc hội thoại (có filter và search)
3. Click vào conversation để chat
4. Gửi/nhận tin nhắn real-time
5. Cập nhật trạng thái (open, in-progress, resolved, closed)
6. Assign nhân viên cho conversation

## Socket.io Integration

### Frontend
```typescript
import { socket } from './socket'

// Join user room
socket.emit('user:join', userId)

// Join conversation
socket.emit('conversation:join', conversationId)

// Listen for new messages
socket.on('new-message', (data) => {
  console.log('New message:', data.message)
})

// Typing indicator
socket.emit('typing:start', { conversationId, userId, username })
socket.emit('typing:stop', { conversationId, userId })
```

### Backend
```javascript
// Global io instance is available in controllers
if (global.io) {
  global.io.to(userId).emit('new-message', { message, conversationId })
  global.io.to('admin-room').emit('new-customer-message', { message, conversation })
}
```

## Tính Năng

### ✅ Đã Hoàn Thành
- Real-time messaging với Socket.io
- Lưu trữ tin nhắn vào MongoDB
- Quản lý conversations
- Typing indicator
- Unread count
- Mark messages as read
- Conversation status (open, in-progress, resolved, closed)
- Priority levels (low, medium, high, urgent)
- Assign staff to conversation
- Filter và search conversations
- Responsive UI cho cả mobile và desktop
- Authentication và authorization

### 🔄 Có Thể Mở Rộng
- Upload file/image trong chat
- Emoji picker
- Message reactions
- Push notifications
- Message search
- Chat history export
- Canned responses (tin nhắn mẫu)
- Chat analytics và reports
- Multi-language support
- Voice/video call

## Testing

### 1. Test Backend API
```bash
# Start backend
cd datn-backend
npm run dev

# Test với Postman hoặc curl
curl -X POST http://localhost:8000/api/messages/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "xxx", "text": "Hello"}'
```

### 2. Test Frontend
```bash
# Start frontend
cd datn-frontend
npm run dev

# Login và test chat widget
```

### 3. Test Admin Panel
```bash
# Start admin panel
cd datn-admin-quan-ly-cua-hang
npm run dev

# Login và vào /admin/chat
```

## Troubleshooting

### Socket không kết nối
- Kiểm tra backend đã start và lắng nghe đúng port
- Kiểm tra CORS settings
- Check console logs

### Tin nhắn không gửi được
- Verify authentication token
- Check network tab trong DevTools
- Xem backend logs

### Không nhận tin nhắn real-time
- Kiểm tra socket connection
- Verify đã join đúng room
- Check socket events

## Security

- ✅ Authentication required cho tất cả endpoints
- ✅ Authorization checks (admin/staff only endpoints)
- ✅ Input validation với Joi schemas
- ✅ XSS protection
- ✅ Rate limiting (nên thêm)
- ✅ Message sanitization

## Performance

- Sử dụng pagination cho messages
- Index MongoDB fields để tối ưu queries
- Socket rooms để giới hạn broadcast
- Lazy loading messages
- Debounce typing indicator

## Deployment

1. Build frontend và admin
```bash
npm run build
```

2. Deploy backend với PM2
```bash
pm2 start src/app.js --name chat-backend
```

3. Configure nginx reverse proxy
```nginx
location /socket.io/ {
    proxy_pass http://localhost:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## Support
Nếu có vấn đề, liên hệ team phát triển.
