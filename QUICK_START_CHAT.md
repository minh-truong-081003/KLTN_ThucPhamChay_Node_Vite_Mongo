# Quick Start - Tính Năng Chat

## 1. Cài Đặt Dependencies (Nếu chưa có)

Backend đã có sẵn socket.io, mongoose, không cần cài thêm.

## 2. Tích Hợp vào Frontend

### Bước 1: Thêm ChatWidget vào App
File: `datn-frontend/src/App.tsx`

```tsx
import { ChatWidget } from './features/chat'

function App() {
  return (
    <div>
      {/* ... existing code ... */}
      
      {/* Thêm ChatWidget ở cuối, trước tag đóng */}
      <ChatWidget />
    </div>
  )
}
```

### Bước 2: Đảm bảo socket được khởi tạo
File: `datn-frontend/src/socket.tsx` (đã có sẵn)

## 3. Tích Hợp vào Admin Panel

### Bước 1: Thêm routes
File: `datn-admin-quan-ly-cua-hang/src/routes/index.tsx`

```tsx
import ConversationList from '../pages/Chat/ConversationList'
import ChatRoom from '../pages/Chat/ChatRoom'

// Thêm vào routes array
{
  path: '/chat',
  element: <ConversationList />
},
{
  path: '/chat/:conversationId',
  element: <ChatRoom />
}
```

### Bước 2: Thêm menu item
File: `datn-admin-quan-ly-cua-hang/src/layouts/Sidebar.tsx` (hoặc menu component)

```tsx
<Link to="/chat" className="menu-item">
  <i className="icon-chat"></i>
  <span>Hỗ trợ khách hàng</span>
  {unreadCount > 0 && <Badge count={unreadCount} />}
</Link>
```

## 4. Khởi động Backend

```bash
cd datn-backend
npm run dev
# hoặc
npm run all
```

Backend sẽ chạy ở port 8000 (hoặc PORT trong .env)

## 5. Khởi động Frontend

```bash
cd datn-frontend
npm run dev
```

## 6. Khởi động Admin Panel

```bash
cd datn-admin-quan-ly-cua-hang
npm run dev
```

## 7. Test

### Customer (Frontend):
1. Đăng nhập vào trang web
2. Click vào icon chat ở góc dưới bên phải
3. Gửi tin nhắn
4. Chờ admin phản hồi

### Admin:
1. Đăng nhập vào admin panel
2. Vào menu "Hỗ trợ khách hàng" hoặc `/chat`
3. Xem danh sách conversations
4. Click vào conversation để chat
5. Gửi tin nhắn cho customer
6. Cập nhật trạng thái conversation

## API Endpoints Đã Tạo

```
# Customer & Admin
POST   /api/messages/send
GET    /api/messages/conversation/:conversationId/messages
PUT    /api/messages/conversation/:conversationId/mark-read
GET    /api/messages/unread-count
DELETE /api/messages/:messageId

# Customer only
GET    /api/messages/conversation/my
GET    /api/messages/conversation/init/:customerId

# Admin/Staff only
GET    /api/messages/conversations
PUT    /api/messages/conversation/:conversationId/status
PUT    /api/messages/conversation/:conversationId/assign
```

## Socket Events

### Client emit:
- `user:join` - Join user room
- `conversation:join` - Join conversation room
- `conversation:leave` - Leave conversation room
- `typing:start` - Bắt đầu nhập
- `typing:stop` - Dừng nhập

### Server emit:
- `new-message` - Tin nhắn mới
- `new-customer-message` - Tin nhắn từ customer (broadcast admin)
- `user-typing` - Đang nhập
- `user-stop-typing` - Dừng nhập

## Kiểm Tra Lỗi Thường Gặp

### 1. Socket không kết nối
- Kiểm tra backend đã chạy chưa
- Check `socket.tsx` có đúng URL backend không
- Mở DevTools > Network > WS để xem websocket connection

### 2. Không gửi được tin nhắn
- Kiểm tra đã login chưa (cần authentication token)
- Check Network tab xem API có trả về lỗi gì không
- Xem console logs

### 3. Admin không thấy tin nhắn của customer
- Kiểm tra admin đã join `admin-room` chưa
- Verify socket connection
- Check backend logs

## Cấu Hình Cần Thiết

### Backend (.env)
```
PORT=8000
JWT_SECRET=your_secret_key
MONGODB_URI=your_mongodb_uri
HTTP=http://localhost:8000
```

### Frontend
Socket URL trong `socket.tsx`:
```typescript
const socket: Socket = io('ws://localhost:8000', {
  transports: ['websocket', 'pulling', 'flashsocket']
})
```

### Admin Panel
Tương tự như frontend, check file `socket.tsx`

## Các Files Đã Tạo

### Backend:
- ✅ src/models/message.model.js
- ✅ src/models/conversation.model.js
- ✅ src/controllers/message.controller.js
- ✅ src/routes/message.routes.js
- ✅ src/validates/message.validate.js
- ✅ src/configs/socket.js (updated)

### Frontend:
- ✅ src/api/message.service.ts
- ✅ src/features/chat/components/CustomerChat.tsx
- ✅ src/features/chat/components/ChatWidget.tsx
- ✅ src/features/chat/index.ts

### Admin:
- ✅ src/services/message.service.ts
- ✅ src/pages/Chat/ConversationList.tsx
- ✅ src/pages/Chat/ChatRoom.tsx

## Xong!

Giờ bạn có thể test tính năng chat:
1. Khách hàng gửi tin nhắn từ frontend
2. Admin nhận và phản hồi từ admin panel
3. Cả hai đều thấy tin nhắn real-time

Nếu có vấn đề, xem file `CHAT_DOCUMENTATION.md` để biết thêm chi tiết.
