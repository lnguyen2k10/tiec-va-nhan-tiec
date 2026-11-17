import {db} from '@/lib/server';
export async function GET(){try{const {data,error}=await db().from('providers').select('id,name,description,city,services,capacity,images').eq('approved',true).order('created_at',{ascending:false}).limit(100);if(error)throw Error(error.message);return Response.json({providers:data})}catch{return Response.json({error:'Chưa kết nối dữ liệu thật.'},{status:503})}}
