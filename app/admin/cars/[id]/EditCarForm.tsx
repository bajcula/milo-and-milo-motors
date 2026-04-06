'use client'

import { createClient } from '@/lib/supabase/browser'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import ImageUpload from '@/components/ImageUpload'

interface Car {
  id: string
  title: string
  description: string | null
  year: number | null
  mileage: number | null
  starting_price: number
  image_urls: string[]
  auction_end_time: string
}

interface Bid {
  id: string
  bidder_name: string
  bidder_email: string
  amount: number
  created_at: string
}

export default function EditCarForm() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [car, setCar] = useState<Car | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: carData } = await supabase
        .from('cars')
        .select('*')
        .eq('id', params.id)
        .single()

      if (carData) {
        setCar(carData)
        setImageUrls(carData.image_urls || [])
      }

      const { data: bidData } = await supabase
        .from('bids')
        .select('*')
        .eq('car_id', params.id)
        .order('amount', { ascending: false })

      if (bidData) setBids(bidData)
    }
    load()
  }, [params.id, supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)

    const { error: updateError } = await supabase
      .from('cars')
      .update({
        title: form.get('title') as string,
        description: (form.get('description') as string) || null,
        year: parseInt(form.get('year') as string) || null,
        mileage: parseInt(form.get('mileage') as string) || null,
        starting_price: parseFloat(form.get('starting_price') as string),
        image_urls: imageUrls,
        auction_end_time: new Date(form.get('auction_end_time') as string).toISOString(),
      })
      .eq('id', params.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this car and all its bids?')) return

    await supabase.from('cars').delete().eq('id', params.id)
    router.push('/admin')
    router.refresh()
  }

  if (!car) return <p>Loading...</p>

  const endTimeLocal = new Date(car.auction_end_time).toISOString().slice(0, 16)

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Edit Car</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-black mb-1">Title *</label>
          <input id="title" name="title" type="text" required defaultValue={car.title}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-black mb-1">Year</label>
            <input id="year" name="year" type="number" defaultValue={car.year ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="mileage" className="block text-sm font-medium text-black mb-1">Mileage</label>
            <input id="mileage" name="mileage" type="number" defaultValue={car.mileage ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-black mb-1">Description</label>
          <textarea id="description" name="description" rows={4} defaultValue={car.description ?? ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="starting_price" className="block text-sm font-medium text-black mb-1">Starting Price ($) *</label>
            <input id="starting_price" name="starting_price" type="number" step="0.01" min="0" required
              defaultValue={car.starting_price}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="auction_end_time" className="block text-sm font-medium text-black mb-1">Auction End Date/Time *</label>
            <input id="auction_end_time" name="auction_end_time" type="datetime-local" required
              defaultValue={endTimeLocal}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <ImageUpload existingUrls={imageUrls} onUrlsChange={setImageUrls} />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button type="button" onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ml-auto">
            Delete Car
          </button>
        </div>
      </form>

      {/* Bids section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Bids ({bids.length})</h2>
        {bids.length === 0 ? (
          <p className="text-black">No bids yet.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Bidder</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bids.map((bid, index) => (
                  <tr key={bid.id} className={index === 0 ? 'bg-green-50' : ''}>
                    <td className="px-4 py-3">{bid.bidder_name}</td>
                    <td className="px-4 py-3 text-sm text-black">{bid.bidder_email}</td>
                    <td className="px-4 py-3 font-medium">${bid.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-black">
                      {new Date(bid.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
