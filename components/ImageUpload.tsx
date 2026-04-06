'use client'

import { createClient } from '@/lib/supabase/browser'
import { useState } from 'react'

interface ImageUploadProps {
  existingUrls: string[]
  onUrlsChange: (urls: string[]) => void
}

export default function ImageUpload({ existingUrls, onUrlsChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newUrls: string[] = [...existingUrls]

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

      const { error } = await supabase.storage
        .from('car-images')
        .upload(fileName, file)

      if (error) {
        console.error('Upload error:', error.message)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(fileName)

      newUrls.push(publicUrl)
    }

    onUrlsChange(newUrls)
    setUploading(false)
  }

  function removeImage(index: number) {
    const updated = existingUrls.filter((_, i) => i !== index)
    onUrlsChange(updated)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-black mb-1">Photos</label>

      {existingUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {existingUrls.map((url, i) => (
            <div key={i} className="relative w-24 h-24">
              <img src={url} alt="" className="w-full h-full object-cover rounded" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        disabled={uploading}
        className="block w-full text-sm text-black file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {uploading && <p className="text-sm text-black mt-1">Uploading...</p>}
    </div>
  )
}
