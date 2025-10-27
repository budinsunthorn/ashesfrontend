import React from 'react'

function DayOfWeekSkeleton() {
  return <div className="panel h-full xl:col-span-2">
                <div className="mb-5">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                </div>
                <div className="relative">
                    <div className="rounded-lg bg-white dark:bg-black p-4">
                        <div className="h-[325px] w-full">
                            {/* Chart Area Skeleton */}
                            <div className="h-full w-full flex flex-col justify-between">
                                {/* Y-axis labels */}
                                <div className="flex justify-between h-full">
                                    <div className="w-12 flex flex-col justify-between">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                                        ))}
                                    </div>
                                    {/* Chart lines */}
                                    <div className="flex-1 flex items-end space-x-2">
                                        {[...Array(7)].map((_, i) => (
                                            <div key={i} className="flex-1">
                                                <div 
                                                    className="bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                                                    style={{
                                                        height: `${Math.random() * 100}%`,
                                                        minHeight: '20px'
                                                    }}
                                                ></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* X-axis labels */}
                                <div className="flex justify-between mt-2">
                                    {[...Array(7)].map((_, i) => (
                                        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
}

export default DayOfWeekSkeleton