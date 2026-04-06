'use client'

import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'

export default function NewCarForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const title = form.get('title') as string
    const description = form.get('description') as string
    const year = parseInt(form.get('year') as string) || null
    const mileage = parseInt(form.get('mileage') as string) || null
    const starting_price = parseFloat(form.get('starting_price') as string)
    const auction_end_time = form.get('auction_end_time') as string

    if (!title || !starting_price || !auction_end_time) {
      setError('Title, starting price, and auction end time are required')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('cars').insert({
      title,
      description: description || null,
      year,
      mileage,
      starting_price,
      image_urls: imageUrls,
      auction_end_time: new Date(auction_end_time).toISOString(),
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-black mb-1">Title *</label>
        <input id="title" name="title" type="text" required placeholder="e.g. 2019 Honda Civic EX"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-black mb-1">Year</label>
          <input id="year" name="year" type="number" placeholder="e.g. 2019"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="mileage" className="block text-sm font-medium text-black mb-1">Mileage</label>
          <input id="mileage" name="mileage" type="number" placeholder="e.g. 45000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-black mb-1">Description</label>
        <textarea id="description" name="description" rows={4} placeholder="Describe the car..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="starting_price" className="block text-sm font-medium text-black mb-1">Starting Price ($) *</label>
          <input id="starting_price" name="starting_price" type="number" step="0.01" min="0" required placeholder="e.g. 5000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="auction_end_time" className="block text-sm font-medium text-black mb-1">Auction End Date/Time *</label>
          <input id="auction_end_time" name="auction_end_time" type="datetime-local" required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <ImageUpload existingUrls={imageUrls} onUrlsChange={setImageUrls} />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Adding...' : 'Add Car'}
        </button>
        <button type="button" onClick={() => router.push('/admin')}
          className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300">
          Cancel
        </button>
      </div>
    </form>
  )
}
