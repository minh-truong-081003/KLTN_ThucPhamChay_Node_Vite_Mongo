import { Breadcrumb, Button, PlusIcon } from '~/components'
import { FormProduct, PreviewProduct, ProductListActive } from './components'
import { IProduct, IRoleUser } from '~/types'
import { RootState, useAppDispatch } from '~/store/store'

import { Tabs } from 'antd'
import { items } from './data/data'
import { setOpenDrawer } from '~/store/slices'
import { setProductsList } from '~/store/slices/Products/product.slice'
import { useAppSelector } from '~/store/hooks'
import { useEffect } from 'react'

interface FeatureProductsProps {
  data: IProduct[]
}

const FeatureProducts = ({ data }: FeatureProductsProps) => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state: RootState) => state.persistedReducer.auth)

  useEffect(() => {
    dispatch(setProductsList(data))
  }, [dispatch, data])

  const isPrivileged = user && (user.role === IRoleUser.ADMIN || user.role === IRoleUser.STAFF)

  return (
    <div>
      <Breadcrumb pageName='Sản phẩm'>
        {isPrivileged && (
          <Button icon={<PlusIcon />} onClick={() => dispatch(setOpenDrawer(true))}>
            Thêm
          </Button>
        )}
      </Breadcrumb>

      {isPrivileged ? (
        <>
          <Tabs defaultActiveKey='1' items={items} />
          <FormProduct />
        </>
      ) : (
        <ProductListActive />
      )}

      {/* preview product */}
      <PreviewProduct />
    </div>
  )
}

export default FeatureProducts
