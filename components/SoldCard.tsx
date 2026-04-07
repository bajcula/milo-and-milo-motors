import Link from 'next/link'

interface SoldCardProps {
  car: {
    id: string
    title: string
    year: number | null
    mileage: number | null
    starting_price: number
    image_urls: string[]
  }
  soldPrice: number | null
}

export default function SoldCard({ car, soldPrice }: SoldCardProps) {
  return (
    <Link href={`/cars/${car.id}`} className="block bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
      <div className="aspect-[4/3] bg-gray-200 relative">
        {car.image_urls.length > 0 ? (
          <img
            src={car.image_urls[0]}
            alt={car.title}
            className="w-full h-full object-cover grayscale-[30%]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Photo
          </div>
        )}
        <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide">
          Sold
        </div>
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
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Sold For</p>
          <p className="text-2xl font-bold text-green-700">
            {soldPrice ? `$${soldPrice.toLocaleString()}` : `$${car.starting_price.toLocaleString()}`}
          </p>
        </div>
      </div>
    </Link>
  )
}
