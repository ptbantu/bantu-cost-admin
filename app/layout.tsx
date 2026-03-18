import type {Metadata} from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css'; // Global styles
import { ClientLayout } from '@/components/client-layout';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '成本中心',
  description: 'Bantu CRM',
  icons: {
    icon: '/bantu_logo_yuan.png',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} text-[12px] text-slate-800 bg-slate-50 antialiased`} suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
