// src/app/layout.js
import '../styles/app.scss'; // Import your SCSS here
import Header from '@/components/Header';
import Providers from "@/components/Providers";
import { VideoProvider } from '@/components/VideoContext';
export default function RootLayout({ children }) {
  
  return (
    <html lang="en">
      <head>
        <title>VidGen</title>
      </head>
      <body>
            <Header/>
            <Providers>
              <VideoProvider>
                {children}
              </VideoProvider>
            </Providers>
      </body>
    </html>
  );
}