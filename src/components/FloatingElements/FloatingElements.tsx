import Image from "next/image";

export default function FloatingElements() {
  return (
    <div className="page-floating-elements" aria-hidden="true">
      <div className="floating-star">
        <Image src="/assets/decorations/blue-star.svg" alt="" width={30} height={30} />
      </div>
      <div className="floating-star">
        <Image src="/assets/decorations/purple-star.svg" alt="" width={30} height={30} />
      </div>
      <div className="floating-star">
        <Image src="/assets/decorations/blue-star.svg" alt="" width={30} height={30} />
      </div>
      <div className="floating-star">
        <Image src="/assets/decorations/purple-star.svg" alt="" width={30} height={30} />
      </div>
      <div className="floating-star">
        <Image src="/assets/decorations/blue-star.svg" alt="" width={30} height={30} />
      </div>
      <div className="floating-star">
        <Image src="/assets/decorations/purple-star.svg" alt="" width={30} height={30} />
      </div>
      <div className="floating-star">
        <Image src="/assets/decorations/blue-star.svg" alt="" width={30} height={30} />
      </div>
      <div className="floating-star">
        <Image src="/assets/decorations/purple-star.svg" alt="" width={30} height={30} />
      </div>
      <div className="floating-star">
        <Image src="/assets/decorations/blue-star.svg" alt="" width={30} height={30} />
      </div>
      <div className="floating-star">
        <Image src="/assets/decorations/purple-star.svg" alt="" width={30} height={30} />
      </div>
      <div className="floating-spaceship">
        <Image 
          src="/assets/decorations/spaceship.svg" 
          alt="" 
          width={725} 
          height={500}
          className="w-full h-auto"
        />
      </div>
      <div className="floating-starship">
        <Image 
          src="/assets/decorations/starship.svg" 
          alt="" 
          width={500} 
          height={400}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
} 