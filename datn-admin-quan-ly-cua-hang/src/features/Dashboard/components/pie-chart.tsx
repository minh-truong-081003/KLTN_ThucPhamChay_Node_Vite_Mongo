import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FD0', '#FF6699'];

export const PieChartSimple = ({ data, title }: PieChartProps) => (
  <div className='w-full h-full bg-white rounded-sm px-5 pt-7.5 pb-5 shadow-default mb-6'>
    {title && <h3 className='text-xl font-semibold text-black mb-4'>{title}</h3>}
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie
          data={data}
          cx='50%'
          cy='50%'
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill='#8884d8'
          dataKey='value'
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => value} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);
