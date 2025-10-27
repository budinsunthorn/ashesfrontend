import React from 'react'

function Divider({className}: {className?: string}) {
  return (
    <div>
        <hr className={`text-lg dark:border-[#1a1e3b] my-2 ${className}`} />
    </div>
  )
}

export default Divider;
