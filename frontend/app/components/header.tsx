'use client';
import Link from 'next/link';
import ThemeSwitch from './ThemeSwitch';
import HamburgerMenu from './HamburgerMenu';

export default function Header() {
  return (
    <header className="border-top border-bottom bg-body text-body">
     
      <div className="d-flex justify-content-between align-items-center px-3 py-2">
        <h2 className="m-0">Assignment 1</h2>
        <span className="m-0">21934327</span>
      </div>

    
      <div style={{
       
        borderTop: "2px solid var(--border) !important",
        borderBottom: "2px solid var(--border) !important",
        
      }}className="px-3 py-2 d-flex align-items-center">
        <nav className="flex-grow-1 d-none d-md-block">
          <ul className="nav justify-content-center gap-4">
            <li className="nav-item"><Link href="/" className="nav-link custom-link p-0">Home</Link></li>
            <li className="nav-item"><Link href="/themes" className="nav-link custom-link p-0">Themes</Link></li>
            <li className="nav-item"><Link href="/docker" className="nav-link custom-link p-0">Docker</Link></li>
            <li className="nav-item"><Link href="/prisma" className="nav-link custom-link p-0">Prisma/Sequelize</Link></li>
            <li className="nav-item"><Link href="/tests" className="nav-link custom-link p-0">Tests</Link></li>
            <li className="nav-item"><Link href="/about" className="nav-link custom-link p-0">About</Link></li>
          </ul>
        </nav>

        {/* Mobile hamburger on the right */}
        <div className="d-flex justify-content-end px-3 py-2">
          <HamburgerMenu />
        </div>
      </div>

      {/* Row 3: dark mode switch, right aligned */}
      <div className="d-flex justify-content-end px-3 py-2">
        <ThemeSwitch />
      </div>
    </header>
  );
}