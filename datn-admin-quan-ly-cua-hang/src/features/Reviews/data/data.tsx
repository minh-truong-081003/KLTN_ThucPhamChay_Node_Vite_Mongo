import type { TabsProps } from 'antd'
import { v4 as uuidv4 } from 'uuid'
import { ReviewListActive, ReviewListDeleted, ReviewListHidden } from '../components'

export const items: TabsProps['items'] = [
  {
    key: uuidv4(),
    label: 'Các đánh giá đang hoạt động',
    children: <ReviewListActive />
  },
  {
    key: uuidv4(),
    label: 'Các đánh giá đã ẩn',
    children: <ReviewListHidden />
  },
  {
    key: uuidv4(),
    label: 'Các đánh giá đã xóa',
    children: <ReviewListDeleted />
  }
]
