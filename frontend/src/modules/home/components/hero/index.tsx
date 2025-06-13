"use client"

import { Button, Heading } from "@medusajs/ui"
import { getHomeHero } from "@lib/sanity"
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
      {slide.backgroundImage && (
        <div className="relative aspect-[21/9] small:aspect-[16/9]">
          <Image
            src={slide.backgroundImage}
            alt={`${slide.heading} - ${slide.subheading}`}
            fill
            className="object-cover transition-all duration-700 ease-in-out transform hover:scale-[1.02]"
            sizes="100vw"
            priority
          />
        </div>
      )}
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center p-4 md:p-16 lg:p-32 gap-6 bg-gradient-to-b from-black/10 via-black/30 to-black/50">
        <span>
          <Heading
            level="h1"
            className="text-heading-1 text-white font-heading text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6"
            style={{
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              letterSpacing: "var(--letter-spacing-tight)"
            }}
          >
            {slide.heading}
          </Heading>
          {slide.subheading && (
            <Heading
              level="h2"
              className="text-heading-2 text-white/95 text-xl md:text-2xl lg:text-3xl font-light mb-10"
              style={{
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                letterSpacing: "var(--letter-spacing-wide)"
              }}
            >
              {slide.subheading}
            </Heading>
          )}
        </span>
        {slide.buttonText && slide.buttonLink && (
          <Button asChild variant="secondary" 
            className="btn bg-white hover:bg-white/90 text-gray-900 px-8 py-3 text-base md:text-lg font-medium rounded-lg 
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

      {settings.showArrows && slides.length > 1 && (
        <>
          <button
            onClick={goToPrevSlide}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 group"
            aria-label="上一張圖片"
          >
            ←
          </button>
          <button
            onClick={goToNextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-lg transition-colors"
            aria-label="下一張圖片"
          >
            →
          </button>
        </>
      )}

      {settings.showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? "bg-white" : "bg-white/50"
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
