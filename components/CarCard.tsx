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
    <Link href={`/cars/${car.id}`} className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
      <div className="aspect-[4/3] bg-gray-200 relative">
        {car.image_urls.length > 0 ? (
          <img
            src={car.image_urls[0]}
            alt={car.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Photo
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg">{car.title}</h3>
        <p className="text-sm text-gray-500">
          {car.year ?? ''} {car.mileage ? `\u00B7 ${car.mileage.toLocaleString()} mi` : ''}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {highestBid ? 'Current Bid' : 'Starting At'}
            </p>
            <p className="text-xl font-bold text-green-700">${currentPrice.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Time Left</p>
            <CountdownTimer endTime={car.auction_end_time} />
          </div>
        </div>
      </div>
    </Link>
  )
}
