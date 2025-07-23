"use client";

import Image from "next/image";
import "./Footer.css";

export default function Footer() {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href");
    if (href && href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        <nav className="footer__nav" aria-label="Footer navigation">
          <a href="#home" onClick={handleNavClick}>Home</a>
          <a href="#overview" onClick={handleNavClick}>Overview</a>

          <a href="#schedule" onClick={handleNavClick}>Schedule</a>
          <a href="#judging" onClick={handleNavClick}>Judging Criteria</a>
          <a href="#faq" onClick={handleNavClick}>FAQ</a>
        </nav>

        <div className="footer__logos">
          <a href="#" className="logo superteam-logo">
            <Image src="/assets/logos/logo.svg" alt="Superteam VN Logo" width={200} height={80} />
          </a>
        </div>

        <div className="footer__sponsors">
          <div className="footer__sponsors-title">
            <Image src="/assets/text/sponsors.svg" alt="Sponsor" width={200} height={60} />
          </div>
          <div className="footer__sponsors-grid">
            <div className="footer__sponsor-item">
              <Image
                src="/assets/logos/superteam.svg"
                alt="Superteam"
                width={150}
                height={60}
              />
            </div>
            <div className="footer__sponsor-item">
              <Image
                src="/assets/sponsor/honeycomb.jpg"
                alt="Honeycomb Protocol"
                width={120}
                height={40}
              />
            </div>
            <div className="footer__sponsor-item">
              <Image
                src="/assets/partner/sendlogo.png"
                alt="Send Arcade"
                width={150}
                height={60}
              />
            </div>
          </div>
        </div>

        <div className="footer__copyright">
          &copy; 2025 Superteam Vietnam. All rights reserved.
        </div>
      </div>
    </footer>
  );
} 