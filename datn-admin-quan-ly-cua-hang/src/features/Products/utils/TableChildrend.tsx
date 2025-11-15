import { Table } from 'antd'
import { IToppingRefProduct } from '~/types'
import { formatCurrency } from '~/utils'

export default function TableChildrend({ products }: any) {
  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: 260,
      render: (name: string) => <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block'}}>{name}</span>
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 120,
      render: (image: any) => (
        <img src={image} className='object-cover w-20 h-20 rounded-lg cursor-pointer mb-1' alt='' />
      )
    },
    {
      title: 'Số Lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => formatCurrency(price)
    }
  ]
  const dataPush = products?.map((item: any) => ({
    name: item.name,
    quantity: item.quantity,
    size: item.size,
    topping: item.toppings,
    price: item.price,
    image: item.image
  }))

  return <Table className='my-3' bordered columns={columns} dataSource={dataPush} pagination={false} />
}
