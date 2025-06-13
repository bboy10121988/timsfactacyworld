import { Product } from "@medusajs/medusa"
import Image from "next/image"

interface ImageGalleryTabProps {
  product: Product
}

const ImageGalleryTab = ({ product }: ImageGalleryTabProps) => {
  if (!product.images || product.images.length === 0) {
    return (
      <div className="text-small-regular py-8">
        <div className="text-center py-4">
          <p>此商品暫無圖片</p>
        </div>
      </div>
    )
  }

  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {product.images.map((image, index) => (
          <div 
            key={image.id} 
            className="aspect-square relative group cursor-pointer hover:opacity-75 transition-opacity duration-200"
          >
            <Image
              src={image.url}
              alt={`商品圖片 ${index + 1}`}
              fill
              className="object-cover rounded-md"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading={index === 0 ? "eager" : "lazy"}
            />
            <div className="absolute bottom-2 right-2 bg-white/70 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {index + 1}/{product.images.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageGalleryTab
