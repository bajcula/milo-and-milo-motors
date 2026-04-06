import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { car_id, bidder_name, bidder_email, amount } = body

  // Validate required fields
  if (!car_id || !bidder_name || !bidder_email || !amount) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Bid amount must be a positive number' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // 1. Verify the email was recently verified (has a used code in the last 2 hours)
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  const { data: verification } = await supabase
    .from('verification_codes')
    .select('id')
    .eq('email', bidder_email.toLowerCase())
    .eq('used', true)
    .gt('created_at', twoHoursAgo)
    .limit(1)
    .single()

  if (!verification) {
    return NextResponse.json({ error: 'Email not verified. Please verify your email first.' }, { status: 403 })
  }

  // 2. Check the car exists and auction hasn't ended
  const { data: car } = await supabase
    .from('cars')
    .select('id, starting_price, auction_end_time')
    .eq('id', car_id)
    .single()

  if (!car) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 })
  }

  if (new Date(car.auction_end_time) < new Date()) {
    return NextResponse.json({ error: 'This auction has ended' }, { status: 400 })
  }

  // 3. Check bid is higher than current highest bid (or starting price)
  const { data: highestBid } = await supabase
    .from('bids')
    .select('amount')
    .eq('car_id', car_id)
    .order('amount', { ascending: false })
    .limit(1)
    .single()

  const minimumBid = highestBid ? highestBid.amount + 1 : car.starting_price

  if (amount < minimumBid) {
    return NextResponse.json(
      { error: `Bid must be at least $${minimumBid.toLocaleString()}` },
      { status: 400 }
    )
  }

  // 4. Insert the bid
  const { error: bidError } = await supabase
    .from('bids')
    .insert({
      car_id,
      bidder_name: bidder_name.trim(),
      bidder_email: bidder_email.toLowerCase(),
      amount,
    })

  if (bidError) {
    return NextResponse.json({ error: 'Failed to place bid' }, { status: 500 })
  }

  return NextResponse.json({ success: true, amount })
}
