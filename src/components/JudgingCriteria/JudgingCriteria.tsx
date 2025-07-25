import Image from "next/image";
import "./JudgingCriteria.css";

export default function JudgingCriteria() {
  return (
    <section id="criteria" className="section">
      <Image
        src="/assets/decorations/purple-star.svg"
        alt=""
        className="star-criteria"
        aria-hidden="true"
        width={50}
        height={50}
      />
      
      <h2 className="section__title">
        <span className="judging-criteria__title-text">JUDGING CRITERIA</span>
      </h2>
      
      <p className="section__description">
        100 points total scoring system for fair and comprehensive evaluation
      </p>

      <div className="judging-criteria__container">
        <div className="judging-criteria__category">
          <div className="judging-criteria__category-header">
            <h3 className="judging-criteria__category-title">Game Play</h3>
            <span className="judging-criteria__category-points">40 points</span>
          </div>
          <div className="judging-criteria__subcategories">
            <div className="judging-criteria__subcategory">
              <span className="judging-criteria__subcategory-name">M (Mechanics)</span>
              <span className="judging-criteria__subcategory-points">10</span>
            </div>
            <div className="judging-criteria__subcategory">
              <span className="judging-criteria__subcategory-name">D (Design)</span>
              <span className="judging-criteria__subcategory-points">10</span>
            </div>
            <div className="judging-criteria__subcategory">
              <span className="judging-criteria__subcategory-name">A (Aesthetics)</span>
              <span className="judging-criteria__subcategory-points">20</span>
            </div>
          </div>
        </div>

        <div className="judging-criteria__category">
          <div className="judging-criteria__category-header">
            <h3 className="judging-criteria__category-title">Solana Integration</h3>
            <span className="judging-criteria__category-points">30 points</span>
          </div>
          <div className="judging-criteria__subcategories">
            <div className="judging-criteria__subcategory">
              <span className="judging-criteria__subcategory-name">Honeycomb Protocol</span>
              <span className="judging-criteria__subcategory-points">10</span>
            </div>
            <div className="judging-criteria__subcategory">
              <span className="judging-criteria__subcategory-name">Civic Identity</span>
              <span className="judging-criteria__subcategory-points">10</span>
            </div>
            <div className="judging-criteria__subcategory">
              <span className="judging-criteria__subcategory-name">PlaySolana</span>
              <span className="judging-criteria__subcategory-points">10</span>
            </div>
          </div>
        </div>

        <div className="judging-criteria__category">
          <div className="judging-criteria__category-header">
            <h3 className="judging-criteria__category-title">Business Model</h3>
            <span className="judging-criteria__category-points">30 points</span>
          </div>
          <div className="judging-criteria__subcategories">
            <div className="judging-criteria__subcategory">
              <span className="judging-criteria__subcategory-name">Growth Plan / GTM</span>
              <span className="judging-criteria__subcategory-points">15</span>
            </div>
            <div className="judging-criteria__subcategory">
              <span className="judging-criteria__subcategory-name">Monetization and Retention Strategies</span>
              <span className="judging-criteria__subcategory-points">15</span>
            </div>
          </div>
        </div>
      </div>

      <div className="judging-criteria__note">
        <p>This scoring system is designed specifically for judges to provide fair and comprehensive evaluation of all submissions.</p>
      </div>
    </section>
  );
} 