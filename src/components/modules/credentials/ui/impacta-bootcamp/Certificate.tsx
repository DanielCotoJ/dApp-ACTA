import Image from 'next/image';

export default function Certificate() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-[1200px]">
        <div className="relative w-full aspect-[1.414/1] bg-[#0000FF] overflow-hidden">
          {/* Decorative thin white border line (partial frame) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1414 1000"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            {/* Top line from logo area to right edge */}
            <line
              x1="110"
              y1="100"
              x2="1360"
              y2="100"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
            />
            {/* Right vertical line going down */}
            <line
              x1="1360"
              y1="100"
              x2="1360"
              y2="960"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
            />
            {/* Left vertical line from top */}
            <line x1="110" y1="20" x2="110" y2="100" stroke="white" strokeWidth="1" opacity="0.5" />
            {/* Top horizontal short line at very top */}
            <line x1="110" y1="20" x2="1280" y2="20" stroke="white" strokeWidth="1" opacity="0.5" />
            {/* Right short line at top to connect to seal */}
            <line
              x1="1280"
              y1="20"
              x2="1280"
              y2="100"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
            />
          </svg>

          {/* Top-left: Impacta Logo */}
          <div className="absolute top-[3%] left-[3%] w-[8%]">
            <Image
              src="/assets/impacta-bootcamp/impacta-logo.svg"
              alt="Impacta Bootcamp logo"
              width={99}
              height={45}
              className="w-full h-auto"
            />
          </div>

          {/* Top: Row of Asteriscs */}
          <div className="absolute top-[3.2%] left-[12.5%] w-[20%]">
            <Image
              src="/assets/impacta-bootcamp/asteriscs.svg"
              alt="Asteriscs decorativos"
              width={244}
              height={30}
              className="w-full h-auto"
            />
          </div>

          {/* Top-right: Corner Seal (globe + asterisk) in white box */}
          <div className="absolute top-[2%] right-[2%] w-[5.8%] bg-white p-[0.3%]">
            <Image
              src="/assets/impacta-bootcamp/corner-seal.svg"
              alt="Sello de esquina"
              width={70}
              height={120}
              className="w-full h-auto"
            />
          </div>

          {/* Left side: Circles / Coil */}
          <div className="absolute top-[24%] left-[3%] w-[18%]">
            <Image
              src="/assets/impacta-bootcamp/circles.svg"
              alt="Circulos decorativos"
              width={232}
              height={76}
              className="w-full h-auto"
            />
          </div>

          {/* Right side: Latam Map Outline with dots */}
          <div className="absolute top-[12%] right-[3%] w-[44%]">
            <Image
              src="/assets/impacta-bootcamp/latam-outline.svg"
              alt="Mapa de Latinoamerica"
              width={505}
              height={610}
              className="w-full h-auto"
            />
          </div>

          {/* Main Title: CERTIFICADO DE PARTICIPACION */}
          <div className="absolute top-[38%] left-[3%]">
            <div className="bg-white inline-block px-[1.2vw] py-[0.5vw]">
              <h1 className="font-sans font-black text-[#0000FF] text-[3vw] leading-tight tracking-[-0.02em] whitespace-nowrap uppercase">
                {'Certificado de Participaci\u00F3n'}
              </h1>
            </div>
          </div>

          {/* Subtitle text */}
          <div className="absolute top-[49%] left-[3%]">
            <p className="font-sans text-white/90 text-[1.3vw] leading-relaxed">
              Se otorga el presente reconocimiento a:
            </p>
          </div>

          {/* Name line */}
          <div className="absolute top-[60%] left-[3%] w-[52%]">
            <div className="border-b border-white/60 w-full" />
          </div>

          {/* Description text */}
          <div className="absolute top-[68%] left-[3%] w-[42%]">
            <p className="font-sans text-white/90 text-[1.05vw] leading-[1.7] italic">
              Por haber completado <span className="font-bold">satisfactoriamente</span> los
              requisitos {'acad\u00E9micos'} y {'pr\u00E1cticos'} del programa intensivo{' '}
              <span className="font-bold not-italic">IMPACTA BOOTCAMP.</span>
            </p>
          </div>

          {/* Year 2026 */}
          <div className="absolute bottom-[3%] right-[4%]">
            <span className="font-sans font-bold text-white text-[5.5vw] leading-none tracking-[-0.02em]">
              2026
            </span>
          </div>

          {/* Bottom-right: Corner Dots */}
          <div className="absolute bottom-[14%] right-[1.5%] w-[4.5%]">
            <Image
              src="/assets/impacta-bootcamp/corner-dots.svg"
              alt="Puntos decorativos"
              width={54}
              height={53}
              className="w-full h-auto"
            />
          </div>

          {/* Bottom-left: Sponsor Logos (Stellar x BAF x Trustless) in white box */}
          <div className="absolute bottom-0 left-0">
            <div className="bg-white px-[0.8vw] py-[0.6vw]">
              <Image
                src="/assets/impacta-bootcamp/stellar-baf-trustless.svg"
                alt="Stellar, BAF y Trustless logos"
                width={218}
                height={38}
                className="w-[15vw] h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
