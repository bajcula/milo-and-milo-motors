'use client'

interface BidFormProps {
  carId: string
  minimumBid: number
}

export default function BidForm({ carId, minimumBid }: BidFormProps) {
  return (
    <div className="text-center py-4 bg-blue-50 rounded-md">
      <p className="text-sm text-gray-500">Bidding coming soon</p>
      <p className="text-xs text-gray-400">Min bid: ${minimumBid}</p>
    </div>
  )
}
