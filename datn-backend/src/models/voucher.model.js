import moment from 'moment';
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

moment().format();

const voucherSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true, unique: true },
    discount: { type: Number, require: true },
    sale: { type: Number, require: true },
    startDate: { type: Date, default: Date.now },
    // endDate sẽ hết hạn sau 7 ngày kể từ ngày tạo
    endDate: { type: Date, require: true },
    isActive: { type: Boolean, default: true },
    desc: {
      type: String, required: true
    }
    ,
    user_used: [
      {
        type: String,
      },
    ],

  },
  { timestamps: true, versionKey: false }
);
voucherSchema.plugin(mongoosePaginate);

/* kiểm tra xem voucher nào còn hoạt động và còn hiệu lực không */
// voucherSchema.methods.isActive = function () {
//   const currentDate = new Date();
//   return this.isActive && this.startDate <= currentDate && this.endDate >= currentDate;
// };

// generate voucher code from title (static method)
voucherSchema.statics.generateCodeFromTitle = async function (title = '') {
  const random = (chars, n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  const raw = String(title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const amountMatch = raw.match(/(\d+[.,]?\d*\s*[kK]?)/);
  let amountToken = '';
  let rawWithoutAmount = raw;
  if (amountMatch) {
    const matched = amountMatch[0];
    const a = matched.replace(/\s+/g, '').replace(/\./g, '').toLowerCase();
    const hasK = /k$/i.test(a);
    const digits = a.replace(/k$/i, '');
    // if original had 'k', append 'k' after digits in the token; otherwise keep digits only
    amountToken = hasK ? `${digits}k` : digits;
    // remove the matched amount substring from the raw text so trailing letters (like 'k') don't stay in alpha part
    rawWithoutAmount = raw.replace(matched, '');
  }

  const cleanAlpha = rawWithoutAmount.replace(/[^a-z]/g, '');
  const alphaPart = cleanAlpha.slice(0, 8) || 'vouch';

  const reserved = alphaPart.length + amountToken.length;
  const remaining = Math.max(0, 15 - reserved);

  const upperPart = random('ABCDEFGHIJKLMNOPQRSTUVWXYZ', Math.max(1, Math.min(4, Math.floor(remaining / 2))));
  const digitPart = random('0123456789', Math.max(1, remaining - upperPart.length));

  let code = (alphaPart + amountToken + upperPart + digitPart).slice(0, 15);

  if (!/[a-z]/.test(code)) code = 'a' + code.slice(1);
  if (!/[A-Z]/.test(code)) code = code.slice(0, 14) + 'A';
  if (!/\d/.test(code)) code = code.slice(0, 13) + '0' + code.slice(14);

  let exists = await this.findOne({ code });
  let attempts = 0;
  while (exists && attempts < 10) {
    const suffix = random('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 3);
    code = (alphaPart + amountToken + upperPart + suffix).slice(0, 15);
    attempts += 1;
    // eslint-disable-next-line no-await-in-loop
    exists = await this.findOne({ code });
  }

  if (exists) {
    // fallback: generate a fully random code until unique
    do {
      code = random('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 15);
      // eslint-disable-next-line no-await-in-loop
      exists = await this.findOne({ code });
    } while (exists);
  }

  return code;
};

const Voucher = mongoose.model('Voucher', voucherSchema);

export default Voucher;
