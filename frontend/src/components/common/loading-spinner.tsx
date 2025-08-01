import React from 'react'

const LoadingSpinner: React.FC = () => {
  return (
    <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        載入中...
      </span>
    </div>
  )
}

export default LoadingSpinner
