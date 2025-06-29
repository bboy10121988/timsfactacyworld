import React from "react"

import Nav from "@modules/layout/templates/nav"

const 204Layout: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <div>
      <Nav />
      <main className="relative">{children}</main>
    </div>
  )
}

export default Layout
