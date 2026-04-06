'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

interface BidFormProps {
  carId: string
  minimumBid: number
  verifiedEmail: string | null
}

type Step = 'email' | 'code' | 'bid'

export default function BidForm({ carId, minimumBid, verifiedEmail }: BidFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<Step>(verifiedEmail ? 'bid' : 'email')
  const [email, setEmail] = useState(verifiedEmail || '')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: otpError } = await supabase.auth.signInWithOtp({ email })

    setLoading(false)

    if (otpError) {
      setError(otpError.message)
      return
    }

    setStep('code')
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    setLoading(false)

    if (verifyError) {
      setError(verifyError.message)
      return
    }

    setStep('bid')
  }

  async function handlePlaceBid(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const bidAmount = parseFloat(amount)
    if (isNaN(bidAmount) || bidAmount < minimumBid) {
      setError(`Bid must be at least $${minimumBid.toLocaleString()}`)
      setLoading(false)
      return
    }

    const res = await fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        car_id: carId,
        bidder_name: name,
        amount: bidAmount,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setSuccess(true)
    router.refresh()
  }

  if (success) {
    return (
      <div className="text-center py-4 bg-green-50 rounded-md">
        <p className="font-medium text-green-700">Bid placed successfully!</p>
        <p className="text-sm text-green-600 mt-1">${parseFloat(amount).toLocaleString()}</p>
        <button
          onClick={() => { setSuccess(false); setAmount('') }}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800"
        >
          Place another bid
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Step 1: Enter email */}
      {step === 'email' && (
        <form onSubmit={handleSendCode} className="space-y-3">
          <p className="text-sm text-black mb-3">
            Enter your email to verify and place a bid.
          </p>
          <div>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !name || !email}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending code...' : 'Send Verification Code'}
          </button>
        </form>
      )}

      {/* Step 2: Enter verification code */}
      {step === 'code' && (
        <form onSubmit={handleVerifyCode} className="space-y-3">
          <p className="text-sm text-black mb-3">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
          <div>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-2xl tracking-widest text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          <button
            type="button"
            onClick={() => { setStep('email'); setCode(''); setError('') }}
            className="w-full text-sm text-black hover:text-black"
          >
            Use a different email
          </button>
        </form>
      )}

      {/* Step 3: Place bid */}
      {step === 'bid' && (
        <form onSubmit={handlePlaceBid} className="space-y-3">
          <p className="text-sm text-green-600 mb-3">
            Verified as <strong>{email}</strong>
          </p>
          {!name && (
            <div>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Your Bid (minimum ${minimumBid.toLocaleString()})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-black">$</span>
              <input
                type="number"
                step="1"
                min={minimumBid}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder={minimumBid.toString()}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !amount || !name}
            className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Placing bid...' : 'Place Bid'}
          </button>
        </form>
      )}
    </div>
  )
}
