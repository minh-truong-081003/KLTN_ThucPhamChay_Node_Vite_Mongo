import { Avatar, Button, Card, Empty } from 'antd'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useGetAllBlogsQuery } from '../../../api/NewBlogs'
import './New.module.scss'
import parse from 'html-react-parser'
import { Pagination } from 'antd'
import { useState } from 'react'
const { Meta } = Card

const News = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: dataBlog } = useGetAllBlogsQuery()

  // If no category ID, show all blogs, otherwise filter by category
  const listBlogsByIdCate = id
    ? dataBlog && dataBlog?.docs?.filter((item) => item?.category?._id === id)
    : dataBlog?.docs

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = listBlogsByIdCate?.slice(startIndex, endIndex)
  const handleChangePage = (page: number) => {
    setCurrentPage(page)
  }

  if (paginatedData && paginatedData.length <= 0) {
    return (
      <div className='flex items-center justify-center w-full py-4'>
        <Empty
          className='flex items-center flex-col'
          image={'https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg'}
          styles={{ image: { height: 200 } }}
          description={<span>Hiện tại chưa có bài viết nào!</span>}
        />
      </div>
    )
  }
  return (
    <>
      {!id && (
        <div className='bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg p-6 mb-8 border-l-4 border-[#d3b673]'>
          <h2 className='text-2xl font-bold text-[#8a733f] mb-3'>📰 Tin Tức Thực Phẩm Chay</h2>
          <p className='text-gray-700 leading-relaxed mb-2'>
            Khám phá những câu chuyện, kiến thức và xu hướng mới nhất về ẩm thực chay. Từ các chính sách đổi trả, câu
            chuyện thương hiệu, đến những sự kiện và khuyến mãi hấp dẫn.
          </p>
          <p className='text-gray-600 text-sm italic'>
            ✨ Cùng ViFood lan tỏa lối sống lành mạnh và yêu thương thiên nhiên!
          </p>
        </div>
      )}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-[20px] gap-y-[30px] my-[30px]'>
        {paginatedData?.map((item) => (
          <Card
            onClick={() => navigate(`/blogs/${item._id}`)}
            key={item._id}
            hoverable
            className='w-[calc(50% - 8px)] bg-[#f5f5f5] hover:bg-[#fff]'
            cover={
              <img
                className='w-full max-h-[200px] object-cover'
                alt={item.images[0].filename}
                src={item.images[0].url}
              />
            }
          >
            <Meta
              className='custom-title  mb-5'
              avatar={<Avatar src='/logo_icon.png' />}
              title={item.name}
              description={<div className='line-clamp-3 text-base'>{parse(item.description)}</div>}
            />
            <Link to={'#'} className='text-left '>
              <Button className='mt-[25px] hover:!text-[#d3b673] hover:bg-transparent hover:!border-[#d3b673]  text-[#fff] bg-[#d3b673]'>
                Xem thêm
              </Button>
            </Link>
          </Card>
        ))}
      </div>
      <Pagination
        showQuickJumper
        pageSize={itemsPerPage}
        defaultCurrent={1}
        current={currentPage}
        total={listBlogsByIdCate?.length}
        onChange={handleChangePage}
      />
    </>
  )
}

export default News
