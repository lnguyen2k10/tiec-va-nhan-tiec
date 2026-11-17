import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
const bodyFont = localFont({
  src: [
    { path: './fonts/BeVietnamPro-Regular.ttf', weight: '400', style: 'normal' },
    { path: './fonts/BeVietnamPro-Medium.ttf', weight: '500', style: 'normal' },
    { path: './fonts/BeVietnamPro-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: './fonts/BeVietnamPro-Bold.ttf', weight: '700', style: 'normal' },
    { path: './fonts/BeVietnamPro-ExtraBold.ttf', weight: '800', style: 'normal' },
  ],
  variable: '--font-body', display: 'swap', fallback: ['Arial', 'sans-serif'],
});
const headingFont = localFont({
  src: [
    { path: './fonts/PlayfairDisplay.ttf', weight: '400 900', style: 'normal' },
    { path: './fonts/PlayfairDisplay-Italic.ttf', weight: '400 900', style: 'italic' },
  ],
  variable: '--font-heading', display: 'swap', fallback: ['Georgia', 'serif'],
});
export const metadata: Metadata = { title: 'Tiệc & Nhận Tiệc — Kết nối cho những dịp đáng nhớ', description: 'Tìm địa điểm, nhà cung cấp và đăng nhu cầu tổ chức tiệc miễn phí. Kết nối trực tiếp với đối tác phù hợp tại Việt Nam.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="vi" className={`${bodyFont.variable} ${headingFont.variable}`}><body>{children}</body></html> }
