// app/layout.tsx
//import './globals.css';
//import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/header';
import Footer from './components/footer';

export const metadata = {
  title: 'Assignment 1',
  description: 'CSE5006 Assignment 1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" 
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        <main className="container py-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}