import { useEffect } from 'react'
import './Autocomplete.scss'
import GeoLoCaTion from '../../utils/geolocation'
import { UseFormSetValue } from 'react-hook-form'

interface Props {
  setValue: UseFormSetValue<any>
  // getValues?: UseFormGetValues<any>
  address?: string
}

const Autocomplete = ({ setValue, address }: Props) => {
  const { lnglat } = GeoLoCaTion()
  // no injected script element; use global goongjs/GoongGeocoder if available
  // const map = useRef(document.createElement('script'))

  const fillAddress = async () => {
    if (address) {
      setValue('address', address)
      const inputEl = document.querySelector<HTMLInputElement>('.mapboxgl-ctrl-geocoder--input')
      if (inputEl) inputEl.value = address
    }
    // const controller = new AbortController()
    // await axios
    //   .get(
    //     `https://rsapi.goong.io/Geocode?latlng=${lnglat.lat},${lnglat.lng}&api_key=BCLZh27rb6GtYXaozPyS16xbZoYw3E1STP7Ckg2P`,
    //     { signal: controller.signal }
    //   )
    //   .then(({ data: { results } }) => {
    //     setValue('address', results[0].formatted_address)
    //     ;(document.querySelector<HTMLInputElement>('.mapboxgl-ctrl-geocoder--input')!.value =
    //       results[0].formatted_address),
    //       controller.abort()
    //   })
  }

  useEffect(() => {
    // Clear any previous ephemeral address value on load
    window.onload = () => {
      localStorage.removeItem('addressDefault')
    }

    // Helper that waits for an element to exist in DOM
    const waitForElement = (selector: string, interval = 100, timeout = 4000) => {
      return new Promise<HTMLElement | null>((resolve) => {
        const start = Date.now()
        const iv = setInterval(() => {
          const el = document.querySelector(selector) as HTMLElement | null
          if (el) {
            clearInterval(iv)
            resolve(el)
          }
          if (Date.now() - start > timeout) {
            clearInterval(iv)
            resolve(null)
          }
        }, interval)
      })
    }

    // When the geocoder control injects its input, normalize it and wire events
    ;(async () => {
      const input = (await waitForElement('.mapboxgl-ctrl-geocoder--input')) as HTMLInputElement | null
      // remove search icon if present
      document.querySelector('.mapboxgl-ctrl-geocoder--icon-search')?.remove()

      if (input) {
        input.setAttribute('placeholder', 'Địa chỉ người nhận')
        input.setAttribute('name', 'address')
        input.setAttribute('autocomplete', 'off')
        input.classList.add('vf-autocomplete-input')

        // ensure we sync value changes into react-hook-form
        const changeHandler = (e: Event) => {
          const target = e.target as HTMLInputElement
          if (setValue) setValue('address', target.value)
        }
        input.removeEventListener('change', changeHandler)
        input.addEventListener('change', changeHandler)
      }

      // Initialize goong map and geocoder directly using global objects
      if (!(window as any).goongjs || !(window as any).GoongGeocoder) {
        // retry shortly if script not yet loaded
        setTimeout(async () => {
          // Try again to init
          if ((window as any).goongjs && (window as any).GoongGeocoder) {
            // eslint-disable-next-line no-console
            console.debug('Goong scripts loaded - initializing autocomplete')
          }
        }, 200)
      } else {
        const goongjs = (window as any).goongjs
        const GoongGeocoder = (window as any).GoongGeocoder
        try { goongjs.accessToken = 'QG9FGuZksX4QOibtVKjBvv7dQcSLpbDqQnajow1S' } catch (e) {}

        // Đảm bảo có phần tử container cho map (một số trang không render map, gây lỗi "Container 'map' not found")
        let mapEl = document.getElementById('map')
        if (!mapEl) {
          mapEl = document.createElement('div')
          mapEl.id = 'map'
          // ẩn container để không ảnh hưởng layout
          mapEl.style.width = '0px'
          mapEl.style.height = '0px'
          mapEl.style.overflow = 'hidden'
          mapEl.style.position = 'absolute'
          mapEl.style.left = '-9999px'
          document.body.appendChild(mapEl)
        }

        const mapObj = new goongjs.Map({ container: 'map' })
        const geocoder = new GoongGeocoder({ accessToken: 'BCLZh27rb6GtYXaozPyS16xbZoYw3E1STP7Ckg2P' })
        const marker = new goongjs.Marker()
        geocoder.addTo('#geocoder')

        geocoder.on('result', function ({ result }: any) {
          const { geometry: { location } } = result.result
          marker.remove()
          localStorage.setItem('addressDefault', JSON.stringify(location))
          marker.setLngLat([location.lng, location.lat]).addTo(mapObj)
          mapObj.flyTo({ center: [location.lng, location.lat], essential: true })
        })

        geocoder.on('clear', function () { localStorage.removeItem('addressDefault') })

        // Try to pre-fill address if provided
        await fillAddress()
      }
    })()
  }, [lnglat])
  return <></>
}

export default Autocomplete
