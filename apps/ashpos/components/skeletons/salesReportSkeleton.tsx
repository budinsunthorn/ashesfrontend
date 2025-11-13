export default function SalesReportSkeleton() {
    return (
      <div className="bg-white dark:bg-black text-white min-h-screen w-full">
        {/* Header Section */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-black rounded animate-pulse w-32 mb-6"></div>
  
          {/* Report Details */}
          <div className="flex justify-start items-center mb-8">
            <div className="space-y-4 mr-10">
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-12"></div>
                <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-32"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-20"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-40"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-24"></div>
                <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-28"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-8"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-8"></div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Main Financial Table */}
        <div className="bg-white dark:bg-black rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-white dark:bg-black border-b !border-gray-200 dark:border-gray-800">
            <div></div>
            <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-16 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-24 mx-auto"></div>    
            <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-12 mx-auto"></div>
          </div>
  
          {/* Financial Rows */}
          <div className="divide-y divide-slate-600">
            {/* Gross Sales */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-white dark:bg-black border-b !border-gray-200 dark:border-gray-800">
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-20"></div>
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-16 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-12 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-16 mx-auto"></div>
            </div>
  
            {/* Discounts */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-white dark:bg-black border-b !border-gray-200 dark:border-gray-800">
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-16"></div>
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-16 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-4 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-16 mx-auto"></div>
            </div>
  
            {/* Returns */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-white dark:bg-black border-b !border-gray-200 dark:border-gray-800">
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-14"></div>
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-4 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-4 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-4 mx-auto"></div>
            </div>
  
            {/* Net Sales */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-white dark:bg-black border-b !border-gray-200 dark:border-gray-800">
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-18"></div>
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-16 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-16 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-16 mx-auto"></div>
            </div>
  
            {/* Cost of Goods */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-white dark:bg-black border-b !border-gray-200 dark:border-gray-800">
              <div className="h-4 bg-gray-200 dark:bg-[#1c2942] rounded animate-pulse w-24"></div>
              <div className="h-4 bg-gray-200 dark:bg-[#1c2942] rounded animate-pulse w-16 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-[#1c2942] rounded animate-pulse w-16 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-[#1c2942] rounded animate-pulse w-16 mx-auto"></div>
            </div>
  
            {/* Gross Profit */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-white dark:bg-black border-b !border-gray-200 dark:border-gray-800">
              <div className="h-4 bg-gray-200 dark:bg-[#1c2942] rounded animate-pulse w-20"></div>
              <div className="h-4 bg-gray-200 dark:bg-[#1c2942] rounded animate-pulse w-12 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-[#1c2942] rounded animate-pulse w-14 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-[#1c2942] rounded animate-pulse w-14 mx-auto"></div>
            </div>
          </div>
        </div>
  
        {/* Tax Section */}
        <div className="mt-8 bg-white dark:bg-black rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-8"></div>
            <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-12"></div>
          </div>
  
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-40"></div>
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-12"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-44"></div>
              <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-14"></div>
            </div>
          </div>
        </div>
  
        {/* Total Section */}
        <div className="mt-6 bg-white dark:bg-black rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 dark:bg-black rounded animate-pulse w-16"></div>
            <div className="h-6 bg-gray-200 dark:bg-black rounded animate-pulse w-16"></div>
          </div>
        </div>
  
        {/* Bottom Right Watermark Area */}
        <div className="fixed bottom-4 right-4">
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 dark:bg-black rounded animate-pulse w-32 opacity-50"></div>
            <div className="h-3 bg-gray-200 dark:bg-black rounded animate-pulse w-48 opacity-50"></div>
          </div>
        </div>
      </div>
    )
  }
  