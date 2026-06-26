import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Agrobanco Fuerza de Ventas Digital",
  description: "Sistema inteligente para asesores de crédito y oficiales de negocios de Agrobanco.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#021525] text-[#D1E4FB]">
        {children}
      </body>
    </html>
  );
}
