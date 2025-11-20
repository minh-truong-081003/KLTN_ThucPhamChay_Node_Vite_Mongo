import { useGetUserFavoritesQuery } from '../../api/favorite.api'
import { useAppSelector } from '../../store/hooks'
import { RootState } from '../../store/store'
import ListProductItem from '../../components/List-ProductItem'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const MyFavorites = () => {
  const navigate = useNavigate()
  const { user } = useAppSelector((state: RootState) => state.persistedReducer.auth)
  const { data: favoritesData, isLoading, refetch } = useGetUserFavoritesQuery({})

  console.log('MyFavorites component rendered, user:', user?._id, 'token:', !!user?.accessToken)

  useEffect(() => {
    if (user?.accessToken) {
      console.log('Refetching favorites')
      refetch()
    }
  }, [user?.accessToken, refetch])

  const favorites = favoritesData?.favorites?.docs || []

  console.log('Favorites data:', favorites)

  const filteredFavorites = favorites.filter(
    (favorite) => favorite.product && !favorite.product.is_deleted && favorite.product.is_active
  )

  console.log('Filtered favorites:', filteredFavorites)

  if (!user?.accessToken) {
    return (
      <div className='my-account grow'>
        <div className='account flex flex-col'>
          <div className='bg-top-account'></div>
          <div className='account-content relative -top-5 bg-[#fff] mx-4 rounded-md p-8'>
            <div className='text-center'>
              <h2 className='text-xl font-semibold mb-4'>Danh sách yêu thích</h2>
              <p className='text-gray-600'>Vui lòng đăng nhập để xem danh sách yêu thích của bạn.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='my-account grow'>
      <div className='account flex flex-col'>
        <div className='bg-top-account'></div>
        <div className='account-content relative -top-5 bg-[#fff] mx-4 rounded-md p-8'>
          <h2 className='text-xl font-semibold mb-6'>Danh sách yêu thích</h2>

          {isLoading ? (
            <div className='text-center py-8'>
              <p>Đang tải...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-gray-600'>Bạn chưa có sản phẩm yêu thích nào.</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {filteredFavorites.map((favorite) => {
                console.log('Rendering favorite:', favorite._id, favorite.product?.name)
                try {
                  return (
                    <ListProductItem
                      key={favorite._id}
                      product={favorite.product}
                      fetchProductById={(id) => navigate(`/products?id=${id}`)}
                    />
                  )
                } catch (error) {
                  console.error('Error rendering favorite:', favorite._id, error)
                  return null
                }
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyFavorites
