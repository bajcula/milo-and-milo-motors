import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { car_id, bidder_name, amount } = body

  // Validate required fields
  if (!car_id || !bidder_name || !amount) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Bid amount must be a positive number' }, { status: 400 })
  }

  // 1. Verify the user has an authenticated session (email verified via OTP)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Email not verified. Please verify your email first.' }, { status: 403 })
  }

  const bidder_email = user.email

  // 2. Use service client for data operations (bypasses RLS)
  const serviceClient = createServiceClient()

  // 3. Check the car exists and auction hasn't ended
  const { data: car } = await serviceClient
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

  // 4. Check bid is higher than current highest bid (or starting price)
  const { data: highestBid } = await serviceClient
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

  // 5. Insert the bid
  const { error: bidError } = await serviceClient
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
