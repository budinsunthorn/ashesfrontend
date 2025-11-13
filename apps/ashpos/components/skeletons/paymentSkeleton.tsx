export default function PaymentSkeleton() {
    return (
      <div className="bg-white dark:bg-black text-white w-full">
        {/* Header Section */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-32 mb-6"></div>
  
          {/* Report Details */}
          <div className="flex justify-start items-center mb-8">
            <div className="space-y-4 mr-10">
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-12"></div>
                <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-32"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-20"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-40"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-24"></div>
                <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-28"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-8"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-8"></div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Main Financial Table */}
        <div className="bg-white dark:bg-[#1e2943] rounded-lg overflow-hidden w-full">
          {/* Table Header */}
          <div className="flex justify-between items-center bg-gray-200 py-3 dark:bg-[#1e2943] border-b border-gray-200 dark:border-gray-800">
            <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-16 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-24 mx-auto"></div>
          </div>
  
          {/* Financial Rows */}
          <div className="divide-y w-full">
            {/* Gross Sales */}
            <div className="w-full flex justify-between items-center py-5 bg-white dark:bg-black !border-b-[1px] border-gray-100 dark:border-black">
              <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-20"></div>
              <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-16"></div>
            </div>
  
            {/* Discounts */}
            <div className="w-full flex justify-between items-center py-5 bg-white dark:bg-black border-b-[1px] border-gray-100 dark:border-gray-800">
              <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-16"></div>
              <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-16"></div>
            </div>
  
            {/* Returns */}
            <div className="w-full flex justify-between items-center py-5 bg-white dark:bg-black border-b-[1px] border-gray-200 dark:border-gray-800">
              <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-14"></div>
              <div className="h-4 bg-gray-200 dark:bg-[#1e2943] rounded animate-pulse w-4"></div> 
            </div>
          </div>
        </div>
      </div>
    )
  }
  