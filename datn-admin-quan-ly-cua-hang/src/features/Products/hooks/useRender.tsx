import { AiFillEdit, AiOutlineUndo } from 'react-icons/ai'
import { Button as ButtonAntd, Input, InputRef, Popconfirm, Space, Tag, Tooltip, message } from 'antd'
import { IProduct, IRoleUser, ISizeRefProduct } from '~/types'
import { RootState, useAppDispatch } from '~/store/store'
import { setOpenDrawer, setProductDetail, setProductId } from '~/store/slices'
import {
  useDeleteFakeProductMutation,
  useDeleteProductMutation,
  useEditProductMutation,
  useGetAllCategoryQuery,
  useRestoreProductMutation
} from '~/store/services'
import { useRef, useState } from 'react'

import type { ColumnType } from 'antd/es/table'
import { DeleteIcon, Loading } from '~/components'
import { FilterConfirmProps } from 'antd/es/table/interface'
import Highlighter from 'react-highlight-words'
import { ICategoryRefProduct } from '~/types/Category'
import { SearchOutlined, SyncOutlined } from '@ant-design/icons'
import { TbBasketDiscount } from 'react-icons/tb'
import clsxm from '~/utils/clsxm'
import { formatCurrency } from '~/utils'
import { useAppSelector } from '~/store/hooks'

export const useRender = (
  productsList: IProduct[],
  deleteReal?: boolean,
  setSearchTextParent?: (text: string) => void,
  setCategoryFilterParent?: (categories: string[]) => void,
  setPriceFilterParent?: (prices: string[]) => void,
  setSaleFilterParent?: (sales: string[]) => void
) => {
  const dispatch = useAppDispatch()
  const searchInput = useRef<InputRef>(null)
  const [searchText, setSearchText] = useState<string>('')
  const [searchedColumn, setSearchedColumn] = useState<string>('')

  const [deleteFakeProduct] = useDeleteFakeProductMutation()
  const [restoreProduct] = useRestoreProductMutation()
  const [deleteProduct] = useDeleteProductMutation()
  const [changeStatusProduct, { isLoading: isChangeStatus }] = useEditProductMutation()

  const { user } = useAppSelector((state: RootState) => state.persistedReducer.auth)

  const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void, dataIndex: IProduct) => {
    const searchValue = selectedKeys[0]
    confirm()
    setSearchText(searchValue)
    setSearchedColumn(dataIndex.name)
    // Update parent state for combined filtering
    if (setSearchTextParent) {
      setSearchTextParent(searchValue)
    }
  }

  const handleResetSearch = () => {
    setSearchText('')
    setSearchedColumn('')
    if (setSearchTextParent) {
      setSearchTextParent('')
    }
  }

  const getColumnSearchProps = (dataIndex: IProduct): ColumnType<IProduct> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8, width: '100%' }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          size='large'
          placeholder={`Tìm kiếm ${dataIndex === 'name' ? 'tên sản phẩm' : dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <ButtonAntd
            type='primary'
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size='large'
          >
            Tìm kiếm
          </ButtonAntd>
          <ButtonAntd
            onClick={() => {
              if (clearFilters) {
                clearFilters()
                handleResetSearch()
              }
            }}
            size='large'
          >
            Xóa
          </ButtonAntd>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <Tooltip title='Tìm kiếm sản phẩm'>
        <ButtonAntd
          type={filtered ? 'primary' : 'default'}
          shape='circle'
          icon={<SearchOutlined />}
          style={{ color: filtered ? '#1890ff' : undefined }}
        />
      </Tooltip>
    ),
    // Remove onFilter to prevent client-side filtering in Table
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100)
      }
    },
    render: (text, product: IProduct) =>
      searchedColumn === dataIndex.name ? (
        <div className='gap-x-3 flex items-center justify-start'>
          <img
            src={product.images[0].url}
            alt={product.images[0].filename}
            className='object-cover w-20 h-20 rounded-lg cursor-pointer'
            onClick={() => {
              dispatch(setOpenDrawer(true))
              dispatch(setProductDetail(product))
            }}
          />
          <div className='flex flex-col gap-0.5 justify-center items-start'>
            <Tag
              color={clsxm(
                { success: !product.is_deleted && product.is_active },
                { '#333': product.is_deleted },
                { red: !product.is_deleted && !product.is_active }
              )}
            >
              {product.is_active && !product.is_deleted ? 'Đang hoạt động' : 'Không hoạt động'}
            </Tag>
            <p
              className='hover:underline capitalize truncate cursor-pointer w-[215px]'
              onClick={() => {
                dispatch(setOpenDrawer(true))
                dispatch(setProductDetail(product))
              }}
            >
              {/* {product.name} */}
              <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text ? text.toString() : ''}
              />
            </p>
            {product.sale > 0 && (
              <p className='flex items-center justify-center gap-1'>
                <span>
                  <TbBasketDiscount />
                </span>
                <span className=''>{formatCurrency(product.sale)}</span>
              </p>
            )}
          </div>
        </div>
      ) : (
        // text
        <div className='gap-x-3 flex items-center justify-start'>
          <img
            src={product.images[0].url}
            alt={product.images[0].filename}
            className='object-cover w-20 h-20 rounded-lg cursor-pointer'
            onClick={() => {
              dispatch(setOpenDrawer(true))
              dispatch(setProductDetail(product))
            }}
          />
          <div className='flex flex-col gap-0.5 justify-center items-start'>
            <Tag
              color={clsxm(
                { success: !product.is_deleted && product.is_active },
                { '#333': product.is_deleted },
                { red: !product.is_deleted && !product.is_active }
              )}
            >
              {product.is_active && !product.is_deleted ? 'Đang hoạt động' : 'Không hoạt động'}
            </Tag>
            <p
              className='hover:underline capitalize truncate cursor-pointer w-[215px]'
              onClick={() => {
                dispatch(setOpenDrawer(true))
                dispatch(setProductDetail(product))
              }}
            >
              {product.name}
            </p>
            {product.sale > 0 && (
              <p className='flex items-center justify-center gap-1'>
                <span>
                  <TbBasketDiscount />
                </span>
                <span className=''>{formatCurrency(product.sale)}</span>
              </p>
            )}
          </div>
        </div>
      )
  })
  const [options, setOptions] = useState({ _page: 1, _limit: 10 })
  const { data: categories } = useGetAllCategoryQuery(options)
  
  // Helper function to get min price from sizes
  const getMinPrice = (sizes: ISizeRefProduct[]) => {
    if (!sizes || sizes.length === 0) return 0
    return Math.min(...sizes.map(size => size.price))
  }

  /* columns staff */
  const columnsStaff: any = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      sorter: (a: any, b: any) => a.index - b.index
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: 350,
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      ...getColumnSearchProps('name' as unknown as IProduct)
    },
    // {
    //   title: 'Size',
    //   dataIndex: 'sizes',
    //   key: 'sizes',
    //   width: 180,
    //   render: (sizes: ISizeRefProduct[]) => (
    //     <>
    //       <div className='flex flex-col gap-1'>
    //         {sizes?.slice(0, 2).map((size: ISizeRefProduct) => (
    //           <div key={size._id} className='relative grid grid-cols-2'>
    //             <p className='border-r-graydark w-full pr-3 uppercase border-r border-opacity-50'>{size.name}</p>
    //             <p className='w-full pl-3'>{formatCurrency(size.price)}</p>
    //           </div>
    //         ))}
    //       </div>
    //       {sizes?.length > 2 && <p className='text-gray-400'>+{sizes.length - 2} size khác</p>}
    //     </>
    //   )
    // },
    {
      title: 'Giá',
      dataIndex: 'sale',
      key: 'sale',
      width: 130,
      sorter: (a: any, b: any) => a.sale - b.sale,
      render: (sale: number) => (
        sale > 0 ? (
          <span className='font-semibold text-green-600'>{formatCurrency(sale)}</span>
        ) : (
          <span className='text-gray-400'>Chưa có giá</span>
        )
      ),
      filters: [
        { text: 'Dưới 50.000đ', value: '0-50000' },
        { text: '50.000đ - 100.000đ', value: '50000-100000' },
        { text: '100.000đ - 200.000đ', value: '100000-200000' },
        { text: 'Trên 200.000đ', value: '200000-999999999' }
      ],
      filterMode: 'menu',
      onFilter: (value: any, record: any) => {
        const [min, max] = value.split('-').map(Number)
        return record.sale >= min && record.sale <= max
      }
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 180,
      render: (category: ICategoryRefProduct) => <p className='capitalize'>{category?.name || 'Không có thông tin'}</p>,
      filters: categories?.docs.map((category: any) => ({ text: category.name, value: category._id })),
      filterMode: 'tree',
      filterSearch: true,
      onFilter: (value: any, record: any) => record.category._id === value,
      ellipsis: true
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    }
  ]

  /* column admin */
  /* handle delete product */
  /*Xoa mem sản phẩm đi */
  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await deleteFakeProduct({ id }).unwrap()
      if (response.message === 'success') {
        message.success('Sản phẩm đã được chuyển vào thùng rác!')
      }
    } catch (error) {
      message.error('Xóa sản phẩm thất bại')
    }
  }

  const handleRestoreProduct = async (id: string) => {
    try {
      const response = await restoreProduct({ id })
      if ((response as any).message === 'success') {
        message.success('Khôi phục sản phẩm thành công!')
      }
    } catch (error) {
      message.error('Khôi phục sản phẩm thất bại')
    }
  }

  const handleDeleteProductReal = async (id: string) => {
    try {
      const response = await deleteProduct({ id })
      if ((response as any).message === 'success') {
        message.success('Xóa sản phẩm thành công!')
      }
    } catch (error) {
      message.error('Khôi phục sản phẩm thất bại')
    }
  }

  const handleChangeStatusProduct = async (product: IProduct) => {
    // console.log(product)
    // return

    const newProduct: any = {
      name: product.name,
      category: product.category._id,
      is_active: product.is_active ? false : true,
      images: product.images,
      description: product.description,
      sale: product.sale,
      size: product.sizes
        .filter((size) => !size.is_default)
        .map((size) => ({ _id: size._id, name: size.name, price: size.price })),
      sizeDefault: product.sizes.filter((size) => size.is_default).map((size) => size._id),
    }
    changeStatusProduct({ id: product._id, product: newProduct })
      .unwrap()
      .then(() => {
        message.success('Thay đổi trạng thái thành công')
      })
      .catch(() => message.error('Thay đổi trạng thái thất bại'))
  }

  const columnsAdmin: any = [
    ...columnsStaff,
    {
      // title: 'Action',
      dataIndex: 'action',
      width: 100,
      key: 'action',
      render: (_: any, product: IProduct) => {
        if (!deleteReal) {
          return (
            <Space>
              {isChangeStatus && <Loading overlay />}
              <Tooltip title='Cập nhật sản phẩm'>
                <ButtonAntd
                  size='large'
                  icon={<AiFillEdit />}
                  onClick={() => {
                    dispatch(setOpenDrawer(true))
                    dispatch(setProductId(product._id))
                  }}
                  className='bg-primary hover:text-white flex items-center justify-center text-white'
                />
              </Tooltip>
              <Popconfirm
                title='Thay đổi trạng thái sản phẩm?'
                description={`Sản phẩm sẽ được ${product.is_active ? 'ẩn đi!' : 'hiển thị'}`}
                onConfirm={() => handleChangeStatusProduct(product)}
                okText='Có'
                cancelText='Không'
              >
                <ButtonAntd
                  size='large'
                  icon={<SyncOutlined />}
                  danger
                  className='hover:text-white flex items-center justify-center text-white'
                />
              </Popconfirm>
            </Space>
          )
        } else {
          return (
            <Space>
              <Tooltip title='Khôi phục sản phẩm'>
                <Popconfirm
                  title='Bạn có muốn khôi phục sản phẩm này?'
                  onConfirm={() => handleRestoreProduct(product._id)}
                  okText='Đồng ý'
                  cancelText='Hủy'
                >
                  <ButtonAntd
                    size='large'
                    icon={<AiOutlineUndo />}
                    className='bg-primary hover:text-white flex items-center justify-center text-white'
                  />
                </Popconfirm>
              </Tooltip>
              <Popconfirm
                title='Xóa sản phẩm?'
                onConfirm={() => handleDeleteProductReal(product._id)}
                okText='Đồng ý'
                cancelText='Hủy'
              >
                <ButtonAntd
                  size='large'
                  icon={<DeleteIcon />}
                  danger
                  className='hover:text-white flex items-center justify-center text-white'
                />
              </Popconfirm>
            </Space>
          )
        }
      }
    }
  ]

  return user && (user.role === IRoleUser.ADMIN || user.role === IRoleUser.STAFF) ? columnsAdmin : columnsStaff
}
