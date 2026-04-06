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
      <div className="aspect-[16/9] bg-gray-200 rounded-lg flex items-center justify-center text-black">
        No Photos
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden">
        <img src={imageUrls[selectedIndex]} alt={title} className="w-full h-full object-cover" />
      </div>
      {imageUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {imageUrls.map((url: string, i: number) => (
            <img
              key={i}
              src={url}
              alt={`${title} photo ${i + 1}`}
              onClick={() => setSelectedIndex(i)}
              className={`w-24 h-24 object-cover rounded flex-shrink-0 cursor-pointer ${
                i === selectedIndex ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
