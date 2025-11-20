import { Button, Input } from '../../components'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useVerifyOtpMutation, useResendOtpMutation } from '../../api/Auth'
import { useEffect, useState } from 'react'
import Loader from '../../components/Loader'

const otpSchema = Yup.object({
  otp: Yup.string().required('Vui lòng nhập mã OTP').length(6, 'Mã OTP phải có 6 chữ số')
})

type OtpForm = Yup.InferType<typeof otpSchema>

const VerifyOtp = () => {
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation()
  const [resendOtp] = useResendOtpMutation()
  const navigate = useNavigate()
  const location = useLocation()
  const account = location.state?.account || ''
  const [canResend, setCanResend] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [resendCount, setResendCount] = useState(0)
  const [isResending, setIsResending] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<OtpForm>({
    resolver: yupResolver(otpSchema)
  })

  useEffect(() => {
    if (!account) {
      navigate('/signup')
      return
    }

    // Show notification when entering the page
    toast.info('Vui lòng nhập mã OTP để xác thực tài khoản.', {
      position: toast.POSITION.TOP_RIGHT
    })

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto resend OTP
          resendOtp({ account })
            .unwrap()
            .then(() => {
              toast.success('Mã OTP đã được gửi lại tự động. Vui lòng kiểm tra email.', {
                position: toast.POSITION.TOP_RIGHT
              })
              setTimeLeft(300)
              setCanResend(false)
            })
            .catch((error) => {
              toast.error(error.data?.message || 'Gửi lại mã OTP thất bại')
            })
          return 300
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [account, navigate, resendOtp])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const onVerify = (data: OtpForm) => {
    verifyOtp({ account, otp: data.otp })
      .unwrap()
      .then(() => {
        toast.success('Xác thực thành công!')
        navigate('/signin')
      })
      .catch((error) => {
        toast.error(error.data?.message || 'Xác thực thất bại')
      })
  }

  const onResend = () => {
    if (resendCount >= 3) {
      toast.error('Bạn đã gửi lại mã OTP tối đa 3 lần. Vui lòng thử lại sau.', {
        position: toast.POSITION.TOP_RIGHT
      })
      return
    }

    setIsResending(true)
    resendOtp({ account })
      .unwrap()
      .then(() => {
        setResendCount((prev) => prev + 1)
        toast.success('Mã OTP đã được gửi lại. Vui lòng kiểm tra email.', {
          position: toast.POSITION.TOP_RIGHT
        })
        setTimeLeft(300)
        setCanResend(false)
      })
      .catch((error) => {
        toast.error(error.data?.message || 'Gửi lại mã OTP thất bại')
      })
      .finally(() => {
        setIsResending(false)
      })
  }

  return (
    <>
      <Loader />
      <div className='background-container'>
        <div className='h-full flex justify-center items-center'>
          <div className='content background-content bg-white w-[90vw] md:w-[500px] h-[500px] px-6 md:px-[100px] py-6 flex justify-center items-center flex-col rounded'>
            <div className='logo'>
              <img src='/logo_th.png' alt='' className='w-[230px] mb-5' />
            </div>
            <h2 className='text-xl font-semibold mb-4'>Xác thực tài khoản</h2>
            <p className='text-center mb-4'>
              Mã OTP đã được gửi đến email: <strong>{account}</strong>
            </p>
            <form action='' className='flex flex-col w-full' onSubmit={handleSubmit(onVerify)}>
              <Input
                type='auth'
                placeholder='Nhập mã OTP 6 chữ số'
                name='otp'
                register={register}
                error={errors.otp?.message}
              />
              <div className='text-center mb-4'>
                <p>Thời gian còn lại: {formatTime(timeLeft)}</p>
              </div>
              <Button type='auth' size='large' shape='circle' disabled={isLoading}>
                {isLoading ? 'Đang xác thực...' : 'Xác thực'}
              </Button>
            </form>
            <div className='flex gap-x-2 justify-center items-center my-5 text-sm'>
              <button
                onClick={onResend}
                disabled={resendCount >= 3 || isResending}
                className={`text-[#028336] ${resendCount >= 3 || isResending ? 'opacity-50 cursor-not-allowed' : 'hover:underline'}`}
              >
                {isResending ? 'Đang gửi...' : `Gửi lại mã (${resendCount}/3)`}
              </button>
            </div>
            <div>
              <Link to='/signup' className='text-sm text-[#007bff] hover:underline'>
                Quay lại đăng ký
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default VerifyOtp
