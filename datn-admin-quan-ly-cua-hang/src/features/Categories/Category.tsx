import { Breadcrumb, Button, PlusIcon } from '~/components'
import { RootState, useAppDispatch } from '~/store/store'

import FormCategory from './components/FormCategory/FormCategory'
import { IRoleUser } from '~/types'
import { Tabs } from 'antd'
import { items } from './data'
import { setOpenDrawer } from '~/store/slices'
import { useAppSelector } from '~/store/hooks'
import ListCategory from './components/ListCategory/ListCategory'

const Category = () => {
  const dispatch = useAppDispatch()
  const { openDrawer } = useAppSelector((state) => state.drawer)
  const { user } = useAppSelector((state: RootState) => state.persistedReducer.auth)

  const isPrivileged = user && (user.role === IRoleUser.ADMIN || user.role === IRoleUser.STAFF)

  return (
    <div>
      <Breadcrumb pageName='Danh mục'>
        {isPrivileged && (
          <Button icon={<PlusIcon />} onClick={() => dispatch(setOpenDrawer(true))}>
            Thêm
          </Button>
        )}
      </Breadcrumb>
      {isPrivileged ? (
        <>
          <Tabs defaultActiveKey='1' items={items} className='text-white' />
          <FormCategory open={openDrawer} />
        </>
      ) : (
        <ListCategory />
      )}
    </div>
  )
}

export default Category
