import { useEffect, useState, useRef } from 'react'
import { AiOutlineSearch, AiOutlineClose } from 'react-icons/ai'
import { FaBell } from 'react-icons/fa'
import { Tooltip, Popover, Empty } from 'antd'
import { Link, createSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { RootState } from '../../store/store'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../store/hooks'
import useQueryConfig from '../../hook/useQueryConfig'
import { useForm } from 'react-hook-form'
import './Header.scss'
import { ClientSocket } from '../../socket'
import { useUpdateNotifitoReadByidMutation } from '../../api/notifications'
import http from '../../api/instance'

const Header = ({ hideLogo = false, bgColor = 'bg-white' }) => {
  const _dispatch = useAppDispatch()
  const queryConfig = useQueryConfig()
  const location = useLocation()
  const [notification, setNotification] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [_searchQuery, _setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { user } = useSelector((state: RootState) => state.persistedReducer.auth)
  const [updateNotification] = useUpdateNotifitoReadByidMutation()

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      name: ''
    }
  })

  const searchValue = watch('name')
  const isProductsPage = location.pathname === '/products'

  const handleUpdateNotification = (id: string) => {
    updateNotification(id)
      .unwrap()
      .then(() => {
        ClientSocket.getUnreadNotificationsByidUser(setNotification, user._id!)
      })
  }

  const navigate = useNavigate()

  const onSubmitSearch = handleSubmit((data: { name: string }) => {
    setShowDropdown(false)
    navigate({
      pathname: '/products',
      search: createSearchParams({
        ...queryConfig,
        searchName: data.name
      }).toString()
    })
  })

  // Search products real-time with optimized debounce
  useEffect(() => {
    // Clear dropdown if search value is too short
    if (!searchValue || searchValue.trim().length <= 1) {
      setSearchResults([])
      setShowDropdown(false)
      setIsSearching(false)
      
      // Only update URL when on products page
      if (!searchValue && queryConfig.searchName && isProductsPage) {
        navigate({
          pathname: '/products',
          search: createSearchParams({
            ...queryConfig,
            searchName: ''
          }).toString()
        }, { replace: true })
      }
      return
    }

    setIsSearching(true)
    const debounceTimer = setTimeout(async () => {
      try {
        // Fetch dropdown results
        const response = await http.get(`/products/all`, {
          params: {
            query: searchValue.trim(),
            _limit: 5,
            _page: 1
          }
        })
        setSearchResults(response.data.docs || [])
        setShowDropdown(true)
        
        // Only update URL and filter products when on products page
        if (isProductsPage) {
          navigate({
            pathname: '/products',
            search: createSearchParams({
              ...queryConfig,
              searchName: searchValue.trim(),
              _page: '1'
            }).toString()
          }, { replace: true })
        }
      } catch (error: any) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => {
      clearTimeout(debounceTimer)
      setIsSearching(false)
    }
  }, [searchValue, isProductsPage])

  // Sync input value with URL searchName (only on mount or when URL changes externally)
  useEffect(() => {
    const urlSearchName = queryConfig.searchName || ''
    // Always sync input with URL - set to empty if URL has no searchName
    if (urlSearchName !== searchValue) {
      setValue('name', urlSearchName)
    }
  }, [queryConfig.searchName])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  // Removed duplicate getAllProducts call - ProductsPage handles this

  useEffect(() => {
    ClientSocket.getUnreadNotificationsByidUser(setNotification, user._id!)
  }, [])

  return (
    <div className={`header flex items-center justify-between gap-2 px-4 py-2 select-none sticky top-0 w-full ${bgColor} z-10`}>
      {/* Logo */}
      {!hideLogo && (
        <div className="logo lg:block hidden">
          <Link to={'/'}>
            <img src='/lgc.png' alt='' className='object-cover w-10 h-10' />
          </Link>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={onSubmitSearch} className="search lg:flex items-center justify-center w-full">
        <div ref={searchRef} className="relative w-full">
          <div className="relative">
            <input
              className="p-0 outline-none block focus:bg-gray-50 w-full bg-[#fbfbfb] h-[32px] text-[14px] rounded-2xl focus:outline-none border-none pl-10 pr-10 lg:mx-auto lg:w-[28rem] border focus:ring-0"
              placeholder="Tìm kiếm sản phẩm..."
              {...register('name')}
              autoComplete="off"
            />
            <AiOutlineSearch className="text-[18px] text-[#bebec2] absolute top-1/2 -translate-y-1/2 left-3 z-10 pointer-events-none" />
            {searchValue && (
              <button
                type="button"
                onClick={() => {
                  setValue('name', '')
                  setSearchResults([])
                  setShowDropdown(false)
                }}
                className="absolute top-1/2 -translate-y-1/2 right-3 z-10 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-200"
              >
                <AiOutlineClose className="text-[16px]" />
              </button>
            )}
          </div>

          {/* Dropdown Search Results */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[400px] overflow-y-auto z-50 lg:mx-auto lg:w-[28rem]">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin h-6 w-6 border-2 border-[#d3b673] border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-sm">Đang tìm kiếm...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-700">
                      Tìm thấy {searchResults.length} sản phẩm
                    </p>
                  </div>
                  <div className="py-2">
                    {searchResults.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => {
                          const currentSearchValue = searchValue.trim()
                          setShowDropdown(false)
                          navigate({
                            pathname: '/products',
                            search: createSearchParams({
                              _page: '1',
                              limit: '6',
                              searchName: currentSearchValue,
                              c: ''
                            }).toString()
                          })
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group cursor-pointer"
                      >
                        <img
                          src={product?.images?.[0]?.url || 'https://via.placeholder.com/48'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/48?text=No+Image'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-[#d3b673] truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(product.sale || product.sizes?.[0]?.price || 0).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <AiOutlineSearch className="text-gray-400 group-hover:text-[#d3b673] transition-colors" />
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <button
                      type="button"
                      className="w-full text-center text-sm text-[#d3b673] hover:text-[#b8945d] font-semibold"
                      onClick={() => {
                        const currentSearchValue = searchValue.trim()
                        setShowDropdown(false)
                        navigate({
                          pathname: '/products',
                          search: createSearchParams({
                            _page: '1',
                            limit: '6',
                            searchName: currentSearchValue,
                            c: ''
                          }).toString()
                        })
                      }}
                    >
                      Xem tất cả kết quả →
                    </button>
                  </div>
                </>
              ) : searchValue && searchValue.trim().length > 1 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500 text-sm">Không tìm thấy sản phẩm "{searchValue}"</p>
                  <p className="text-xs text-gray-400 mt-2">Thử tìm kiếm với từ khóa khác</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </form>

      {/* Notifications and User Avatar */}
      {user?.avatar ? (
        <div className="info_notifi flex items-center gap-x-5">
          <Tooltip title="Thông báo" arrow={false} zIndex={11}>
            <Popover
              className="notification cursor-pointer"
              title="Thông báo"
              placement="bottomRight"
              trigger="click"
              getPopupContainer={(trigger: any) => trigger?.parentNode}
              content={
                <>
                  {notification.length > 0 ? (
                    notification?.map((item, index) => (
                      <div
                        key={index}
                        className="py-2 px-2 group hover:bg-[#d3b673] rounded flex items-center gap-x-2"
                        title={item.content}
                      >
                        <span className="inline-block w-[10px] h-[10px] bg-[#d3b673] rounded-full group-hover:bg-white"></span>
                        <Link
                          onClick={() => {
                            handleUpdateNotification(item._id)
                          }}
                          className="group-hover:!text-white block"
                          to={`/account-layout/my-order/${item.idOrder}`}
                        >
                          {item.content}
                        </Link>
                      </div>
                    ))
                  ) : (
                    <Empty
                      className="flex items-center flex-col"
                      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                      imageStyle={{ height: 200 }}
                      description={<span>Hiện tại bạn không có thông báo nào!</span>}
                    />
                  )}
                </>
              }
            >
              <div className="relative">
                {notification.length > 0 && (
                  <span className="absolute left-2 -top-[6px] bg-red-600 text-white text-xs rounded-full w-max h-[15px] px-1 flex items-center justify-center">
                    <span>{notification.length}</span>
                  </span>
                )}
                <FaBell className={`text-xl ${bgColor === 'transparent' ? 'text-white' : 'text-gray-800'}`} />
              </div>
            </Popover>
          </Tooltip>
          <Tooltip title="Tài khoản" arrow={false}>
            <Link to="/account-layout">
              <img className="w-12 md:w-9 md:h-9 rounded-full mr-[8px] object-cover" src={user?.avatar} alt="" />
            </Link>
          </Tooltip>
        </div>
      ) : (
        <div className="text-sm px-[15px] py-[6px] bg-[#d8b979] text-white text-center rounded-3xl">
          <Link to="/signin" className="w-max block">
            Đăng nhập
          </Link>
        </div>
      )}
    </div>
  )
}

export default Header
