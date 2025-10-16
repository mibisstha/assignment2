'use client';
import { useState } from 'react';
import styles from './HamburgerMenu.module.css';
import Link from 'next/link';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className={styles.container}>
      {/* Hamburger Icon */}
      <div className={styles.hamburger} onClick={toggleMenu}>
        <div className={isOpen ? styles.barOpen : styles.bar}></div>
        <div className={isOpen ? styles.barOpen : styles.bar}></div>
        <div className={isOpen ? styles.barOpen : styles.bar}></div>
      </div>

      {/* Dropdown Menu */}
      <nav className={isOpen ? styles.menuOpen : styles.menu}>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/themes">Themes</Link></li>
          <li><Link href="/docker">Docker</Link></li>
          <li><Link href="/prisma">Prisma/Sequelize</Link></li>
          <li><Link href="/tests">Tests</Link></li>
          <li><Link href="/about">About</Link></li>
        </ul>
      </nav>
    </div>
  );
}