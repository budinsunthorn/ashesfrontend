'use client'
import { packageStatusArray } from '@/utils/variables'
import React from 'react'

function PackageStatusBadge({packageStatus}: {packageStatus: keyof typeof packageStatusArray}) {
  return (
    <span className={`px-3 py-0 rounded-full text-sm ${packageStatus == 'ACCEPTED' || packageStatus == 'ACTIVE'
        ? 'bg-success-light text-success dark:bg-success-dark-light'
        : packageStatus == 'PENDING'
        ? 'bg-warning-light text-warning dark:bg-warning-dark-light'
        : packageStatus == 'HOLD' ? 'text-secondary bg-secondary-light dark:bg-secondary-dark-light'
        : 'bg-info-light text-info dark:bg-info-dark-light'}`}>{packageStatusArray[packageStatus]}</span>
  )
}

export default PackageStatusBadge