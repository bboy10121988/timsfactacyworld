"use client"

import React from "react"

const FooterClient = () => {
  return (
    <footer className="border-t border-gray-200">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">TIMS HAIR SALON</h3>
            <p className="text-gray-600 text-sm">專業美髮沙龍與高級美髮產品</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} TIMS HAIR SALON. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default FooterClient
