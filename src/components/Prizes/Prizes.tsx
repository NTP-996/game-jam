import Image from "next/image";
import "./Prizes.css";

export default function Prizes() {
  return (
    <section id="prizes" className="section">
      <h2 className="section__title">
        <Image src="/assets/text/prizes.svg" alt="PRIZES" width={600} height={120} />
      </h2>

      <div className="prizes__container">
        <div className="prizes__item">
          <Image src="/assets/prize/1st-prize.svg" alt="1st prize: $30,000" width={400} height={200} />
        </div>
        <div className="prizes__item">
          <Image src="/assets/prize/2nd-prize.svg" alt="2nd prize: $20,000" width={400} height={200} />
        </div>
        <div className="prizes__item">
          <Image src="/assets/prize/3rd-prize.svg" alt="3rd prize: $10,000" width={400} height={200} />
        </div>
        <div className="prizes__item">
          <Image src="/assets/prize/4th-prize.svg" alt="4th prize: $7,500" width={400} height={200} />
        </div>
        <div className="prizes__item">
          <Image src="/assets/prize/5th-prize.svg" alt="5th prize: $5,000" width={400} height={200} />
        </div>
        <div className="prizes__item">
          <Image
            src="/assets/prize/mentions.svg"
            alt="Honorable mentions: $2,500 each"
            width={400}
            height={200}
          />
        </div>
        <div className="prizes__item">
          <Image src="/assets/prize/meme.svg" alt="Meme prize: $2,000" width={400} height={200} />
        </div>
      </div>

      <div className="participants">
        <h3 className="participants__title">PARTICIPANTS</h3>
        <div className="participants__grid">
          <div className="participants__item">
            <Image src="/assets/logos/superlogo/Solar.jpg" alt="Solar" width={60} height={60} />
          </div>
          <div className="participants__item">
            <Image src="/assets/logos/superlogo/indo.jpg" alt="Indonesia" width={60} height={60} />
          </div>
          <div className="participants__item">
            <Image src="/assets/logos/superlogo/jp.jpg" alt="Japan" width={60} height={60} />
          </div>
          <div className="participants__item">
            <Image src="/assets/logos/superlogo/kr.png" alt="South Korea" width={60} height={60} />
          </div>
          <div className="participants__item">
            <Image src="/assets/logos/superlogo/malay.jpg" alt="Malaysia" width={60} height={60} />
          </div>
          <div className="participants__item">
            <Image src="/assets/logos/superlogo/pakistan.jpg" alt="Pakistan" width={60} height={60} />
          </div>
          <div className="participants__item">
            <Image src="/assets/logos/superlogo/ph.png" alt="Philippines" width={60} height={60} />
          </div>
          <div className="participants__item">
            <Image src="/assets/logos/superlogo/sg.jpg" alt="Singapore" width={60} height={60} />
          </div>
          <div className="participants__item">
            <Image src="/assets/logos/superlogo/thai.png" alt="Thailand" width={60} height={60} />
          </div>
          <div className="participants__item">
            <Image src="/assets/logos/superlogo/vn.jpg" alt="Vietnam" width={60} height={60} />
          </div>
          <div className="participants__item">
            <Image src="/assets/logos/superlogo/india.png" alt="India" width={60} height={60} />
          </div>
          <div className="participants__item">
            <Image src="/assets/logos/superlogo/nigeria.png" alt="Nigeria" width={60} height={60} />
          </div>
        </div>
      </div>

      <Image
        src="/assets/decorations/cloud.svg"
        alt=""
        className="cloud"
        aria-hidden="true"
        width={200}
        height={100}
      />

      <div className="moving-text">
        <div className="moving-text__content">
          <Image
            src="/assets/text/Solana Game Jam_ APAC.svg"
            alt="Solana Game Jam APAC"
            width={600}
            height={100}
          />
        </div>
      </div>
    </section>
  );
} 