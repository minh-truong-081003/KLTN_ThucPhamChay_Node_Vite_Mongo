import { Button as ButtonAntd, Table, Tooltip } from 'antd'

import { useState } from 'react'
import { useAppSelector } from '~/store/hooks'
import { useGetAllProductActiveQuery } from '~/store/services'
import { RootState } from '~/store/store'
import { IRoleUser, IProduct } from '~/types'
import { useRender } from '../../hooks'

export const ProductListActive = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [priceFilter, setPriceFilter] = useState<string[]>([])
  const [saleFilter, setSaleFilter] = useState<string[]>([])
  const { user } = useAppSelector((state: RootState) => state.persistedReducer.auth)
  const [options, setOptions] = useState({
    page: 1,
    limit: 5
  })
  const { data } = useGetAllProductActiveQuery({
    _page: options.page,
    _limit: options.limit,
    query: ''
  })

  const products = (data?.docs || []).map((product: any, index: number) => ({
    ...product,
    key: product._id,
    index: index + 1
  }))

  const start = () => {
    setLoading(true)
    // ajax request after empty completing
    setTimeout(() => {
      setSelectedRowKeys([])
      setLoading(false)
    }, 1000)
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  }
  const hasSelected = selectedRowKeys.length > 1

  const columnsData = useRender(
    data?.docs || [],
    false,
    setSearchText,
    setCategoryFilter,
    setPriceFilter,
    setSaleFilter
  )

  return (
    <div>
      <div style={{ marginBottom: 16 }} className='flex items-center gap-3'>
        {hasSelected && (
          <Tooltip title={hasSelected ? `Đang chọn ${selectedRowKeys?.length} sản phẩm` : ''}>
            <ButtonAntd
              size='large'
              danger
              type='primary'
              className='text-sm font-semibold capitalize'
              onClick={start}
              loading={loading}
            >
              Xóa tất cả
            </ButtonAntd>
          </Tooltip>
        )}
        {/* <ButtonAntd
          icon={<HiDocumentDownload />}
          size='large'
          className='bg-[#209E62] text-white hover:!text-white text-sm font-semibold capitalize flex items-center'
          onClick={() => {
            if (data?.docs?.length === 0) {
              message.warning('Không có sản phẩm nào để xuất')
              return
            }
            exportDataToExcel(data?.docs, 'products-active')
          }}
        >
          Xuất excel
        </ButtonAntd> */}
      </div>
      <Table
        rowSelection={user && (user.role === IRoleUser.ADMIN || user.role === IRoleUser.STAFF) ? rowSelection : undefined}
        columns={columnsData}
        dataSource={products}
        scroll={{ x: 1300 }}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '25', '30', '40', '50'],
          defaultPageSize: options.limit,
          showSizeChanger: true,
          total: data?.totalDocs,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`,
          onChange: (page, pageSize) => {
            setOptions((prev) => ({ ...prev, page, limit: pageSize }))
          }
        }}
        bordered={true}
      />
    </div>
  )
}
