import Image from "next/image";
import "./Mentors.css";

export default function Mentors() {
  return (
    <section id="mentors" className="section">
      <h2 className="section__title">
        <Image src="/assets/text/mentor.svg" alt="MENTORS" width={600} height={120} />
      </h2>

      <div className="mentors__container">
        <div className="mentors__card">
          <Image src="/assets/mentors/anhtran.svg" alt="Mentor: Anh Tran" width={350} height={450} />
        </div>
        <div className="mentors__card">
          <Image src="/assets/mentors/karthik.svg" alt="Mentor: Karthik" width={350} height={450} />
        </div>
        <div className="mentors__card">
          <Image src="/assets/mentors/jonas.svg" alt="Mentor: Jonas" width={350} height={450} />
        </div>
        <div className="mentors__card">
          <Image src="/assets/mentors/semi.svg" alt="Mentor: Semi" width={350} height={450} />
        </div>
        <div className="mentors__card">
          <Image src="/assets/mentors/yash.svg" alt="Mentor: Yash" width={350} height={450} />
        </div>
        <div className="mentors__card">
          <Image src="/assets/mentors/jp.svg" alt="Mentor: JP" width={350} height={450} />
        </div>
        <div className="mentors__card">
          <Image src="/assets/mentors/gomez.svg" alt="Mentor: Gomez" width={350} height={450} />
        </div>
        <div className="mentors__card">
          <Image src="/assets/mentors/thomukas1.svg" alt="Mentor: Thomukas1" width={350} height={450} />
        </div>
        <div className="mentors__card">
          <Image src="/assets/mentors/Belac.svg" alt="Belac - Founder Obelisk Protocol / SuperTeam hub Jogja" width={350} height={450} />
        </div>
      </div>

      <Image
        src="/assets/decorations/right-mountain.svg"
        alt=""
        className="mountain-right"
        aria-hidden="true"
        width={300}
        height={200}
      />
      <Image
        src="/assets/decorations/left-mountain.svg"
        alt=""
        className="mountain-left"
        aria-hidden="true"
        width={300}
        height={200}
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