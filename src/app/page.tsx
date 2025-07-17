import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import About from "@/components/About/About";
import Prizes from "@/components/Prizes/Prizes";
import Schedule from "@/components/Schedule/Schedule";
import Mentors from "@/components/Mentors/Mentors";
import FAQ from "@/components/FAQ/FAQ";
import Footer from "@/components/Footer/Footer";
import FloatingElements from "@/components/FloatingElements/FloatingElements";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <FloatingElements />
      <Header />
      
      <main className="main">
        <Hero />
        <About />
        
        {/* Tracks Section */}
        <section id="tracks" className="section text-center">
          <div className="section__title">
            <Image
              src="/assets/highlight/tracks.svg"
              alt="Game Development Tracks"
              width={800}
              height={150}
            />
          </div>
        </section>

        <Prizes />
        <Schedule />
        <Mentors />

        {/* CTA Section */}
        <section id="cta" className="section">
          <div className="cta__content">
            <div className="hero__date">
              <Image
                src="/assets/text/event-date.svg"
                alt="JUNE 23 - JULY 25, 2025"
                width={500}
                height={80}
              />
            </div>
            <div className="hero__title">
              <Image
                src="/assets/text/Solana Game Jam_.svg"
                alt="SOLANA GAME JAM"
                className="hero__title-main"
                width={900}
                height={180}
              />
              <Image
                src="/assets/text/APAC.svg"
                alt="APAC"
                className="hero__title-sub"
                width={350}
                height={120}
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

        <FAQ />
      </main>

      <Footer />
    </>
  );
}
