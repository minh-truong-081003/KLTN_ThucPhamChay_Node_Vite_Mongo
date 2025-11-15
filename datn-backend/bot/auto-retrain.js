const axios = require('axios');

/**
 * AUTO-RETRAIN BOT HELPER
 * Tự động train lại bot khi có thay đổi dữ liệu
 */

let isRetraining = false;
let retrainQueue = [];
const RETRAIN_DELAY = 5000; // 5 giây delay để tránh train liên tục

/**
 * Trigger retrain bot
 * Gọi hàm này từ các controller khi có thay đổi data
 */
async function triggerBotRetrain(reason = 'Data changed') {
  console.log(`🤖 Bot retrain triggered: ${reason}`);
  
  // Nếu đang retrain, thêm vào queue
  if (isRetraining) {
    console.log('⏳ Bot đang retrain, thêm vào queue...');
    retrainQueue.push(reason);
    return { queued: true, reason };
  }

  try {
    isRetraining = true;
    console.log('🔄 Bắt đầu retrain bot...');
    
    // Gọi API retrain bot
    const response = await axios.get('http://localhost:3333/update');
    
    console.log('✅ Bot retrain thành công!');
    isRetraining = false;
    
    // Xử lý queue nếu có
    if (retrainQueue.length > 0) {
      console.log(`📋 Còn ${retrainQueue.length} retrain request trong queue`);
      setTimeout(() => {
        retrainQueue = []; // Clear queue
        triggerBotRetrain('Batch retrain from queue');
      }, RETRAIN_DELAY);
    }
    
    return { success: true, message: 'Bot retrained successfully' };
  } catch (error) {
    console.error('❌ Lỗi khi retrain bot:', error.message);
    isRetraining = false;
    return { success: false, error: error.message };
  }
}

/**
 * Debounced retrain - Tránh train quá nhiều lần liên tục
 */
let retrainTimeout = null;
function debouncedRetrain(reason, delay = RETRAIN_DELAY) {
  if (retrainTimeout) {
    clearTimeout(retrainTimeout);
  }
  
  retrainTimeout = setTimeout(() => {
    triggerBotRetrain(reason);
  }, delay);
}

module.exports = {
  triggerBotRetrain,
  debouncedRetrain,
};
