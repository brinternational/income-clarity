'use client';

import React from 'react';
import Link from 'next/link';

export interface SkipLink {
  href: string;
  label: string;
  accessKey?: string;
}

export interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

const DEFAULT_SKIP_LINKS: SkipLink[] = [
  {
    href: '#main-content',
    label: 'Skip to main content',
    accessKey: '1',
  },
  {
    href: '#main-navigation',
    label: 'Skip to navigation',
    accessKey: '2',
  },
  {
    href: '#search',
    label: 'Skip to search',
    accessKey: '3',
  },
  {
    href: '#footer',
    label: 'Skip to footer',
    accessKey: '4',
  },
];

export function SkipLinks({ links = DEFAULT_SKIP_LINKS, className = '' }: SkipLinksProps) {
  return (
    <nav 
      aria-label="Skip links" 
      className={`skip-links-container ${className}`}
      role="navigation"
    >
      <ul className="skip-links-list">
        {links.map((link, index) => (
          <li key={index} className="skip-links-item">
            <Link
              href={link.href}
              className="skip-link"
              accessKey={link.accessKey}
              onFocus={(e) => {
                // Ensure the link is visible when focused
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.opacity = '1';
              }}
              onBlur={(e) => {
                // Hide the link when focus is lost
                e.currentTarget.style.transform = 'translateY(-100%)';
                e.currentTarget.style.opacity = '0';
              }}
            >
              {link.label}
              {link.accessKey && (
                <span className="sr-only"> (Access key: {link.accessKey})</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SkipLinks;