import { Image, Popconfirm, Rate, Space, Table, Tag, Button as AntButton, Tooltip, Input } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { useState, useRef } from 'react'
import { AiOutlineSearch } from 'react-icons/ai'
import { BsFillTrashFill } from 'react-icons/bs'
import { MdRestore } from 'react-icons/md'
import Loading from '~/components/Loading/Loading'
import { NotFound } from '~/pages'
import { useForceDeleteReviewMutation, useGetAllReviewsQuery, useRestoreReviewMutation } from '~/store/services'
import { IReview } from '~/types'
import { formatDate } from '~/utils/formatDate'
import { messageAlert } from '~/utils/messageAlert'
import { pause } from '~/utils/pause'

export const ReviewListDeleted = () => {
  const [options, setOptions] = useState({
    page: 1,
    limit: 10,
    is_deleted: true
  })
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchedColumn] = useState('')
  const searchInput = useRef<any>(null)

  const { data: reviewsData, isLoading, isError } = useGetAllReviewsQuery(options)
  const [forceDelete] = useForceDeleteReviewMutation()
  const [restoreReview] = useRestoreReviewMutation()

  const handleSearch = (selectedKeys: string[], confirm: any, dataIndex: string) => {
    confirm()
    setSearchText(selectedKeys[0])
    setSearchedColumn(dataIndex)
  }

  const handleReset = (clearFilters: any) => {
    clearFilters()
    setSearchText('')
  }

  const getColumnSearchProps = (dataIndex: string, placeholder: string) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Tìm ${placeholder}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : [])
            confirm({ closeDropdown: false })
          }}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <AntButton
            type='primary'
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<AiOutlineSearch />}
            size='small'
            style={{ width: 90 }}
          >
            Tìm
          </AntButton>
          <AntButton onClick={() => clearFilters && handleReset(clearFilters)} size='small' style={{ width: 90 }}>
            Xóa
          </AntButton>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <AiOutlineSearch style={{ color: filtered ? '#1890ff' : undefined, fontSize: '16px' }} />,
    onFilter: (value: any, record: any) => {
      const keys = dataIndex.split('.')
      let data = record
      for (const key of keys) {
        data = data?.[key]
      }
      return data?.toString().toLowerCase().includes(value.toString().toLowerCase())
    },
    onFilterDropdownOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100)
      }
    }
  })

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  }

  const handleBulkRestore = async () => {
    setLoading(true)
    try {
      await Promise.all(selectedRowKeys.map((id) => restoreReview({ id: id as string }).unwrap()))
      messageAlert(`Đã khôi phục ${selectedRowKeys.length} đánh giá`, 'success')
      setSelectedRowKeys([])
    } catch (error) {
      messageAlert('Có lỗi xảy ra khi khôi phục đánh giá!', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkForceDelete = async () => {
    setLoading(true)
    try {
      await Promise.all(selectedRowKeys.map((id) => forceDelete({ id: id as string }).unwrap()))
      messageAlert(`Đã xóa vĩnh viễn ${selectedRowKeys.length} đánh giá`, 'success')
      setSelectedRowKeys([])
    } catch (error) {
      messageAlert('Có lỗi xảy ra khi xóa vĩnh viễn đánh giá!', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleForceDelete = async (id: string) => {
    await pause(1000)
    forceDelete({ id })
      .unwrap()
      .then(() => {
        messageAlert('Đã xóa vĩnh viễn đánh giá', 'success')
      })
      .catch(() => messageAlert('Xóa đánh giá thất bại!', 'error'))
  }

  const handleRestore = async (id: string) => {
    await pause(500)
    restoreReview({ id })
      .unwrap()
      .then(() => {
        messageAlert('Khôi phục đánh giá thành công', 'success')
      })
      .catch(() => messageAlert('Khôi phục đánh giá thất bại!', 'error'))
  }

  const columns: ColumnsType<IReview> = [
    {
      title: '#',
      dataIndex: 'index',
      width: 60,
      render: (_, __, index) => (options.page - 1) * options.limit + index + 1
    },
    {
      title: 'Người dùng',
      dataIndex: 'user',
      width: 150,
      ...getColumnSearchProps('user.username', 'tên người dùng'),
      render: (user: any) => (
        <div className='flex items-center gap-2'>
          {user?.avatar ? (
            <Image src={user.avatar} alt={user.username} className='w-8 h-8 rounded-full object-cover' />
          ) : (
            <div className='w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold'>
              {(user?.username || user?.account || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <span>{user?.username || user?.account || 'N/A'}</span>
        </div>
      )
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      width: 250,
      ...getColumnSearchProps('product.name', 'tên sản phẩm'),
      render: (product: any) => (
        <div className='flex items-start gap-2'>
          {typeof product === 'object' && product?.images?.[0] ? (
            <div className='flex-shrink-0'>
              <Image src={product.images[0].url} alt={product.name} width={80} height={80} className='rounded object-cover' style={{ width: '80px', height: '80px' }} />
            </div>
          ) : null}
          <span className='line-clamp-2 flex-1'>{typeof product === 'object' ? product?.name : 'N/A'}</span>
        </div>
      )
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      width: 100,
      align: 'center',
      filters: [
        { text: '5 sao', value: 5 },
        { text: '4 sao', value: 4 },
        { text: '3 sao', value: 3 },
        { text: '2 sao', value: 2 },
        { text: '1 sao', value: 1 }
      ],
      onFilter: (value, record) => record.rating === value,
      sorter: (a, b) => a.rating - b.rating,
      render: (rating: number) => (
        <div className='flex items-center justify-center gap-1'>
          <span className='text-base font-semibold'>{rating}</span>
          <Rate disabled value={1} count={1} className='text-sm' />
        </div>
      )
    },
    {
      title: 'Bình luận',
      dataIndex: 'comment',
      width: 250,
      render: (comment: string) => (
        <div className='line-clamp-2' title={comment}>
          {comment || 'Không có bình luận'}
        </div>
      )
    },
    {
      title: 'Ảnh',
      dataIndex: 'images',
      width: 100,
      render: (images: any[]) => {
        if (!images || images.length === 0) return <span className='text-gray-400'>Không có</span>
        return (
          <div className='flex gap-1'>
            {images.slice(0, 2).map((img, idx) => (
              <Image key={idx} src={img.url} alt={`Review ${idx + 1}`} width={80} height={80} className='rounded object-cover' style={{ width: '80px', height: '80px' }} />
            ))}
            {images.length > 2 && <span className='text-xs text-gray-500'>+{images.length - 2}</span>}
          </div>
        )
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 150,
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_deleted',
      width: 120,
      render: () => <Tag color='red'>Đã xóa</Tag>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 220,
      align: 'center',
      render: (_, record) => (
        <Space size='small' style={{ display: 'flex', justifyContent: 'center' }}>
          <Popconfirm
            title='Khôi phục đánh giá'
            description='Bạn có chắc chắn muốn khôi phục đánh giá này?'
            onConfirm={() => handleRestore(record._id)}
            okText='Có'
            cancelText='Không'
          >
            <button 
              style={{ backgroundColor: '#52c41a', color: 'white', border: 'none' }}
              className='px-3 py-1.5 rounded hover:bg-green-600 flex items-center gap-1.5 transition-colors'
            >
              <MdRestore className='text-base' />
              <span>Khôi phục</span>
            </button>
          </Popconfirm>
          <Popconfirm
            title='Xóa vĩnh viễn'
            description='Hành động này không thể hoàn tác. Bạn có chắc chắn?'
            onConfirm={() => handleForceDelete(record._id)}
            okText='Có'
            cancelText='Không'
          >
            <button 
              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
              className='px-3 py-1.5 rounded hover:bg-red-600 flex items-center gap-1.5 transition-colors'
            >
              <BsFillTrashFill className='text-sm' />
              <span>Xóa</span>
            </button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  if (isLoading) return <Loading />
  if (isError) return <NotFound />

  const hasSelected = selectedRowKeys.length > 0

  return (
    <div>
      {hasSelected && (
        <div style={{ marginBottom: 16 }} className='flex items-center gap-3'>
          <Tooltip title={`Đã chọn ${selectedRowKeys.length} mục`}>
            <AntButton
              size='large'
              style={{ backgroundColor: '#52c41a', color: 'white', borderColor: '#52c41a' }}
              className='hover:!bg-green-600 text-sm font-semibold'
              icon={<MdRestore />}
              onClick={handleBulkRestore}
              loading={loading}
            >
              Khôi phục tất cả
            </AntButton>
          </Tooltip>
          <Tooltip title={`Đã chọn ${selectedRowKeys.length} mục`}>
            <AntButton
              size='large'
              type='default'
              danger
              className='text-sm font-semibold'
              icon={<BsFillTrashFill />}
              onClick={handleBulkForceDelete}
              loading={loading}
            >
              Xóa vĩnh viễn tất cả
            </AntButton>
          </Tooltip>
        </div>
      )}
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={reviewsData?.docs || []}
        rowKey='_id'
        scroll={{ x: 1400 }}
        pagination={{
          current: options.page,
          pageSize: options.limit,
          total: reviewsData?.totalDocs || 0,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '15', '20', '25', '30'],
          showTotal: (total) => `Tổng ${total} đánh giá`,
          onChange: (page, pageSize) => {
            setOptions({ ...options, page, limit: pageSize || 10 })
          }
        }}
      />
    </div>
  )
}
