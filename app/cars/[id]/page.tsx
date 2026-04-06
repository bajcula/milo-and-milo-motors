import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CountdownTimer from '@/components/CountdownTimer'
import BidForm from '@/components/BidForm'

export const revalidate = 30

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CarDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: car } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single()

  if (!car) notFound()

  const { data: bids } = await supabase
    .from('bids')
    .select('*')
    .eq('car_id', id)
    .order('amount', { ascending: false })

  const highestBid = bids && bids.length > 0 ? bids[0].amount : null
  const auctionEnded = new Date(car.auction_end_time) < new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <a href="/" className="text-xl font-bold text-black hover:text-blue-600">
            Milo & Milo Motors
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Photos & Description */}
          <div className="lg:col-span-2">
            {car.image_urls.length > 0 ? (
              <div className="space-y-2">
                <div className="aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden">
                  <img src={car.image_urls[0]} alt={car.title} className="w-full h-full object-cover" />
                </div>
                {car.image_urls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {car.image_urls.map((url: string, i: number) => (
                      <img key={i} src={url} alt={`${car.title} photo ${i + 1}`}
                        className="w-24 h-24 object-cover rounded flex-shrink-0" />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[16/9] bg-gray-200 rounded-lg flex items-center justify-center text-black">
                No Photos
              </div>
            )}

            <h1 className="text-3xl font-bold mt-6 text-black">{car.title}</h1>
            <p className="text-black mt-1">
              {car.year ?? ''} {car.mileage ? `· ${car.mileage.toLocaleString()} miles` : ''}
            </p>

            {car.description && (
              <div className="mt-4 text-black whitespace-pre-wrap">{car.description}</div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4 text-black">Bid History ({bids?.length || 0})</h2>
              {(!bids || bids.length === 0) ? (
                <p className="text-black">No bids yet. Be the first!</p>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-black">Bidder</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-black">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-black">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bids.map((bid, i) => (
                        <tr key={bid.id} className={i === 0 ? 'bg-green-50' : ''}>
                          <td className="px-4 py-3">{bid.bidder_name}</td>
                          <td className="px-4 py-3 font-medium">
                            ${bid.amount.toLocaleString()}
                            {i === 0 && <span className="ml-2 text-xs text-green-600 font-medium">HIGHEST</span>}
                          </td>
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
          </div>

          {/* Right: Bid Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <div className="mb-4">
                <p className="text-sm text-black">
                  {highestBid ? 'Current High Bid' : 'Starting Price'}
                </p>
                <p className="text-3xl font-bold text-green-700">
                  ${(highestBid ?? car.starting_price).toLocaleString()}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-black">Time Left</p>
                <div className="text-xl">
                  <CountdownTimer endTime={car.auction_end_time} />
                </div>
              </div>

              {auctionEnded ? (
                <div className="text-center py-4 bg-gray-100 rounded-md">
                  <p className="font-medium text-black">Auction has ended</p>
                  {highestBid && bids && (
                    <p className="text-sm text-black mt-1">
                      Won by {bids[0].bidder_name} for ${highestBid.toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <BidForm
                  carId={car.id}
                  minimumBid={highestBid ? highestBid + 1 : car.starting_price}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
