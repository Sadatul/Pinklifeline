import { Inter, Lato, Montserrat, Nunito, Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "@stream-io/video-react-sdk/dist/css/styles.css";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";

const inter = Montserrat({ subsets: ["latin"], weight :"500" });

export const metadata = {
  title: "Pink Life Line",
  description: "Breast Cancer Awareness Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon_with_white_bg.ico" sizes="any" />
      <body className={inter.className}>
        <NextTopLoader />
        {children}
        <Toaster richColors closeButton position='bottom-left' duration={1000} />
      </body>
    </html>
  );
}
