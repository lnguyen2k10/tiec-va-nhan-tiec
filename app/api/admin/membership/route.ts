import {admin,failure} from '@/lib/server';
import {z} from 'zod';
export async function POST(req:Request){try{const {client}=await admin(req);const {payment_id}=z.object({payment_id:z.uuid()}).parse(await req.json());const {data,error}=await client.rpc('confirm_membership',{payment:payment_id});if(error)throw new Error(error.message);return Response.json({expires_at:data})}catch(e){return failure(e)}}
