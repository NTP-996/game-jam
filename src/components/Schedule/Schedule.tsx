import Image from "next/image";
import "./Schedule.css";

export default function Schedule() {
  return (
    <section id="schedule" className="section">
      <Image
        src="/assets/decorations/right-cloud.svg"
        alt=""
        className="cloud-schedule"
        aria-hidden="true"
        width={200}
        height={100}
      />
      <h2 className="section__title">
        <Image src="/assets/text/schedule.svg" alt="SCHEDULE" width={600} height={120} />
      </h2>
      <p className="schedule__description">
        2 weeks of in-person 2-3 hour training
      </p>

      <div className="schedule__container">
        <div className="schedule__item">
          <Image
            src="/assets/schedule/schedule-1.svg"
            alt="June 23: Kick-off and team formation"
            width={400}
            height={300}
          />
        </div>
        <div className="schedule__item">
          <Image
            src="/assets/schedule/schedule-2.svg"
            alt="June 30: Development workshops"
            width={400}
            height={300}
          />
        </div>
        <div className="schedule__item">
          <Image
            src="/assets/schedule/schedule-3.svg"
            alt="July 15: Submission deadline"
            width={400}
            height={300}
          />
        </div>
        <div className="schedule__item">
          <Image
            src="/assets/schedule/schedule-4.svg"
            alt="July 25: Final event and awards"
            width={400}
            height={300}
          />
        </div>
      </div>
    </section>
  );
} 