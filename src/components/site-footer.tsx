import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              AI-powered ATS resume checker: score, tailor, and rewrite your resume to land more interviews.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">Product</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><Link href="/#features" className="hover:text-foreground">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-foreground">Pricing</Link></li>
              <li><Link href="/#faq" className="hover:text-foreground">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">Account</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground">Log in</Link></li>
              <li><Link href="/register" className="hover:text-foreground">Sign up</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">Legal</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} SignalCV. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
