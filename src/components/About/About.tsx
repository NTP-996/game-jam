import Image from "next/image";
import "./About.css";

export default function About() {
  return (
    <section id="about" className="section">
      <h2 className="section__title">
        <Image src="/assets/text/about.svg" alt="ABOUT US" width={600} height={120} />
      </h2>

      <p className="section__description">
        Dive into the largest Solana Game Jam, covering the entire APAC
        region! Get mentorship from industry experts and transform your idea 
        into a Web3 game company.
      </p>


      <div className="stats">

        <div className="stats__item">
          <Image
            src="/assets/highlight/country.svg"
            alt="10+ Countries Participating"
            width={400}
            height={200}
          />
        </div>
        <div className="stats__item">
          <Image
            src="/assets/highlight/open.svg"
            alt="Open to All Skill Levels"
            width={400}
            height={200}
          />
        </div>
      </div>
    </section>
  );
} 