import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixReviewIndex = async () => {
  try {
    // Kết nối MongoDB
    const mongoUri = process.env.MONGOOSE_URI || process.env.MONGOOSE_DB;
    if (!mongoUri) {
      throw new Error('MONGOOSE_URI hoặc MONGOOSE_DB không được tìm thấy trong .env');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Đã kết nối MongoDB');

    const db = mongoose.connection.db;
    const reviewsCollection = db.collection('reviews');

    // Lấy danh sách tất cả indexes hiện tại
    const indexes = await reviewsCollection.indexes();
    console.log('\n📋 Các indexes hiện tại:');
    indexes.forEach((index) => {
      console.log('  -', JSON.stringify(index.key), index.unique ? '(unique)' : '');
    });

    // Xóa index cũ nếu tồn tại
    const oldIndexName = 'user_1_product_1_order_1';
    try {
      await reviewsCollection.dropIndex(oldIndexName);
      console.log(`\n🗑️  Đã xóa index cũ: ${oldIndexName}`);
    } catch (error) {
      if (error.code === 27) {
        console.log(`\n⚠️  Index ${oldIndexName} không tồn tại, bỏ qua`);
      } else {
        console.log(`\n⚠️  Lỗi khi xóa index: ${error.message}`);
      }
    }

    // Tạo index mới với partialFilterExpression
    await reviewsCollection.createIndex(
      { user: 1, product: 1, order: 1 },
      {
        unique: true,
        partialFilterExpression: { parent_review: null },
        name: 'user_1_product_1_order_1_partial'
      }
    );
    console.log('\n✅ Đã tạo index mới với partialFilterExpression');

    // Kiểm tra lại indexes
    const newIndexes = await reviewsCollection.indexes();
    console.log('\n📋 Các indexes sau khi cập nhật:');
    newIndexes.forEach((index) => {
      console.log('  -', JSON.stringify(index.key), index.unique ? '(unique)' : '', index.partialFilterExpression ? `(partial: ${JSON.stringify(index.partialFilterExpression)})` : '');
    });

    console.log('\n✅ Hoàn thành! Index đã được cập nhật thành công.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

fixReviewIndex();
