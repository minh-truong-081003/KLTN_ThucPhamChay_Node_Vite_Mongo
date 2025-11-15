import Category from '../models/category.model.js';
import Product from '../models/product.model.js';
import Size from '../models/size.model.js';
import Topping from '../models/topping.model.js';
import productValidate from '../validates/product.validate.js';
import { debouncedRetrain } from '../../bot/auto-retrain.js';

export const ProductController = {
  createProduct: async (req, res, next) => {
    try {
      const Data = req.body;
      const { category } = Data;
     
      const existCategory = await Category.findById(category);
      if (!existCategory) {
        return res.status(404).json({ message: 'fail', err: 'Create Product failed' });
      }
      const product = await Product.create(Data);
      if (!product) {
        return res.status(400).json({ message: 'fail', err: 'Create Product failed' });
      }
      // /* tạo ra bảng size & giá luôn */
      // const { sizes } = Data;
      // // if (sizes.length > 0) {
      // //   for (let size of sizes) {
      // //     const sizeItem = {
      // //       name: size.name,
      // //       price: size.price,
      // //       productId: product._id,
      // //     };
      // //     await Size.create(sizeItem);
      // //   }
      // // }
      await existCategory.updateOne({ $addToSet: { products: product._id } });
      /* tạo ra bảng size & giá luôn */
      // const { sizes } = Data;
      // if (sizes.length > 0) {
      //   for (let size of sizes) {
      //     const sizeItem = {
      //       name: size.name,
      //       price: size.price,
      //       productId: product._id,
      //     };
      //     await Size.create(sizeItem);
      //   }
      // }
      // await Size.updateMany(
      //   { _id: { $in: sizes } },
      //   { $push: { productId: product._id } },
      //   { multi: true }
      // );
      /* update category */
      /* update id product topping array */
      const { toppings } = Data;
      if (toppings.length > 0) {
        for (let i = 0; i < toppings.length; i++) {
          await Topping.findByIdAndUpdate(toppings[i], {
            $addToSet: { products: product._id },
          });
        }
      }
      
      // Trigger bot retrain khi có sản phẩm mới
      debouncedRetrain('New product created: ' + product.name);
      
      return res.status(200).json({ message: 'success', data: product });
    } catch (error) {
      next(error);
    }
  },

  createProductV2: async (req, res, next) => {
    try {
      const sizeIdArray = [];
      const body = req.body;
      const sizeArray = body.size;
      let dataSizeArray = [];
      /* kiểm tra xem size thêm vào có trùng với size mặc định hay không */
      // const sizeDefault = body.sizeDefault;
      // if (sizeArray) {
      //   for (let index = 0; index < sizeDefault.length; index++) {
      //     const element = await Size.findById(sizeDefault[index]);
      //     /*
      //     so sánh xem tên element size default đó trùng với tên size người dùng đẩy lên thì lấy size mới người dùng thêm
      //     chứ không lấy size mặc định nữa, loại bỏ id size default đó ra khỏi mảng sizeDefault
      //   */
      //     for (let i = 0; i < sizeArray.length; i++) {
      //       if (element.name === sizeArray[i].name) {
      //         sizeDefault.splice(index, 1);
      //       }
      //     }
      //   }
      //   /* tạo ra size này */
      //   for (const sizeItem of sizeArray) {
      //     const sizeCreate = await Size.create(sizeItem);
      //     if (!sizeCreate) {
      //       return res.status(400).json({ message: 'fail', err: 'Create Size failed' });
      //     }
      //     sizeIdArray.push(sizeCreate._id);
      //   }
      //   /* tạo ra product này */
      //   dataSizeArray = [...sizeIdArray, ...body.sizeDefault];
      // } else {
      //   dataSizeArray = [...body.sizeDefault];
      // }
      const productData = {
        name: body.name,
        description: body.description,
        category: body.category,
        sizes: dataSizeArray,
        toppings: body.toppings,
        images: body.images,
        sale: body.sale,
        is_active: body.is_active,
      };
      const product = await Product.create(productData);
      if (!product) {
        return res.status(400).json({ message: 'fail', err: 'Create Product failed' });
      }
      /* update category */
      await Category.findByIdAndUpdate(body.category, {
        $addToSet: { products: product._id },
      });
      /* update topping */
      // const { toppings } = body;
      // if (toppings.length > 0) {
      //   for (let i = 0; i < toppings.length; i++) {
      //     await Topping.findByIdAndUpdate(toppings[i], {
      //       $addToSet: { products: product._id },
      //     });
      //   }
      // }
      /* update size */
      // const { sizes } = productData;
      // if (sizes.length > 0) {
      //   for (let i = 0; i < sizes.length; i++) {
      //     await Size.findByIdAndUpdate(sizes[i], {
      //       $addToSet: { productId: product._id },
      //     });
      //   }
      // }
      return res.status(200).json({ message: 'success', data: product });
    } catch (error) {
      return res.status(500).json({ message: 'fail', err: error.message });
    }
  },

  /* lấy ra các sản phẩm đang hoạt động */
  getAllProducts: async (req, res, next) => {
    try {
      const { _page = 1, _limit = 10, q = '', c = '', priceRange = '', rating = '', sortBy = '' } = req.query;
      console.log('🔍 Filter params:', { _page, _limit, q, c, priceRange, rating, sortBy });
      
      let query = { $and: [{ is_deleted: false }, { is_active: true }] };
      
      // Build sort option (only for non-price sorts, price sort will be done in-memory)
      let sortOption = { createdAt: -1 }; // Default: newest first
      let needsManualSort = false;
      
      if (sortBy === 'price-asc' || sortBy === 'price-desc') {
        needsManualSort = true;
        sortOption = { createdAt: -1 }; // Use default for initial fetch
      } else if (sortBy === 'bestseller') {
        sortOption = { totalOrders: -1 };
      }
      
      const options = {
        page: _page,
        limit: _limit,
        sort: sortOption,
        populate: [
          { path: 'category', select: 'name' },
          { path: 'sizes', select: 'name price is_default' },
          { path: 'toppings', select: 'name price' },
        ],
      };

      // Build query conditions
      const conditions = [{ is_deleted: false }, { is_active: true }];

      // Search by name
      if (q) {
        conditions.push({ name: { $regex: q, $options: 'i' } });
      }

      // Filter by category
      if (c) {
        conditions.push({ category: c });
      }

      // Note: Price filtering will be done after fetching since price is in sizes array
      // We'll need to filter in memory or add a price field to products

      // Filter by rating
      if (rating) {
        const minRating = Number(rating);
        if (!isNaN(minRating) && minRating >= 0) {
          conditions.push({ averageRating: { $gte: minRating } });
        }
      }

      query = { $and: conditions };

      let products;
      
      // If we need price filtering or price sorting, do manual processing
      if (priceRange || needsManualSort) {
        // Get all products matching base conditions
        const baseProducts = await Product.find(query)
          .populate([
            { path: 'category', select: 'name' },
            { path: 'sizes', select: 'name price is_default' },
            { path: 'toppings', select: 'name price' },
          ])
          .sort(sortOption);
        
        console.log('📦 Base products fetched:', baseProducts.length);
        if (baseProducts.length > 0) {
          const sample = baseProducts[0];
          console.log('📦 First product raw data:', {
            name: sample.name,
            _id: sample._id,
            sizesArray: sample.sizes, // Raw sizes array
            sizesLength: sample.sizes?.length,
            hasOwnProperty: sample.hasOwnProperty('sizes')
          });
        }
        
        let filteredDocs = baseProducts;
        
        // Filter by price range if specified
        if (priceRange) {
          const [minPrice, maxPrice] = priceRange.split('-').map(Number);
          console.log('💰 Price filter:', { minPrice, maxPrice, beforeFilter: filteredDocs.length });
          
          if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            filteredDocs = filteredDocs.filter(product => {
              // Use 'sale' field as price (this is the display price)
              const productPrice = product.sale || 0;
              const hasMatch = productPrice >= minPrice && productPrice <= maxPrice;
              
              console.log(`  ${hasMatch ? '✅' : '❌'} ${product.name}: ${productPrice}đ`);
              
              return hasMatch;
            });
            
            console.log('💰 After price filter:', filteredDocs.length, 'products');
          }
        }
        
        // Sort by price if needed (using default/first size price)
        if (needsManualSort) {
          console.log('🔀 Sorting by price:', sortBy);
          
          filteredDocs = filteredDocs.sort((a, b) => {
            // Use 'sale' field as price
            const priceA = a.sale || 0;
            const priceB = b.sale || 0;
            
            return sortBy === 'price-asc' ? priceA - priceB : priceB - priceA;
          });
          
          console.log('🔀 After sorting, first 3 products:', 
            filteredDocs.slice(0, 3).map(p => ({
              name: p.name,
              price: p.sale || 0
            }))
          );
        }
        
        // Manual pagination
        const page = parseInt(_page) || 1;
        const limit = parseInt(_limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        products = {
          docs: filteredDocs.slice(startIndex, endIndex),
          totalDocs: filteredDocs.length,
          limit: limit,
          page: page,
          totalPages: Math.ceil(filteredDocs.length / limit),
          hasNextPage: endIndex < filteredDocs.length,
          hasPrevPage: page > 1,
          nextPage: endIndex < filteredDocs.length ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null,
          pagingCounter: startIndex + 1
        };
      } else {
        // Normal pagination without price filtering
        products = await Product.paginate(query, options);
      }
      
      console.log('✅ Returning products:', {
        docsCount: products.docs?.length || 0,
        totalDocs: products.totalDocs,
        totalPages: products.totalPages,
        page: products.page
      });
      
      if (!products || !products.docs) {
        return res.status(404).json({ message: 'fail', err: 'Not found any products' });
      }
      return res.status(200).json({ ...products });
    } catch (error) {
      next(error);
    }
  },

  /* lấy ra 1 sản phẩm */
  getProduct: async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id).populate([
        { path: 'category', select: 'name' },
        { path: 'sizes', select: 'name price is_default' },
        { path: 'toppings', select: '-products' },
      ]);
      if (!product) {
        return res.status(404).json({ message: 'fail', err: 'Not found Product' });
      }
      
      // Đảm bảo averageRating và totalReviews luôn được tính lại từ reviews thực tế
      // Tính lại rating từ reviews (CHỈ TÍNH REVIEW GỐC, KHÔNG TÍNH REPLIES)
      const Review = (await import('../models/review.model.js')).default;
      const reviews = await Review.find({
        product: product._id,
        is_deleted: false,
        is_active: true,
        parent_review: null, // CHỈ LẤY REVIEW GỐC
      });

      let averageRating = 0;
      let totalReviews = 0;
      
      if (reviews.length > 0) {
        // Lọc các reviews có rating (chỉ review gốc mới có rating)
        const validReviews = reviews.filter(review => review.rating != null);
        if (validReviews.length > 0) {
          const totalRating = validReviews.reduce((sum, review) => sum + review.rating, 0);
          averageRating = parseFloat((totalRating / validReviews.length).toFixed(1));
          totalReviews = validReviews.length;
        }
      }

      await Product.findByIdAndUpdate(product._id, {
        averageRating: averageRating,
        totalReviews: totalReviews,
      });
      
      // Lấy lại product sau khi cập nhật
      const updatedProduct = await Product.findById(req.params.id).populate([
        { path: 'category', select: 'name' },
        { path: 'sizes', select: 'name price is_default' },
        { path: 'toppings', select: '-products' },
      ]);
      
      return res.status(200).json({ message: 'success', data: updatedProduct });
    } catch (error) {
      next(error);
    }
  },

  /* cập nhật sản phẩm */
  updateProduct: async (req, res, next) => {
    try {
      const { category } = req.body;
      // const { error } = productValidate.validate(req.body, { abortEarly: false });
      // if (error) {
      //   return res
      //     .status(400)
      //     .json({ message: 'fail', err: error.details.map((err) => err.message) });
      // }
      const existCategory = await Category.findById(category);
      if (!existCategory) {
        return res.status(404).json({ message: 'fail', err: 'Not found category' });
      }
      const product = await Product.findById(req.params.id);
      const CatRefProduct = await Category.findByIdAndUpdate(product.category, {
        $pull: { products: req.params.id },
      });

      // /* cập nhật lại size */
      // const sizes = product.sizes;
      // const sizeListNew = [];
      // const sizeBody = req.body.size;
      // if (sizeBody.length > 0) {
      //   const results = sizeBody.filter((sizeItem) => {
      //     return !sizeItem._id;
      //   });
      //   if (results.length > 0) {
      //     for (let sizeItem of results) {
      //       const size = await Size.create(sizeItem);
      //       sizeListNew.push(size);
      //     }
      //   }
      // }
      // if (sizes.length > 0) {
      //   for (let i = 0; i < sizes.length; i++) {
      //     await Size.findByIdAndUpdate(sizes[i], {
      //       $pull: { productId: product._id },
      //     });
      //   }
      // }

      // const { size, sizeDefault } = req.body;

      // if (size.length > 0) {
      //   for (let sizeItem of size) {
      //     await Size.findByIdAndUpdate(sizeItem._id, sizeItem, { new: true });
      //     sizeListNew.push(sizeItem._id);
      //   }
      // }
      const data = { ...req.body };
      const resultUpdate = await Product.findByIdAndUpdate(req.body._id, data, { new: true });
      if (!resultUpdate) {
        return res.status(500).json({ message: 'fail', err: 'Update failed' });
      }
      if (!CatRefProduct) {
        return res.status(404).json({ message: 'fail', err: 'Update failed' });
      }

      /* cập nhật lại topping */
      // const toppings = product.toppings;
      // if (toppings.length > 0) {
      //   for (let i = 0; i < toppings.length; i++) {
      //     await Topping.findByIdAndUpdate(toppings[i], {
      //       $pull: { products: product._id },
      //     });
      //   }
      // }
      // const updateTopping = req.body.toppings;
      // if (updateTopping.length > 0) {
      //   for (let i = 0; i < updateTopping.length; i++) {
      //     await Topping.findByIdAndUpdate(updateTopping[i], {
      //       $addToSet: { products: product._id },
      //     });
      //   }
      // }

      if (!product) {
        return res.status(404).json({ message: 'fail', err: 'Not found Product to update' });
      }
      await existCategory.updateOne({ $addToSet: { products: product._id } });
      
      // Trigger bot retrain khi cập nhật sản phẩm
      debouncedRetrain('Product updated: ' + product.name);
      
      return res.status(200).json({ message: 'success', data: product });
    } catch (error) {
      next(error);
    }
  },

  // updateProduct: async (req, res, next) => {
  //   try {
  //     const body = req.body;
  //     console.log('🚀 ~ file: product.controller.js:292 ~ updateProduct: ~ body:', body);
  //     const { id } = req.params;
  //     const { category } = req.body;
  //     const { error } = productValidate.validate(req.body, { abortEarly: false });
  //     if (error) {
  //       return res
  //         .status(400)
  //         .json({ message: 'fail', err: error.details.map((err) => err.message) });
  //     }
  //     const existCategory = await Category.findById(category);
  //     if (!existCategory) {
  //       return res.status(404).json({ message: 'fail', err: 'Not found category' });
  //     }
  //     /* dựa vào id và tìm ra produc có tồn tại hay khong */
  //     const productExit = await Product.findById(id);
  //     if (!productExit) {
  //       return res.status(404).json({ message: 'fail', err: 'Not found Product' });
  //     }
  //     /* delete size đó luôn */
  //     if (productExit.sizes.length > 0) {
  //       const sizeList = productExit.sizes;
  //       if (sizeList.length > 0) {
  //         for (let size of sizeList) {
  //           await Size.findByIdAndDelete(size);
  //         }
  //       }
  //     }
  //     /* gỡ topping trước đó mà product đã gắn */
  //     const toppingList = productExit.toppings;
  //     if (toppingList.length > 0) {
  //       for (let topping of toppingList) {
  //         await Topping.findByIdAndUpdate(topping, {
  //           $pull: { products: productExit._id },
  //         });
  //       }
  //     }
  //     /* gỡ category ra khỏi product */
  //     await Category.findByIdAndUpdate(productExit.category, {
  //       $pull: { products: productExit._id },
  //     });
  //     const { size, sizeDefault, toppings } = body;
  //     /* tạo size */
  //     const sizeListNew = [];
  //     if (sizes.length > 0) {
  //       for (let size of sizes) {
  //         const sizeItem = {
  //           name: size.name,
  //           price: size.price,
  //         };
  //         const result = await Size.create(sizeItem);
  //         sizeListNew.push(result._id);
  //       }
  //     }
  //     console.log('first ahihi');
  //     /* update product đó */
  //     const data = { ...body, sizes: sizeListNew };
  //     console.log('🚀 ~ file: product.controller.js:200 ~ updateProduct: ~ data:', data);
  //     const productUpdate = await Product.findByIdAndUpdate({ _id: id }, data, { new: true });
  //     if (!productUpdate) {
  //       return res.status(404).json({ message: 'fail', err: 'Update Product failed' });
  //     }
  //     /* update id product to category */
  //     for (let topping of body.toppings) {
  //       await Topping.findByIdAndUpdate(topping, {
  //         $addToSet: { products: productUpdate._id },
  //       });
  //     }
  //     /* update category */
  //     await Category.findByIdAndUpdate(body.category, {
  //       $addToSet: { products: productUpdate._id },
  //     }).exec();
  //     return res.status(200).json({ message: 'success', data: productUpdate });
  //   } catch (error) {
  //     next(error);
  //   }
  // },

  /* xóa cứng */
  deleteRealProduct: async (req, res, next) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      /* delete product */
      const updateCategory = await Category.findByIdAndUpdate(product.category, {
        $pull: { products: product._id },
      });
      if (!updateCategory) {
        return res.status(404).json({ message: 'fail', err: 'Delete Product failed' });
      }
      /* delete topping */
      const toppings = product.toppings;
      if (toppings.length > 0) {
        for (let i = 0; i < toppings.length, i++; ) {
          await Topping.findByIdAndUpdate(toppings[i], {
            $pull: { products: product._id },
          });
        }
      }
      /* xóa size */
      const sizes = product.sizes;
      if (sizes.length > 0) {
        for (let size of sizes) {
          await Size.findByIdAndDelete(size._id);
        }
      }
      if (!product) {
        return res.status(404).json({ message: 'fail', err: 'Delete Product failed' });
      }
      return res.status(200).json({ message: 'success', data: product });
    } catch (error) {
      next(error);
    }
  },

  /* xóa mềm */
  deleteFakeProduct: async (req, res, next) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          is_deleted: true,
        },
        { new: true }
      );

      /* khi người dùng xóa mềm product đi rồi thì cateogry cũng sẽ tự động cho product out */
      const updateCategory = await Category.findByIdAndUpdate(product.category, {
        $pull: { products: product._id },
      });
      if (!updateCategory) {
        return res.status(404).json({ message: 'fail', err: 'Delete Product failed' });
      }

      await Size.updateMany({ _id: { $in: product.sizes } }, { $pull: { productId: product._id } });

      /* kèm topping cũng sẽ bị xóa đi */
      const toppings = product.toppings;
      if (toppings.length > 0) {
        for (let i = 0; i < toppings.length, i++; ) {
          await Topping.findByIdAndUpdate(toppings[i], {
            $pull: { products: product._id },
          });
        }
      }
      if (!product) {
        return res.status(404).json({ message: 'fail', err: 'Delete Product failed' });
      }
      return res.status(200).json({ message: 'success', data: product });
    } catch (error) {
      next(error);
    }
  },

  /* khôi phục sản phẩm */
  restoreProduct: async (req, res, next) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          is_deleted: false,
        },
        { new: true }
      );

      const updateCategory = await Category.findByIdAndUpdate(product.category, {
        $addToSet: { products: product._id },
      });

      if (!updateCategory) {
        return res.status(404).json({ message: 'fail', err: 'Restore Product failed' });
      }

      await Size.updateMany(
        { _id: { $in: product.sizes } },
        { $addToSet: { productId: product._id } }
      );

      /* khi khôi phục lại sản phẩm thì cũng sẽ có các topping đi kèm import vào */
      const toppings = product.toppings;
      if (toppings.length > 0) {
        for (let i = 0; i < toppings.length, i++; ) {
          await Topping.findByIdAndUpdate(toppings[i], {
            $addToSet: { products: product._id },
          });
        }
      }
      if (!product) {
        return res.status(404).json({ message: 'fail', err: 'Restore Product failed' });
      }
      return res.status(200).json({ message: 'success', data: product });
    } catch (error) {
      next(error);
    }
  },

  /* lấy ra tất cả sản phẩm không tính is_delete hay is_active */
  getAllProductsStore: async (req, res, next) => {
    try {
      const { _page = 1, _limit = 10, query = '', category = '', priceRange = '', rating = '', sortBy = '' } = req.query;
      
      // Base filter: only active and not deleted products
      const baseFilter = {
        is_deleted: false,
        is_active: true
      };

      // Filter by category
      if (category) {
        baseFilter.category = category;
      }

      // Search by name
      if (query) {
        const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const words = escapedQuery.split(/\s+/).filter(word => word.length > 0);
        const searchPattern = words.join('.*');
        baseFilter.name = { $regex: searchPattern, $options: 'i' };
      }

      // Filter by rating - sử dụng averageRating
      if (rating) {
        const ratingNum = Number(rating);
        if (!isNaN(ratingNum) && ratingNum > 0) {
          baseFilter.averageRating = { $gte: ratingNum };
        }
      }

      // Lấy tất cả sản phẩm thỏa điều kiện base
      let allProducts = await Product.find(baseFilter)
        .populate([
          { path: 'category', select: 'name' },
          { path: 'sizes', select: 'name price is_default' },
          { path: 'toppings', select: 'name price' },
        ])
        .lean();

      // Xử lý price cho mỗi sản phẩm (lấy từ sale hoặc size default)
      allProducts = allProducts.map(product => {
        let productPrice = product.sale || 0;
        
        // Nếu sale = 0, lấy giá từ size default
        if (productPrice === 0 && product.sizes && product.sizes.length > 0) {
          const defaultSize = product.sizes.find(s => s.is_default);
          if (defaultSize && defaultSize.price) {
            productPrice = defaultSize.price;
          } else if (product.sizes[0] && product.sizes[0].price) {
            productPrice = product.sizes[0].price;
          }
        }
        
        return {
          ...product,
          _price: productPrice // Thêm trường tạm để sort/filter
        };
      });

      // Filter by price range
      if (priceRange) {
        const [minPrice, maxPrice] = priceRange.split('-').map(Number);
        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
          allProducts = allProducts.filter(p => p._price >= minPrice && p._price <= maxPrice);
        }
      }

      // Sort
      if (sortBy === 'price-asc') {
        allProducts.sort((a, b) => a._price - b._price);
      } else if (sortBy === 'price-desc') {
        allProducts.sort((a, b) => b._price - a._price);
      } else if (sortBy === 'bestseller') {
        allProducts.sort((a, b) => {
          if (b.totalReviews !== a.totalReviews) return b.totalReviews - a.totalReviews;
          return b.averageRating - a.averageRating;
        });
      } else if (sortBy === 'newest') {
        allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      // Manual pagination
      const page = parseInt(_page);
      const limit = parseInt(_limit);
      const total = allProducts.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const docs = allProducts.slice(startIndex, endIndex);

      // Xóa trường _price trước khi trả về
      const cleanDocs = docs.map(({ _price, ...rest }) => rest);

      const result = {
        docs: cleanDocs,
        totalDocs: total,
        limit: limit,
        totalPages: totalPages,
        page: page,
        pagingCounter: startIndex + 1,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null
      };
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAllProductsStore:', error);
      return res.status(500).json({ message: 'fail', err: error.message });
    }
  },

  /* get all products is_delete = true */
  getAllProductsDeletedTrueActiveTrue: async (req, res) => {
    try {
      const { _page = 1, _limit = 10, query = '' } = req.query;
      const options = {
        page: _page,
        limit: _limit,
        sort: { createdAt: -1 },
        populate: [
          { path: 'category', select: 'name' },
          { path: 'sizes', select: 'name price' },
          { path: 'toppings', select: 'name price' },
        ],
      };
      if (query) {
        const products = await Product.paginate(
          {
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
            ],
          },
          options
        );
        return res.status(200).json({ ...products });
      }
      const products = await Product.paginate({ $and: [{ is_deleted: true }] }, options);
      if (!products) {
        return res.status(404).json({ message: 'fail', err: 'Not found any size' });
      }
      return res.status(200).json({ ...products });
    } catch (error) {
      return res.status(500).json({ message: 'fail', err: error });
    }
  },

  /* lấy ra các sản phẩm is_delete = false/ is_active là false */
  getAllProductInActive: async (req, res) => {
    try {
      const { _page = 1, _limit = 10, query = '' } = req.query;
      const options = {
        page: _page,
        limit: _limit,
        sort: { createdAt: -1 },
        populate: [
          { path: 'category', select: 'name' },
          { path: 'sizes', select: 'name price' },
          { path: 'toppings', select: 'name price' },
        ],
      };
      if (query) {
        const products = await Product.paginate(
          {
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
            ],
          },
          options
        );
        return res.status(200).json({ ...products });
      }
      const products = await Product.paginate(
        { $and: [{ is_deleted: false }, { is_active: false }] },
        options
      );
      if (!products) {
        return res.status(404).json({ message: 'fail', err: 'Not found any size' });
      }
      return res.status(200).json({ ...products });
    } catch (error) {
      return res.status(500).json({ message: 'fail', err: error });
    }
  },
};
