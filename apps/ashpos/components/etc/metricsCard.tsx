interface MetricCardProps {
    title: string
    value: string
    subtitle?: string
  }
  
  export function MetricCard({ title, value, subtitle }: MetricCardProps) {
    return (
      <div className="panel p-4 border rounded-lg dark:border-[#1b2e4b]">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm text-gray-600">{title}</h3>
          {/* <button className="text-gray-400">•••</button> */}
        </div>
        <p className="text-2xl font-semibold">{value}</p>
        {subtitle && <p className="text-xs text-dark dark:text-white-dark mt-1">{subtitle}</p>}
      </div>
    )
  }
  