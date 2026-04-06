import { createClient } from '@/lib/supabase/server'
import CarCard from '@/components/CarCard'

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-black">Milo & Milo Motors</h1>
          <p className="text-black mt-1">Quality used cars — bid now!</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeCars.length === 0 && endedCars.length === 0 && (
          <p className="text-black text-center py-12">
            No cars listed yet. Check back soon!
          </p>
        )}

        {activeCars.length > 0 && (
          <>
            <h2 className="text-xl font-bold mb-4 text-black">Active Auctions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {activeCars.map((car) => (
                <CarCard key={car.id} car={car} highestBid={highestBidMap[car.id] ?? null} />
              ))}
            </div>
          </>
        )}

        {endedCars.length > 0 && (
          <>
            <h2 className="text-xl font-bold mb-4 text-black">Ended Auctions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
              {endedCars.map((car) => (
                <CarCard key={car.id} car={car} highestBid={highestBidMap[car.id] ?? null} />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="border-t bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-black">
          Milo & Milo Motors
        </div>
      </footer>
    </div>
  )
}
