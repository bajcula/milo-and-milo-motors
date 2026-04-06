import { Resend } from 'resend'

// Lazy singleton — deferred so module evaluation doesn't throw during build
let _resend: Resend | null = null
export const resend = {
  get emails() {
    if (!_resend) {
      _resend = new Resend(process.env.RESEND_API_KEY!)
    }
    return _resend.emails
  },
}
