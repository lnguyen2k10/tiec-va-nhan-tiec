import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Tiệc & Nhận Tiệc — Kết nối cho những dịp đáng nhớ', description: 'Tìm địa điểm, nhà cung cấp và đăng nhu cầu tổ chức tiệc miễn phí. Kết nối trực tiếp với đối tác phù hợp tại Việt Nam.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="vi"><body>{children}</body></html> }
