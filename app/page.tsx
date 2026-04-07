import { createClient } from '@/lib/supabase/server'
import CarCard from '@/components/CarCard'
import SoldCard from '@/components/SoldCard'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()

  const { data: cars } = await supabase
    .from('cars')
    .select('*')
    .order('auction_end_time', { ascending: true })

  const { data: bids } = await supabase
    .from('bids')
    .select('car_id, amount')

  // Build highest bid map
  const highestBidMap: Record<string, number> = {}
  for (const bid of bids || []) {
    if (!highestBidMap[bid.car_id] || bid.amount > highestBidMap[bid.car_id]) {
      highestBidMap[bid.car_id] = bid.amount
    }
  }

  // Separate active and ended auctions
  const now = new Date()
  const activeCars = (cars || []).filter(c => new Date(c.auction_end_time) > now)
  const endedCars = (cars || []).filter(c => new Date(c.auction_end_time) <= now)

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-accent rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">
              M
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Milo & Milo Motors</h1>
              <p className="text-white/70 text-sm sm:text-base">Quality Used Cars — Bid & Save</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-navy border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-white/90 text-sm sm:text-base">
            Browse our current auctions. Verify your email and place your bid!
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-400 font-medium">{activeCars.length} Active</span>
            <span className="text-white/50">{endedCars.length} Ended</span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeCars.length === 0 && endedCars.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚗</span>
            </div>
            <p className="text-black text-lg">No cars listed yet.</p>
            <p className="text-gray-500 mt-1">Check back soon for new auctions!</p>
          </div>
        )}

        {activeCars.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-6 bg-red-accent rounded-full"></div>
              <h2 className="text-xl font-bold text-black uppercase tracking-wide">Active Auctions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {activeCars.map((car) => (
                <CarCard key={car.id} car={car} highestBid={highestBidMap[car.id] ?? null} />
              ))}
            </div>
          </>
        )}

        {endedCars.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-6 bg-green-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-black uppercase tracking-wide">Recently Sold</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedCars.map((car) => (
                <SoldCard key={car.id} car={car} soldPrice={highestBidMap[car.id] ?? null} />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="bg-navy text-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <span className="font-bold">Milo & Milo Motors</span>
            </div>
            <p className="text-white/50 text-sm">Trusted used car auctions</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
