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
      <div className="text-center py-4 bg-green-50 rounded-md border border-green-200">
        <p className="font-bold text-green-700">Bid placed!</p>
        <p className="text-sm text-green-600 mt-1">${parseFloat(amount).toLocaleString()}</p>
        <button
          onClick={() => { setSuccess(false); setAmount('') }}
          className="mt-3 text-sm text-navy font-medium hover:underline"
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
          <p className="text-sm text-gray-500 mb-3">
            Verify your email to place a bid.
          </p>
          <div>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !name || !email}
            className="w-full py-2.5 bg-red-accent text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-bold uppercase tracking-wide text-sm"
          >
            {loading ? 'Sending code...' : 'Verify Email'}
          </button>
        </form>
      )}

      {/* Step 2: Enter verification code */}
      {step === 'code' && (
        <form onSubmit={handleVerifyCode} className="space-y-3">
          <p className="text-sm text-gray-500 mb-3">
            We sent an 8-digit code to <strong className="text-black">{email}</strong>
          </p>
          <div>
            <input
              type="text"
              placeholder="Enter 8-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={8}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-center text-2xl tracking-widest text-black focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || code.length !== 8}
            className="w-full py-2.5 bg-navy text-white rounded-md hover:bg-navy/90 disabled:opacity-50 font-bold uppercase tracking-wide text-sm"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          <button
            type="button"
            onClick={() => { setStep('email'); setCode(''); setError('') }}
            className="w-full text-sm text-gray-500 hover:text-black"
          >
            Use a different email
          </button>
        </form>
      )}

      {/* Step 3: Place bid */}
      {step === 'bid' && (
        <form onSubmit={handlePlaceBid} className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-green-700 font-medium">
              Verified as <strong>{email}</strong>
            </p>
          </div>
          {!name && (
            <div>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Your Bid (min ${minimumBid.toLocaleString()})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-black font-bold">$</span>
              <input
                type="number"
                step="1"
                min={minimumBid}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder={minimumBid.toString()}
                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy text-lg font-bold"
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !amount || !name}
            className="w-full py-2.5 bg-red-accent text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-bold uppercase tracking-wide text-sm"
          >
            {loading ? 'Placing bid...' : 'Place Bid'}
          </button>
        </form>
      )}
    </div>
  )
}
