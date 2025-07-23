"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import "./Header.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMenuOpen) {
        closeMobileMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  // Handle body scroll lock
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }

    return () => document.body.classList.remove("menu-open");
  }, [isMenuOpen]);

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
    closeMobileMenu();
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="logo-container">
          <a href="#" className="header__logo">
            <Image
              src="/assets/logos/logo-top.svg"
              alt="Superteam VN Logo"
              width={188}
              height={60}
              priority
            />
          </a>
        </div>

        <button
          className={`header__mobile-toggle ${isMenuOpen ? "active" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`header__nav-wrapper ${isMenuOpen ? "active" : ""}`}>
          <nav aria-label="Main navigation">
            <ul className="header__nav">
              <li>
                <a href="#home" onClick={handleNavClick}>
                  Home
                </a>
              </li>
              <li>
                <a href="#overview" onClick={handleNavClick}>
                  Overview
                </a>
              </li>

              <li>
                <a href="#schedule" onClick={handleNavClick}>
                  Schedule
                </a>
              </li>
              <li>
                <a href="#judging" onClick={handleNavClick}>
                  Judging
                </a>
              </li>
              <li>
                <a href="#criteria" onClick={handleNavClick}>
                  Criteria
                </a>
              </li>
              <li>
                <a href="#faq" onClick={handleNavClick}>
                  FAQ
                </a>
              </li>
            </ul>
          </nav>

          <div className="header__actions">
            <a
              href="https://airtable.com/appVdfAJVyAXnTTrb/pagu9mFlefjKeY2Lg/form"
              className="btn btn--register"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Register for Solana Game Jam"
            >
              <Image
                src="/assets/Buttons/register-top.svg"
                alt="REGISTER NOW"
                width={110}
                height={40}
                className="btn__image"
              />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
} 