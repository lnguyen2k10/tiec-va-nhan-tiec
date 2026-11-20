export type Provider = {
 id:string; name:string; category:string; city:string; district:string;
 capacity:number|null; price:number|null; image:string; tags:string[]; featured:boolean;
 description:string; realImage?:string; live?:boolean; publicProfile?:boolean;
 address?:string; phone?:string; website?:string; checkedAt?:string;
 sources?:{label:string;url:string;fields:string[]}[];
};
// Research target: 20 HCMC providers; 3 source-backed listings recorded so far.
// Public-source listings do not represent platform membership.
// Missing price, banquet capacity and photo rights are intentionally left unknown.
export const providers:Provider[] = [
 {
  id:'gem-center-hcm',name:'GEM Center',category:'Trung tâm hội nghị & sự kiện',
  city:'TP. Hồ Chí Minh',district:'Phường Sài Gòn',
  address:'08 Nguyễn Bỉnh Khiêm, Phường Sài Gòn, Thành phố Hồ Chí Minh',
  phone:'1900 998 890',website:'https://gemcenter.com.vn/',
  capacity:null,price:null,image:'',tags:['Tiệc cưới','Tiệc công ty','Sinh nhật','Hội nghị'],featured:false,
  publicProfile:true,checkedAt:'2026-11-20',
  description:'GEM Center cung cấp địa điểm và dịch vụ cho sự kiện doanh nghiệp và tiệc cá nhân, gồm hội nghị, tiệc cưới và sinh nhật. Nội dung được tổng hợp từ website chính thức.',
  sources:[
   {label:'Trang liên hệ chính thức của GEM Center',url:'https://gemcenter.com.vn/home/contact',fields:['Tên','Địa chỉ','Hotline']},
   {label:'Dịch vụ sự kiện cá nhân và doanh nghiệp',url:'https://gemcenter.com.vn/introduction/detail/introduction-personal-events-vn',fields:['Loại tiệc','Dịch vụ']}
  ]
 },
 {
  id:'white-palace-pham-van-dong',name:'White Palace Phạm Văn Đồng',category:'Trung tâm hội nghị & sự kiện',
  city:'TP. Hồ Chí Minh',district:'Phường Hiệp Bình',
  address:'588 Phạm Văn Đồng, Phường Hiệp Bình, Thành phố Hồ Chí Minh',
  phone:'1900 088 850',website:'https://whitepalace.com.vn/pham-van-dong/',
  capacity:null,price:null,image:'',tags:['Tiệc cưới','Tiệc công ty','Sinh nhật','Hội nghị'],featured:false,
  publicProfile:true,checkedAt:'2026-11-20',
  description:'White Palace Phạm Văn Đồng là địa điểm tổ chức hội nghị và sự kiện tại TP.HCM. Website thương hiệu giới thiệu các dịch vụ tiệc cưới, sinh nhật và sự kiện doanh nghiệp.',
  sources:[
   {label:'Trang địa điểm White Palace Phạm Văn Đồng',url:'https://whitepalace.com.vn/pham-van-dong/',fields:['Tên chi nhánh','Địa chỉ','Hotline','Loại địa điểm']},
   {label:'Các dịch vụ trên website White Palace',url:'https://whitepalace.com.vn/',fields:['Loại tiệc','Dịch vụ']}
  ]
 },
 {
  id:'riverside-palace-hcm',name:'Riverside Palace',category:'Trung tâm hội nghị & tiệc cưới',
  city:'TP. Hồ Chí Minh',district:'Phường Vĩnh Hội',
  address:'360D Bến Vân Đồn, Phường Vĩnh Hội, TP. Hồ Chí Minh',
  phone:'0933 777 838',website:'https://riversidepalace.vn/',
  capacity:null,price:null,image:'',tags:['Tiệc cưới','Hội nghị'],featured:false,
  publicProfile:true,checkedAt:'2026-11-20',
  description:'Riverside Palace là trung tâm hội nghị và tiệc cưới tại Bến Vân Đồn, TP.HCM. Website chính thức giới thiệu dịch vụ tiệc cưới, hội nghị và sự kiện. Hotline trong hồ sơ là số kinh doanh được công bố trên trang liên hệ.',
  sources:[
   {label:'Trang liên hệ chính thức Riverside Palace',url:'https://riversidepalace.vn/lien-he.html',fields:['Tên','Địa chỉ','Hotline']},
   {label:'Giới thiệu trung tâm và dịch vụ',url:'https://riversidepalace.vn/gioi-thieu.html',fields:['Loại địa điểm','Dịch vụ']}
  ]
 }
];
export type EventRequest = {id:string;title:string;type:string;city:string;guests:number;budget:number;date:string;deadline:string;description:string;proposals:number;status?:string;created_at?:string};
export const initialRequests:EventRequest[] = [
 {id:'r1',title:'Tìm địa điểm tổ chức tiệc cưới ấm cúng',type:'Tiệc cưới',city:'TP. Hồ Chí Minh',guests:200,budget:150000000,date:'2027-01-24',deadline:'2027-01-10',description:'Mong muốn không gian sân vườn, phong cách tối giản. Cần tư vấn thực đơn và trang trí tông trắng xanh.',proposals:8},
 {id:'r2',title:'Tổ chức Year End Party cho công ty',type:'Tiệc công ty',city:'Hà Nội',guests:150,budget:100000000,date:'2027-01-15',deadline:'2026-12-20',description:'Cần đơn vị tổ chức trọn gói gồm địa điểm, âm thanh, ánh sáng, MC và tiệc tối.',proposals:5},
 {id:'r3',title:'Tiệc sinh nhật ngoài trời cho bé',type:'Sinh nhật',city:'TP. Hồ Chí Minh',guests:50,budget:25000000,date:'2026-12-20',deadline:'2026-12-05',description:'Tiệc sinh nhật 5 tuổi, cần khu vực vui chơi an toàn và trang trí chủ đề vũ trụ.',proposals:3},
 {id:'r4',title:'Tiệc kỷ niệm 10 năm thành lập',type:'Tiệc công ty',city:'Đà Nẵng',guests:120,budget:80000000,date:'2026-11-10',deadline:'2026-11-01',description:'Tìm không gian trang trọng cho buổi tiệc kỷ niệm và tri ân đối tác.',proposals:12}
];
export const money=(n:number)=>new Intl.NumberFormat('vi-VN').format(n);
export const dateLabel=(d:string)=>new Date(d+'T00:00:00+07:00').toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'});
export const isExpired=(r:Pick<EventRequest,'deadline'|'status'>,now=Date.now())=>r.status==='closed'||new Date(r.deadline+'T23:59:59+07:00').getTime()<now;
