import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Table } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items || []
  
  return (
    <div className="space-y-6">
      {/* Clean items table */}
      <div className="bg-white">
        <Table className="w-full">
          {/* Desktop header */}
          <Table.Header className="hidden lg:table-header-group border-b border-gray-200">
            <Table.Row className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              <Table.HeaderCell className="py-4 text-left">
                Product
              </Table.HeaderCell>
              <Table.HeaderCell className="py-4 text-left">
                
              </Table.HeaderCell>
              <Table.HeaderCell className="py-4 text-center">
                Quantity
              </Table.HeaderCell>
              <Table.HeaderCell className="py-4 text-right">
                Unit Price
              </Table.HeaderCell>
              <Table.HeaderCell className="py-4 text-right">
                Total
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          
          <Table.Body className="divide-y divide-gray-100">
            {items.length > 0
              ? items
                  .sort((a, b) => {
                    return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                  })
                  .map((item) => {
                    return (
                      <Item
                        key={item.id}
                        item={item}
                        currencyCode={cart?.currency_code || 'TWD'}
                      />
                    )
                  })
              : repeat(5).map((i) => {
                  return <SkeletonLineItem key={i} />
                })}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}

export default ItemsTemplate
