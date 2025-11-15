import { BarChartSimple, MonthlyRevenue } from './components'
import { PieChartSimple } from './components/pie-chart'
import { LineChartSimple } from './components/line-chart'
import { CardFour, CardThree, CardTwo } from '~/components'
import { useGetAnalystQuery, useGetAnalyticsQuery, useGetAnalystMonthQuery } from '~/store/services'

import { CardOne } from '~/components/Cart/CardOne'
import { Loader } from '~/common'
import { ProductAnalytic } from './components/product-analytic'
import { Table } from 'antd'

const FeatureDashboard = () => {
  const { data: dataAnalytics, isLoading: loadingTotalMoneys, isError: errorAnalytics } = useGetAnalyticsQuery()
  const { data: dataAnalytics2, isLoading: loadingTotalMoneys2, isError: errorAnalytics2 } = useGetAnalystQuery()
  const { data: analyticMonths } = useGetAnalystMonthQuery()

  if (loadingTotalMoneys || loadingTotalMoneys2) return <Loader />

  if (errorAnalytics || errorAnalytics2) return <div>error</div>

  if (!dataAnalytics || !dataAnalytics2) return <Loader />

  // Debug logs to inspect API payloads in browser console
  // eslint-disable-next-line no-console
  console.debug('DATA_ANALYTICS:', dataAnalytics)
  // eslint-disable-next-line no-console
  console.debug('DATA_ANALYST:', dataAnalytics2)
  // eslint-disable-next-line no-console
  console.debug('DATA_ANALYTIC_MONTHS:', analyticMonths)

  // Dữ liệu thật cho Pie chart: Tỷ lệ trạng thái đơn hàng
  const statusMap: Record<string, string> = {
    pending: 'Đang xử lý',
    confirmed: 'Đã xác nhận',
    done: 'Đã hoàn thành',
    canceled: 'Đã hủy',
    cancel: 'Đã hủy'
  }

  const pieDataOrderStatus = (dataAnalytics.countOrderStatus || []).map((item: any) => ({
    name: statusMap[item.name] || item.name || 'Khác',
    value: item.value || 0
  }))

  // Dữ liệu thật cho Line chart: Doanh thu từng năm
  let lineDataRevenueByYear: { name: string; value: number }[] = []

  if (dataAnalytics2 && (dataAnalytics2 as any).revenueByYear) {
    lineDataRevenueByYear = Object.entries((dataAnalytics2 as any).revenueByYear).map(([year, value]) => ({ name: year, value: value as number }))
  } else if (analyticMonths && Array.isArray(analyticMonths.orders)) {
    const yearsEntry = analyticMonths.orders.find((o: any) => o.name === 'years')
    if (yearsEntry && Array.isArray(yearsEntry.analytics)) {
      const totalsByYear: Record<string, number> = {}
      yearsEntry.analytics.forEach((status: any) => {
        if (!Array.isArray(status.analytics)) return
        status.analytics.forEach((a: any) => {
          const key = a.month ?? a.week ?? a.year ?? String(a.label ?? a.name ?? '')
          if (!key) return
          totalsByYear[key] = (totalsByYear[key] || 0) + (a.totalRevenue || 0)
        })
      })
      lineDataRevenueByYear = Object.entries(totalsByYear).map(([name, value]) => ({ name, value }))
      // Sort by year if numeric
      lineDataRevenueByYear.sort((a, b) => Number(a.name) - Number(b.name))
    }
  }

  if (lineDataRevenueByYear.length === 0 && dataAnalytics2 && dataAnalytics2['doanh thu tháng này']) {
    // Fallback: Sử dụng trường 'tổng doanh thu' từ log
    lineDataRevenueByYear = [
      {
        name: 'Tháng này',
        value: dataAnalytics2['doanh thu tháng này']?.['tổng doanh thu'] || 0
      }
    ]
  }

  // Debug log for line chart data
  // eslint-disable-next-line no-console
  console.debug('LINE_DATA_REVENUE_BY_YEAR:', lineDataRevenueByYear)

  return (
    <>
      <div className='grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5'>
        <ProductAnalytic dataAnalytics2={dataAnalytics2} dataAnalytics={dataAnalytics} />
        <CardThree data={dataAnalytics} data2={dataAnalytics2} />
        <CardFour data={dataAnalytics.users} />
      </div>

      {/* Add spacing between Tổng quan and Tỷ lệ trạng thái đơn hàng */}
      <div className='mb-6'>
        <MonthlyRevenue data={dataAnalytics2} />
        <BarChartSimple data={dataAnalytics} />
      </div>

      <div className='mb-6'>
        <PieChartSimple data={pieDataOrderStatus} title='Tỷ lệ trạng thái đơn hàng' />
      </div>

      <div className='mb-6'>
        {lineDataRevenueByYear && lineDataRevenueByYear.length > 0 ? (
          <LineChartSimple data={lineDataRevenueByYear} title='Doanh thu từng năm' />
        ) : (
          <div className='w-full bg-white rounded-sm px-5 pt-7.5 pb-5 shadow-default mb-6 text-center text-gray-500'>
            Không có dữ liệu doanh thu theo năm để hiển thị
          </div>
        )}
      </div>
    </>
  )
}

export default FeatureDashboard
