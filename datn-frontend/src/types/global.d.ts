export {}

declare global {
  interface Window {
    __yasuo_refresh?: () => Promise<void>
    __yasuo_map_initialized?: boolean
    __yasuo_map?: any
    __yasuo_marker?: any
    __yasuo_map_ready?: boolean
    __yasuo_pending_location?: string
    goongjs?: any
    GoongGeocoder?: any
    goong?: any
    __goong_autocomplete_initialized?: boolean
    __goong_autocomplete?:
      | {
          mapObj: any
          geocoder: any
          marker: any
        }
      | undefined
    __goong_autocomplete_cleanup?: (() => void) | undefined
    L?: any
  }
}
