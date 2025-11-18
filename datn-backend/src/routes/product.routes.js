import { ProductController } from '../controllers/product.controller.js';
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const productRoutes = express.Router();
productRoutes.route('/products').get(ProductController.getAllProducts);
productRoutes.route('/product').post(ProductController.createProduct);
productRoutes
  .route('/product/:id')
  .get(ProductController.getProduct)
  .delete(ProductController.deleteRealProduct)
  .put(ProductController.updateProduct);
productRoutes.route('/deleteFakeProduct/:id').put(ProductController.deleteFakeProduct);
productRoutes.route('/restoreProduct/:id').put(ProductController.restoreProduct);
productRoutes.get(`/products/all`, ProductController.getAllProductsStore);
productRoutes.get(
  `/products/allDeleteTrueActiveTrue`,
  ProductController.getAllProductsDeletedTrueActiveTrue
);
productRoutes.post('/create/product', ProductController.createProductV2);

productRoutes.get('/products/recommendations', authMiddleware.verifyToken, ProductController.getRecommendations);

export default productRoutes;
