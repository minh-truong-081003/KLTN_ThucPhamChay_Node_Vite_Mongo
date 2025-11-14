import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkReviews = async () => {
  try {
    const mongoUri = process.env.MONGOOSE_URI || process.env.MONGOOSE_DB;
    await mongoose.connect(mongoUri);
    console.log('✅ Đã kết nối MongoDB\n');

    const db = mongoose.connection.db;
    const reviewsCollection = db.collection('reviews');

    // Kiểm tra tất cả reviews
    const allReviews = await reviewsCollection.find({}).toArray();
    console.log(`📊 Tổng số reviews: ${allReviews.length}\n`);

    // Phân loại
    const rootReviews = allReviews.filter(r => !r.parent_review);
    const replies = allReviews.filter(r => r.parent_review);
    
    console.log(`📝 Review gốc (có rating): ${rootReviews.length}`);
    console.log(`💬 Replies (không có rating): ${replies.length}\n`);

    // Kiểm tra replies có rating không
    const repliesWithRating = replies.filter(r => r.rating != null);
    if (repliesWithRating.length > 0) {
      console.log(`⚠️  CÓ ${repliesWithRating.length} REPLIES CÓ RATING (SAI!):`);
      repliesWithRating.forEach(r => {
        console.log(`  - ID: ${r._id}, rating: ${r.rating}, parent: ${r.parent_review}`);
      });
    } else {
      console.log('✅ Tất cả replies đều không có rating (ĐÚNG!)');
    }

    // Kiểm tra review gốc có rating không
    const rootWithoutRating = rootReviews.filter(r => r.rating == null);
    if (rootWithoutRating.length > 0) {
      console.log(`\n⚠️  CÓ ${rootWithoutRating.length} REVIEW GỐC KHÔNG CÓ RATING (SAI!):`);
      rootWithoutRating.forEach(r => {
        console.log(`  - ID: ${r._id}, product: ${r.product}, user: ${r.user}`);
      });
    } else {
      console.log('\n✅ Tất cả review gốc đều có rating (ĐÚNG!)');
    }

    // Kiểm tra xem có reply nào có order không
    const repliesWithOrder = replies.filter(r => r.order != null);
    if (repliesWithOrder.length > 0) {
      console.log(`\n⚠️  CÓ ${repliesWithOrder.length} REPLIES CÓ ORDER (NÊN KIỂM TRA!):`);
      repliesWithOrder.forEach(r => {
        console.log(`  - ID: ${r._id}, order: ${r.order}, parent: ${r.parent_review}`);
      });
    } else {
      console.log('\n✅ Tất cả replies đều không có order (ĐÚNG!)');
    }

    console.log('\n✅ Hoàn thành kiểm tra!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

checkReviews();
