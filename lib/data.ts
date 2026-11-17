export const providers = [
 {id:'gem',name:'GEM Center',category:'Trung tâm hội nghị & tiệc',city:'TP. Hồ Chí Minh',district:'Quận 1',capacity:2000,price:850000,rating:'4.9',reviews:128,image:'photo-1519167758481-83f550bb49b3',tags:['Tiệc cưới','Hội nghị'],featured:true,description:'Không gian kiến trúc đương đại với sảnh tiệc rộng, dịch vụ chuyên nghiệp và thực đơn đa dạng cho những sự kiện đáng nhớ.'},
 {id:'chloe',name:'Chloé Gallery',category:'Địa điểm tiệc ngoài trời',city:'TP. Hồ Chí Minh',district:'Quận 7',capacity:350,price:650000,rating:'4.8',reviews:86,image:'photo-1511795409834-ef04bbd61622',tags:['Tiệc cưới','Sinh nhật'],featured:true,description:'Khu vườn xanh và không gian bên hồ dành cho tiệc cưới thân mật, sinh nhật và những buổi gặp gỡ riêng tư.'},
 {id:'white',name:'The White Palace',category:'Trung tâm hội nghị & tiệc',city:'TP. Hồ Chí Minh',district:'TP. Thủ Đức',capacity:1200,price:720000,rating:'4.9',reviews:204,image:'photo-1519225421980-715cb0215aed',tags:['Tiệc cưới','Hội nghị'],featured:true,description:'Sảnh tiệc thanh lịch, hệ thống âm thanh ánh sáng và đội ngũ điều phối cho sự kiện doanh nghiệp và tiệc cưới.'},
 {id:'sora',name:'Sora Event & Catering',category:'Đơn vị tổ chức tiệc',city:'Hà Nội',district:'Tây Hồ',capacity:500,price:450000,rating:'4.8',reviews:64,image:'photo-1464366400600-7168b8af9bc3',tags:['Tiệc công ty','Sinh nhật'],featured:false,description:'Dịch vụ tổ chức trọn gói, trang trí và ẩm thực theo yêu cầu cho các bữa tiệc ấm cúng.'},
 {id:'ocean',name:'Ocean Garden Đà Nẵng',category:'Địa điểm tiệc ngoài trời',city:'Đà Nẵng',district:'Sơn Trà',capacity:250,price:550000,rating:'4.7',reviews:52,image:'photo-1478146896981-b80fe463b330',tags:['Tiệc cưới','Tiệc công ty'],featured:false,description:'Địa điểm tổ chức tiệc bên biển với không gian mở và thực đơn hải sản theo mùa.'}
];
export type Provider = typeof providers[number] & {realImage?:string; live?:boolean};
export type EventRequest = {id:string;title:string;type:string;city:string;guests:number;budget:number;date:string;deadline:string;description:string;proposals:number;status?:string;created_at?:string};
export const initialRequests:EventRequest[] = [
 {id:'r1',title:'Tìm địa điểm tổ chức tiệc cưới ấm cúng',type:'Tiệc cưới',city:'TP. Hồ Chí Minh',guests:200,budget:150000000,date:'2027-01-24',deadline:'2027-01-10',description:'Mong muốn không gian sân vườn, phong cách tối giản. Cần tư vấn thực đơn và trang trí tông trắng xanh.',proposals:8},
 {id:'r2',title:'Tổ chức Year End Party cho công ty',type:'Tiệc công ty',city:'Hà Nội',guests:150,budget:100000000,date:'2027-01-15',deadline:'2026-12-20',description:'Cần đơn vị tổ chức trọn gói gồm địa điểm, âm thanh, ánh sáng, MC và tiệc tối.',proposals:5},
 {id:'r3',title:'Tiệc sinh nhật ngoài trời cho bé',type:'Sinh nhật',city:'TP. Hồ Chí Minh',guests:50,budget:25000000,date:'2026-12-20',deadline:'2026-12-05',description:'Tiệc sinh nhật 5 tuổi, cần khu vực vui chơi an toàn và trang trí chủ đề vũ trụ.',proposals:3},
 {id:'r4',title:'Tiệc kỷ niệm 10 năm thành lập',type:'Tiệc công ty',city:'Đà Nẵng',guests:120,budget:80000000,date:'2026-11-10',deadline:'2026-11-01',description:'Tìm không gian trang trọng cho buổi tiệc kỷ niệm và tri ân đối tác.',proposals:12}
];
export const money=(n:number)=>new Intl.NumberFormat('vi-VN').format(n);
export const dateLabel=(d:string)=>new Date(d+'T00:00:00+07:00').toLocaleDateString('vi-VN');
export const isExpired=(r:Pick<EventRequest,'deadline'|'status'>,now=Date.now())=>r.status==='closed'||new Date(r.deadline+'T23:59:59+07:00').getTime()<now;
