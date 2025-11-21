import { BiLogoGoogle } from 'react-icons/bi'
import { Button, Input } from '../../components'
import { Login, LoginSchema } from '../../validate/Form'

import CardSigin from '../../components/CardSignin'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLoginMutation } from '../../api/Auth'
import { yupResolver } from '@hookform/resolvers/yup'
import { useCreateCartDBMutation } from '../../api/cartDB'
import { useAppSelector } from '../../store/hooks'
import { RootState } from '../../store/store'
import Loader from '../../components/Loader'
import { ClientSocket } from '../../socket'

const Signin = () => {
  const [loginUser] = useLoginMutation()
  const [addCartDbFn] = useCreateCartDBMutation()
  const { items } = useAppSelector((state: RootState) => state.persistedReducer.cart)
  const navigate = useNavigate()
  const location = useLocation()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Login>({
    mode: 'onChange',
    resolver: yupResolver(LoginSchema)
  })

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const error = searchParams.get('error')
    if (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT
      })
    }
  }, [location])
  const onLogin = async (loginData: Login) => {
    await loginUser(loginData).then((data: any) => {
      if (data.error) {
        const errorMessage = data.error.data.message
        if (errorMessage === 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực.') {
          navigate('/verify-otp', { state: { account: loginData.account } })
          return
        }
        return toast.error(errorMessage, {
          position: toast.POSITION.TOP_RIGHT
        })
      } else {
        ClientSocket.JoinRoom(data.data.user._id)
        if (items.length > 0) {
          items.map(async (cart) => {
            cart.items.map(async (item) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { sale, _id, ...rest } = item
              await addCartDbFn({
                name: 'Cart',
                items: [
                  {
                    ...rest,
                    image: rest.image,
                    size: rest.size?._id,
                  }
                ]
              })
            })
          })
        }
      }
    })
  }

  return (
    <>
      <Loader />
      <div className='background-container'>
        <div className='flex items-center justify-center h-full'>
          <div className='content background-content bg-white w-[90vw] md:w-[500px] h-[600px] mx-6 md:px-[100px] py-6 flex justify-center items-center flex-col rounded'>
            <div className='logo'>
              <img src='/logo_th.png' alt='' className='w-[230px] mb-5' />
            </div>
            <form action='' className='flex flex-col w-full' onSubmit={handleSubmit(onLogin)}>
              <Input
                type='auth'
                placeholder='Nhập email của bạn'
                name='account'
                register={register}
                error={errors.account?.message}
                typeInput='text'
              />
              <Input
                type='auth'
                placeholder='Nhập mật khẩu của bạn'
                name='password'
                error={errors.password?.message}
                register={register}
                typeInput='password'
              />
              <div className='text-right mt-4 font-bold text-[#028336] text-sm'>
                <Link to={'/forgot-password'}>Quên mật khẩu?</Link>
              </div>
              <Button type='auth' size='large' shape='circle'>
                Đăng nhập
              </Button>
              <div className='flex justify-center gap-1'>
                <CardSigin
                  bgColor='#dc2626'
                  color='#fafafa'
                  icon={<BiLogoGoogle />}
                  colorHover='#fef2f2'
                  bgColorHover='#991b1b'
                  LoginIn='google'
                />
              </div>
              <div className='gap-x-2 flex items-center justify-center my-5 text-sm'>
                <div>Bạn chưa có tài khoản?</div>
                <div className=' font-semibold'>
                  <Link to='/signup' className='text-[#028336]'>
                    Tạo tài khoản
                  </Link>
                </div>
              </div>
            </form>
            <div>
              <Link to='/' className='text-sm text-[#007bff] hover:underline'>
                Quay lại màn hình chính
              </Link>
            </div>
          </div>
        </div>
        {/* <ToastContainer /> */}
      </div>
    </>
  )
}

export default Signin
