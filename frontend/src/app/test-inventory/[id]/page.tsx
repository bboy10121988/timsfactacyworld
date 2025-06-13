import ProductInventoryTest from "../../../components/ProductInventoryTest"

export default function TestInventoryPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <ProductInventoryTest productId={params.id} />
    </div>
  )
}
