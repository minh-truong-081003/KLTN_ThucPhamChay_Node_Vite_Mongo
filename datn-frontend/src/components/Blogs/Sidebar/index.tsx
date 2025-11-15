import { Link, useParams, useLocation } from 'react-router-dom'
import styles from './index.module.scss'
import { useGetAllBlogCategoryQuery, useGetBlogDetailQuery } from '../../../api/NewBlogs'

const SiderbarBlog = () => {
  const { data: blogCategories } = useGetAllBlogCategoryQuery()
  const { id } = useParams()
  const location = useLocation()
  
  // Check if viewing all blogs
  const isAllBlogs = location.pathname === '/blogs' || location.pathname === '/blogs/'
  
  // Check if viewing blog detail to get its category
  const isBlogDetail = location.pathname.match(/^\/blogs\/[a-zA-Z0-9]+$/) !== null
  const { data: currentBlog } = useGetBlogDetailQuery(id!, { skip: !isBlogDetail || !id })
  
  // Determine active category ID
  let activeCategoryId = null
  if (isBlogDetail && currentBlog?.category) {
    // When viewing blog detail, get category from blog data
    activeCategoryId = typeof currentBlog.category === 'string' ? currentBlog.category : currentBlog.category._id
  } else if (location.pathname.includes('/category/')) {
    // When viewing category page, use the id from URL
    activeCategoryId = id
  }

  return (
    <div className='sm:w-full lg:w-full max-w-[300px]'>
      <div className='sticky top-[80px] self-start'>
        <div className={`${styles.category_menu_title} sm:text-[25px] text-center lg:text-[28px]`}>Danh mục tin tức</div>
        <div className='w-full max-w-[260px] mx-auto mb-[70px]'>
        <ul>
          <li className={`${styles.menu_category} transition-all duration-200 ${isAllBlogs ? 'border-l-4 border-[#d3b673] bg-[#f5f5dc] pl-3' : ''}`}>
            <Link to='/blogs' className={`block ${isAllBlogs ? 'text-[#8a733f] font-semibold' : ''}`}>Tất cả tin tức</Link>
          </li>
          {blogCategories &&
            blogCategories.docs.length > 0 &&
            blogCategories?.docs?.map((item: any, index: number) => {
              const isActive = activeCategoryId === item?._id
              return (
                <li key={index} className={`${styles.menu_category} transition-all duration-200 ${isActive ? 'border-l-4 border-[#d3b673] bg-[#f5f5dc] pl-3' : ''}`}>
                  <Link to={`category/${item?._id}`} className={`block ${isActive ? 'text-[#8a733f] font-semibold' : ''}`}>{item?.name}</Link>
                </li>
              )
            })}

          {/* <li className={`${styles.menu_category}`}>
            <Link to='tin-tuc-khuyen-mai'>Tin tức khuyến mãi</Link>
          </li>
          <li className={`${styles.menu_category}`}>
            <Link to='su-kien'>Sự kiện</Link>
          </li> */}
        </ul>
        </div>
        {/* <div className={`${styles.category_menu_title} hidden sm:hidden lg:inline-block text-[28px] `}>
          <span>Từ khóa</span>
        </div> */}
      </div>
    </div>
  )
}

export default SiderbarBlog
