import { Divider, List, ListItem, ListItemText, Paper, Popover, Stack, Typography } from '@mui/material'
import { Fragment, useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { FaBars, FaRedo } from 'react-icons/fa'
import { IQueryConfig } from '../../hook/useQueryConfig'
import { ICategory } from '../../interfaces/category.type'
import NotFound from '../../pages/Not-Found/NotFound'
import { getIdCate } from '../../store/slices/categories'
import { savePage } from '../../store/slices/product.slice'
import SKProduct from '../Skeleton/SKProduct'
import { useNavigate } from 'react-router-dom'

interface SidebarCateProps {
  categories: ICategory[] | undefined
  error: FetchBaseQueryError | SerializedError | undefined
  isLoading: boolean
  queryConfig?: IQueryConfig
}

const SidebarCate = ({ categories, error, isLoading, queryConfig }: SidebarCateProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const dispatch = useAppDispatch()
  const [selectedCategory, setSelectedCategory] = useState(queryConfig?.c || '')
  const [totalProductsCount, setTotalProductsCount] = useState<number>(0)

  const navigate = useNavigate()
  const { products } = useAppSelector((state) => state.persistedReducer.products)

  // Lưu tổng số sản phẩm ban đầu (khi không có filter)
  useEffect(() => {
    if (
      products?.totalDocs &&
      !queryConfig?.c &&
      !queryConfig?.priceRange &&
      !queryConfig?.rating &&
      !queryConfig?.sortBy
    ) {
      setTotalProductsCount(products.totalDocs)
    }
  }, [products?.totalDocs, queryConfig])

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // Hàm reload lại trang, sẽ reset lại danh mục và sản phẩm và XÓA HẾT BỘ LỌC
  const handleReload = () => {
    dispatch(getIdCate('')) // Reset danh mục
    setSelectedCategory('') // Reset selectedCategory
    dispatch(savePage(1)) // Reset lại trang đầu tiên
    // Chuyển hướng về trang sản phẩm với params - CHỈ GIỮ LẠI _page và limit, XÓA HẾT CÁC FILTER
    navigate('/products?_page=1&limit=6')
  }

  const handleCategoryClick = (categoryId: string) => {
    dispatch(
      getIdCate(
        categoryId ? { idCate: categoryId, nameCate: categories?.find((c) => c._id === categoryId)?.name || '' } : ''
      )
    )
    dispatch(savePage(1))
    setSelectedCategory(categoryId)

    // Build URL với category param
    const params: any = {
      _page: '1',
      limit: queryConfig?.limit || '6'
    }
    if (categoryId) params.c = categoryId
    if (queryConfig?.searchName) params.searchName = queryConfig.searchName
    if (queryConfig?.priceRange) params.priceRange = queryConfig.priceRange
    if (queryConfig?.rating) params.rating = queryConfig.rating
    if (queryConfig?.sortBy) params.sortBy = queryConfig.sortBy

    navigate(`/products?${new URLSearchParams(params).toString()}`)
  }

  if (error) return <NotFound />
  if (isLoading)
    return (
      <div className='sidebar select-none shrink-0 w-[300px] bg-[#fff] text-[14px] rounded-sm mx-[16px] pb-[12px] h-fit hidden lg:block'>
        <SKProduct amount={10} />
      </div>
    )

  return (
    <>
      <div className='sidebar select-none w-full bg-white text-[14px] rounded-sm shadow-sm h-fit'>
        <div className='flex justify-between items-center border-b border-gray-200 px-4 py-3 bg-gradient-to-r from-[#d3b673] to-[#c4a962]'>
          <div className='font-semibold text-white flex items-center gap-2'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
            </svg>
            DANH MỤC SẢN PHẨM
          </div>
          {/* Nút reload */}
          <button
            onClick={handleReload}
            className='text-white hover:bg-white/20 p-1.5 rounded transition-all'
            title='Làm mới'
          >
            <FaRedo size={14} />
          </button>
        </div>
        <div className='p-2'>
          <div className='block'>
            <div
              onClick={() => handleCategoryClick('')}
              className={`cursor-pointer rounded-lg transition-all duration-200 px-4 py-3 flex justify-between items-center group ${
                selectedCategory == ''
                  ? 'bg-gradient-to-r from-[#d3b673]/10 to-[#c4a962]/10 border-l-4 border-[#d3b673]'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div
                className={`cat-name capitalize font-medium ${selectedCategory == '' ? 'text-[#d3b673]' : 'text-gray-700'}`}
              >
                🏠 Tất cả sản phẩm
              </div>
              <div
                className={`cat-amount text-xs font-semibold px-2 py-1 rounded-full ${
                  selectedCategory === '' ? 'bg-[#d3b673] text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {/* Luôn hiển thị tổng số sản phẩm ban đầu (cố định) */}
                {totalProductsCount || products?.totalDocs || 0}
              </div>
            </div>
          </div>
          {categories &&
            Array.isArray(categories) &&
            categories?.length > 0 &&
            categories?.map((category: ICategory) => (
              <div key={category._id} className='block'>
                <div
                  onClick={() => handleCategoryClick(category._id)}
                  className={`cursor-pointer rounded-lg transition-all duration-200 px-4 py-3 flex justify-between items-center group mb-1 ${
                    selectedCategory === category._id
                      ? 'bg-gradient-to-r from-[#d3b673]/10 to-[#c4a962]/10 border-l-4 border-[#d3b673]'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <div
                    className={`cat-name capitalize font-medium ${selectedCategory === category._id ? 'text-[#d3b673]' : 'text-gray-700'}`}
                  >
                    📦 {category.name}
                  </div>
                  <div
                    className={`cat-amount text-xs font-semibold px-2 py-1 rounded-full ${
                      selectedCategory === category._id ? 'bg-[#d3b673] text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {category.products?.filter((p) => p.is_active && !p.is_deleted).length || 0}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div
        className='btn-menu cursor-pointer fixed bottom-[100px] left-[16px] bg-[#ee4d2d] text-white w-[40px] h-[40px] rounded-full flex items-center justify-center z-[3] lg:hidden'
        onClick={handleClick}
      >
        <FaBars />
      </div>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <Paper elevation={3} sx={{ width: '25rem' }}>
          <Fragment>
            <Typography component={'h1'} color='text.primary' fontWeight={500} padding={1}>
              Danh mục
            </Typography>
          </Fragment>
          <Divider />
          <List
            disablePadding
            sx={{
              width: '100%',
              maxHeight: 200,
              overflow: 'auto'
            }}
          >
            <Stack onClick={handleClose}>
              <ListItem>
                <ListItemText
                  className='cursor-pointer'
                  secondary={
                    <Fragment>
                      <Typography
                        component={'span'}
                        className='flex justify-between w-full'
                        color='text.primary'
                        fontSize={13}
                      >
                        Tất cả
                      </Typography>
                    </Fragment>
                  }
                  onClick={() => dispatch(getIdCate(''))}
                />
              </ListItem>
              <Divider sx={{ marginLeft: '16px' }} />
            </Stack>
            {categories &&
              categories?.length > 0 &&
              categories?.map((category: ICategory) => (
                <Stack key={category._id} onClick={handleClose}>
                  <ListItem>
                    <ListItemText
                      className='cursor-pointer'
                      secondary={
                        <Fragment>
                          <Typography
                            component={'span'}
                            className='flex justify-between w-full'
                            color='text.primary'
                            fontSize={13}
                          >
                            {category.name}
                            <span>{category.products?.length}</span>
                          </Typography>
                        </Fragment>
                      }
                      onClick={() => dispatch(getIdCate({ idCate: category._id, nameCate: category.name }))}
                    />
                  </ListItem>
                  <Divider sx={{ marginLeft: '16px' }} />
                </Stack>
              ))}
          </List>
        </Paper>
      </Popover>
    </>
  )
}

export default SidebarCate
