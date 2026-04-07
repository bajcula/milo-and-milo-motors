'use client'

import { useState } from 'react'

interface ImageGalleryProps {
  imageUrls: string[]
  title: string
}

export default function ImageGallery({ imageUrls, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (imageUrls.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
        No Photos
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden shadow-md">
        <img src={imageUrls[selectedIndex]} alt={title} className="w-full h-full object-cover" />
      </div>
      {imageUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imageUrls.map((url: string, i: number) => (
            <img
              key={i}
              src={url}
              alt={`${title} photo ${i + 1}`}
              onClick={() => setSelectedIndex(i)}
              className={`w-20 h-20 object-cover rounded cursor-pointer flex-shrink-0 border-2 transition-all ${
                i === selectedIndex ? 'border-navy opacity-100' : 'border-transparent opacity-60 hover:opacity-90'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
