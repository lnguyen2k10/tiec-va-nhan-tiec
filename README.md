# Tiệc & Nhận Tiệc — MVP V1

Ứng dụng Next.js App Router, TypeScript, Tailwind 4, Supabase. Thư mục mới độc lập, không ghi đè dự án khác.

## Chạy

Yêu cầu Node 22+.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Mở http://localhost:3000. Chưa cấu hình Supabase: hiển thị dữ liệu minh họa, tìm kiếm/lọc và các form hoạt động ở giao diện; không giả lập đăng nhập, đăng tin, thanh toán hoặc gửi đề xuất thành công. Không sử dụng tên, giá, điểm đánh giá và ảnh minh họa như thông tin doanh nghiệp đã xác minh.

## Kết nối Supabase

1. Tạo project Supabase. Chạy `supabase/001_initial.sql` một lần trong SQL Editor.
2. Điền `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` vào `.env.local`.
3. Trong Authentication URL Configuration đặt Site URL và Redirect URLs cho localhost và tên miền triển khai. Bật Email OTP / magic link. Cấu hình SMTP cho production.
4. Đăng nhập email ở ứng dụng. Trigger tự tạo profile customer. Tài khoản nào cũng có thể tạo hồ sơ đối tác và yêu cầu xét duyệt, không tự đặt quyền admin.
5. Cấp quyền admin duy nhất từ SQL Editor tin cậy: `update public.profiles set role='admin' where id='<UUID tài khoản quản trị>';`.
6. Tài khoản → Quản trị: duyệt đối tác, duyệt nhu cầu đã đồng ý công khai, cấu hình phí năm, xác nhận giao dịch, quản lý Facebook groups và xem lỗi đồng bộ.

Danh bạ thật chỉ lấy đối tác đã duyệt; nhu cầu công khai lấy từ view chỉ có các trường cho phép. Chủ nhu cầu xem đề xuất, trả lời, chọn đối tác trong Tài khoản. Nhà cung cấp tạo/sửa hồ sơ, xem hạn thành viên, gửi đề xuất và phản hồi. Tin mới cần kiểm duyệt. Cập nhật nội dung tin qua DB trả tin về trạng thái chờ duyệt. Không có dữ liệu liên hệ riêng tư trong projection công khai.

## Thành viên và thanh toán

Phí cấu hình mặc định 3.000.000đ/năm trong database; admin có thể thay đổi. Đây là giá cấu hình ban đầu, cần chủ nền tảng xác nhận trước khi vận hành. V1 không tích hợp cổng thanh toán hay tự kích hoạt bằng nút bấm. Chủ nền tảng cung cấp thông tin chuyển khoản cho đối tác. Đối tác gửi mã giao dịch; admin kiểm tra tiền thực nhận rồi xác nhận. Một mã ngân hàng là duy nhất; RPC khóa giao dịch, chống kích hoạt hai lần và gia hạn 365 ngày từ `max(now, hạn hiện tại)`. Kiểm tra hạn trên DB trước mọi đề xuất. Không bán lead, không thu phí lượt xem/chào giá.

## Email

`EMAIL_API_URL` dùng API gửi email tương thích payload Resend (`from`, `to`, `subject`, `text`), `EMAIL_API_TOKEN`, `EMAIL_FROM`, `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `EMAIL_WORKER_SECRET` chỉ đặt ở server.

Chạy `POST /api/email-worker` bằng tác vụ bảo mật bên ngoài, header `Authorization: Bearer <EMAIL_WORKER_SECRET>`. Không gọi từ trình duyệt. Worker nhận tối đa 10 job bằng lease atomic 5 phút, retry exponential tối đa 6 lần. `dedupe_key` unique và header `Idempotency-Key` chống lặp. Cần chọn dịch vụ thực thi idempotency và xác minh thời gian lưu key; không đảm bảo exactly-once khi nhà cung cấp email không hỗ trợ. Liên kết email mở tài khoản được bảo vệ, không đưa thông tin liên hệ vào email. Notification và job được tạo trong cùng transaction với đề xuất/phản hồi.

## Apify — phần chưa xác minh bên ngoài

Chưa có token/dataset nên **chưa xác minh Actor posts**, chưa chạy Actor, chưa tự động thu thập Facebook. Không giả định schema Profile Scraper là Posts Scraper. `APIFY_ACTOR_ID` dành cho bước kết nối sau khi xác minh; hiện chưa sử dụng.

Admin có thể nhập dataset có sẵn sau khi tự kiểm tra schema thực tế, nhập tên các trường ID, URL bài viết, nội dung, ngày. API gọi dataset với token ở header, timeout 15 giây, phân trang 100, tối đa 1.000 dòng/lần. Không tự chạy Actor nên không tạo chi phí Actor. Chống trùng ID và URL ở database; bài trùng URL nhưng khác ID bị từ chối và ghi lỗi. Nguồn được giữ riêng cho admin, chỉ phân loại sơ bộ bằng quy tắc, tuyệt đối không tự công khai. Group kiểm thử được tạo ở trạng thái tạm dừng. Sau kiểm tra, admin mời người đăng tự đăng nhập và đăng nhu cầu để ghi nhận đồng ý. Nút ghi nhận đã mời chỉ đổi trạng thái, không gửi tin nhắn Facebook.

Còn cần trước khi vận hành: xác minh Actor, thêm adapter input và cơ chế chạy thủ công có ngân sách sau khi schema/cost được kiểm chứng; giao diện sửa URL group hiện thực hiện bằng xóa/thêm; cập nhật, sửa ngày nhu cầu có thể làm qua Supabase admin, chưa có form sửa phía khách. Thanh toán SePay chưa tích hợp, chỉ thiết kế tách bảng payments/RPC để bổ sung webhook có xác minh sau.

## Kiểm tra

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

7 kiểm thử gồm kiểm tra thời gian đóng tin theo Việt Nam, hạn thành viên, validation, chặn mẫu nhận đề xuất thật, và kiểm thử migration/RLS trên PostgreSQL nhúng PGlite. Kiểm thử SQL kiểm tra tự nâng quyền, đọc profile riêng, ghi membership trái phép, đề xuất thiếu thành viên, đề xuất trùng/hết hạn, thông báo/email transaction, xác nhận gia hạn và giao dịch trùng, URL Facebook trùng, public view không lộ owner_id.

PGlite dùng mock `auth.uid()`/`auth.role()` để kiểm chứng SQL/RLS. Không thay thế kiểm thử Supabase Auth/PostgREST trên môi trường staging. Chưa có credentials nên chưa kiểm thử đăng nhập/email/Apify/Supabase thật. Browser QA chưa thực hiện được: managed preview báo `relay could not open browser port 4173: timed out waiting for relay readiness`. Typecheck, lint, test, production build được chạy độc lập.

## Triển khai Vercel

1. Đưa thư mục này vào repository mới của bạn, không đưa `.env.local` hoặc service role key vào Git.
2. Import repository vào Vercel; framework Next.js, install `npm ci`, build `npm run build`.
3. Cấu hình các biến `.env.example` ở Vercel. Chỉ URL và anon key mang tiền tố `NEXT_PUBLIC_`. Không public service key, Apify token hay email token.
4. Cập nhật Supabase Redirect URLs bằng domain Vercel, đặt `NEXT_PUBLIC_SITE_URL` cùng domain.
5. Deploy, kiểm tra với hai tài khoản khách/đối tác và một tài khoản admin trên staging: duyệt tin → đăng ký đối tác → admin xác nhận chuyển khoản → gửi đề xuất → email → phản hồi → chọn đối tác → khóa tin. Kiểm tra thêm nhà cung cấp hết hạn và khách khác không đọc được dữ liệu riêng.
6. Cấu hình gọi worker định kỳ ở hệ thống job bảo mật. Chưa bật lịch Apify tự động.

Chưa triển khai Vercel hay provision dịch vụ bên ngoài trong phiên này. API không giả lập thành công khi thiếu cấu hình.
