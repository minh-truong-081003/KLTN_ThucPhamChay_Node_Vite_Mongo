import { useState, useEffect, useRef } from 'react'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaLeaf, FaHeart, FaExclamationTriangle, FaPaperPlane } from 'react-icons/fa'
import HeaderHomePage from '../../components/Header-HomePage'
import FooterHomePage from '../../components/Footer-HomePage'
import ButtonDelivery from '../../components/Button-Delivery'
import Loader from '../../components/Loader'
import { toast } from 'react-toastify'
import axios from 'axios'
import { Helmet } from 'react-helmet-async'

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  subject?: string
  message?: string
}

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const mapRef = useRef<HTMLDivElement>(null)

  // Địa chỉ cửa hàng (có thể thay đổi theo thực tế)
  const storeLocation = {
    lat: 10.8708, // Tọa độ TP Hồ Chí Minh, thay đổi theo địa chỉ thực tế
    lng: 106.8037,
    address: 'Trường Sư phạm Kỹ thuật TP HCM, Khu phố 6, Linh Trung, Thủ Đức, TP Hồ Chí Minh',
    phone: '0123 456 789',
    email: 'contact@vifood.vn',
    hours: '8:00 - 18:00 (Thứ 2 - Chủ nhật)'
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const field = e.target.name
    setTouched((prev) => ({
      ...prev,
      [field]: true
    }))
    validateField(field, formData[field as keyof typeof formData])
  }

  const validateField = (field: string, value: string) => {
    const newErrors: FormErrors = {}

    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Vui lòng nhập họ và tên'
        } else if (value.trim().length < 2) {
          newErrors.name = 'Họ và tên phải có ít nhất 2 ký tự'
        }
        break
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Vui lòng nhập email'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Email không hợp lệ'
        }
        break
      case 'phone':
        if (value.trim() && !/^[+]?[0-9\s()-]{10,}$/.test(value)) {
          newErrors.phone = 'Số điện thoại không hợp lệ'
        }
        break
      case 'subject':
        if (!value.trim()) {
          newErrors.subject = 'Vui lòng chọn chủ đề'
        }
        break
      case 'message':
        if (!value.trim()) {
          newErrors.message = 'Vui lòng nhập nội dung tin nhắn'
        } else if (value.trim().length < 10) {
          newErrors.message = 'Nội dung tin nhắn phải có ít nhất 10 ký tự'
        }
        break
    }

    setErrors((prev) => ({
      ...prev,
      ...newErrors
    }))

    return Object.keys(newErrors).length === 0
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ và tên'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Họ và tên phải có ít nhất 2 ký tự'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (formData.phone.trim() && !/^[+]?[0-9\s()-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Vui lòng chọn chủ đề'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Vui lòng nhập nội dung tin nhắn'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Nội dung tin nhắn phải có ít nhất 10 ký tự'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      subject: true,
      message: true
    })

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin đã nhập!')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await axios.post('/api/contact', formData)

      if (response.data.success) {
        toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.')
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
        setErrors({})
        setTouched({})
      } else {
        throw new Error(response.data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Khởi tạo Goong Map
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (mapRef.current && (window as any).goongjs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).goongjs.accessToken =
        import.meta.env.VITE_GOONG_MAP_ACCESS_TOKEN || 'QG9FGuZksX4QOibtVKjBvv7dQcSLpbDqQnajow1S'

      // Khởi tạo map
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = new (window as any).goongjs.Map({
        container: 'contactMap',
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: [storeLocation.lng, storeLocation.lat],
        zoom: 15
      })

      // Thêm marker tại vị trí cửa hàng
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const marker = new (window as any).goongjs.Marker().setLngLat([storeLocation.lng, storeLocation.lat]).addTo(map)

      // Thêm popup cho marker
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const popup = new (window as any).goongjs.Popup({ offset: 25 })
        .setHTML(`<div style="font-family: Arial, sans-serif; max-width: 200px;">
          <h3 style="margin: 0 0 5px 0; color: #d3b673; font-size: 16px;">VIFOOD</h3>
          <p style="margin: 0; font-size: 14px; color: #666;">${storeLocation.address}</p>
        </div>`)

      marker.setPopup(popup)

      // Thêm controls
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.addControl(new (window as any).goongjs.NavigationControl())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.addControl(new (window as any).goongjs.FullscreenControl())

      // Cleanup function
      return () => {
        map.remove()
      }
    }
  }, [storeLocation.lat, storeLocation.lng, storeLocation.address])

  return (
    <>
      <Helmet>
        <title>Liên Hệ - VIFOOD | Siêu Thị Thực Phẩm Chay Sạch</title>
        <meta
          name='description'
          content='Liên hệ với VIFOOD - Siêu thị thực phẩm chay sạch. Gửi tin nhắn, xem địa chỉ cửa hàng trên bản đồ. Hỗ trợ 24/7.'
        />
        <meta property='og:title' content='Liên Hệ - VIFOOD | Siêu Thị Thực Phẩm Chay Sạch' />
        <meta
          property='og:description'
          content='Liên hệ với VIFOOD để được tư vấn về sản phẩm thực phẩm chay sạch chất lượng cao.'
        />
        <meta property='og:type' content='website' />
        <link rel='canonical' href={window.location.href} />
      </Helmet>
      <Loader />
      <HeaderHomePage />

      {/* Hero Section với background thực phẩm chay */}
      <section className='relative h-[400px] md:h-[500px] overflow-hidden mt-[80px]'>
        {/* Background image với overlay */}
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=600&fit=crop&crop=center')`
          }}
        >
          <div className='absolute inset-0 bg-gradient-to-r from-green-900/80 via-green-800/70 to-emerald-900/80'></div>
          <div className='absolute inset-0 bg-black/30'></div>
        </div>

        {/* Floating elements */}
        <div className='absolute inset-0 overflow-hidden'>
          <div
            className='absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-bounce'
            style={{ animationDelay: '0s' }}
          ></div>
          <div
            className='absolute top-32 right-20 w-12 h-12 bg-[#d3b673]/20 rounded-full animate-bounce'
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className='absolute bottom-32 left-20 w-20 h-20 bg-green-400/20 rounded-full animate-bounce'
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        <div className='relative z-10 h-full flex items-center justify-center px-4'>
          <div className='text-center text-white max-w-4xl mx-auto'>
            <div className='flex items-center justify-center mb-6'>
              <FaLeaf className='text-[#d3b673] text-4xl mr-3 animate-pulse' />
              <h1 className='text-4xl md:text-6xl font-bold animate-fade-in'>Liên Hệ Với Chúng Tôi</h1>
              <FaLeaf className='text-[#d3b673] text-4xl ml-3 animate-pulse' />
            </div>
            <p className='text-xl md:text-2xl mb-8 text-gray-100 animate-fade-in' style={{ animationDelay: '0.3s' }}>
              Hãy chia sẻ ý kiến của bạn về thực phẩm chay sạch
            </p>
            <div
              className='flex items-center justify-center space-x-4 animate-fade-in'
              style={{ animationDelay: '0.6s' }}
            >
              <div className='w-16 h-1 bg-[#d3b673] rounded-full'></div>
              <FaHeart className='text-[#d3b673] text-2xl' />
              <div className='w-16 h-1 bg-[#d3b673] rounded-full'></div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className='absolute bottom-0 left-0 right-0'>
          <svg viewBox='0 0 1200 120' preserveAspectRatio='none' className='w-full h-16 fill-white'>
            <path d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z'></path>
          </svg>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className='py-16 bg-gradient-to-br from-green-50 via-white to-emerald-50'>
        <div className='max-w-6xl mx-auto px-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-start'>
            {/* Contact Form */}
            <div className='bg-white rounded-2xl shadow-xl p-8 border border-green-100'>
              <div className='flex items-center mb-6'>
                <FaEnvelope className='text-[#d3b673] text-2xl mr-3' />
                <h2 className='text-3xl font-bold text-gray-800'>Gửi Tin Nhắn</h2>
              </div>
              <p className='text-gray-600 mb-8'>Chúng tôi luôn sẵn sàng lắng nghe ý kiến của bạn về thực phẩm chay sạch.</p>

              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Name Field */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Họ và tên <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d3b673] focus:border-transparent transition-all duration-200 ${
                      errors.name && touched.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder='Nhập họ và tên của bạn'
                  />
                  {errors.name && touched.name && (
                    <p className='mt-1 text-sm text-red-600 flex items-center'>
                      <FaExclamationTriangle className='mr-1' />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Email <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d3b673] focus:border-transparent transition-all duration-200 ${
                      errors.email && touched.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder='Nhập địa chỉ email của bạn'
                  />
                  {errors.email && touched.email && (
                    <p className='mt-1 text-sm text-red-600 flex items-center'>
                      <FaExclamationTriangle className='mr-1' />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Số điện thoại
                  </label>
                  <input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d3b673] focus:border-transparent transition-all duration-200 ${
                      errors.phone && touched.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder='Nhập số điện thoại (tùy chọn)'
                  />
                  {errors.phone && touched.phone && (
                    <p className='mt-1 text-sm text-red-600 flex items-center'>
                      <FaExclamationTriangle className='mr-1' />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Subject Field */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Chủ đề <span className='text-red-500'>*</span>
                  </label>
                  <select
                    name='subject'
                    value={formData.subject}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d3b673] focus:border-transparent transition-all duration-200 ${
                      errors.subject && touched.subject ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value=''>Chọn chủ đề</option>
                    <option value='general'>Thắc mắc chung</option>
                    <option value='product'>Sản phẩm</option>
                    <option value='order'>Đơn hàng</option>
                    <option value='feedback'>Phản hồi</option>
                    <option value='partnership'>Hợp tác</option>
                  </select>
                  {errors.subject && touched.subject && (
                    <p className='mt-1 text-sm text-red-600 flex items-center'>
                      <FaExclamationTriangle className='mr-1' />
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Nội dung tin nhắn <span className='text-red-500'>*</span>
                  </label>
                  <textarea
                    name='message'
                    value={formData.message}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d3b673] focus:border-transparent transition-all duration-200 resize-none ${
                      errors.message && touched.message ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder='Nhập nội dung tin nhắn của bạn...'
                  />
                  {errors.message && touched.message && (
                    <p className='mt-1 text-sm text-red-600 flex items-center'>
                      <FaExclamationTriangle className='mr-1' />
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full bg-gradient-to-r from-[#d3b673] to-[#b8954a] hover:from-[#b8954a] hover:to-[#d3b673] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl'
                >
                  {isSubmitting ? (
                    <div className='flex items-center justify-center'>
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                      Đang gửi...
                    </div>
                  ) : (
                    <div className='flex items-center justify-center'>
                      <FaPaperPlane className='mr-2' />
                      Gửi Tin Nhắn
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Goong Maps */}
            <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
              <div ref={mapRef} id='contactMap' className='h-[400px] md:h-[500px] w-full'></div>
              <div className='p-6'>
                <h3 className='text-lg font-bold text-[#282828] mb-2'>Tìm Đường Đến Cửa Hàng</h3>
                <p className='text-gray-600 text-sm mb-4'>{storeLocation.address}</p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${storeLocation.lat},${storeLocation.lng}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center text-[#d3b673] hover:text-[#c4a55f] font-medium transition-colors'
                >
                  <FaMapMarkerAlt className='mr-2' />
                  Chỉ đường
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Thông tin liên hệ */}
      <section className='py-16 bg-white'>
        <div className='max-w-6xl mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-800 mb-4'>Thông Tin Liên Hệ</h2>
            <p className='text-gray-600 max-w-2xl mx-auto'>
              Chúng tôi luôn sẵn sàng hỗ trợ bạn với nhiều kênh liên lạc khác nhau
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
            <div className='text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-100'>
              <div className='w-16 h-16 bg-[#d3b673] rounded-full flex items-center justify-center mx-auto mb-4'>
                <FaMapMarkerAlt className='text-2xl text-white' />
              </div>
              <h3 className='font-bold text-lg mb-2'>Địa Chỉ</h3>
              <p className='text-gray-600 text-sm'>{storeLocation.address}</p>
            </div>

            <div className='text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-100'>
              <div className='w-16 h-16 bg-[#d3b673] rounded-full flex items-center justify-center mx-auto mb-4'>
                <FaPhone className='text-2xl text-white' />
              </div>
              <h3 className='font-bold text-lg mb-2'>Điện Thoại</h3>
              <p className='text-gray-600 text-sm'>{storeLocation.phone}</p>
            </div>

            <div className='text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-100'>
              <div className='w-16 h-16 bg-[#d3b673] rounded-full flex items-center justify-center mx-auto mb-4'>
                <FaEnvelope className='text-2xl text-white' />
              </div>
              <h3 className='font-bold text-lg mb-2'>Email</h3>
              <p className='text-gray-600 text-sm'>{storeLocation.email}</p>
            </div>

            <div className='text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-100'>
              <div className='w-16 h-16 bg-[#d3b673] rounded-full flex items-center justify-center mx-auto mb-4'>
                <FaClock className='text-2xl text-white' />
              </div>
              <h3 className='font-bold text-lg mb-2'>Giờ Mở Cửa</h3>
              <p className='text-gray-600 text-sm'>{storeLocation.hours}</p>
            </div>
          </div>
        </div>
      </section>

      <FooterHomePage />
      <ButtonDelivery />
    </>
  )
}

export default ContactPage