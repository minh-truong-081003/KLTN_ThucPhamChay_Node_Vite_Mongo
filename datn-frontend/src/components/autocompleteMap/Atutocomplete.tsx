import { useEffect, useCallback } from 'react'
import './Autocomplete.scss'
import GeoLoCaTion from '../../utils/geolocation'
import { UseFormSetValue } from 'react-hook-form'

interface FormData {
  address: string
}

interface Props {
  setValue: UseFormSetValue<FormData>
  address?: string
}

/* Use global types from `src/types/global.d.ts` to avoid duplicate declarations. */

const Autocomplete = ({ setValue, address }: Props) => {
  const { lnglat } = GeoLoCaTion()

  const fillAddress = useCallback(async () => {
    if (address) {
      setValue('address', address, { shouldDirty: true, shouldValidate: true })
      const inputEl = document.querySelector<HTMLInputElement>(
        '.mapboxgl-ctrl-geocoder--input, .goongjs-ctrl-geocoder--input, .goongjs-ctrl-geocoder__input'
      )
      if (inputEl) inputEl.value = address
    }
  }, [address, setValue])

  useEffect(() => {
    // Clear any previous ephemeral address value on load
    window.onload = () => {
      localStorage.removeItem('addressDefault')
    }

    // Try to immediately populate the form from any cached address so users
    // don't see a blank input while the external geocoder control initializes.
    const populateFromCache = () => {
      const keys = ['checkoutDefaultAddress', 'addressDefault', 'shippingLocation', 'shippingLocationDefault']
      for (const k of keys) {
        const raw = localStorage.getItem(k)
        if (raw) {
          let value = raw
          try {
            value = JSON.parse(raw)
          } catch (e) {
            // not JSON — keep raw
          }
          if (value) {
            try {
              setValue('address', value as any, { shouldDirty: true, shouldValidate: true })
            } catch (e) {
              // ignore
            }
            const existingInput = document.querySelector<HTMLInputElement>(
              '.mapboxgl-ctrl-geocoder--input, .goongjs-ctrl-geocoder--input, .goongjs-ctrl-geocoder__input'
            )
            if (existingInput) existingInput.value = String(value)
            break
          }
        }
      }
    }
    populateFromCache()

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

    const waitForAnySelector = async (selectors: string, interval = 100, timeout = 4000) => {
      return (await waitForElement(selectors, interval, timeout)) as HTMLInputElement | null
    }

    const applyInputAttributes = (input: HTMLInputElement | null) => {
      if (!input) return
      input.setAttribute('placeholder', 'Địa chỉ người nhận')
      input.setAttribute('name', 'address')
      input.setAttribute('autocomplete', 'off')
      input.classList.add('vf-autocomplete-input')

      const changeHandler = (e: Event) => {
        const target = e.target as HTMLInputElement
        if (setValue) setValue('address', target.value, { shouldDirty: true, shouldValidate: true })
      }
      input.removeEventListener('change', changeHandler)
      input.addEventListener('change', changeHandler)
    }

    ;(async () => {
      // Accept either Mapbox or Goong geocoder input classes
      const inputSelector =
        '.mapboxgl-ctrl-geocoder--input, .goongjs-ctrl-geocoder--input, .goongjs-ctrl-geocoder__input'
      const iconSelectors =
        '.mapboxgl-ctrl-geocoder--icon-search, .goongjs-ctrl-geocoder--icon-search, .goongjs-ctrl-geocoder--icon'
      const input = await waitForAnySelector(inputSelector)
      document.querySelector(iconSelectors)?.remove()

      applyInputAttributes(input)

      if (!window.goongjs || !window.GoongGeocoder) {
        setTimeout(async () => {
          if (window.goongjs && window.GoongGeocoder) {
            console.debug('Goong scripts loaded - initializing autocomplete')
          }
        }, 200)
      } else {
        const goongjs = window.goongjs
        const GoongGeocoder = window.GoongGeocoder
        try {
          goongjs.accessToken = 'QG9FGuZksX4QOibtVKjBvv7dQcSLpbDqQnajow1S'
        } catch (e) {
          console.warn('Failed to set access token', e)
        }

        if (window.__goong_autocomplete_initialized) {
          const existing = window.__goong_autocomplete
          const geocoderExisting = existing?.geocoder
          const geocoderContainer = document.getElementById('geocoder')
          const alreadyInContainer = geocoderContainer?.querySelector(
            '.mapboxgl-ctrl-geocoder, .goongjs-ctrl-geocoder, .goongjs-ctrl-geocoder__control'
          )
          if (geocoderExisting && geocoderContainer && !alreadyInContainer) {
            try {
              geocoderExisting.addTo && geocoderExisting.addTo('#geocoder')
            } catch (err) {
              console.warn('Failed to reattach existing geocoder to #geocoder', err)
            }
          }
          await fillAddress()
          return
        }

        let mapEl = document.getElementById('map')
        let createdMapEl = false
        if (!mapEl) {
          mapEl = document.createElement('div')
          mapEl.id = 'map'
          mapEl.style.width = '0px'
          mapEl.style.height = '0px'
          mapEl.style.overflow = 'hidden'
          mapEl.style.position = 'absolute'
          mapEl.style.left = '-9999px'
          document.body.appendChild(mapEl)
          createdMapEl = true
        }

        const mapObj = new goongjs.Map({ container: 'map' })
        const geocoder = new GoongGeocoder({ accessToken: 'BCLZh27rb6GtYXaozPyS16xbZoYw3E1STP7Ckg2P' })
        const marker = new goongjs.Marker()

        window.__goong_autocomplete_initialized = true
        window.__goong_autocomplete = { mapObj, geocoder, marker }

        const geocoderContainer = document.getElementById('geocoder')
        const existingControl = geocoderContainer?.querySelector(
          '.mapboxgl-ctrl-geocoder, .goongjs-ctrl-geocoder, .goongjs-ctrl-geocoder__control'
        )
        if (geocoderContainer && !existingControl) {
          try {
            geocoder.addTo('#geocoder')
          } catch (err) {
            console.warn('Failed to add geocoder to #geocoder', err)
          }
        }

        // Normalize wrapper/input style in case the geocoder control sets inline widths
        const normalizeGeocoderStyles = () => {
          const container = document.getElementById('geocoder')
          const wrapper = container?.querySelector(
            '.mapboxgl-ctrl-geocoder, .goongjs-ctrl-geocoder, .goongjs-ctrl-geocoder__control'
          ) as HTMLElement | null
          const target = (wrapper as HTMLElement) || container
          if (target) {
            try {
              target.style.removeProperty('width')
              target.style.width = '100%'
              target.style.maxWidth = 'none'
              target.style.minWidth = '0'
              target.style.boxSizing = 'border-box'
            } catch (e) {
              // ignore
            }
          }
          const inputAfterNorm = document.querySelector<HTMLInputElement>(
            '.mapboxgl-ctrl-geocoder--input, .goongjs-ctrl-geocoder--input, .goongjs-ctrl-geocoder__input'
          )
          if (inputAfterNorm) {
            try {
              inputAfterNorm.style.removeProperty('width')
              inputAfterNorm.style.width = '100%'
              inputAfterNorm.style.boxSizing = 'border-box'
              if (!inputAfterNorm.style.padding) inputAfterNorm.style.padding = '10px 12px'
            } catch (e) {
              // ignore
            }
          }
        }

        // Ensure input attributes are applied after the control is added
        try {
          const inputAfter = await waitForAnySelector(
            '.mapboxgl-ctrl-geocoder--input, .goongjs-ctrl-geocoder--input, .goongjs-ctrl-geocoder__input',
            100,
            2000
          )
          applyInputAttributes(inputAfter)
          // remove any inline width set by the geocoder control and force 100%
          normalizeGeocoderStyles()
        } catch (err) {
          // ignore
        }

        interface GeocoderResultEvent {
          result?: unknown
        }

        geocoder.on('result', function (e: GeocoderResultEvent) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = (e.result as any) || e
            const geometry = res?.geometry || res?.result?.geometry
            const location = geometry?.location || res?.location
            if (!location) return
            const formatted =
              res?.formatted_address ||
              res?.result?.formatted_address ||
              res?.place_name ||
              res?.address ||
              res?.result?.address ||
              ''
            const inputEl = document.querySelector<HTMLInputElement>(
              '.mapboxgl-ctrl-geocoder--input, .goongjs-ctrl-geocoder--input, .goongjs-ctrl-geocoder__input'
            )
            if (setValue) setValue('address', formatted, { shouldDirty: true, shouldValidate: true })
            if (inputEl && formatted) inputEl.value = formatted

            marker.remove()
            localStorage.setItem('addressDefault', JSON.stringify(location))
            try {
              if (marker && typeof marker.setLngLat === 'function') {
                const maybe = marker.setLngLat([location.lng, location.lat])
                if (maybe && typeof maybe.addTo === 'function') {
                  maybe.addTo(mapObj)
                } else if (typeof marker.addTo === 'function') {
                  marker.addTo(mapObj)
                } else if (marker._leafletMarker && typeof marker._leafletMarker.addTo === 'function') {
                  marker._leafletMarker.addTo(mapObj)
                }
              }
            } catch (e) {
              // ignore marker add failures
            }
            mapObj.flyTo({ center: [location.lng, location.lat], essential: true })
          } catch (err) {
            console.warn('Unhandled geocoder result payload', err)
          }
        })

        geocoder.on('clear', function () {
          localStorage.removeItem('addressDefault')
        })

        await fillAddress()

        const cleanup = () => {
          try {
            marker.remove()
          } catch (e) {
            // Ignore errors when removing marker
          }
          if (createdMapEl) {
            const mapNode = document.getElementById('map')
            if (mapNode && mapNode.parentNode) mapNode.parentNode.removeChild(mapNode)
            window.__goong_autocomplete_initialized = false
            window.__goong_autocomplete = undefined
          }
        }
        window.__goong_autocomplete_cleanup = cleanup
      }
    })()
  }, [lnglat, fillAddress, setValue])
  return <></>
}

export default Autocomplete
