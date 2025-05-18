import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
export function ChartContent({ chart }: { chart: { labels: string[]; datasets: { label: string; data: number[] }[] } }) {
  const data = chart.labels.map((label, idx) => ({
    name: label,
    ...chart.datasets.reduce((acc, ds) => ({ ...acc, [ds.label]: ds.data[idx] }), {})
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        {chart.datasets.map(ds => (
          <Bar key={ds.label} dataKey={ds.label} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
