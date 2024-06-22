import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import { AuthContextProvider } from "./components/authContexts";
import { AuthContext } from "./components/authContexts";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
