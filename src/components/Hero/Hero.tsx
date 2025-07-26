import Image from "next/image";
import "./Hero.css";

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero__content">
        <div className="hero__date">
          <Image
            src="/assets/text/event-date.svg"
            alt="JUNE 23 - JULY 25, 2025"
            width={400}
            height={60}
            priority
          />
        </div>

        <div className="hero__title">
          <Image
            src="/assets/text/Solana Game Jam_.svg"
            alt="SOLANA GAME JAM"
            className="hero__title-main"
            width={800}
            height={150}
            priority
          />
          <Image
            src="/assets/text/APAC.svg"
            alt="APAC"
            className="hero__title-sub"
            width={300}
            height={100}
            priority
          />
        </div>

        <p className="hero__description">
          Dive into the largest Solana Game Jam, covering the APAC gaming
          market through its local Superteams
        </p>

        <div className="cta__buttons">
          <a
            href="https://airtable.com/appVdfAJVyAXnTTrb/pagu9mFlefjKeY2Lg/form"
            className="btn btn--register-large"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Register for Solana Game Jam"
          >
            <Image
              src="/assets/Buttons/register-low.svg"
              alt="REGISTER NOW"
              className="btn__image"
              width={272}
              height={80}
            />
          </a>

          <a
            href="https://discord.gg/yB5vWmSkAY"
            className="btn btn--register-large"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join Discord"
          >
            <Image
              src="/assets/Buttons/discord.svg"
              alt="JOIN DISCORD"
              className="btn__image"
              width={272}
              height={80}
            />
          </a>
        </div>
      </div>
    </section>
  );
} 