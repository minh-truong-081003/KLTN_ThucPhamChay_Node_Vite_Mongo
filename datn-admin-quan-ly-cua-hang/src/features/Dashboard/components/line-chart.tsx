import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  dataKey?: string;
}

export const LineChartSimple = ({ data, title, dataKey = 'value' }: LineChartProps) => (
  <div className='w-full h-full bg-white rounded-sm px-5 pt-7.5 pb-5 shadow-default mb-6'>
    {title && <h3 className='text-xl font-semibold text-black mb-4'>{title}</h3>}
    <ResponsiveContainer width='100%' height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='name' />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type='monotone' dataKey={dataKey} stroke='#8884d8' activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
