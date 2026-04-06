import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, code } = body

  if (!email || !code) {
    return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Find a matching, unused, non-expired code
  const { data: match } = await supabase
    .from('verification_codes')
    .select('id')
    .eq('email', email.toLowerCase())
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .single()

  if (!match) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
  }

  // Mark the code as used
  await supabase
    .from('verification_codes')
    .update({ used: true })
    .eq('id', match.id)

  return NextResponse.json({ verified: true })
}
