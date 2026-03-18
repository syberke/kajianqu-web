import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req: Request) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Akses ditolak: Token tidak ditemukan')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!


    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser()
    
    if (userError || !user) throw new Error('Akses ditolak: User tidak valid')
    
    if (user.user_metadata?.role !== 'admin') {
      throw new Error('Terlarang: Hanya Admin yang bisa menyetujui Asatidz')
    }

    const body = await req.json()
    const { target_user_id } = body

    if (!target_user_id) throw new Error('ID Asatidz tidak ditemukan')

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    const { error: updateError } = await supabaseAdmin
      .from('asatidz_profiles')
      .update({ approved: true })
      .eq('id', target_user_id)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true, message: 'Asatidz berhasil diverifikasi' }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})