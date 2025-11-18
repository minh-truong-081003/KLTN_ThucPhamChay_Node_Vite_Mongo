// About component not used here
import ButtonDelivery from '../../components/Button-Delivery'
import FooterHomePage from '../../components/Footer-HomePage'
import HeaderHomePage from '../../components/Header-HomePage'
import Loader from '../../components/Loader'
import NewProducts from '../../components/New-Products'
// News component not used here
import Popup from '../../components/Popup'
import Sliders from '../../components/Slider'
import ServiceInfo from '../../components/ServiceInfo'
import AboutSection from '../../components/AboutSection'
import { useEffect } from 'react'

const HomePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Loader />
      <HeaderHomePage />
      <Sliders />
      <AboutSection />
      <main className='md:p-5 p-8'>
        <NewProducts />
        {/* <About /> */}
        {/* <News /> */}
      </main>
      <ServiceInfo />
      <FooterHomePage />
      <ButtonDelivery />
      <Popup />
    </>
  )
}

export default HomePage
