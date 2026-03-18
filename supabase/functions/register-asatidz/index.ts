
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

    const body = await req.json()
    const { nama, email, no_wa, password, bidang, bank, no_rekening, redirectTo } = body

    if (!nama || !email || !password || !bidang || !bank || !no_rekening) {
      return new Response(JSON.stringify({ error: 'Data asatidz belum lengkap' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

  
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        nama,
        role: 'asatidz',
      },
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = data.user.id

 
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: userId,
      role: 'asatidz',
      nama,
      email,
      no_wa,
    })

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId) 
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }


    const { error: asatidzError } = await supabaseAdmin.from('asatidz_profiles').insert({
      id: userId,
      bidang,
      bank,
      no_rekening,
      approved: false, 
    })

    if (asatidzError) {
      return new Response(JSON.stringify({ error: asatidzError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }


    const redirectUrl = redirectTo || 'http://localhost:3000/login'
    
    const { error: emailError } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: redirectUrl
      }
    })

    if (emailError) {
      console.error('Gagal mengirim email asatidz:', emailError.message)
    }

    // 7. Selesai
    return new Response(JSON.stringify({ 
      success: true, 
      user_id: userId,
      message: 'Register Asatidz berhasil. Silakan cek email.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})