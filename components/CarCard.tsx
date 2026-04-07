import Link from 'next/link'
import CountdownTimer from './CountdownTimer'

interface CarCardProps {
  car: {
    id: string
    title: string
    year: number | null
    mileage: number | null
    starting_price: number
    image_urls: string[]
    auction_end_time: string
  }
  highestBid: number | null
}

export default function CarCard({ car, highestBid }: CarCardProps) {
  const currentPrice = highestBid ?? car.starting_price

  return (
    <Link href={`/cars/${car.id}`} className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100">
      <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
        {car.image_urls.length > 0 ? (
          <img
            src={car.image_urls[0]}
            alt={car.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Photo
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-black">{car.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          {car.year && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">{car.year}</span>
          )}
          {car.mileage && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">{car.mileage.toLocaleString()} mi</span>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              {highestBid ? 'Current Bid' : 'Starting At'}
            </p>
            <p className="text-2xl font-bold text-navy">${currentPrice.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Time Left</p>
            <CountdownTimer endTime={car.auction_end_time} />
          </div>
        </div>
      </div>
    </Link>
  )
}
