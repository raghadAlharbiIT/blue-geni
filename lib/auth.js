import { SignJWT,jwtVerify } from 'jose'; import { cookies } from 'next/headers';
const key=()=>new TextEncoder().encode(process.env.SESSION_SECRET||'dev-secret-change-me');
export async function makeSession(email){return new SignJWT({email,role:'admin'}).setProtectedHeader({alg:'HS256'}).setExpirationTime('8h').sign(key())}
export async function requireAdmin(){try{const c=await cookies();const t=c.get('genie_admin')?.value;if(!t)return null;return (await jwtVerify(t,key())).payload}catch{return null}}
