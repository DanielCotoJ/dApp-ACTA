import Link from 'next/link';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function NotFound() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
        <Card className="w-full max-w-2xl border-[#edeed1]/20 bg-zinc-900/80 py-10 px-8 shadow-xl backdrop-blur-sm sm:py-12 sm:px-10">
          <CardHeader className="text-center px-0">
            <p
              className="text-6xl font-bold tabular-nums tracking-tight text-[#edeed1] sm:text-8xl"
              aria-hidden
            >
              404
            </p>
            <CardTitle className="text-2xl font-semibold text-white sm:text-3xl">
              Page not found
            </CardTitle>
            <CardDescription className="text-base text-zinc-400 sm:text-lg">
              The page you’re looking for doesn’t exist or has been moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-0 sm:flex-row sm:justify-center sm:gap-6">
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="div"
              className="flex items-center justify-center bg-white text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-200"
              highlightEnabled={false}
            >
              <Link
                href="/"
                className="w-full sm:w-60 rounded-full px-6 py-2 font-medium text-black text-center focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#edeed1] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Home
              </Link>
            </HoverBorderGradient>
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="div"
              className="flex items-center justify-center bg-zinc-800/50 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-800/70 backdrop-blur-sm"
              highlightEnabled={false}
            >
              <Link
                href="/dashboard"
                className="w-full sm:w-60 rounded-full px-6 py-2 font-medium text-white text-center focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#edeed1] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Dashboard
              </Link>
            </HoverBorderGradient>
          </CardContent>
        </Card>
      </div>
    </AuroraBackground>
  );
}
