import { LoadingOutlined } from '@ant-design/icons'
import { Checkbox, Col, DatePicker, Drawer, Form, Input, InputNumber, Row } from 'antd'
import { Space } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Button } from '~/components'
import { useAppSelector } from '~/store/hooks'
import { useAddVoucherMutation, useUpdateVoucherMutation } from '~/store/services'
import { setOpenDrawer, setVoucher } from '~/store/slices'
import { RootState, useAppDispatch } from '~/store/store'
import { IVoucher } from '~/types'
import { messageAlert } from '~/utils/messageAlert'

interface VoucherAddProps {
  open: boolean
}

const VoucherAdd = ({ open }: VoucherAddProps) => {
  const dispatch = useAppDispatch()
  const [form] = Form.useForm()
  const [addVoucher, { isLoading: isAdding }] = useAddVoucherMutation()
  const [updateVoucher] = useUpdateVoucherMutation()
  const { voucherData } = useAppSelector((state: RootState) => state.vouchers)
  const [checkedVoucher, setCheckedVoucher] = useState<boolean>()
  const [generating, setGenerating] = useState(false)
  

  useEffect(() => {
    voucherData._id &&
      form.setFieldsValue({
        startDate: dayjs(voucherData.startDate),
        endDate: dayjs(voucherData.endDate),
        code: voucherData.code,
        sale: voucherData.sale,
        discount: voucherData.discount,
        title: voucherData.title,
        desc: voucherData.desc,
        isActive: voucherData.isActive
      })
  }, [form, voucherData])

  useEffect(() => {
    voucherData && voucherData._id && setCheckedVoucher(voucherData.isActive)
  }, [voucherData])

  const onFinish = async (values: IVoucher) => {
    if (voucherData._id) {
      updateVoucher({ _id: voucherData._id, ...values, isActive: checkedVoucher })
        .unwrap()
        .then(() => {
          messageAlert('Cập nhật thành công', 'success')
          onClose()
        })
        .catch(() => messageAlert('Cập nhật thất bại', 'error'))

      return
    }

    addVoucher(values)
      .unwrap()
      .then(() => {
        messageAlert('Thêm voucher thành công', 'success')
        onClose()
      })
      .catch(() => messageAlert('Thêm voucher thất bại!', 'error'))
  }
  const onClose = () => {
    dispatch(setOpenDrawer(false))
    dispatch(setVoucher({ _id: '', code: '', title: '', discount: 0, sale: 0 }))
    form.resetFields()
  }

  const checkTime = (current: dayjs.ConfigType, startValue: dayjs.ConfigType) => {
    const today = dayjs().startOf('day')

    // Disable dates before the start date
    if (startValue) {
      return current && (current < today || current < dayjs(startValue).startOf('day'))
    }

    return current && current < today
  }

  // Generate voucher code from title: normalize title then combine with random parts to produce 15 chars
  const randomFrom = (chars: string, n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')

  const generateCode = (title = '') => {
    const raw = String(title || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    // extract amount like '100k' or '100' or '1.5k' and keep only the numeric part (remove trailing 'k')
    const amountMatch = raw.match(/(\d+[.,]?\d*\s*[kK]?)/)
    let amountToken = ''
    let rawWithoutAmount = raw
    if (amountMatch) {
      const matched = amountMatch[0]
      const a = matched.replace(/\s+/g, '').replace(/\./g, '')
      const hasK = /k$/i.test(a)
      const digits = a.replace(/k$/i, '')
      amountToken = hasK ? `${digits}k` : digits
      // remove the amount substring from raw so letters attached to amount (like 'k') are not included in alpha
      rawWithoutAmount = raw.replace(matched, '')
    }

    const cleanAlpha = rawWithoutAmount.replace(/[^a-z]/g, '')
    const alphaPart = cleanAlpha.slice(0, 8) || 'vouch'

    // remaining length reserved for random suffix
    const reserved = alphaPart.length + amountToken.length
    const remaining = Math.max(0, 15 - reserved)

    // ensure we include at least one uppercase and one digit in suffix
    const upperPart = randomFrom('ABCDEFGHIJKLMNOPQRSTUVWXYZ', Math.max(1, Math.min(4, Math.floor(remaining / 2))))
    const digitPart = randomFrom('0123456789', Math.max(1, remaining - upperPart.length))

    let code = (alphaPart + amountToken + upperPart + digitPart).slice(0, 15)

    if (!/[a-z]/.test(code)) code = 'a' + code.slice(1)
    if (!/[A-Z]/.test(code)) code = code.slice(0, 14) + 'A'
    if (!/\d/.test(code)) code = code.slice(0, 13) + '0' + code.slice(14)

    return code
  }

  const handleGenerateCode = async () => {
    const title = form.getFieldValue('title') || ''
    const baseUrl = import.meta.env.VITE_API || ''
    try {
      setGenerating(true)
      const res = await fetch(`${baseUrl}/voucher/generate-code?title=${encodeURIComponent(title)}`)
      if (res.ok) {
        const payload = await res.json()
        const code = payload?.data?.code
        if (code) {
          form.setFieldsValue({ code })
          return
        }
      }
      // fallback to client-side generation
      const fallback = generateCode(title)
      form.setFieldsValue({ code: fallback })
    } catch (e) {
      const fallback = generateCode(title)
      form.setFieldsValue({ code: fallback })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Drawer
      title={voucherData._id ? 'Cập nhật voucher' : 'Thêm voucher mới'}
      width={476}
      destroyOnClose
      onClose={onClose}
      getContainer={false}
      open={open}
    >
      <Form
        name='basic'
        autoComplete='off'
        layout='vertical'
        form={form}
        className='dark:text-white'
        onFinish={onFinish}
      >
        <Form.Item
          className='dark:text-white'
          label='Tên voucher'
          name='title'
          rules={[
            { required: true, message: 'Tên voucher không được bỏ trống!' },
            {
              validator: (_, value) => {
                if (value.trim() === '') {
                  return Promise.reject('Tên voucher không được chứa toàn khoảng trắng!')
                }

                return Promise.resolve()
              }
            }
          ]}
        >
          <Input size='large' placeholder='Tên voucher' />
        </Form.Item>
        <Form.Item
          className='dark:text-white'
          label='Mã code voucher'
          name='code'
          rules={[
            { required: true, message: 'Mã Code voucher không được bỏ trống!' },
            {
              validator: (_, value) => {
                if (value.trim() === '') {
                  return Promise.reject('Mã Code voucher không được chứa toàn khoảng trắng!')
                }
                if (!/^[^~\-.A-Z]*[0-9]+[^~\-.A-Z]*$/.test(value) && value.length < 15) {
                  return Promise.reject('Mã Code voucher phải chứa chữ thường, hoa và số!')
                }
                if (value.length !== 15) {
                  return Promise.reject('Mã Code voucher dài 15 kí tự!')
                }
                return Promise.resolve()
              }
            }
          ]}
        >
          <Input
            size='large'
            placeholder='Mã voucher'
            addonAfter={
              <Button type='button' styleClass='!px-3 !py-1' onClick={handleGenerateCode} loading={generating}>
                {generating ? 'Đang...' : 'Tạo mã'}
              </Button>
            }
          />
        </Form.Item>
        

        <Form.Item
          className='dark:text-white'
          label='Số lượng'
          name='discount'
          rules={[
            { required: true, message: 'Không được bỏ trống!' },
            {
              validator: (_, value) => {
                if (value < 0) {
                  return Promise.reject('Số lượng không được âm!')
                }
                return Promise.resolve()
              }
            }
          ]}
        >
          <Input size='large' placeholder='Số lượng voucher' />
        </Form.Item>
        <Form.Item
          className='dark:text-white'
          label='Giảm giá voucher'
          name='sale'
          rules={[
            { required: true, message: 'Không được bỏ trống!' },
            {
              validator: (_, value) => {
                if (value < 1000) {
                  return Promise.reject('Giảm giá không được nhỏ hơn 1000đ!')
                }
                return Promise.resolve()
              }
            }
          ]}
        >
          <InputNumber
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            parser={(value: any) => value.replace(/ \s?|(\.*)/g, '')}
            size='large'
            placeholder='Giảm giá voucher(vnd)'
            className='w-full'
          />
        </Form.Item>
        <Row justify='space-between'>
          <Col span={11}>
            <Form.Item
              className='dark:text-white'
              label='Ngày Bắt đầu'
              name='startDate'
              rules={[{ required: true, message: 'Không được bỏ trống!' }]}
            >
              <DatePicker
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                size='large'
                className='w-full'
              />
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item
              className='dark:text-white'
              label='Ngày hết hạn'
              name='endDate'
              dependencies={['startDate']}
              rules={[
                { required: true, message: 'Không được bỏ trống!' },
                ({ getFieldValue }: any) => ({
                  validator(_, value) {
                    const result = checkTime(getFieldValue('startDate'), value)

                    if (result) {
                      return Promise.resolve()
                    } else {
                      return Promise.reject(new Error('Ngày kết thúc phải lớn hơn ngày bắt đầu'))
                    }
                  }
                })
              ]}
            >
              <DatePicker
                size='large'
                className='w-full'
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </Col>
        </Row>

        {voucherData && voucherData._id && (
          <Form.Item className='dark:text-white' label='Trạng thái' name='isActive'>
            <Checkbox checked={checkedVoucher} onChange={() => setCheckedVoucher(!checkedVoucher)}>
              Hoạt Động
            </Checkbox>
          </Form.Item>
        )}
        <Form.Item
          className='dark:text-white'
          label='Mô tả voucher'
          name='desc'
          rules={[
            { required: true, message: 'Không được bỏ trống!' },
            {
              validator: (_, value) => {
                if (value.trim() === '') {
                  return Promise.reject('Tên size không được chứa toàn khoảng trắng!')
                }
                return Promise.resolve()
              }
            }
          ]}
        >
          <TextArea rows={4} placeholder='Mô tả voucher' />
        </Form.Item>
        <Form.Item>
          <Button
            disabled={isAdding ? true : false}
            icon={isAdding && <LoadingOutlined />}
            styleClass='!w-full mt-5 py-2'
            type='submit'
          >
            {voucherData._id ? 'Cập nhật voucher' : 'Thêm voucher mới'}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  )
}

export default VoucherAdd
