import { FeatureProducts } from '~/features'
import { NotFound } from '..'
import { useGetAllProductsQuery } from '~/store/services'

const ProductPage = () => {
  /* lấy ra tất cả các sản phẩm - tăng limit để có đủ dữ liệu cho filter */
  const {
    data: dataProducts,
    isLoading: loadingProduct,
    isError: errorProudct
  } = useGetAllProductsQuery({
    _page: 1,
    _limit: 1000, // Load nhiều sản phẩm hơn để filter hoạt động tốt
    query: ''
  })

  if (loadingProduct) {
    return <div>Loading...</div>
  }

  if (errorProudct || !dataProducts) {
    return <NotFound />
  }

  return (
    <div>
      <FeatureProducts data={dataProducts.docs} />
    </div>
  )
}

export default ProductPage
