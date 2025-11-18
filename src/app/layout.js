import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RoleModalProvider } from "@/contexts/RoleModalContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SINAVIKA - Platform Digital Berbasis AI untuk Ekosistem JKN",
  description: "Memperbaiki alur layanan dan klaim dari hulu ke hilir dengan Agentic AI dan Computer Vision",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RoleModalProvider>
          {children}
        </RoleModalProvider>
      </body>
    </html>
  );
}
