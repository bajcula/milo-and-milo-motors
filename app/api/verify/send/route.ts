import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email } = body

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  // Expire in 10 minutes
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // Mark any existing unused codes for this email as used
  const supabase = createServiceClient()
  await supabase
    .from('verification_codes')
    .update({ used: true })
    .eq('email', email.toLowerCase())
    .eq('used', false)

  // Insert the new code
  const { error: insertError } = await supabase
    .from('verification_codes')
    .insert({
      email: email.toLowerCase(),
      code,
      expires_at,
    })

  if (insertError) {
    return NextResponse.json({ error: 'Failed to create verification code' }, { status: 500 })
  }

  // Send the email
  const { error: emailError } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Milo & Milo Motors <onboarding@resend.dev>',
    to: [email],
    subject: 'Your Verification Code — Milo & Milo Motors',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2>Milo & Milo Motors</h2>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${code}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
      </div>
    `,
  })

  if (emailError) {
    console.error('Resend error:', emailError)
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
