import {z} from 'zod';
const futureDate=z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const requestSchema=z.object({title:z.string().trim().min(10).max(140),type:z.enum(['Tiệc cưới','Tiệc công ty','Sinh nhật','Hội nghị','Khác']),city:z.enum(['TP. Hồ Chí Minh','Hà Nội','Đà Nẵng']),date:futureDate,deadline:futureDate,guests:z.number().int().min(5).max(100000),budget:z.number().min(1000000).max(1e12),description:z.string().trim().min(20).max(3000),website:z.string().max(0).optional()}).refine(d=>d.deadline<=d.date,{message:'Hạn nhận đề xuất phải trước hoặc bằng ngày tổ chức.'}).refine(d=>new Date(d.deadline+'T23:59:59+07:00').getTime()>Date.now(),{message:'Hạn nhận đề xuất phải ở tương lai.'});
export const proposalSchema=z.object({request_id:z.uuid(),price:z.number().min(100000).max(1e12),message:z.string().trim().min(30).max(5000)});
export function classify(text:string){return /(cần|tìm|muốn).{0,100}(tiệc|đám cưới|sinh nhật|sự kiện|year end)/isu.test(text)?'potential_request':'other'}
export function canPropose(expiry:string,deadline:string,now=Date.now()){return new Date(expiry).getTime()>now&&new Date(deadline).getTime()>now}
