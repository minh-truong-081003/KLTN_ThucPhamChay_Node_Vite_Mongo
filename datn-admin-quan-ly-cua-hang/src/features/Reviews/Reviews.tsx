import { Tabs } from 'antd'
import { Breadcrumb } from '~/components'
import { items } from './data/data'

const ReviewsFeature = () => {
  return (
    <div>
      <Breadcrumb pageName='Quản lý đánh giá' />
      <Tabs defaultActiveKey='1' items={items} />
    </div>
  )
}

export default ReviewsFeature

