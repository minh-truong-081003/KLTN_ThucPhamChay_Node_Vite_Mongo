# 🤖 HỆ THỐNG BOT CHAT AI TỰ ĐỘNG - THỰC PHẨM CHAY

## 📋 Tổng quan

Bot AI được train chuyên về **thực phẩm chay**, tự động trả lời câu hỏi khách hàng về:
- Thông tin sản phẩm chay
- Giá cả, khuyến mãi
- Dinh dưỡng & sức khỏe
- Đặt hàng & giao hàng
- Lịch sử mua hàng
- Thống kê sản phẩm bán chạy

## ✨ Tính năng mới

### 🔄 **Auto-Retrain (Tự động train lại)**

Bot sẽ **TỰ ĐỘNG TRAIN LẠI** khi có thay đổi:

✅ **Khi thêm sản phẩm mới** → Bot tự động học thông tin sản phẩm
✅ **Khi cập nhật sản phẩm** → Bot cập nhật giá, mô tả mới
✅ **Khi có order mới** → Bot học patterns đặt hàng

### ⚡ **Debounced Training**

- Tránh train quá nhiều lần liên tục
- Delay 5 giây giữa các lần train
- Queue system để xử lý nhiều request cùng lúc

## 🚀 Cách sử dụng

### 1. Khởi động Bot Server

```bash
cd datn-backend/bot
npm install
npm start
```

Bot sẽ chạy trên: `http://localhost:3333`

### 2. Auto-Retrain tự động hoạt động

Khi admin **thêm/sửa sản phẩm** hoặc có **order mới**, bot tự động retrain sau 5 giây.

```javascript
// Trong product.controller.js
debouncedRetrain('New product created: ' + product.name);

// Trong order.controller.js
debouncedRetrain('New order created: ' + order._id);
```

### 3. Manual Retrain (Train thủ công)

Nếu cần train ngay lập tức:

```bash
# Gọi API
GET http://localhost:3333/update
```

Hoặc từ code:

```javascript
const { triggerBotRetrain } = require('./bot/auto-retrain');
await triggerBotRetrain('Manual retrain');
```

## 📊 Endpoint API

### Bot Chat
```
GET /ask?query={câu_hỏi}&id={user_id}
```

### Manual Retrain
```
GET /update
```

### Products (cho bot training)
```
GET /products
GET /checkouts
```

## 🎯 Các Intent Bot đã train

### 1. **Thông tin thực phẩm chay**
- `about_vegetarian` - Giới thiệu về thực phẩm chay
- `vegetarian_types` - Các loại món chay
- `nutrition` - Dinh dưỡng & sức khỏe
- `origin_quality` - Nguồn gốc nguyên liệu

### 2. **Sản phẩm & Menu**
- `Products` - Danh sách sản phẩm (auto từ DB)
- `AskProduct{n}` - Hỏi giá sản phẩm cụ thể
- `AskProductDes{n}` - Mô tả sản phẩm
- `AskProductLeft?{n}` - Hỏi còn hàng

### 3. **Đặt hàng & Ship**
- `AboutShip` - Thông tin giao hàng
- `bought_num` - Số đơn đã mua (cần login)
- `lastest_buy` - Đơn hàng gần nhất

### 4. **Khuyến mãi**
- `promotion` - Voucher, giảm giá
- `vegetarian_day` - Ưu đãi ngày rằm, mùng 1

### 5. **Tư vấn đặc biệt**
- `beginner_vegetarian` - Món chay cho người mới
- `kids_vegetarian` - Món chay cho trẻ em
- `combo_set` - Combo & set meal

### 6. **Thống kê**
- `dtt` - Sản phẩm bán chạy nhất

### 7. **Giao tiếp cơ bản**
- `greeting` - Chào hỏi
- `NeedHelp` - Yêu cầu trợ giúp
- `thanks` - Cảm ơn

## ❌ Đã xóa

- ~~Tất cả training về **topping**~~ (không sử dụng)

## 🔧 Cấu trúc File

```
datn-backend/
├── bot/
│   ├── index.js           # Main bot server
│   ├── langchain.js       # Training logic (UPDATED)
│   ├── more.js           # NLP Manager setup
│   ├── auto-retrain.js   # Auto-retrain helper (NEW)
│   └── model.nlp         # Trained model
├── src/
│   └── controllers/
│       ├── product.controller.js  # + Auto-retrain
│       └── order.controller.js    # + Auto-retrain
```

## 📝 Logs

Bot sẽ log các hoạt động:

```
🤖 Bot retrain triggered: New product created: Cơm chiên chay
⏳ Bot đang retrain, thêm vào queue...
🔄 Bắt đầu retrain bot...
✅ Bot retrain thành công!
📋 Còn 2 retrain request trong queue
```

## 🐛 Troubleshooting

### Bot không trả lời đúng sau khi thêm sản phẩm?

1. Kiểm tra bot server có đang chạy không
2. Xem logs để đảm bảo retrain thành công
3. Gọi manual retrain: `GET /update`

### Retrain quá chậm?

- Giảm `RETRAIN_DELAY` trong `auto-retrain.js`
- Hiện tại: 5000ms (5 giây)

### Lỗi khi training?

```bash
# Restart bot server
cd datn-backend/bot
npm start
```

## 📌 Lưu ý

1. ✅ Bot **TỰ ĐỘNG** train khi có thay đổi
2. ✅ **Không cần** topping nữa
3. ✅ Debounced để tránh train quá nhiều
4. ✅ Queue system xử lý nhiều request
5. ⚠️ Cần bot server chạy để auto-retrain hoạt động

## 🎉 Kết quả

- Bot luôn **cập nhật thông tin mới nhất**
- Không cần train thủ công
- Tự động học từ database
- Hiệu suất tốt hơn với debouncing

---

Made with 💚 for ViFood - Thực phẩm chay sạch
