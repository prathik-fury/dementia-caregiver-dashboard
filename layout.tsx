import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'CareConnect | Dementia Monitoring', description: 'Caregiver dashboard for connected dementia patient assistance devices.' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
