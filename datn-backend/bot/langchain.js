const manager = require('./more.js');
//
const axios = require('axios');
const crypto = require('crypto');
let dataSzie = [];
const data =
  'Chỗ này điền secret key để tạo ra tỷ lệ trùng tin nhắn thấp nhất có thể thì chuỗi này cần phải dài nhât';
const hash = crypto.createHash('md5').update(data).digest('hex');

// ============================================
// TRAINING BOT CHO CỬA HÀNG THỰC PHẨM CHAY
// ============================================

// === 1. CHÀO HỎI & GIAO TIẾP CƠ BẢN ===
manager.addDocument('vi', 'Chào shop', 'greeting');
manager.addDocument('vi', 'Chào cửa hàng', 'greeting');
manager.addDocument('vi', 'Chào em', 'greeting');
manager.addDocument('vi', 'Hello shop', 'greeting');
manager.addDocument('vi', 'Hi shop', 'greeting');
manager.addDocument('vi', 'Xin chào', 'greeting');
manager.addDocument('vi', 'Chào bạn', 'greeting');
manager.addDocument('vi', 'Hey', 'greeting');
manager.addDocument('vi', 'Alo shop', 'greeting');
manager.addDocument('vi', 'Shop ơi', 'greeting');
manager.addDocument('vi', 'Có ai không', 'greeting');
manager.addDocument('vi', 'Hú hú', 'greeting');
manager.addDocument('vi', 'Chào nhà hàng chay', 'greeting');
manager.addDocument('vi', 'Chào quán chay', 'greeting');
// === 2. THÔNG TIN VỀ THỰC PHẨM CHAY ===
manager.addDocument('vi', 'Thực phẩm chay là gì', 'about_vegetarian');
manager.addDocument('vi', 'Đồ chay là gì vậy', 'about_vegetarian');
manager.addDocument('vi', 'Shop bán đồ chay phải không', 'about_vegetarian');
manager.addDocument('vi', 'Đồ ăn ở đây có phải là chay không', 'about_vegetarian');
manager.addDocument('vi', 'Thực phẩm chay có lành mạnh không', 'about_vegetarian');
manager.addDocument('vi', 'Ăn chay có tốt cho sức khỏe không', 'about_vegetarian');
manager.addDocument('vi', 'Shop này chuyên về món chay à', 'about_vegetarian');
manager.addDocument('vi', 'Chay là gì', 'about_vegetarian');
manager.addDocument('vi', 'Tại sao nên ăn chay', 'about_vegetarian');
manager.addDocument('vi', 'Lợi ích của thực phẩm chay', 'about_vegetarian');
manager.addDocument('vi', 'Shop toàn đồ chay hả', 'about_vegetarian');
manager.addDocument('vi', 'Có bán đồ mặn không', 'about_vegetarian');
manager.addDocument('vi', 'Đồ ăn ở đây healthy không', 'about_vegetarian');
manager.addDocument('vi', 'Ăn chay có béo không', 'about_vegetarian');
manager.addDocument('vi', 'Đồ chay có ngon không', 'about_vegetarian');
manager.addDocument('vi', 'Món chay có đủ chất không', 'about_vegetarian');
manager.addDocument('vi', 'Đồ đóng gói có an toàn không', 'about_vegetarian');
manager.addDocument('vi', 'Đồ đông lạnh có tốt không', 'about_vegetarian');
manager.addDocument('vi', 'Đồ đóng gói bảo quản bao lâu', 'about_vegetarian');

manager.addAnswer('vi', 'about_vegetarian', 'Shop chuyên THỰC PHẨM CHAY ĐÓNG GÓI & ĐÔNG LẠNH 100% từ nguồn gốc thực vật 🌱 Tiện lợi, bảo quản lâu 3-6 tháng!');
manager.addAnswer('vi', 'about_vegetarian', 'Đúng rồi! Shop bán đồ chay ĐÃ ĐÓNG GÓI SẴN, chỉ cần rã đông & hâm nóng là ăn được 💚 Tiện cho người bận!');
manager.addAnswer('vi', 'about_vegetarian', 'Shop chuyên THỰC PHẨM CHAY ĐÔNG LẠNH: nem chay, chả chay, giò chay, xúc xích chay... 🥬 Không chất bảo quản độc hại!');
manager.addAnswer('vi', 'about_vegetarian', 'Đồ đóng gói rất tốt! 📦 Vừa tiện, vừa sạch, vừa đủ dinh dưỡng. Từ đồ ăn liền đến nguyên liệu chế biến!');
manager.addAnswer('vi', 'about_vegetarian', 'Đồ đông lạnh AN TOÀN tuyệt đối! ❄️ Công nghệ IQF -18°C, giữ nguyên dinh dưỡng & hương vị!');
manager.addAnswer('vi', 'about_vegetarian', 'Shop bán đồ chay ĐÓNG GÓI & ĐÔNG LẠNH: HSD 3-6 tháng 🌱 Không lo hỏng, mua trữ tiện lợi!');
manager.addAnswer('vi', 'about_vegetarian', 'Shop 100% thực phẩm chay đóng gói! Từ đồ ăn sẵn (nem, chả) đến nguyên liệu (nấm, đậu) 📦 Tiện cho mọi gia đình!');
manager.addAnswer('vi', 'about_vegetarian', 'Đồ đông lạnh không thua đồ tươi! Công nghệ đông nhanh IQF giữ nguyên chất lượng ❄️ Nhiều khách ưa thích!');

// === 3. CÁC LOẠI THỰC PHẨM CHAY ===
manager.addDocument('vi', 'Shop có những loại thực phẩm chay nào', 'vegetarian_types');
manager.addDocument('vi', 'Món chay nào ngon nhất', 'vegetarian_types');
manager.addDocument('vi', 'Shop bán đồ chay gì', 'vegetarian_types');
manager.addDocument('vi', 'Có những loại đồ chay nào', 'vegetarian_types');
manager.addDocument('vi', 'Menu chay có gì', 'vegetarian_types');
manager.addDocument('vi', 'Shop bán món gì', 'vegetarian_types');
manager.addDocument('vi', 'Có món nào ngon', 'vegetarian_types');
manager.addDocument('vi', 'Muốn xem menu', 'vegetarian_types');
manager.addDocument('vi', 'Cho tui xem các món', 'vegetarian_types');
manager.addDocument('vi', 'Món ăn có gì', 'vegetarian_types');
manager.addDocument('vi', 'Shop có bán cơm không', 'vegetarian_types');
manager.addDocument('vi', 'Có phở chay không', 'vegetarian_types');
manager.addDocument('vi', 'Có bún chay không', 'vegetarian_types');
manager.addDocument('vi', 'Món nào bestseller', 'vegetarian_types');
manager.addDocument('vi', 'Món nào bán chạy nhất', 'vegetarian_types');
manager.addDocument('vi', 'Nên gọi món gì', 'vegetarian_types');
manager.addDocument('vi', 'Gợi ý món ngon', 'vegetarian_types');

manager.addAnswer('vi', 'vegetarian_types', 'Shop có: Nem chay, chả chay, giò chay, xúc xích chay, đậu phụ đóng gói, nấm đông lạnh... 📦 Đóng gói sẵn, tiện dùng!');
manager.addAnswer('vi', 'vegetarian_types', 'Đồ đông lạnh: Nem cuốn, chả giò, viên chay, thịt chay, cá chay, bánh bao chay... ❄️ Rã đông & chiên/nướng là ăn được!');
manager.addAnswer('vi', 'vegetarian_types', 'Menu: Đồ ăn liền (nem, chả), Nguyên liệu (nấm, đậu), Gia vị chay (bột, nước tương)... 🌱 Đủ loại!');
manager.addAnswer('vi', 'vegetarian_types', 'Bestseller: Nem chay đông lạnh, chả chay chiên giòn, xúc xích chay, thịt chay bó 🏆 Khách mua nhiều nhất!');
manager.addAnswer('vi', 'vegetarian_types', 'Từ đồ ăn sẵn: nem, chả, giò... đến nguyên liệu: nấm đông lạnh, đậu phụ, rau củ đóng gói 📦 Đủ để nấu cả tuần!');
manager.addAnswer('vi', 'vegetarian_types', 'Lần đầu mua nên chọn: Nem chay đông lạnh hoặc xúc xích chay 😊 Dễ chế biến, ăn liền, tiện lợi!');
manager.addAnswer('vi', 'vegetarian_types', 'Có 5 nhóm: 📦 Đồ ăn sẵn, ❄️ Đồ đông lạnh, 🌾 Nguyên liệu, 🧂 Gia vị, 🥫 Đồ hộp - Hơn 100 sản phẩm!');
manager.addAnswer('vi', 'vegetarian_types', 'Hot nhất: Nem chay Đà Lạt, chả chay Huế, giò chay miền Tây 🔥 Mua về ăn Tết, tiệc đều được!');

// === 4. THÔNG TIN SHIP/GIAO HÀNG ===
manager.addDocument('vi', 'Shop có ship không', 'AboutShip');
manager.addDocument('vi', 'Có giao hàng không', 'AboutShip');
manager.addDocument('vi', 'Giao hàng tận nơi không', 'AboutShip');
manager.addDocument('vi', 'Shop có ship tận nhà không', 'AboutShip');
manager.addDocument('vi', 'Có ship không shop', 'AboutShip');
manager.addDocument('vi', 'Giao đồ tận nơi không', 'AboutShip');
manager.addDocument('vi', 'Mình đặt ship được không', 'AboutShip');
manager.addDocument('vi', 'Ship bao lâu', 'AboutShip');
manager.addDocument('vi', 'Bao lâu thì giao', 'AboutShip');
manager.addDocument('vi', 'Bao giờ giao hàng', 'AboutShip');
manager.addDocument('vi', 'Giao hàng mất bao lâu', 'AboutShip');
manager.addDocument('vi', 'Phí ship bao nhiêu', 'AboutShip');
manager.addDocument('vi', 'Tiền ship là bao nhiêu', 'AboutShip');
manager.addDocument('vi', 'Có tính phí giao hàng không', 'AboutShip');
manager.addDocument('vi', 'Ship xa có được không', 'AboutShip');
manager.addDocument('vi', 'Ship ngoại thành được không', 'AboutShip');
manager.addDocument('vi', 'Khu vực nào thì ship', 'AboutShip');
manager.addDocument('vi', 'Shop có giao đồ ăn chay tận nhà không', 'AboutShip');
manager.addDocument('vi', 'Phí ship thực phẩm chay bao nhiêu', 'AboutShip');

manager.addAnswer('vi', 'AboutShip', 'Có ship nha bạn! 🚚 Shop giao hàng tận nơi trong 30-60 phút, phí ship 15k-30k tùy khoảng cách. Miễn ship cho đơn trên 150k!');
manager.addAnswer('vi', 'AboutShip', 'Chào bạn, shop có ship thực phẩm chay tận nơi! Đồ ăn được đóng gói cẩn thận, giữ nguyên hương vị 😙 Giao trong 30-60 phút!');
manager.addAnswer('vi', 'AboutShip', 'Shop giao hàng tận nhà cho bạn nhé! 🛵 Thời gian: 30-60 phút. Phí ship: 15k nội thành, 30k ngoại thành. Đơn >150k miễn phí!');
manager.addAnswer('vi', 'AboutShip', 'Có giao tận nơi nha! Đảm bảo món chay còn nóng hổi khi đến tay bạn 🔥 Ship nhanh trong 30-60 phút, phí rất rẻ!');
manager.addAnswer('vi', 'AboutShip', 'Shop ship toàn TP và ngoại thành nha bạn! Phí ship: 15-30k (FREE ship đơn >150k) ⚡ Gọi ngay để được giao nhanh nhất!');
manager.addAnswer('vi', 'AboutShip', 'Giao hàng tận nhà trong 30-60 phút! 🚀 Đóng gói cẩn thận, giữ nhiệt tốt. Phí ship chỉ 15-30k thôi!');

// === 5. DINH DƯỠNG & SỨC KHỎE ===
manager.addDocument('vi', 'Ăn chay có đủ dinh dưỡng không', 'nutrition');
manager.addDocument('vi', 'Thực phẩm chay có đủ protein không', 'nutrition');
manager.addDocument('vi', 'Món chay có tốt cho người giảm cân không', 'nutrition');
manager.addDocument('vi', 'Ăn chay có thiếu chất gì không', 'nutrition');
manager.addDocument('vi', 'Đồ chay có đủ vitamin không', 'nutrition');
manager.addDocument('vi', 'Ăn chay có bị thiếu máu không', 'nutrition');
manager.addDocument('vi', 'Đồ chay có đủ sắt không', 'nutrition');
manager.addDocument('vi', 'Ăn chay giảm cân được không', 'nutrition');
manager.addDocument('vi', 'Thực phẩm chay có béo không', 'nutrition');
manager.addDocument('vi', 'Ăn chay có tốt cho da không', 'nutrition');
manager.addDocument('vi', 'Đồ chay có làm sáng da không', 'nutrition');
manager.addDocument('vi', 'Ăn chay có tốt cho người tiểu đường không', 'nutrition');
manager.addDocument('vi', 'Món chay có cholesterol không', 'nutrition');
manager.addDocument('vi', 'Đồ chay có nhiều calo không', 'nutrition');
manager.addDocument('vi', 'Ăn chay có đủ năng lượng không', 'nutrition');

manager.addAnswer('vi', 'nutrition', 'Thực phẩm chay hoàn toàn đủ dinh dưỡng! Đậu phụ, đậu nành, các loại đậu cung cấp protein. Rau xanh giàu vitamin & khoáng chất 💪');
manager.addAnswer('vi', 'nutrition', 'Món chay rất tốt cho giảm cân, ít calo, nhiều chất xơ, giúp thanh lọc cơ thể. Shop có nhiều món ăn sạch cho người ăn kiêng 🥗');
manager.addAnswer('vi', 'nutrition', 'Đừng lo thiếu chất nhé! Đậu phụ giàu protein, rau xanh nhiều sắt, ngũ cốc đủ vitamin B 🌾 Shop balance dinh dưỡng trong từng món!');
manager.addAnswer('vi', 'nutrition', 'Ăn chay giúp giảm cholesterol, tốt cho tim mạch ❤️ Đặc biệt tốt cho người tiểu đường, huyết áp cao!');
manager.addAnswer('vi', 'nutrition', 'Đồ chay ít calo nhưng đủ năng lượng! Protein từ đậu, carb từ cơm/ngũ cốc, chất béo tốt từ hạt 🌰 Ăn no mà không béo!');
manager.addAnswer('vi', 'nutrition', 'Ăn chay làm đẹp da lắm bạn ơi! 🌸 Vitamin từ rau củ giúp da sáng, giảm mụn, chống lão hóa. Nhiều sao Việt ăn chay để giữ dáng đó!');
manager.addAnswer('vi', 'nutrition', 'Shop đảm bảo mỗi món đều cân đối dinh dưỡng: Protein + Carb + Chất xơ + Vitamin 🍽️ Ăn chay khỏe hơn ăn mặn ấy!');

// === 6. GIÁ CẢ & ƯU ĐÃI ===
manager.addDocument('vi', 'Giá thực phẩm chay bao nhiêu', 'price_range');
manager.addDocument('vi', 'Đồ chay có đắt không', 'price_range');
manager.addDocument('vi', 'Món chay giá cả thế nào', 'price_range');
manager.addDocument('vi', 'Ăn chay có rẻ hơn không', 'price_range');
manager.addDocument('vi', 'Giá món chay', 'price_range');
manager.addDocument('vi', 'Bao nhiêu tiền một suất', 'price_range');
manager.addDocument('vi', 'Giá cả như thế nào', 'price_range');
manager.addDocument('vi', 'Món chay đắt không', 'price_range');
manager.addDocument('vi', 'Ăn chay tốn bao nhiêu', 'price_range');
manager.addDocument('vi', 'Giá thực đơn', 'price_range');
manager.addDocument('vi', 'Phở chay giá bao nhiêu', 'price_range');
manager.addDocument('vi', 'Cơm chay giá bao nhiêu', 'price_range');
manager.addDocument('vi', 'Bún chay bao nhiêu tiền', 'price_range');
manager.addDocument('vi', 'Món rẻ nhất', 'price_range');
manager.addDocument('vi', 'Có món nào dưới 50k', 'price_range');

manager.addAnswer('vi', 'price_range', 'Giá rất hợp lý: 30k-50k (cơm, phở, bún), 50k-80k (món đặc biệt), 80k-100k (combo/lẩu) 💰 Chất lượng cao, giá siêu tốt!');
manager.addAnswer('vi', 'price_range', 'Đồ chay không đắt đâu bạn! Từ 30k đã có suất ngon rồi 😋 Phở 35k, cơm rang 40k, salad 45k... rẻ hơn đồ mặn ấy!');
manager.addAnswer('vi', 'price_range', 'Shop cam kết giá TỐT NHẤT: Phở chay 35-45k, Bún chay 30-40k, Cơm chay 40-60k 🌿 Nguyên liệu sạch, giá cực yêu!');
manager.addAnswer('vi', 'price_range', 'Có món từ 30k luôn! 🎯 Phở chay 35k, cơm rang 40k, salad 45k... Ăn ngon mà không lo hết ví đâu!');
manager.addAnswer('vi', 'price_range', 'Giá siêu hợp lý: Dưới 50k có nhiều món lắm (phở, bún, cơm), 50-80k (món đặc biệt), 80-100k (lẩu, combo) 💚');
manager.addAnswer('vi', 'price_range', 'Ăn chay RẺ HƠN ăn mặn đó bạn! Suất cơm chay chỉ 40k mà no lâu, nhiều rau, tốt cho sức khỏe 🥗 Tiết kiệm lại khỏe!');

manager.addDocument('vi', 'Shop có khuyến mãi không', 'promotion');
manager.addDocument('vi', 'Có voucher giảm giá không', 'promotion');
manager.addDocument('vi', 'Mã giảm giá thực phẩm chay', 'promotion');
manager.addDocument('vi', 'Có giảm giá không', 'promotion');
manager.addDocument('vi', 'Ưu đãi gì không', 'promotion');
manager.addDocument('vi', 'Sale không shop', 'promotion');
manager.addDocument('vi', 'Có mã giảm giá', 'promotion');
manager.addDocument('vi', 'Voucher gì', 'promotion');
manager.addDocument('vi', 'Hôm nay có khuyến mãi gì', 'promotion');
manager.addDocument('vi', 'Miễn ship không', 'promotion');
manager.addDocument('vi', 'Free ship đơn bao nhiêu', 'promotion');
manager.addDocument('vi', 'Giảm giá khi nào', 'promotion');
manager.addDocument('vi', 'Có chương trình ưu đãi', 'promotion');

// === LẤY KHUYẾN MÃI TỪ DATABASE ===
// Delay 5000ms để đảm bảo main API server đã khởi động hoàn toàn
setTimeout(() => {
  axios
    .get('http://localhost:3333/vouchers', {
      timeout: 10000, // 10 giây timeout
      headers: {
        'Accept': 'application/json'
      }
    })
    .then((response) => {
    const currentDate = new Date();
    const vouchers = response?.data?.data?.docs || [];
    const activeVouchers = vouchers.filter((voucher) => {
      return (
        voucher.isActive &&
        new Date(voucher.startDate) <= currentDate &&
        new Date(voucher.endDate) >= currentDate
      );
    });

    if (activeVouchers && activeVouchers.length > 0) {
      let voucherText = '🎉 KHUYẾN MÃI ĐANG HOẠT ĐỘNG:\\n\\n';
      activeVouchers.slice(0, 5).forEach((voucher, index) => {
        const endDate = new Date(voucher.endDate).toLocaleDateString('vi-VN');
        voucherText += `${index + 1}. 🎫 Mã: <strong style="color:#22c55e">${voucher.code}</strong>\\n`;
        voucherText += `   📌 ${voucher.title}\\n`;
        voucherText += `   💰 Giảm: ${voucher.discount}% (tối đa ${voucher.sale.toLocaleString()}đ)\\n`;
        voucherText += `   ⏰ HSD: ${endDate}\\n`;
        if (voucher.desc) voucherText += `   ℹ️ ${voucher.desc}\\n`;
        voucherText += '\\n';
      });
      voucherText += '🛒 Áp dụng mã khi thanh toán để được giảm giá nhé!';
      
      manager.addAnswer('vi', 'promotion', voucherText);
      console.log(`✅ Đã tải ${activeVouchers.length} voucher đang hoạt động`);
    } else {
      manager.addAnswer(
        'vi',
        'promotion',
        '📢 Hiện tại chưa có khuyến mãi đang hoạt động. Theo dõi shop để nhận thông báo ưu đãi mới nhé! 💚'
      );
      console.log('✅ Đã tải 0 voucher đang hoạt động');
    }

    // Thêm câu trả lời chung
    manager.addAnswer(
      'vi',
      'promotion',
      'Shop luôn có ưu đãi hấp dẫn! Vào <a href="/account-layout/my-voucher" style="color:#22c55e;font-weight:600;">Trang Khuyến Mãi</a> để xem tất cả voucher đang áp dụng nhé! 🎁'
    );

    })
    .catch((error) => {
      // Chỉ log nếu không phải lỗi ECONNREFUSED (main API chưa sẵn sàng)
      if (error.code !== 'ECONNREFUSED') {
        console.error('❌ Lỗi khi tải voucher:', error.message || error);
        if (error.response) {
          console.error('   Response status:', error.response.status);
          console.error('   Response data:', error.response.data);
        }
      } else {
        console.log('⏳ Main API chưa sẵn sàng, sử dụng fallback voucher response');
      }
      
      // Thêm câu trả lời mặc định cho trường hợp API chưa sẵn sàng
      manager.addAnswer(
        'vi',
        'promotion',
        'Shop có nhiều chương trình khuyến mãi! Vui lòng vào <a href="/account-layout/my-voucher" style="color:#22c55e;">Trang Voucher</a> để xem chi tiết nhé! 🎉'
      );
    });
}, 5000); // Delay 5 giây để đảm bảo main API đã khởi động hoàn toàn

// === 7. CÂU HỎI GIÚP ĐỠ & TƯ VẤN ===
manager.addDocument('vi', 'Có ai online không', 'NeedHelp');
manager.addDocument('vi', 'Có ai không', 'NeedHelp');
manager.addDocument('vi', 'Tôi cần giúp đỡ', 'NeedHelp');
manager.addDocument('vi', 'Tư vấn giúp em món chay nào ngon', 'NeedHelp');
manager.addDocument('vi', 'Shop tư vấn món chay cho người mới ăn chay', 'NeedHelp');
manager.addDocument('vi', 'Help me', 'NeedHelp');
manager.addDocument('vi', 'Cần tư vấn', 'NeedHelp');
manager.addDocument('vi', 'Shop tư vấn giúp em', 'NeedHelp');
manager.addDocument('vi', 'Muốn hỏi vài thứ', 'NeedHelp');
manager.addDocument('vi', 'Không biết nên chọn món nào', 'NeedHelp');
manager.addDocument('vi', 'Món nào ngon cho người mới', 'NeedHelp');
manager.addDocument('vi', 'Tư vấn món ăn chay', 'NeedHelp');
manager.addDocument('vi', 'Giúp tôi chọn món', 'NeedHelp');
manager.addDocument('vi', 'Nên ăn gì', 'NeedHelp');
manager.addDocument('vi', 'Gợi ý món đi', 'NeedHelp');

manager.addAnswer('vi', 'NeedHelp', 'Shop sẵn sàng tư vấn món chay cho bạn! 😊 Bạn thích món Việt (phở, bún, cơm) hay món Á/Âu (pasta, sushi, burger chay)?');
manager.addAnswer('vi', 'NeedHelp', 'Shop đang online đây nè! 💬 Bạn cần tư vấn món gì? Phở, bún, cơm, lẩu, hay salad giảm cân?');
manager.addAnswer('vi', 'NeedHelp', 'Mình tư vấn ngay nè! 🌱 Bạn mới ăn chay → gợi ý: Phở chay, cơm rang chay (quen miệng). Ăn lâu rồi → thử: Sushi chay, burger chay!');
manager.addAnswer('vi', 'NeedHelp', 'Shop giúp bạn chọn món nhé! 🥗 Giảm cân: Salad, nước ép. No bụng: Cơm, phở. Đổi vị: Lẩu chay, pasta. Bạn thích gì?');
manager.addAnswer('vi', 'NeedHelp', 'Bạn cần gì cứ hỏi shop nha! 💚 Tư vấn món ăn, dinh dưỡng, giá cả, giao hàng... mình support hết!');
manager.addAnswer('vi', 'NeedHelp', 'Tùy sở thích bạn nhé: 🍜 Món nước: phở/bún chay, 🍚 Món khô: cơm/mì xào, 🥗 Healthy: salad/súp, 🍕 Fast food: burger/pizza chay!');

// === CẢM ƠN & TẠM BIỆT ===
manager.addDocument('vi', 'Cảm ơn shop', 'thanks');
manager.addDocument('vi', 'E cảm ơn shop ạ', 'thanks');
manager.addDocument('vi', 'Thanks shop nhé', 'thanks');
manager.addDocument('vi', 'Tks shop', 'thanks');
manager.addDocument('vi', 'Cảm ơn nhiều', 'thanks');
manager.addDocument('vi', 'Thank you', 'thanks');
manager.addDocument('vi', 'Thanks nhiều nha', 'thanks');
manager.addDocument('vi', 'Cảm ơn đã tư vấn', 'thanks');
manager.addDocument('vi', 'Cảm ơn shop nhiều', 'thanks');
manager.addDocument('vi', 'Shop tuyệt vời', 'thanks');
manager.addDocument('vi', 'Ok cảm ơn', 'thanks');
manager.addDocument('vi', 'Oke thanks', 'thanks');
manager.addDocument('vi', 'Được rồi cảm ơn', 'thanks');
manager.addDocument('vi', 'Thế là được', 'thanks');
manager.addDocument('vi', 'Tạm biệt', 'thanks');
manager.addDocument('vi', 'Bye bye', 'thanks');
manager.addDocument('vi', 'Hẹn gặp lại', 'thanks');

manager.addAnswer('vi', 'thanks', 'Không có gì nè! Chúc bạn ăn chay vui vẻ, sức khỏe dồi dào 🙏 Hẹn gặp lại bạn!');
manager.addAnswer('vi', 'thanks', '❤️ Cảm ơn bạn đã ủng hộ shop thực phẩm chay nhé! Ăn chay là yêu thương bản thân và trái đất 🌍');
manager.addAnswer('vi', 'thanks', 'Rất vui được hỗ trợ bạn! 💚 Chúc bạn có bữa ăn chay ngon miệng nha!');
manager.addAnswer('vi', 'thanks', 'Không có chi bạn ơi! 😊 Shop luôn sẵn sàng tư vấn. Hẹn gặp lại, chúc bạn khỏe!');
manager.addAnswer('vi', 'thanks', 'You are welcome! 🌱 Ăn chay mỗi ngày, sống khỏe mỗi ngày nha bạn!');
manager.addAnswer('vi', 'thanks', 'Cảm ơn bạn đã ghé thăm! 🥗 Nhớ quay lại để thử thêm món chay mới nha!');

// === 8. DANH SÁCH SẢN PHẨM CHAY (TỪ DATABASE) ===
manager.addDocument('vi', 'Hiện tại shop bán sản phẩm chay gì thế', 'Products');
manager.addDocument('vi', 'Shop còn món chay gì thế', 'Products');
manager.addDocument('vi', 'Shop có bán món ăn chay gì thế', 'Products');
manager.addDocument('vi', 'Kể tên toàn bộ sản phẩm chay', 'Products');
manager.addDocument('vi', 'Menu thực phẩm chay có gì', 'Products');
manager.addDocument('vi', 'Cho xem danh sách món', 'Products');
manager.addDocument('vi', 'Liệt kê tất cả món chay', 'Products');
manager.addDocument('vi', 'Xem tất cả sản phẩm', 'Products');
manager.addDocument('vi', 'Có bao nhiêu món', 'Products');
manager.addDocument('vi', 'Show menu', 'Products');
manager.addDocument('vi', 'Xem menu đầy đủ', 'Products');
manager.addDocument('vi', 'Danh sách món ăn', 'Products');
manager.addDocument('vi', 'Tất cả các món', 'Products');
manager.addAnswer(
  'vi',
  'greeting',
  'Hi, shop thực phẩm chay đã nhận được tin nhắn của bạn rồi! Món nào làm bạn thích thú nhỉ? 🥗'
);

manager.addAnswer('vi', 'NeedHelp', 'Shop lúc nào có mặt nè , bạn cần hỗ trợ gì thế ? ');
manager.addAnswer('vi', 'NeedHelp', 'Shop đang online nè  , bạn có chuyện gì thế ');

axios
  .get('http://localhost:3333/products')
  .then((response) => {
    let i = 0;
    let AllProduct =
      "<span style='display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; height: 500px;overflow-y: auto; width:100%'>";
    response?.['data'].forEach((value) => {
      let nameText = value.name.length > 14 ? value.name.substring(0, 14) + '...' : value.name;
      AllProduct +=
        "<a href='/products' style='display: block; width:150px; height:220px; padding:10px; border:1px #22c55e solid; color: white; margin:10px; box-shadow:0 4px 8px 0 rgba(34,197,94,0.3); border-radius:10px; text-align:center; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); text-decoration:none; transition: all 0.3s;'>" +
        "<div style='height: 40px; overflow: hidden; margin-bottom: 10px; color:#15803d; font-weight:600;'>" +
        nameText +
        ' 🌱</div>' +
        "<img style='width:120px; height:100px; object-fit:cover; border-radius:8px;' src=" +
        value.images[0].url +
        '>' +
        '<div style=\'width:120px; height:35px; margin-top:5px; background:#22c55e; color:white; border:none; box-shadow: 2px 2px 4px rgba(0,0,0,0.3); border-radius: 5px; font-weight:600; display:flex; align-items:center; justify-content:center;\'>🛒 Xem Chi Tiết</div>' +
        '</a>';
      manager.addDocument('vi', 'Shop cho em xin giá của món chay ' + value.name, 'AskProduct' + i);
      manager.addDocument('vi', 'em xin giá món ' + value.name, 'AskProduct' + i);
      manager.addDocument('vi', 'em muốn ăn món chay ' + value.name, 'AskProduct' + i);
      manager.addDocument('vi', 'giá ' + value.name + ' bao nhiêu', 'AskProduct' + i);
      manager.addDocument('vi', value.name + ' giá bao nhiêu', 'AskProduct' + i);
      
      manager.addAnswer(
        'vi',
        'AskProduct' + i,
        'Món chay ' +
          value?.name +
          ' size ' +
          value.sizes[0]?.name +
          ' giá ' +
          value.sizes[0]?.price +
          ' VND (đang sale ' +
          value?.sale +
          'đ) 🌿 Món này rất healthy và ngon lắm nè!'
      );
      manager.addAnswer(
        'vi',
        'AskProduct' + i,
        'Giá hiện tại của món ' +
          value?.name +
          ' là ' +
          value.sizes[0]?.price +
          ' VND, đang giảm còn ' +
          value?.sale +
          'đ luôn! Đặt ngay nhé 🥗'
      );
      //description - Mô tả món chay
      manager.addDocument(
        'vi',
        'Shop giới thiệu cho em về món chay ' + value.name,
        'AskProductDes' + i
      );
      manager.addDocument(
        'vi',
        'Món ' + value.name + ' làm từ nguyên liệu gì',
        'AskProductDes' + i
      );
      manager.addDocument('vi', 'mô tả món chay ' + value.name, 'AskProductDes' + i);
      manager.addDocument('vi', 'giới thiệu món ' + value.name, 'AskProductDes' + i);
      manager.addDocument('vi', value.name + ' có gì trong đó', 'AskProductDes' + i);
      manager.addDocument('vi', 'món chay ' + value.name + ' là gì thế shop', 'AskProductDes' + i);
      manager.addDocument(
        'vi',
        'cho em xin thông tin về món chay ' + value.name + ' với ạ',
        'AskProductDes' + i
      );
      
      manager.addAnswer(
        'vi', 
        'AskProductDes' + i, 
        '🌿 ' + value.name + ': ' + value.description + '\n\n100% thực phẩm chay, không chất bảo quản, tươi ngon mỗi ngày!'
      );

      //leftProduct - Hỏi còn hàng
      manager.addDocument('vi', 'Shop còn món chay ' + value.name + ' không ạ !', 'AskProductLeft?' + i);
      manager.addDocument('vi', 'Shop bán ' + value.name + ' không', 'AskProductLeft?' + i);
      manager.addDocument('vi', 'Món ' + value.name + ' còn hàng không', 'AskProductLeft?' + i);
      manager.addDocument(
        'vi',
        'Shop có bán món chay ' + value.name + ' phải không ạ !',
        'AskProductLeft?' + i
      );
      
      manager.addAnswer('vi', 'AskProductLeft?' + i, 'Shop còn nhiều món chay ' + value.name + ' nhé bạn ơi 😁🌱');
      manager.addAnswer('vi', 'AskProductLeft?' + i, 'Có món ' + value.name + ' nè! Shop làm tươi mỗi ngày luôn 😁');
      manager.addAnswer(
        'vi',
        'AskProductLeft?' + i,
        'Món chay ' + value.name + ' còn nhiều lắm bạn! Đặt ngay nhé 🥗'
      );
      manager.addAnswer(
        'vi',
        'AskProductLeft?' + i,
        'Shop bán món ' + value.name + ' hàng ngày, luôn có sẵn món fresh cho bạn 😁🌿'
      );
      //Ask for order food
      manager.addDocument(
        'vi',
        'Ship cho em ' + value.name + '[được,đc] không ạ !',
        'AskProductOrder?name=' + i
      );
      manager.addDocument(
        'vi',
        'Ship cho em ' + value.name + 'nhanh nhé shop !',
        'AskProductOrder?name=' + i
      );
      manager.addDocument(
        'vi',
        'Ship em ' + value.name + 'nhanh nhé shop !',
        'AskProductOrder?name=' + i
      );
      manager.addAnswer(
        'vi',
        'AskProductOrder?name=' + i,
        ' Ok bạn nè , bạn gửi lại tin nhắn đầy đủ chứa địa chỉ nhận hàng , tên người nhận , sđt cho shop nhé 😁'
      );

      //checkout
      manager.addDocument(
        'vi',
        'Ship [cho] em ' +
          value.name +
          ' [tới,đến] địa chỉ ' +
          ' sđt [là] : 0987654321' +
          ' người nhận :',
        'MesCheckOut' + i
      );
      manager.addDocument(
        'vi',
        'Gửi [cho] em ' +
          value.name +
          ' [tới,đến] địa điểm ' +
          ' số điện thoại [là]  0987654321' +
          ' người nhận ',
        'MesCheckOut' + i
      );
      manager.addAnswer(
        'vi',
        'MesCheckOut',
        'Shop đã nhận được đơn của bạn rùi nè 😀 Cảm ơn bạn đã đặt hàng !'
      );
      manager.addAnswer(
        'vi',
        'MesCheckOut',
        'Shop vừa gửi cho a shipper rồi nhé , bạn nhớ kiểm tra điện thoại thường xuyên nhé !'
      );
      //

      i++;
    });
    AllProduct += '</span>';
    manager.addAnswer('vi', 'Products', '🌱 Shop thực phẩm chay có những món này nè:\n' + AllProduct);
    manager.addAnswer(
      'vi',
      'Products',
      '🥗 Đây là menu món chay của shop, toàn ngon và healthy:\n' + AllProduct
    );
    manager.addAnswer('vi', 'Products', '🌿 Thực đơn chay hôm nay có mấy món này bạn nhé:\n' + AllProduct);
    manager.addAnswer('vi', 'Products', '💚 Shop có các món chay tươi ngon này, bạn tham khảo nha:\n' + AllProduct);

    manager.save();
    manager.train();
  })
  .catch((error) => {
    console.error('Lỗi khi truy vấn API:', error);
  });
//bảng checkouts

// === HỎI VỀ ĐƠN HÀNG (THEO TRẠNG THÁI) ===
manager.addDocument('vi', 'Đơn hàng của tôi đâu', 'check_my_orders');
manager.addDocument('vi', 'Kiểm tra đơn hàng', 'check_my_orders');
manager.addDocument('vi', 'Xem đơn hàng của mình', 'check_my_orders');
manager.addDocument('vi', 'Tình trạng đơn hàng thế nào', 'check_my_orders');
manager.addDocument('vi', 'Check đơn hàng', 'check_my_orders');
manager.addDocument('vi', 'Xem lịch sử đơn hàng', 'check_my_orders');
manager.addDocument('vi', 'Kiểm tra order', 'check_my_orders');
manager.addDocument('vi', 'Trạng thái đơn hàng', 'check_my_orders');

manager.addAnswer('vi', 'check_my_orders', '📦 Xem tất cả đơn hàng tại: <a href="/account-layout/my-order" style="color:#22c55e; font-weight:600;">Đơn Hàng Của Tôi</a>. Đăng nhập để xem chi tiết từng trạng thái!');
manager.addAnswer('vi', 'check_my_orders', '🔐 Vui lòng đăng nhập, sau đó vào <a href="/account-layout/my-order" style="color:#22c55e; font-weight:600;">Quản Lý Đơn Hàng</a> để xem trạng thái, thời gian giao...');

// ĐƠN CHỜ XÁC NHẬN
manager.addDocument('vi', 'Đơn hàng chờ xác nhận', 'check_pending_orders');
manager.addDocument('vi', 'Đơn chưa duyệt', 'check_pending_orders');
manager.addDocument('vi', 'Đơn đang chờ', 'check_pending_orders');
manager.addDocument('vi', 'Đơn hàng đã duyệt chưa', 'check_pending_orders');
manager.addDocument('vi', 'Shop xác nhận đơn chưa', 'check_pending_orders');

manager.addAnswer('vi', 'check_pending_orders', '⏳ Đơn chờ xác nhận: <a href="/account-layout/my-order" style="color:#ff9800; font-weight:600;">Xem Đơn Chờ Duyệt</a>. Thời gian xác nhận: 10-30 phút!');
manager.addAnswer('vi', 'check_pending_orders', '📋 Đơn đang chờ shop xác nhận! Xem tại: <a href="/account-layout/my-order" style="color:#ff9800; font-weight:600;">Đơn Chờ Xác Nhận</a>. Lọc theo trạng thái "Chờ xác nhận"!');

// ĐƠN ĐANG GIAO
manager.addDocument('vi', 'Đơn hàng đang giao', 'check_shipping_orders');
manager.addDocument('vi', 'Đơn đang ship', 'check_shipping_orders');
manager.addDocument('vi', 'Đơn của tôi đến đâu rồi', 'check_shipping_orders');
manager.addDocument('vi', 'Shipper đến chưa', 'check_shipping_orders');
manager.addDocument('vi', 'Bao giờ giao đơn hàng', 'check_shipping_orders');
manager.addDocument('vi', 'Đơn hàng bao lâu nữa đến', 'check_shipping_orders');

manager.addAnswer('vi', 'check_shipping_orders', '🚚 Đơn đang giao: <a href="/account-layout/my-order" style="color:#2196f3; font-weight:600;">Xem Đơn Đang Ship</a>. Lọc theo "Đang giao" để xem chi tiết!');
manager.addAnswer('vi', 'check_shipping_orders', '🛵 Kiểm tra đơn đang giao tại: <a href="/account-layout/my-order" style="color:#2196f3; font-weight:600;">Đơn Đang Vận Chuyển</a>. Dự kiến giao trong 30-60 phút!');

// ĐƠN ĐÃ GIAO
manager.addDocument('vi', 'Đơn hàng đã giao', 'check_delivered_orders');
manager.addDocument('vi', 'Đơn đã nhận', 'check_delivered_orders');
manager.addDocument('vi', 'Đơn hoàn thành', 'check_delivered_orders');
manager.addDocument('vi', 'Đơn đã mua', 'check_delivered_orders');
manager.addDocument('vi', 'Lịch sử mua hàng', 'check_delivered_orders');

manager.addAnswer('vi', 'check_delivered_orders', '✅ Đơn đã giao: <a href="/account-layout/my-order" style="color:#4caf50; font-weight:600;">Xem Đơn Hoàn Thành</a>. Đánh giá sản phẩm để nhận điểm thưởng nhé!');
manager.addAnswer('vi', 'check_delivered_orders', '🎉 Lịch sử mua hàng tại: <a href="/account-layout/my-order" style="color:#4caf50; font-weight:600;">Đơn Đã Giao</a>. Mua lại nhanh chóng!');

// ĐƠN ĐÃ HỦY
manager.addDocument('vi', 'Đơn hàng đã hủy', 'check_cancelled_orders');
manager.addDocument('vi', 'Đơn bị hủy', 'check_cancelled_orders');
manager.addDocument('vi', 'Tại sao đơn bị hủy', 'check_cancelled_orders');

manager.addAnswer('vi', 'check_cancelled_orders', '❌ Đơn đã hủy: <a href="/account-layout/my-order" style="color:#f44336; font-weight:600;">Xem Đơn Đã Hủy</a>. Xem lý do và đặt lại nếu cần!');
manager.addAnswer('vi', 'check_cancelled_orders', '🚫 Kiểm tra đơn đã hủy tại: <a href="/account-layout/my-order" style="color:#f44336; font-weight:600;">Đơn Bị Hủy</a>. Liên hệ shop nếu cần hỗ trợ!');

// HỎI VỀ CHÍNH SÁCH ĐƠN HÀNG
manager.addDocument('vi', 'Đặt hàng như thế nào', 'how_to_order');
manager.addDocument('vi', 'Cách đặt đồ chay', 'how_to_order');
manager.addDocument('vi', 'Làm sao để order', 'how_to_order');
manager.addDocument('vi', 'Mua hàng thế nào', 'how_to_order');
manager.addDocument('vi', 'Quy trình đặt hàng', 'how_to_order');
manager.addDocument('vi', 'Order món chay', 'how_to_order');
manager.addDocument('vi', 'Đặt món ăn chay online', 'how_to_order');

manager.addAnswer('vi', 'how_to_order', '📱 Đặt hàng dễ lắm bạn ơi: 1️⃣ Chọn món → 2️⃣ Thêm vào giỏ 🛒 → 3️⃣ Thanh toán → 4️⃣ Nhận hàng tận nhà! Có COD và chuyển khoản nhé!');
manager.addAnswer('vi', 'how_to_order', '🛍️ Quy trình: Xem menu → Chọn món thích → Bấm "Thêm giỏ hàng" → Điền địa chỉ → Chọn thanh toán → Xong! Shop sẽ giao trong 30-60 phút!');
manager.addAnswer('vi', 'how_to_order', '✨ Đặt hàng siêu nhanh: Bấm vào món ăn → Chọn số lượng → Thêm giỏ → Checkout → Nhập SĐT & địa chỉ → Hoàn tất! Shipper sẽ liên hệ ngay!');

// HỦY ĐƠN & HOÀN TIỀN  
manager.addDocument('vi', 'Hủy đơn hàng được không', 'cancel_order');
manager.addDocument('vi', 'Làm sao để hủy đơn', 'cancel_order');
manager.addDocument('vi', 'Tôi muốn hủy đơn', 'cancel_order');
manager.addDocument('vi', 'Đổi ý không mua nữa', 'cancel_order');
manager.addDocument('vi', 'Hoàn tiền như thế nào', 'cancel_order');
manager.addDocument('vi', 'Có được đổi trả không', 'cancel_order');

manager.addAnswer('vi', 'cancel_order', '❌ Bạn có thể hủy đơn hàng TRƯỚC KHI shop xác nhận (trong 5-10 phút). Vào <a href="/account-layout/my-order" style="color:#22c55e;">Đơn Hàng</a> → Chọn đơn → Bấm "Hủy Đơn"!');
manager.addAnswer('vi', 'cancel_order', '⏰ Hủy đơn được trong 5-10 phút đầu sau khi đặt. Sau khi shop xác nhận thì không hủy được nữa nhé! Hoàn tiền trong 3-5 ngày nếu đã thanh toán!');
manager.addAnswer('vi', 'cancel_order', '🔄 Muốn hủy: Vào Đơn Hàng → Tìm đơn cần hủy → Bấm "Hủy". Nếu đã thanh toán, tiền hoàn về trong 3-5 ngày làm việc!');

axios
  .get('http://localhost:3333/checkouts')
  .then((response) => {
    console.log('✅ Đã tải ' + response['data'].length + ' đơn hàng để training bot');
    manager.save();
    manager.train();
  })
  .catch((error) => {
    console.error('❌ Lỗi khi tải đơn hàng:', error);
    manager.save();
    manager.train();
  });

// === THỐNG KÊ SẢN PHẨM CHAY BÁN CHẠY ===
manager.addDocument('vi', 'món chay hot nhất tháng này là gì', 'dtt');
manager.addDocument('vi', 'tháng này bán được nhiều nhất món chay nào', 'dtt');
manager.addDocument('vi', 'đồ ăn chay bán được top nhiều nhất trong tháng', 'dtt');
manager.addDocument('vi', 'món chay bán chạy tháng này', 'dtt');
manager.addDocument('vi', 'thực phẩm chay nào được yêu thích nhất', 'dtt');
manager.addDocument('vi', 'Top bán chạy', 'dtt');
manager.addDocument('vi', 'Bestseller là gì', 'dtt');
manager.addDocument('vi', 'Món nào hot nhất', 'dtt');
manager.addDocument('vi', 'Món gì nhiều người mua', 'dtt');
manager.addDocument('vi', 'Thống kê bán hàng', 'dtt');
manager.addDocument('vi', 'Món nào được yêu thích', 'dtt');
manager.addDocument('vi', 'Người ta hay order món gì', 'dtt');
manager.addDocument('vi', 'Top 5 món bán chạy', 'dtt');
manager.addDocument('vi', 'Xem thống kê', 'dtt');

// === 9. NGUỒN GỐC & CHẤT LƯỢNG ===
manager.addDocument('vi', 'Nguyên liệu thực phẩm chay từ đâu', 'origin_quality');
manager.addDocument('vi', 'Đồ chay có organic không', 'origin_quality');
manager.addDocument('vi', 'Rau củ có sạch không', 'origin_quality');
manager.addDocument('vi', 'Shop lấy hàng ở đâu', 'origin_quality');
manager.addDocument('vi', 'Thực phẩm chay có đảm bảo an toàn không', 'origin_quality');
manager.addDocument('vi', 'Nguồn gốc rõ ràng không', 'origin_quality');
manager.addDocument('vi', 'Có phải đồ organic không', 'origin_quality');
manager.addDocument('vi', 'Rau có thuốc trừ sâu không', 'origin_quality');
manager.addDocument('vi', 'Đảm bảo vệ sinh an toàn', 'origin_quality');
manager.addDocument('vi', 'Có giấy chứng nhận không', 'origin_quality');
manager.addDocument('vi', 'Nhập từ đâu', 'origin_quality');
manager.addDocument('vi', 'Rau Đà Lạt không', 'origin_quality');

manager.addAnswer('vi', 'origin_quality', 'Shop lấy nguyên liệu từ các trang trại organic uy tín: 🌱 Rau củ Đà Lạt, đậu phụ nhà làm, nấm tươi... đều có nguồn gốc rõ ràng!');
manager.addAnswer('vi', 'origin_quality', 'Tất cả nguyên liệu đều được kiểm định: 💚 Không thuốc trừ sâu, không hóa chất, không chất bảo quản độc hại. Shop cam kết 100% an toàn!');
manager.addAnswer('vi', 'origin_quality', 'Đồ chay của shop là ORGANIC nhập từ: 🥬 Rau Đà Lạt, nấm Đồng Nai, đậu phụ tự làm, gia vị tự nhiên. Đảm bảo sạch tuyệt đối!');
manager.addAnswer('vi', 'origin_quality', '✅ Shop có giấy chứng nhận VSATTP (Vệ sinh An toàn Thực phẩm), nguồn gốc rõ ràng, traceable từng nguyên liệu. Yên tâm ăn uống!');
manager.addAnswer('vi', 'origin_quality', 'Nguyên liệu cao cấp: Rau organic VietGAP, đậu phụ non tự làm, nấm tươi mỗi ngày 🍄 Shop chọn kỹ lắm mới bán!');

// === 10. ĂN CHAY THEO NGÀY ===
manager.addDocument('vi', 'Ngày rằm ăn gì', 'vegetarian_day');
manager.addDocument('vi', 'Mùng 1 có món chay nào đặc biệt không', 'vegetarian_day');
manager.addDocument('vi', 'Ăn chay ngày lễ', 'vegetarian_day');
manager.addDocument('vi', 'Menu rằm tháng 7', 'vegetarian_day');
manager.addDocument('vi', 'Rằm này ăn gì', 'vegetarian_day');
manager.addDocument('vi', 'Mùng 1 có gì đặc biệt', 'vegetarian_day');
manager.addDocument('vi', 'Combo rằm', 'vegetarian_day');
manager.addDocument('vi', 'Set ăn mùng 1', 'vegetarian_day');
manager.addDocument('vi', 'Ngày Phật đản có gì', 'vegetarian_day');
manager.addDocument('vi', 'Lễ Vu Lan ăn chay', 'vegetarian_day');
manager.addDocument('vi', 'Ăn chay ngày vía', 'vegetarian_day');
manager.addDocument('vi', 'Thứ 2 có giảm giá không', 'vegetarian_day');

manager.addAnswer('vi', 'vegetarian_day', 'Ngày rằm & mùng 1, shop có combo đặc biệt: 🙏 Cơm chay + canh + đậu phụ + rau củ + tráng miệng... đầy đủ và giảm 15-20%!');
manager.addAnswer('vi', 'vegetarian_day', 'Các ngày lễ Phật giáo (Phật đản, Vu Lan, Nguyên tiêu...) shop có menu đặc biệt, giảm giá đến 20% cho khách ăn chay 🪷');
manager.addAnswer('vi', 'vegetarian_day', '🌙 Menu rằm/mùng 1: Set 1 người (65k), Set 2 người (120k), Set gia đình (220k) - đầy đủ món, giảm 20%!');
manager.addAnswer('vi', 'vegetarian_day', 'Thứ 2 hàng tuần giảm 10% toàn bộ đơn! Rằm/Mùng 1 giảm 20%! Ngày lễ lớn giảm đến 30% 🎉');
manager.addAnswer('vi', 'vegetarian_day', 'Ăn chay ngày vía: Shop chuẩn bị combo chay đặc biệt theo truyền thống, nhiều món cúng dường, giá ưu đãi 🙏');

// === 11. ĂN CHAY CHO NGƯỜI MỚI ===
manager.addDocument('vi', 'Mới bắt đầu ăn chay nên ăn gì', 'beginner_vegetarian');
manager.addDocument('vi', 'Tôi chưa quen ăn chay', 'beginner_vegetarian');
manager.addDocument('vi', 'Tư vấn món chay cho người mới', 'beginner_vegetarian');
manager.addDocument('vi', 'Ăn chay lần đầu nên chọn món nào', 'beginner_vegetarian');
manager.addDocument('vi', 'Người mới ăn món gì', 'beginner_vegetarian');
manager.addDocument('vi', 'Lần đầu ăn chay', 'beginner_vegetarian');
manager.addDocument('vi', 'Chưa bao giờ ăn chay', 'beginner_vegetarian');
manager.addDocument('vi', 'Sợ không quen miệng', 'beginner_vegetarian');
manager.addDocument('vi', 'Món nào dễ ăn nhất', 'beginner_vegetarian');
manager.addDocument('vi', 'Giới thiệu món cho newbie', 'beginner_vegetarian');

manager.addAnswer('vi', 'beginner_vegetarian', 'Cho người mới, shop recommend: 🍜 Phở chay, cơm chiên chay, mì xào chay - những món quen thuộc, dễ ăn, giống món mặn!');
manager.addAnswer('vi', 'beginner_vegetarian', 'Lần đầu ăn chay nên thử: Bún bò chay, cơm sườn chay, bánh mì chay 🥖 Vị giống món thường ăn, không bỡ ngỡ!');
manager.addAnswer('vi', 'beginner_vegetarian', 'Newbie nên chọn: Burger chay, pizza chay, pasta chay 🍕 Fast food style, ngon không thua đồ mặn đâu!');
manager.addAnswer('vi', 'beginner_vegetarian', 'Chưa quen ăn chay? Thử món quen thuộc trước: Phở, bún, cơm rang... sau đó mới thử món lạ như salad, lẩu 😊');
manager.addAnswer('vi', 'beginner_vegetarian', 'Shop có combo "Khởi đầu chay": 3 món dễ ăn (phở + cơm + nước ép) chỉ 99k để bạn làm quen với ẩm thực chay! 🌱');
manager.addAnswer('vi', 'beginner_vegetarian', 'Bạn có thể thử bún bò chay, bánh mì chay - vị giống món mặn nhưng healthy hơn! Đảm bảo ngon 😋');
manager.addAnswer('vi', 'beginner_vegetarian', 'Shop có set combo cho người mới ăn chay: Đa dạng món, không kén miệng, giá ưu đãi luôn! 💯');

// === 12. GIỜ MỞ CỬA ===
manager.addDocument('vi', 'Shop mở cửa lúc mấy giờ', 'opening_hours');
manager.addDocument('vi', 'Giờ hoạt động của shop', 'opening_hours');
manager.addDocument('vi', 'Bao giờ shop mở cửa', 'opening_hours');
manager.addDocument('vi', 'Shop đóng cửa lúc nào', 'opening_hours');
manager.addDocument('vi', 'Mấy giờ mở cửa', 'opening_hours');
manager.addDocument('vi', 'Mấy giờ đóng cửa', 'opening_hours');
manager.addDocument('vi', 'Thời gian làm việc', 'opening_hours');
manager.addDocument('vi', 'Sáng sớm có bán không', 'opening_hours');
manager.addDocument('vi', 'Tối muộn có bán không', 'opening_hours');
manager.addDocument('vi', 'Chủ nhật có mở không', 'opening_hours');
manager.addDocument('vi', 'Cuối tuần có bán không', 'opening_hours');

manager.addAnswer('vi', 'opening_hours', 'Shop mở cửa từ 6h sáng đến 21h tối hàng ngày 🕐 Phục vụ đầy đủ các bữa: Sáng, trưa, tối đều có món chay tươi ngon!');
manager.addAnswer('vi', 'opening_hours', 'Giờ làm việc: 6:00 - 21:00 mỗi ngày, kể cả cuối tuần & ngày lễ! 📱 Đặt hàng online 24/7 luôn nha!');
manager.addAnswer('vi', 'opening_hours', '🕕 Sáng sớm 6h đã mở! Tối đến 9h vẫn bán! Chủ nhật không nghỉ nha bạn! Order online bất cứ lúc nào!');
manager.addAnswer('vi', 'opening_hours', 'Shop phục vụ 6AM - 9PM hàng ngày! Sáng có cháo/phở, trưa có cơm, tối có lẩu 🌙 Không nghỉ T7 CN!');

// === 13. ĐỊA CHỈ & LIÊN HỆ ===
manager.addDocument('vi', 'Địa chỉ shop ở đâu', 'address_contact');
manager.addDocument('vi', 'Shop có chi nhánh nào không', 'address_contact');
manager.addDocument('vi', 'Liên hệ shop như thế nào', 'address_contact');
manager.addDocument('vi', 'Số điện thoại shop', 'address_contact');
manager.addDocument('vi', 'Địa chỉ cụ thể', 'address_contact');
manager.addDocument('vi', 'Hotline là gì', 'address_contact');
manager.addDocument('vi', 'Gọi điện thoại', 'address_contact');
manager.addDocument('vi', 'Fanpage Facebook', 'address_contact');
manager.addDocument('vi', 'Email shop', 'address_contact');
manager.addDocument('vi', 'Cách liên lạc', 'address_contact');
manager.addDocument('vi', 'Có bao nhiêu chi nhánh', 'address_contact');
manager.addDocument('vi', 'Shop gần nhà tôi', 'address_contact');

manager.addAnswer('vi', 'address_contact', 'Bạn xem thông tin liên hệ, địa chỉ shop tại phần <a href="#footer" style="color:#22c55e;">footer website</a> 📍 Hoặc inbox trực tiếp!');
manager.addAnswer('vi', 'address_contact', 'Shop có giao hàng toàn quốc! 📞 Bạn đặt online hoặc gọi hotline (xem ở footer) để được tư vấn chi tiết!');
manager.addAnswer('vi', 'address_contact', '📍 Địa chỉ & liên hệ ở cuối trang website. Có SĐT, email, fanpage, Zalo... Liên hệ cách nào cũng được nha!');
manager.addAnswer('vi', 'address_contact', 'Shop có nhiều chi nhánh! Xem địa chỉ gần bạn nhất tại <a href="/stores" style="color:#22c55e;">Hệ Thống Cửa Hàng</a> 🏪');

// === 14. ĂN CHAY CHO TRẺ EM ===
manager.addDocument('vi', 'Trẻ em ăn chay được không', 'kids_vegetarian');
manager.addDocument('vi', 'Món chay cho bé', 'kids_vegetarian');
manager.addDocument('vi', 'Trẻ con ăn được không', 'kids_vegetarian');
manager.addDocument('vi', 'Bé ăn chay có đủ chất không', 'kids_vegetarian');
manager.addDocument('vi', 'Menu cho trẻ em', 'kids_vegetarian');
manager.addDocument('vi', 'Đồ ăn cho bé', 'kids_vegetarian');
manager.addDocument('vi', 'Cháo chay cho bé', 'kids_vegetarian');
manager.addDocument('vi', 'Súp chay trẻ em', 'kids_vegetarian');
manager.addDocument('vi', 'Có món chay cho trẻ nhỏ không', 'kids_vegetarian');

manager.addAnswer('vi', 'kids_vegetarian', 'Có nha! Shop có món chay dành cho bé: 👶 Cháo chay bổ dưỡng, cơm chiên chay, súp bí đỏ, nước ép trái cây... vừa bổ vừa ngon!');
manager.addAnswer('vi', 'kids_vegetarian', 'Trẻ em ăn chay rất tốt cho sức khỏe! 💪 Shop có menu riêng cho bé: Cháo, súp, pasta nhẹ... đủ dưỡng chất phát triển!');
manager.addAnswer('vi', 'kids_vegetarian', 'Menu kids: Cháo tươi (25k), Súp rau củ (30k), Mì xào nhẹ (35k), Smoothie trái cây (20k) 🍼 Đảm bảo bé ăn ngon!');
manager.addAnswer('vi', 'kids_vegetarian', 'Bé ăn chay đủ chất nhé! Shop balance protein từ đậu, vitamin từ rau, carb từ gạo 🥄 Nhiều mẹ cho bé ăn chay lắm!');

// === 15. COMBO & SET MEAL ===
manager.addDocument('vi', 'Có combo thực phẩm chay không', 'combo_set');
manager.addDocument('vi', 'Set meal món chay', 'combo_set');
manager.addDocument('vi', 'Gói ăn chay trọn gói', 'combo_set');
manager.addDocument('vi', 'Combo 2 người', 'combo_set');
manager.addDocument('vi', 'Set gia đình', 'combo_set');
manager.addDocument('vi', 'Gói cặp đôi', 'combo_set');
manager.addDocument('vi', 'Combo cho nhóm', 'combo_set');
manager.addDocument('vi', 'Set tiết kiệm', 'combo_set');
manager.addDocument('vi', 'Ăn theo set', 'combo_set');

manager.addAnswer('vi', 'combo_set', 'Shop có nhiều combo: 🍱 Combo 1 người (50-65k), Combo 2 người (110-130k), Set gia đình (220-280k) - đầy đủ món!');
manager.addAnswer('vi', 'combo_set', 'Set meal chay gồm: Món chính + canh + rau + đồ uống + tráng miệng 🥘 Giá ưu đãi hơn gọi lẻ 20%!');
manager.addAnswer('vi', 'combo_set', 'Gói trọn gói tiết kiệm: Combo A (phở+nem+nước) 60k, Combo B (cơm+canh+salad) 65k, Combo C (lẩu 2 người) 150k 💰');
manager.addAnswer('vi', 'combo_set', 'Set cặp đôi romantic: 2 món chính + 2 nước ép + tráng miệng chỉ 120k! 💑 Phù hợp date hoặc ăn gia đình!');

manager.save();

module.exports = manager;
