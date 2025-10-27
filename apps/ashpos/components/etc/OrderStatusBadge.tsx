import React from 'react'

function OrderStatusBadge({status, className} : {status: string | undefined; className?: string}) {
  return (
    <span className={`badge text-[10px] ${className}  ${status == 'PAID' ? "bg-success-light text-success dark:bg-success-dark-light" : status == "EDIT" ? "bg-info-light text-info dark:bg-info-dark-light" : "bg-warning-light text-warning dark:bg-warning-dark-light"}`}>{status}</span>
  )
}

export default OrderStatusBadge