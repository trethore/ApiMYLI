import type { Metadata } from "next";
import { Alexandria, Protest_Strike } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { PlaylistProvider } from "@/context/PlaylistContext";
import { ToastProvider } from "@/context/ToastContext";
import Player from "@/components/Player";
import PlayerPadding from "@/components/PlayerPadding";
import AuthRequiredPopup from "@/components/AuthRequiredPopup";
import "./globals.css";

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["latin"],
});

const protestStrike = Protest_Strike({
  weight: "400",
  variable: "--font-protest-strike",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MUSE",
  description: "MUSE Streaming Platform",
  authors: [{ name: "Muse" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${alexandria.variable} ${protestStrike.variable} antialiased font-[family-name:var(--font-alexandria)]`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ToastProvider>
              <PlayerProvider>
                <PlaylistProvider>
                  {children}
                <AuthRequiredPopup />
                <PlayerPadding />
                <Player />
                </PlaylistProvider>
              </PlayerProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
