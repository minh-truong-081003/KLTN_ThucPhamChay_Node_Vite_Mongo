import { useEffect } from 'react'
import { ListProducts, MyCart, SidebarCate, ProductFilter } from '../../components'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

import { RootState } from '../../store/store'
import { useGetAllCategoryQuery } from '../../api/category'
import useQueryConfig from '../../hook/useQueryConfig'
import { getAllProducts } from '../../store/services/product.service'

const ProductsPage = () => {
  const queryConfig = useQueryConfig()
  const dispatch = useAppDispatch()

  const { data: datacate, error: errorCategories, isLoading: isLoadingCategories } = useGetAllCategoryQuery()
  const categories = datacate?.docs
  const {
    products: ProductList,
    error: errorProduct,
    isLoading: isLoadingProduct
  } = useAppSelector((state: RootState) => state.persistedReducer.products)

  // Fetch products whenever query params change
  useEffect(() => {
    const params = {
      page: queryConfig._page || 1,
      limit: queryConfig.limit || 10,
      query: queryConfig.searchName || '',
      category: queryConfig.c || '',
      priceRange: queryConfig.priceRange || '',
      rating: queryConfig.rating || '',
      sortBy: queryConfig.sortBy || ''
    }
    
    dispatch(getAllProducts(params))
  }, [
    dispatch,
    queryConfig._page,
    queryConfig.limit,
    queryConfig.searchName,
    queryConfig.c,
    queryConfig.priceRange,
    queryConfig.rating,
    queryConfig.sortBy
  ])

  return (
    <div>
      <div className='bg-[#fbfbfb]'>
        <div className='container pt-3 mx-auto'>
          <div className='content md:flex-row flex flex-col justify-between gap-4'>
            {/* Sidebar với Category và Filter */}
            <div className="shrink-0 w-[300px] hidden lg:block space-y-4">
              <SidebarCate
                queryConfig={queryConfig}
                categories={categories}
                error={errorCategories}
                isLoading={isLoadingCategories}
              />
              <ProductFilter queryConfig={queryConfig} />
            </div>

            {/* List sản phẩm */}
            <ListProducts
              queryConfig={queryConfig}
              products={ProductList}
              error={errorProduct}
              isLoading={isLoadingProduct}
            />

            {/* Giỏ hàng */}
            <MyCart />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
