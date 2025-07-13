'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link href="/">Modern TODO</Link>
      </div>
      
      <ul className="nav-links">
        <li>
          <Link 
            href="/" 
            className={pathname === '/' ? 'active' : ''}
          >
            Home
          </Link>
        </li>
        <li>
          <Link 
            href="/about" 
            className={pathname === '/about' ? 'active' : ''}
          >
            About
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;