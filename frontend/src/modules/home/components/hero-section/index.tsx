"use client"

import Hero from "../hero"
import type { MainBanner } from "@lib/sanity"

type HeroSectionProps = {
  banner: MainBanner
}

const HeroSection = ({ banner }: HeroSectionProps) => {
  if (!banner.slides || banner.slides.length === 0) {
    return null
  }
  
  return (
    <section className="w-full">
      <div className="mb-4 last:mb-0">
        <Hero
          slides={banner.slides.map(slide => ({
            heading: slide.heading,
            subheading: slide.subheading || "",
            backgroundImage: slide.backgroundImage,
            buttonText: slide.buttonText || "",
            buttonLink: slide.buttonLink || ""
          }))}
          settings={banner.settings}
        />
      </div>
    </section>
  )
}

export default HeroSection
