import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: cars } = await supabase
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: bids } = await supabase
    .from('bids')
    .select('car_id, amount')
    .order('amount', { ascending: false })

  // Build a map: car_id -> { count, highest_bid }
  const bidMap: Record<string, { count: number; highest: number }> = {}
  for (const bid of bids || []) {
    if (!bidMap[bid.car_id]) {
      bidMap[bid.car_id] = { count: 0, highest: 0 }
    }
    bidMap[bid.car_id].count++
    if (bid.amount > bidMap[bid.car_id].highest) {
      bidMap[bid.car_id].highest = bid.amount
    }
  }

  const now = new Date()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Dashboard</h1>
        <Link
          href="/admin/cars/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Add Car
        </Link>
      </div>

      {(!cars || cars.length === 0) ? (
        <p className="text-black">No cars listed yet. Add your first car!</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden text-black">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-black">Car</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-black">Starting Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-black">Highest Bid</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-black">Bids</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-black">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cars.map((car) => {
                const ended = new Date(car.auction_end_time) < now
                const info = bidMap[car.id]
                return (
                  <tr key={car.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{car.title}</div>
                      <div className="text-sm text-black">
                        {car.year} {car.mileage ? `· ${car.mileage.toLocaleString()} mi` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">${car.starting_price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {info ? `$${info.highest.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3">{info?.count || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ended
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {ended ? 'Ended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/cars/${car.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
