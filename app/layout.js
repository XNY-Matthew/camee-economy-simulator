import './globals.css';

export const metadata = {
  title: 'Camee Economy Simulator',
  description: 'Interactive Status & Rating system simulator',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
