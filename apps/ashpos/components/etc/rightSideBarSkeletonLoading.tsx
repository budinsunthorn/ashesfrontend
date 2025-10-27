export default function RightSideBarSkeletonLoading() {
    return (
      <div className="w-full max-w-3xl mx-auto">
        {/* Status Header */}
        <div className="w-24 h-6 mb-6 bg-blue-100 animate-pulse" />
  
        {/* Transfer Details Section */}
        <div className="mb-8">
          <h2 className="w-32 h-6 mb-4 bg-gray-200 rounded animate-pulse" />
          
          <div className="space-y-4">
            {/* Created At Row */}
            <div className="flex justify-between items-center">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
  
            {/* Received At Row */}
            <div className="flex justify-between items-center">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
  
            {/* Transfer ID Row */}
            <div className="flex justify-between items-center">
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
  
            {/* Last Synced At Row */}
            <div className="flex justify-between items-center">
              <div className="w-28 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
  
            {/* Transfer Type Row */}
            <div className="flex justify-between items-center">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
  
            {/* From Name Row */}
            <div className="flex justify-between items-center">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-48 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
  
            {/* From License Number Row */}
            <div className="flex justify-between items-center">
              <div className="w-36 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
  
            {/* Marijuana Transfer Row */}
            <div className="flex justify-between items-center">
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
  
            {/* Supplier Row */}
            <div className="flex justify-between items-center">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-48 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
  
            {/* Total Packages Row */}
            <div className="flex justify-between items-center">
              <div className="w-28 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
  
            {/* Received Date Row */}
            <div className="flex justify-between items-center">
              <div className="w-28 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
  
            {/* Total Cost Row */}
            <div className="flex justify-between items-center">
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
  
        {/* Packages Section */}
        <div>
          <h2 className="w-24 h-6 mb-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-full h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }
  
  