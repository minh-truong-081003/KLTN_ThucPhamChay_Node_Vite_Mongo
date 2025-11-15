import { Outlet, useLocation } from 'react-router-dom'
import Loader from '../../components/Loader'
import HeaderHomePage from '../../components/Header-HomePage'
import ButtonDelivery from '../../components/Button-Delivery'
import FooterHomePage from '../../components/Footer-HomePage'
import { useEffect } from 'react'

const ClientLayout = () => {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      <Loader />
      <HeaderHomePage />
      <main className="mt-[80px]">
        <Outlet />
      </main>
      <FooterHomePage />
      <ButtonDelivery />
    </>
  )
}

export default ClientLayout
