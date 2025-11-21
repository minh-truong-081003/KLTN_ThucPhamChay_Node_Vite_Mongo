const { NlpManager } = require('node-nlp');
const axios = require('axios');

// The manager object is initialized in index.js and then used here.
const mongoose = require('mongoose');
const dedupe = require('./dedupe');
// This file previously contained hardcoded intents and answers related to "trà sữa".
// These have been removed to align the bot with "thực phẩm chay" only.

// Import backend models
const Product = require('../src/models/product.model.js').default;
const Category = require('../src/models/category.model.js').default;
const Voucher = require('../src/models/voucher.model.js').default;
const Review = require('../src/models/review.model.js').default;
const NewsBlog = require('../src/models/newsBlogs.model.js').default;
// Any new training data should be added to the MongoDB 'pre_trainings' collection
const manager = new NlpManager({ languages: ['vi'] });

// Vegetarian Food Chatbot - Dynamic MongoDB Integration
// Helper: Add product intents/answers (accepts optional target manager)
async function addProductIntents(targetManager) {
	const m = targetManager || manager;
	const products = await Product.find({ is_deleted: false, is_active: true }).populate('category');
	products.forEach(product => {
		const utter = `Thông tin về ${product.name}`;
		const intent = 'product.info';
		// dedupe: check existing documents on manager
		const existingUtterances = (m.documents || []).filter(d => d.locale === 'vi').map(d => String(d.utterance || ''));
		if (!dedupe.isSimilarToAny(utter, existingUtterances, { jaccardThreshold: 0.65, levenshteinThreshold: 0.72 })) {
			m.addDocument('vi', utter, intent);
		}

		const ansText = `Sản phẩm: ${product.name}\nMô tả: ${product.description}`;
		const answers = (m.answers && m.answers['vi'] && m.answers['vi'][intent]) || [];
		if (!dedupe.isSimilarToAny(ansText, answers, { jaccardThreshold: 0.7, levenshteinThreshold: 0.78 })) {
			m.addAnswer('vi', intent, ansText);
		}
	});
}

// Helper: Add category intents/answers
async function addCategoryIntents(targetManager) {
	const m = targetManager || manager;
	const categories = await Category.find({ is_deleted: false });
	categories.forEach(category => {
		const utter = `Danh mục ${category.name}`;
		const intent = 'category.info';
		const existingUtterances = (m.documents || []).filter(d => d.locale === 'vi').map(d => String(d.utterance || ''));
		if (!dedupe.isSimilarToAny(utter, existingUtterances, { jaccardThreshold: 0.65, levenshteinThreshold: 0.72 })) {
			m.addDocument('vi', utter, intent);
		}
		const ansText = `Danh mục: ${category.name}`;
		const answers = (m.answers && m.answers['vi'] && m.answers['vi'][intent]) || [];
		if (!dedupe.isSimilarToAny(ansText, answers, { jaccardThreshold: 0.7, levenshteinThreshold: 0.78 })) {
			m.addAnswer('vi', intent, ansText);
		}
	});
}

// Helper: Add voucher intents/answers
async function addVoucherIntents(targetManager) {
	const m = targetManager || manager;
	const vouchers = await Voucher.find({ isActive: true });
	vouchers.forEach(voucher => {
		const utter = `Khuyến mãi ${voucher.title}`;
		const intent = 'voucher.info';
		const existingUtterances = (m.documents || []).filter(d => d.locale === 'vi').map(d => String(d.utterance || ''));
		if (!dedupe.isSimilarToAny(utter, existingUtterances, { jaccardThreshold: 0.6, levenshteinThreshold: 0.68 })) {
			m.addDocument('vi', utter, intent);
		}
		const ansText = `Mã: ${voucher.code}\nGiảm giá: ${voucher.discount}%\n${voucher.desc}`;
		const answers = (m.answers && m.answers['vi'] && m.answers['vi'][intent]) || [];
		if (!dedupe.isSimilarToAny(ansText, answers, { jaccardThreshold: 0.7, levenshteinThreshold: 0.78 })) {
			m.addAnswer('vi', intent, ansText);
		}
	});
}

// Helper: Add review intents/answers
async function addReviewIntents(targetManager) {
	const m = targetManager || manager;
	const reviews = await Review.find({ is_active: true, is_deleted: false }).populate('product user');
	reviews.forEach(review => {
		if (review.product && review.user) {
			const utter = `Đánh giá về ${review.product.name}`;
			const intent = 'review.info';
			const existingUtterances = (m.documents || []).filter(d => d.locale === 'vi').map(d => String(d.utterance || ''));
			if (!dedupe.isSimilarToAny(utter, existingUtterances, { jaccardThreshold: 0.6, levenshteinThreshold: 0.68 })) {
				m.addDocument('vi', utter, intent);
			}
			const ansText = `Người dùng: ${review.user.username || 'Ẩn danh'}\nĐánh giá: ${review.rating}/5\n${review.comment}`;
			const answers = (m.answers && m.answers['vi'] && m.answers['vi'][intent]) || [];
			if (!dedupe.isSimilarToAny(ansText, answers, { jaccardThreshold: 0.7, levenshteinThreshold: 0.78 })) {
				m.addAnswer('vi', intent, ansText);
			}
		}
	});
}

// Helper: Add blog/news intents/answers
async function addBlogIntents(targetManager) {
	const m = targetManager || manager;
	const blogs = await NewsBlog.find({ is_active: true, is_deleted: false });
	blogs.forEach(blog => {
		const utter = `Tin tức ${blog.name}`;
		const intent = 'blog.info';
		const existingUtterances = (m.documents || []).filter(d => d.locale === 'vi').map(d => String(d.utterance || ''));
		if (!dedupe.isSimilarToAny(utter, existingUtterances, { jaccardThreshold: 0.6, levenshteinThreshold: 0.68 })) {
			m.addDocument('vi', utter, intent);
		}
		const ansText = `Tiêu đề: ${blog.name}\n${blog.description}`;
		const answers = (m.answers && m.answers['vi'] && m.answers['vi'][intent]) || [];
		if (!dedupe.isSimilarToAny(ansText, answers, { jaccardThreshold: 0.7, levenshteinThreshold: 0.78 })) {
			m.addAnswer('vi', intent, ansText);
		}
	});
}

// Main: Load all dynamic intents/answers (accept optional manager)
async function loadDynamicIntents(targetManager) {
	await addProductIntents(targetManager);
	await addCategoryIntents(targetManager);
	await addVoucherIntents(targetManager);
	await addReviewIntents(targetManager);
	await addBlogIntents(targetManager);
}

// Attach loader onto manager for backwards compatibility and export manager
manager.loadDynamicIntents = loadDynamicIntents;
// Also expose loader that accepts a target manager for training flows
manager.loadDynamicIntentsFor = loadDynamicIntents;
module.exports = manager;

module.exports = manager;
