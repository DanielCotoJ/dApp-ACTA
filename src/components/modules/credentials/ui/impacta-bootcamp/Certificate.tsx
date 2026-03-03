'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Twitter, Linkedin } from 'lucide-react';

type CertificateProps = {
  holderName?: string;
  year?: string | number;
  issuer?: string;
  subjectDid?: string;
  credentialType?: string;
  issuedAt?: string;
  status?: string;
};

type CertificateCanvasProps = {
  holderName?: string;
  year?: string | number;
};

export function CertificateCanvas({ holderName, year = 2026 }: CertificateCanvasProps) {
  return (
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
          <line x1="110" y1="100" x2="1360" y2="100" stroke="white" strokeWidth="1" opacity="0.5" />
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
          <line x1="1280" y1="20" x2="1280" y2="100" stroke="white" strokeWidth="1" opacity="0.5" />
        </svg>

        {/* Top-left: Impacta Logo */}
        <div className="absolute top-[3%] left-[3%] w-[8%] float-soft">
          <Image
            src="/assets/impacta-bootcamp/impacta-logo.svg"
            alt="Impacta Bootcamp logo"
            width={99}
            height={45}
            className="w-full h-auto"
          />
        </div>

        {/* Top: Row of Asteriscs */}
        <div className="absolute top-[3.2%] left-[12.5%] w-[20%] float-soft-delayed">
          <Image
            src="/assets/impacta-bootcamp/asteriscs.svg"
            alt="Asteriscs decorativos"
            width={244}
            height={30}
            className="w-full h-auto"
          />
        </div>

        {/* Top-right: Corner Seal (globe + asterisk) in white box */}
        <div className="absolute top-[2%] right-[2%] w-[5.8%] bg-white p-[0.3%] float-soft">
          <Image
            src="/assets/impacta-bootcamp/corner-seal.svg"
            alt="Sello de esquina"
            width={70}
            height={120}
            className="w-full h-auto"
          />
        </div>

        {/* Left side: Circles / Coil */}
        <div className="absolute top-[24%] left-[3%] w-[18%] float-soft-delayed">
          <Image
            src="/assets/impacta-bootcamp/circles.svg"
            alt="Circulos decorativos"
            width={232}
            height={76}
            className="w-full h-auto"
          />
        </div>

        {/* Right side: Latam Map Outline with dots */}
        <div className="absolute top-[12%] right-[3%] w-[44%] float-soft">
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
          <div className="relative border-b border-white/60 w-full">
            {holderName && (
              <span className="absolute -translate-y-[95%] font-sans text-white text-[2vw] tracking-[0.12em] uppercase whitespace-nowrap">
                {holderName}
              </span>
            )}
          </div>
        </div>

        {/* Description text */}
        <div className="absolute top-[68%] left-[3%] w-[42%]">
          <p className="font-sans text-white/90 text-[1.05vw] leading-[1.7] italic">
            Por haber completado <span className="font-bold">satisfactoriamente</span> los
            requisitos {'acad\u00E9micos'} y {'pr\u00E1cticos'} del programa intensivo{' '}
            <span className="font-bold not-italic">IMPACTA BOOTCAMP.</span>
          </p>
        </div>

        {/* Year */}
        <div className="absolute bottom-[3%] right-[4%]">
          <span className="font-sans font-bold text-white text-[5.5vw] leading-none tracking-[-0.02em]">
            {String(year)}
          </span>
        </div>

        {/* Bottom-right: Corner Dots */}
        <div className="absolute bottom-[14%] right-[1.5%] w-[4.5%] float-soft-delayed">
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

      <style jsx>{`
        .float-soft {
          animation: float-soft 10s ease-in-out infinite;
          will-change: transform;
        }

        .float-soft-delayed {
          animation: float-soft 12s ease-in-out infinite;
          animation-delay: -3s;
          will-change: transform;
        }

        @keyframes float-soft {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -8px, 0);
          }
        }
      `}</style>
    </div>
  );
}

export default function Certificate(props: CertificateProps) {
  const { issuedAt, year, issuer, subjectDid, credentialType, status } = props;
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setShareUrl(window.location.href);
  }, []);

  const derivedYear =
    typeof year !== 'undefined'
      ? year
      : issuedAt && !Number.isNaN(Date.parse(issuedAt))
        ? new Date(issuedAt).getFullYear()
        : 2026;

  const details = [
    issuer && { label: 'Issuer', value: issuer },
    subjectDid && { label: 'Holder DID', value: subjectDid },
    credentialType && { label: 'Credential Type', value: credentialType },
    issuedAt && { label: 'Issued At', value: issuedAt },
    status && { label: 'Status', value: status },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-[1400px] flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-1.5">
        {/* Certificado a la izquierda */}
        <div className="w-full max-w-[900px] lg:max-w-[900px] shrink-0">
          <div className="scale-[0.8] sm:scale-[0.75] origin-top-left w-full">
            <CertificateCanvas holderName={props.holderName} year={derivedYear} />
          </div>
        </div>

        {details.length > 0 && (
          <div className="w-full lg:w-[480px] shrink-0 flex flex-col gap-4">
            <div className="rounded-xl bg-black/80 border border-white/15 px-5 py-4 sm:px-6 sm:py-5 text-white">
              <div className="text-[11px] sm:text-xs tracking-[0.18em] text-white/50 uppercase mb-3">
                Credential Details
              </div>
              <div className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
                {details.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-1 sm:grid-cols-[140px_minmax(0,1fr)] gap-1 sm:gap-3 border-t border-white/8 first:border-t-0 pt-2 first:pt-0"
                  >
                    <div className="font-semibold text-white/70 uppercase text-[11px] sm:text-[11px]">
                      {item.label}
                    </div>
                    <div className="font-mono text-white/90 break-all">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={
                  shareUrl
                    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `Mi certificado Impacta Bootcamp\n\n${shareUrl}\n\nEmitido por @ActaXyz \nGracias a @TheBAFNetwork @TrustlessWork @StellarOrg por el apoyo`,
                      )}`
                    : '#'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-medium transition-colors"
              >
                <Twitter className="w-4 h-4 shrink-0" />
                <span>Share X</span>
              </a>
              <a
                href={
                  shareUrl
                    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
                    : '#'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-medium transition-colors"
              >
                <Linkedin className="w-4 h-4 shrink-0" />
                <span>Share LinkedIn</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
