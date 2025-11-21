import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaStar, FaFilter, FaTimes } from 'react-icons/fa'
import { IQueryConfig } from '../../hook/useQueryConfig'

interface ProductFilterProps {
  queryConfig: IQueryConfig
}

const ProductFilter = ({ queryConfig }: ProductFilterProps) => {
  const navigate = useNavigate()
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(1000000)
  const [rating, setRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>(queryConfig.sortBy || '')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (queryConfig.priceRange) {
      const [min, max] = queryConfig.priceRange.split('-').map(Number)
      setMinPrice(min)
      setMaxPrice(max)
    } else {
      // Reset về giá trị mặc định khi không có priceRange
      setMinPrice(0)
      setMaxPrice(1000000)
    }
    setRating(Number(queryConfig.rating) || 0)
    setSortBy(queryConfig.sortBy || '')
  }, [queryConfig])

  const sortOptions = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Giá: Thấp → Cao', value: 'price-asc' },
    { label: 'Giá: Cao → Thấp', value: 'price-desc' },
    { label: 'Bán chạy', value: 'bestseller' }
  ]

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}tr`
    if (price >= 1000) return `${(price / 1000).toFixed(0)}.000`
    return `${price}`
  }

  const _applyFilters = (immediate = false) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const updateFilters = () => {
      const params: any = {
        _page: '1',
        limit: queryConfig.limit || '6'
      }

      if (queryConfig.c && queryConfig.c !== 'all') params.c = queryConfig.c
      if (queryConfig.searchName) params.searchName = queryConfig.searchName

      if (minPrice > 0 || maxPrice < 1000000) {
        params.priceRange = `${minPrice}-${maxPrice}`
      }

      if (rating > 0) params.rating = rating.toString()
      if (sortBy) params.sortBy = sortBy

      const searchParams = new URLSearchParams(params).toString()
      navigate(`/products?${searchParams}`)
    }

    if (immediate) {
      updateFilters()
    } else {
      timeoutRef.current = setTimeout(updateFilters, 300)
    }
  }

  const handlePriceChange = (newMin: number, newMax: number, immediate = false) => {
    if (newMin <= newMax && newMax >= newMin) {
      setMinPrice(newMin)
      setMaxPrice(newMax)

      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      const updateFn = () => {
        const params: any = {
          _page: '1',
          limit: queryConfig.limit || '6'
        }
        if (queryConfig.c && queryConfig.c !== 'all') params.c = queryConfig.c
        if (queryConfig.searchName) params.searchName = queryConfig.searchName
        if (newMin > 0 || newMax < 1000000) params.priceRange = `${newMin}-${newMax}`
        if (rating > 0) params.rating = rating.toString()
        if (sortBy) params.sortBy = sortBy

        navigate(`/products?${new URLSearchParams(params).toString()}`)
      }

      if (immediate) {
        updateFn()
      } else {
        timeoutRef.current = setTimeout(updateFn, 300)
      }
    }
  }

  const handleRatingChange = (val: number) => {
    setRating(val)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    const params: any = {
      _page: '1',
      limit: queryConfig.limit || '6'
    }
    if (queryConfig.c && queryConfig.c !== 'all') params.c = queryConfig.c
    if (queryConfig.searchName) params.searchName = queryConfig.searchName
    if (minPrice > 0 || maxPrice < 1000000) params.priceRange = `${minPrice}-${maxPrice}`
    if (val > 0) params.rating = val.toString()
    if (sortBy) params.sortBy = sortBy

    timeoutRef.current = setTimeout(() => {
      navigate(`/products?${new URLSearchParams(params).toString()}`)
    }, 300)
  }

  const handleSortChange = (val: string) => {
    setSortBy(val)

    const params: any = {
      _page: '1',
      limit: queryConfig.limit || '6'
    }
    if (queryConfig.c && queryConfig.c !== 'all') params.c = queryConfig.c
    if (queryConfig.searchName) params.searchName = queryConfig.searchName
    if (minPrice > 0 || maxPrice < 1000000) params.priceRange = `${minPrice}-${maxPrice}`
    if (rating > 0) params.rating = rating.toString()
    if (val) params.sortBy = val

    navigate(`/products?${new URLSearchParams(params).toString()}`)
  }

  const clearFilters = () => {
    setMinPrice(0)
    setMaxPrice(1000000)
    setRating(0)
    setSortBy('')

    const params: any = {
      _page: '1',
      limit: queryConfig.limit || '6'
    }
    if (queryConfig.c && queryConfig.c !== 'all') params.c = queryConfig.c
    if (queryConfig.searchName) params.searchName = queryConfig.searchName

    const searchParams = new URLSearchParams(params).toString()
    navigate(`/products?${searchParams}`)
  }

  const hasActiveFilters = minPrice > 0 || maxPrice < 1000000 || rating > 0 || sortBy

  return (
    <div className='bg-white rounded-sm p-3 shadow-sm'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <FaFilter className='text-[#d3b673]' size={14} />
          <h3 className='font-semibold text-gray-800 text-sm'>Bộ lọc</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className='text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors'
          >
            <FaTimes size={10} />
            Xóa
          </button>
        )}
      </div>

      {/* Sort By */}
      <div className='mb-3 pb-3 border-b border-gray-200'>
        <label className='block text-xs font-medium text-gray-700 mb-2'>
          Sắp xếp{' '}
          {sortBy && <span className='text-[#d3b673]'>({sortOptions.find((o) => o.value === sortBy)?.label})</span>}
        </label>
        <div className='grid grid-cols-2 gap-1.5'>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`text-xs py-1.5 px-2 rounded border transition-all duration-200 ${
                sortBy === option.value
                  ? 'bg-[#d3b673] text-white border-[#d3b673] shadow-sm font-medium'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#d3b673] hover:shadow-sm'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className='mb-3 pb-3 border-b border-gray-200'>
        <label className='block text-xs font-medium text-gray-700 mb-2'>
          Khoảng giá:{' '}
          <span className='text-[#d3b673] font-semibold'>
            {formatPrice(minPrice)}đ - {formatPrice(maxPrice)}đ
          </span>
        </label>

        {/* Quick Price Selection Buttons */}
        <div className='grid grid-cols-3 gap-1.5 mb-3'>
          <button
            onClick={() => handlePriceChange(0, 100000, true)}
            className={`text-xs py-1.5 px-1 rounded border transition-all ${
              minPrice === 0 && maxPrice === 100000
                ? 'bg-[#d3b673] text-white border-[#d3b673]'
                : 'bg-white text-gray-600 border-gray-300 hover:border-[#d3b673]'
            }`}
          >
            &lt;100.000đ
          </button>
          <button
            onClick={() => handlePriceChange(100000, 500000, true)}
            className={`text-xs py-1.5 px-1 rounded border transition-all ${
              minPrice === 100000 && maxPrice === 500000
                ? 'bg-[#d3b673] text-white border-[#d3b673]'
                : 'bg-white text-gray-600 border-gray-300 hover:border-[#d3b673]'
            }`}
          >
            100.000-500.000đ
          </button>
          <button
            onClick={() => handlePriceChange(500000, 1000000, true)}
            className={`text-xs py-1.5 px-1 rounded border transition-all ${
              minPrice === 500000 && maxPrice === 1000000
                ? 'bg-[#d3b673] text-white border-[#d3b673]'
                : 'bg-white text-gray-600 border-gray-300 hover:border-[#d3b673]'
            }`}
          >
            &gt;500.000đ
          </button>
        </div>

        {/* Dual Range Slider Container */}
        <div className='relative pt-1 pb-6'>
          <div className='relative h-1.5'>
            {/* Background Track */}
            <div className='absolute w-full h-1.5 bg-gray-200 rounded-lg'></div>

            {/* Active Range Track */}
            <div
              className='absolute h-1.5 bg-[#d3b673] rounded-lg'
              style={{
                left: `${(minPrice / 1000000) * 100}%`,
                right: `${100 - (maxPrice / 1000000) * 100}%`
              }}
            ></div>

            {/* Min Range Input */}
            <input
              type='range'
              min='0'
              max='1000000'
              step='10000'
              value={minPrice}
              onChange={(e) => handlePriceChange(Number(e.target.value), maxPrice)}
              className='absolute w-full h-1.5 bg-transparent appearance-none cursor-pointer pointer-events-none dual-range-min'
            />

            {/* Max Range Input */}
            <input
              type='range'
              min='0'
              max='1000000'
              step='10000'
              value={maxPrice}
              onChange={(e) => handlePriceChange(minPrice, Number(e.target.value))}
              className='absolute w-full h-1.5 bg-transparent appearance-none cursor-pointer pointer-events-none dual-range-max'
            />
          </div>

          {/* Price Labels */}
          <div className='flex justify-between text-[10px] text-gray-500 mt-3'>
            <span className='font-medium text-gray-700'>{formatPrice(minPrice)}đ</span>
            <span className='font-medium text-gray-700'>{formatPrice(maxPrice)}đ</span>
          </div>
        </div>
      </div>

      {/* Rating Slider */}
      <div className='mb-1'>
        <label className='block text-xs font-medium text-gray-700 mb-2'>
          Đánh giá:{' '}
          {rating > 0 ? (
            <span className='text-[#d3b673] font-semibold'>{rating}★+</span>
          ) : (
            <span className='text-gray-500'>Tất cả</span>
          )}
        </label>
        <input
          type='range'
          min='0'
          max='5'
          step='1'
          value={rating}
          onChange={(e) => handleRatingChange(Number(e.target.value))}
          className='w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb'
          style={{
            background: `linear-gradient(to right, #d3b673 0%, #d3b673 ${(rating / 5) * 100}%, #e5e7eb ${(rating / 5) * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className='flex justify-between mt-2 px-1'>
          {[0, 1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingChange(star)}
              className={`transition-all duration-200 ${
                star <= rating && star > 0 ? 'scale-110' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <FaStar
                className={`transition-colors duration-200 ${
                  star <= rating && star > 0 ? 'text-yellow-400' : 'text-gray-300'
                }`}
                size={star === 0 ? 10 : 14}
              />
            </button>
          ))}
        </div>
      </div>

      <style>{`
        /* Dual Range Slider Styles */
        .dual-range-min::-webkit-slider-thumb,
        .dual-range-max::-webkit-slider-thumb {
          appearance: none;
          pointer-events: all;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #d3b673;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        
        .dual-range-min::-webkit-slider-thumb:hover,
        .dual-range-max::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }

        .dual-range-min::-moz-range-thumb,
        .dual-range-max::-moz-range-thumb {
          pointer-events: all;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #d3b673;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }

        .dual-range-min::-moz-range-thumb:hover,
        .dual-range-max::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }

        /* Rating Slider */
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #d3b673;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        .slider-thumb::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #d3b673;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  )
}

export default ProductFilter
