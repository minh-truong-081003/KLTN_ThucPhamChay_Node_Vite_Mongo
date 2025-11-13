import { Image, Popconfirm, Rate, Space, Table, Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { BsFillTrashFill } from 'react-icons/bs'
import { Button } from '~/components'
import Loading from '~/components/Loading/Loading'
import { NotFound } from '~/pages'
import { useDeleteReviewMutation, useGetAllReviewsQuery, useRestoreReviewMutation } from '~/store/services'
import { IReview, IReviewDataType } from '~/types'
import { formatDate } from '~/utils/formatDate'
import { messageAlert } from '~/utils/messageAlert'
import { pause } from '~/utils/pause'

export const ListReviews = () => {
  const [options, setOptions] = useState({
    page: 1,
    limit: 10,
    productId: undefined as string | undefined,
    userId: undefined as string | undefined,
    rating: undefined as number | undefined,
    is_active: undefined as boolean | undefined
  })

  const { data: reviewsData, isLoading, isError } = useGetAllReviewsQuery(options)
  const [deleteReview] = useDeleteReviewMutation()
  const [restoreReview] = useRestoreReviewMutation()

  const handleDelete = async (id: string) => {
    await pause(1000)
    deleteReview({ id })
      .unwrap()
      .then(() => {
        messageAlert('Xóa đánh giá thành công', 'success')
      })
      .catch(() => messageAlert('Xóa đánh giá thất bại!', 'error'))
  }

  const handleRestore = async (id: string) => {
    await pause(1000)
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
      width: 200,
      render: (product: any) => (
        <div className='flex items-center gap-2'>
          {typeof product === 'object' && product?.images?.[0] ? (
            <Image src={product.images[0].url} alt={product.name} className='w-10 h-10 rounded object-cover' />
          ) : null}
          <span className='line-clamp-1'>{typeof product === 'object' ? product?.name : 'N/A'}</span>
        </div>
      )
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      width: 120,
      render: (rating: number) => (
        <div className='flex items-center gap-2'>
          <Rate disabled defaultValue={rating} className='text-sm' />
          <span className='text-sm font-semibold'>{rating}</span>
        </div>
      ),
      filters: [
        { text: '5 sao', value: 5 },
        { text: '4 sao', value: 4 },
        { text: '3 sao', value: 3 },
        { text: '2 sao', value: 2 },
        { text: '1 sao', value: 1 }
      ],
      onFilter: (value, record) => record.rating === value
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
              <Image key={idx} src={img.url} alt={`Review ${idx + 1}`} className='w-10 h-10 rounded object-cover' />
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
      dataIndex: 'is_active',
      width: 100,
      render: (is_active: boolean) => (
        <Tag color={is_active ? 'green' : 'red'}>{is_active ? 'Hoạt động' : 'Không hoạt động'}</Tag>
      ),
      filters: [
        { text: 'Hoạt động', value: true },
        { text: 'Không hoạt động', value: false }
      ],
      onFilter: (value, record) => record.is_active === value
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size='middle'>
          {record.is_deleted ? (
            <Popconfirm
              title='Khôi phục đánh giá'
              description='Bạn có chắc chắn muốn khôi phục đánh giá này?'
              onConfirm={() => handleRestore(record._id)}
              okText='Có'
              cancelText='Không'
            >
              <Button
                type='primary'
                className='bg-green-500 hover:bg-green-600'
                icon={<BsFillTrashFill className='rotate-180' />}
              >
                Khôi phục
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title='Xóa đánh giá'
              description='Bạn có chắc chắn muốn xóa đánh giá này?'
              onConfirm={() => handleDelete(record._id)}
              okText='Có'
              cancelText='Không'
            >
              <Button type='primary' danger icon={<BsFillTrashFill />}>
                Xóa
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  if (isLoading) return <Loading />
  if (isError) return <NotFound />

  return (
    <div>
      <Table
        columns={columns}
        dataSource={reviewsData?.docs || []}
        rowKey='_id'
        scroll={{ x: 1200 }}
        pagination={{
          current: options.page,
          pageSize: options.limit,
          total: reviewsData?.totalDocs || 0,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đánh giá`,
          onChange: (page, pageSize) => {
            setOptions({ ...options, page, limit: pageSize || 10 })
          }
        }}
      />
    </div>
  )
}

