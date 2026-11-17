import 'server-only';
import {createClient} from '@supabase/supabase-js';
export function db(token?:string){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)throw new Error('Hệ thống chưa kết nối Supabase.');return createClient(url,key,{global:token?{headers:{Authorization:`Bearer ${token}`}}:undefined,auth:{persistSession:false}})}
export async function authenticated(req:Request){const token=req.headers.get('authorization')?.replace(/^Bearer /,'');if(!token)throw new Error('Vui lòng đăng nhập.');const client=db(token);const {data,error}=await client.auth.getUser(token);if(error||!data.user)throw new Error('Phiên đăng nhập không hợp lệ.');return {client,user:data.user}}
export async function admin(req:Request){const result=await authenticated(req);const {data}=await result.client.from('profiles').select('role').eq('id',result.user.id).single();if(data?.role!=='admin')throw new Error('Bạn không có quyền quản trị.');return result}
export function failure(e:unknown){return Response.json({error:e instanceof Error?e.message:'Có lỗi xảy ra.'},{status:e instanceof Error&&/đăng nhập|Phiên/.test(e.message)?401:400})}
