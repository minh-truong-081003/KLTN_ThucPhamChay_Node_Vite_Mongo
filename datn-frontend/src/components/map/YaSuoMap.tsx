import { useEffect, useRef } from 'react'
import '../../StyleMap.css'
import axios from 'axios'
import GeoLoCaTion from '../../utils/geolocation'
import ListStore, { Distance } from '../../interfaces/Map.type'
import { UseFormSetValue } from 'react-hook-form'
import { IUserCheckout } from '../../validate/Form'

interface LngLat {
  lng: number
  lat: number
}

const List: ListStore[] = [
  {
    highName: 'Trường Sư phạm Kỹ thuật TP HCM',
    name: 'Trường Sư phạm Kỹ thuật TP HCM, Khu phố 6, Linh Trung, Thủ Đức, TP Hồ Chí Minh',
    geoLocation: {
      lat: 10.8527907, // Vĩ độ mới
      lng: 106.7725584 // Kinh độ mới
    }
  }
]

interface Props {
  setGapStore?: React.Dispatch<React.SetStateAction<ListStore[]>>
  setPickGapStore?: React.Dispatch<React.SetStateAction<ListStore>>
  setValue: UseFormSetValue<IUserCheckout>
  // getValue: UseFormGetValues<IUserCheckout>
}

const getLocation = () => {
  if (!localStorage.getItem('userLocation')) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        let location: LngLat = {
          lng: 0,
          lat: 0
        }
        location = {
          lng: position.coords.longitude,
          lat: position.coords.latitude
        }
        localStorage.setItem('userLocation', JSON.stringify(location))
      })
    }
  }
}

getLocation()

const YaSuoMap = ({ setValue, setGapStore, setPickGapStore }: Props) => {
  const { lnglat } = GeoLoCaTion()
  const map = useRef(document.createElement('script'))

  const getDistance = async (locate?: { lng: number; lat: number }) => {
    setTimeout(async () => {
      const controller = new AbortController()
      let StorageDistance = localStorage.getItem('location')
        ? JSON.parse(localStorage.getItem('location') as string)
        : JSON.parse(localStorage.getItem('userLocation') as string)

      if (locate) {
        StorageDistance = locate
      }

      await axios
        .get(
          `https://rsapi.goong.io/DistanceMatrix?origins=${StorageDistance?.lat ? StorageDistance.lat : lnglat.lat},${
            StorageDistance?.lng ? StorageDistance.lng : lnglat.lng
          }&destinations=${List[0].geoLocation.lat},${
            List[0].geoLocation.lng
          }&vehicle=car&api_key=BCLZh27rb6GtYXaozPyS16xbZoYw3E1STP7Ckg2P`,
          { signal: controller.signal }
        )
        .then(({ data: { rows } }) => {
          const fetchDistance: Distance[] = rows[0].elements
          const listDistance: ListStore[] = fetchDistance.map((item, index: number) => {
            return { ...List[index], ...item.distance }
          })

          const sortDistance = listDistance.sort((a, b) => {
            return (a.value ?? 0) - (b.value ?? 0)
          })

          if (setGapStore && setPickGapStore) {
            setGapStore(sortDistance)
            setPickGapStore(sortDistance[0])
          }
          controller.abort()
        })
    }, 1000)
  }

  const fillAddress = async (locate?: { lng: number; lat: number }) => {
    let geoDefault = JSON.parse(localStorage.getItem('userLocation') as string)
    if (locate) {
      geoDefault = locate
    }

    const controller = new AbortController()
    await axios
      .get(
        `https://rsapi.goong.io/Geocode?latlng=${geoDefault ? geoDefault.lat : lnglat.lat},${
          geoDefault ? geoDefault.lng : lnglat.lng
        }&api_key=BCLZh27rb6GtYXaozPyS16xbZoYw3E1STP7Ckg2P`,
        { signal: controller.signal }
      )
      .then(({ data: { results } }) => {
        const address = results && results[0] && results[0].formatted_address
        if (address) {
          setValue('shippingLocation', address)
          const input = document.querySelector<HTMLInputElement>('.mapboxgl-ctrl-geocoder--input')
          if (input) input.value = address
        }
        controller.abort()
      })
    if (!locate) {
      await getDistance()
    }
  }

  useEffect(() => {
    window.onload = () => {
      localStorage.removeItem('location')
    }

    // The geocoder control may not be available immediately after script injection.
    // Poll for the input element and then attach attributes and listeners.
    const waitFor = async (selector: string, timeout = 3000) => {
      const start = Date.now()
      return new Promise<HTMLElement | null>((resolve) => {
        const i = setInterval(() => {
          const el = document.querySelector(selector) as HTMLElement | null
          if (el) {
            clearInterval(i)
            resolve(el)
          } else if (Date.now() - start > timeout) {
            clearInterval(i)
            resolve(null)
          }
        }, 200)
      })
    }

    ;(async () => {
      // Accept either Mapbox or Goong geocoder input classes
      const selector = '.mapboxgl-ctrl-geocoder--input, .goongjs-ctrl-geocoder--input, .goongjs-ctrl-geocoder__input'
      const inputEl = (await waitFor(selector, 5000)) as HTMLInputElement | null
      // Remove common icon elements inserted by different geocoder libs
      const iconSelectors = [
        '.mapboxgl-ctrl-geocoder--icon-search',
        '.mapboxgl-ctrl-geocoder--icon',
        '.goongjs-ctrl-geocoder--icon',
        '.goongjs-ctrl-geocoder--icon-search',
        '.goongjs-ctrl-geocoder__icon'
      ]
      iconSelectors.forEach((s) => {
        const el = document.querySelector(s)
        if (el && el.parentNode) el.parentNode.removeChild(el)
      })

      if (inputEl) {
        // Normalize placeholder and clear stray leading characters
        inputEl.setAttribute('placeholder', 'Địa chỉ người nhận')
        inputEl.setAttribute('name', 'shippingLocation')
        inputEl.setAttribute('autoComplete', 'off')
        inputEl.classList.add('yasuo-search')
        // Force padding via inline style so it wins over external CSS
        // Use 48px to leave room for the icon/pseudo-element
        inputEl.style.paddingLeft = inputEl.style.paddingLeft || '48px'
        inputEl.style.position = inputEl.style.position || 'relative'
        // If input contains stray single-letter prefix (seen in some browsers), trim it
        if (inputEl.value && inputEl.value.length === 1 && inputEl.value.toLowerCase() === 's') {
          inputEl.value = ''
        }

        inputEl.addEventListener('input', (e: any) => {
          // keep form in sync as user types
          if (setValue) setValue('shippingLocation', e.target.value)
        })

        inputEl.addEventListener('change', async (e: any) => {
          if (setValue) {
            setValue('shippingLocation', e.target.value)
          }
          await getDistance()
        })
      }

      const groups = document.querySelectorAll('.mapboxgl-ctrl-top-right .mapboxgl-ctrl-group')
      const geoBtn = groups && groups[1]
      if (geoBtn) {
        geoBtn.addEventListener('click', async () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
              await getDistance({ lng: position.coords.longitude, lat: position.coords.latitude })
              await fillAddress({ lng: position.coords.longitude, lat: position.coords.latitude })
            })
          }
        })
      }
    })()

    if (navigator.geolocation) {
      map.current.innerHTML = `
      goongjs.accessToken = "QG9FGuZksX4QOibtVKjBvv7dQcSLpbDqQnajow1S";
      var map = new goongjs.Map({
        container: 'mapCheckout',
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: [${lnglat.lng}, ${lnglat.lat}],
        zoom: 13
      });
      var geocoder = new GoongGeocoder({
        accessToken: "BCLZh27rb6GtYXaozPyS16xbZoYw3E1STP7Ckg2P"
        });

      var marker = new goongjs.Marker();
        geocoder.addTo('#geocoderCheckout');

        // Add geocoder result to container.
        geocoder.on('result', function (e) {
            try {
              // Normalize different possible payload shapes from geocoder
              const result = e?.result || e
              const geometry = result.geometry || result?.result?.geometry
              const location = geometry?.location
              if (!location) return

              marker.remove();
              localStorage.setItem('location', JSON.stringify(location))
              marker
                .setLngLat([location.lng, location.lat])
                .addTo(map)
              map.flyTo({
                center: [location.lng, location.lat],
                essential: true // this animation is considered essential with respect to prefers-reduced-motion
              })
            } catch (err) {
              console.error('Error handling geocoder result', err)
            }
          });

        // Clear results container when search is cleared.
        geocoder.on('clear', function () {
          localStorage.removeItem("location")
        // results.innerText = '';
        });

      map.addControl(new goongjs.NavigationControl());
      map.addControl(
        new goongjs.GeolocateControl({
        positionOptions: {
        enableHighAccuracy: true
      },
        trackUserLocation: true,
      })
      );
       map.on("load",()=>{
        if(localStorage.getItem("userLocation")){
          marker.remove();
          map.flyTo({
            center: [
              JSON.parse(localStorage.getItem('userLocation')).lng,
              JSON.parse(localStorage.getItem('userLocation')).lat,
            ],
            essential: true // this animation is considered essential with respect to prefers-reduced-motion
          });
          marker
            .setLngLat([
              JSON.parse(localStorage.getItem('userLocation')).lng,
              JSON.parse(localStorage.getItem('userLocation')).lat,])
              .addTo(map)
        }else{
          if (navigator.geolocation) {
            marker.remove();
            navigator.geolocation.getCurrentPosition((position) => {
                localStorage.setItem("userLocation",JSON.stringify(
                  {
                    lng:position.coords.longitude,
                    lat:position.coords.latitude
                  }
                ))
                map.flyTo({
                   center: [
                    position.coords.longitude,
                    position.coords.latitude
                   ],
                   essential: true // this animation is considered essential with respect to prefers-reduced-motion
               });
               marker
                 .setLngLat([position.coords.longitude,position.coords.latitude]).addTo(map)
            });
          }
        }

       }); `
    }
    if ((lnglat.lat > 0 && lnglat.lng > 0) || localStorage.getItem('userLocation')) {
      getDistance()
      fillAddress()
    }
    // getDistance()

    document.body.appendChild(map.current)
  }, [lnglat])
  return <></>
}

export default YaSuoMap
