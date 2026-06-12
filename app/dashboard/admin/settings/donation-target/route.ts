import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
const formData = await req.formData()

const value = formData.get('value')

const supabaseAdmin = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
)

await supabaseAdmin
.from('settings')
.update({
value: String(value)
})
.eq('key', 'donation_target')

return NextResponse.redirect(
new URL('/dashboard/admin/settings', req.url)
)
}
