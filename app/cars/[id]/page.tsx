import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CountdownTimer from '@/components/CountdownTimer'
import BidForm from '@/components/BidForm'
import ImageGallery from '@/components/ImageGallery'

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

  // Check if current user is a verified bidder (not an admin)
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  const verifiedBidderEmail = user?.email && !adminEmails.includes(user.email.toLowerCase())
    ? user.email
    : null

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-red-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <span className="text-lg font-bold">Milo & Milo Motors</span>
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Photos & Description */}
          <div className="lg:col-span-2">
            <ImageGallery imageUrls={car.image_urls} title={car.title} />

            <h1 className="text-2xl sm:text-3xl font-bold mt-6 text-black">{car.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              {car.year && (
                <span className="text-sm bg-navy/10 text-navy px-2 py-0.5 rounded font-medium">{car.year}</span>
              )}
              {car.mileage && (
                <span className="text-sm bg-navy/10 text-navy px-2 py-0.5 rounded font-medium">{car.mileage.toLocaleString()} miles</span>
              )}
            </div>

            {car.description && (
              <div className="mt-4 text-black whitespace-pre-wrap leading-relaxed">{car.description}</div>
            )}

            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-5 bg-red-accent rounded-full"></div>
                <h2 className="text-lg font-bold text-black uppercase tracking-wide">Bid History ({bids?.length || 0})</h2>
              </div>
              {(!bids || bids.length === 0) ? (
                <p className="text-gray-500">No bids yet. Be the first!</p>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-x-auto border border-gray-100">
                  <table className="w-full">
                    <thead className="bg-navy text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Bidder</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bids.map((bid, i) => (
                        <tr key={bid.id} className={i === 0 ? 'bg-green-50' : ''}>
                          <td className="px-4 py-3 text-black">{bid.bidder_name}</td>
                          <td className="px-4 py-3 font-bold text-black">
                            ${bid.amount.toLocaleString()}
                            {i === 0 && <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">HIGHEST</span>}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
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
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8 border border-gray-100">
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  {highestBid ? 'Current High Bid' : 'Starting Price'}
                </p>
                <p className="text-3xl font-bold text-navy">
                  ${(highestBid ?? car.starting_price).toLocaleString()}
                </p>
              </div>

              <div className="mb-6 bg-cream rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Time Left</p>
                <div className="text-xl mt-0.5">
                  <CountdownTimer endTime={car.auction_end_time} />
                </div>
              </div>

              {auctionEnded ? (
                <div className="text-center py-4 bg-gray-100 rounded-md">
                  <p className="font-bold text-black">Auction has ended</p>
                  {highestBid && bids && (
                    <p className="text-sm text-gray-500 mt-1">
                      Won by <strong className="text-black">{bids[0].bidder_name}</strong> for ${highestBid.toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <BidForm
                  carId={car.id}
                  minimumBid={highestBid ? highestBid + 1 : car.starting_price}
                  verifiedEmail={verifiedBidderEmail}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-navy text-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-accent rounded-full flex items-center justify-center text-white font-bold text-xs">
              M
            </div>
            <span className="text-sm font-bold">Milo & Milo Motors</span>
          </div>
          <p className="text-white/50 text-sm">Trusted used car auctions</p>
        </div>
      </footer>
    </div>
  )
}
