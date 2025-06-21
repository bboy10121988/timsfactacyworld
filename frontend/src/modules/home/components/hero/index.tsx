"use client"

import { Button, Heading } from "@medusajs/ui"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

type Slide = {
  heading: string
  subheading: string
  backgroundImage: string
  buttonText: string
  buttonLink: string
}

type Settings = {
  autoplay: boolean
  autoplaySpeed: number
  showArrows: boolean
  showDots: boolean
}

type HeroProps = {
  slides: Slide[]
  settings: Settings
}

const Hero = ({ slides, settings }: HeroProps) => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (slides.length <= 1 || !settings.autoplay) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, settings.autoplaySpeed * 1000) // 將秒轉換為毫秒

    return () => clearInterval(interval)
  }, [slides.length, settings.autoplay, settings.autoplaySpeed])

  if (!slides.length) return null

  const slide = slides[currentSlide]

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className="relative w-full">
      {/* 輪播圖片容器 - 調整高度比例及響應式設計 */}
      <div className="relative aspect-[16/11] xs:aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] overflow-hidden">
        {slides.map((slideItem, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {slideItem.backgroundImage && (
              <Image
                src={slideItem.backgroundImage}
                alt={`${slideItem.heading} - ${slideItem.subheading}`}
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 100vw"
                priority={index === 0}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* 內容覆蓋層 - 優化手機版顯示 */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end sm:justify-center items-center text-center p-4 pb-16 sm:p-16 md:p-16 lg:p-32 gap-3 sm:gap-6 bg-gradient-to-b from-black/10 via-black/30 to-black/60">
        <div 
          key={currentSlide}
          className="animate-fade-in-content max-w-[90%] sm:max-w-4xl"
        >
          <Heading
            level="h1"
            className="text-heading-1 text-white font-heading text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-2 sm:mb-6"
            style={{
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              letterSpacing: "var(--letter-spacing-tight)"
            }}
          >
            {slide.heading}
          </Heading>
          {slide.subheading && (
            <Heading
              level="h2"
              className="text-heading-2 text-white/95 text-sm sm:text-xl md:text-2xl lg:text-3xl font-light mb-4 sm:mb-10"
              style={{
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                letterSpacing: "var(--letter-spacing-wide)"
              }}
            >
              {slide.subheading}
            </Heading>
          )}
          {slide.buttonText && slide.buttonLink && (
            <Button asChild variant="secondary" 
              className="btn bg-white hover:bg-white/90 text-gray-900 px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base md:text-lg font-medium rounded-lg 
                shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              style={{
                letterSpacing: "var(--letter-spacing-wide)",
                fontFamily: "var(--font-base)"
              }}
            >
              <Link href={slide.buttonLink}>{slide.buttonText}</Link>
            </Button>
          )}
        </div>
      </div>

      {/* 點點導航 - 改進響應式樣式 */}
      {settings.showDots && slides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 sm:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "bg-white scale-110 shadow-lg" 
                  : "bg-white/60 hover:bg-white/80 scale-100"
              }`}
              aria-label={`前往第 ${index + 1} 張圖片`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Hero
