import React from 'react'

function CategoryBySalesChartSkeleton() {
  return (
    <div>
        {/* Donut Chart Skeleton */}
        <div className="panel h-full">
            <div className="mb-5">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4 animate-pulse"></div>
            </div>
            <div className="rounded-lg bg-white dark:bg-black p-4">
                <div className="h-[460px] w-full flex items-center justify-center">
                    <div className="relative w-52 h-52">
                        {/* Donut segments */}
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute inset-0 rounded-full border-8 border-gray-200 dark:border-gray-700 animate-pulse"
                                style={{
                                    transform: `rotate(${i * 90}deg)`,
                                    clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0)'
                                }}
                            ></div>
                        ))}
                        {/* Center circle */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 rounded-full bg-white dark:bg-black"></div>
                        </div>
                    </div>
                </div>
                {/* Legend */}
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center">
                            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full mr-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  )
}

export default CategoryBySalesChartSkeleton