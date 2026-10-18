// Cloudflare Workers API: Google-only auth, D1 sessions, Workers AI.
const cookie = (name, value, age) => `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
const getCookie = (request, key) => Object.fromEntries((request.headers.get('Cookie') || '').split('; ').filter(Boolean).map(x => x.split('=')))[key];
export default { async fetch(request, env) {
  const url = new URL(request.url);
  if (url.pathname === '/api/auth/google') {
    const state = crypto.randomUUID();
    const redirect = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    redirect.search = new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,redirect_uri:`${url.origin}/api/auth/callback`,response_type:'code',scope:'openid email profile',state,access_type:'offline'});
    return new Response(null,{status:302,headers:{Location:redirect,'Set-Cookie':cookie('oauth_state',state,600)}});
  }
  if (url.pathname === '/api/auth/callback') {
    if (!url.searchParams.get('code') || url.searchParams.get('state') !== getCookie(request,'oauth_state')) return new Response('Invalid sign-in request',{status:400});
    const tokens = await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code:url.searchParams.get('code'),client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,redirect_uri:`${url.origin}/api/auth/callback`,grant_type:'authorization_code'})}).then(r=>r.json());
    if (!tokens.access_token) return new Response('Google sign-in failed',{status:401});
    const user = await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:`Bearer ${tokens.access_token}`}}).then(r=>r.json());
    const session = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO sessions (id, google_sub, email, name, expires_at) VALUES (?, ?, ?, ?, datetime('now', '+30 days'))").bind(session,user.sub,user.email,user.name).run();
    return new Response(null,{status:302,headers:{Location:'/', 'Set-Cookie':cookie('session',session,2592000)}});
  }
  if (url.pathname === '/api/me') {
    const session=getCookie(request,'session'); if(!session) return Response.json({user:null});
    const user=await env.DB.prepare("SELECT email,name FROM sessions WHERE id=? AND expires_at > datetime('now')").bind(session).first();
    return Response.json({user:user || null});
  }
  if (url.pathname === '/api/ai/organize' && request.method === 'POST') {
    const { text } = await request.json();
    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct',{messages:[{role:'system',content:'Return concise JSON with title and category.'},{role:'user',content:text}]});
    return Response.json(result);
  }
  return env.ASSETS.fetch(request);
} };
