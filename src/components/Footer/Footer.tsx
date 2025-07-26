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
        {/* Main Sponsors Section */}
        <div className="footer__sponsors">
          <div className="footer__sponsors-title">
            <Image src="/assets/text/sponsors.svg" alt="Sponsors" width={200} height={60} style={{margin: '0 auto', display: 'block'}} />
          </div>
          <div className="footer__sponsors-grid">
            <div className="footer__sponsor-item footer__sponsor-item--main">
              <Image
                src="/assets/sponsor/PlaySolana.png"
                alt="PlaySolana"
                width={120}
                height={50}
              />
            </div>
            <div className="footer__sponsor-item footer__sponsor-item--main">
              <Image
                src="/assets/sponsor/civic.jpg"
                alt="Civic Auth"
                width={120}
                height={50}
              />
            </div>
            <div className="footer__sponsor-item footer__sponsor-item--main">
              <Image
                src="/assets/sponsor/solanafoundation.svg"
                alt="Solana Foundation"
                width={120}
                height={50}
                style={{objectFit: 'contain'}}
              />
            </div>
          </div>
        </div>

        {/* Partners Section */}
        <div className="footer__partners">
          <div className="footer__partners-title">
            <h3 className="footer__section-title">Partners</h3>
          </div>
          <div className="footer__partners-grid">
            <div className="footer__partner-item">
              <Image
                src="/assets/partner/sendlogo.png"
                alt="SEND Arcade"
                width={80}
                height={32}
              />
            </div>
            <div className="footer__partner-item">
              <Image
                src="/assets/sponsor/honeycomb.jpg"
                alt="Honeycomb Protocol"
                width={80}
                height={32}
              />
            </div>
            <div className="footer__partner-item">
              <Image
                src="/assets/logos/superteam.svg"
                alt="Superteam Vietnam"
                width={80}
                height={32}
              />
            </div>
            <div className="footer__partner-item">
              <Image
                src="/assets/partner/STKRlogo.png"
                alt="BIC & Superteam Korea"
                width={80}
                height={32}
              />
            </div>
            <div className="footer__partner-item">
              <Image
                src="/assets/partner/obelisklogo.png"
                alt="Superteam Hub Jogja (Obelisk)"
                width={80}
                height={32}
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