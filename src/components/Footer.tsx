import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-charcoal text-paper px-4 pt-8 pb-24">
      {/* Wordmark */}
      <div className="mb-6">
        <span className="font-display text-lg font-bold tracking-tight">
          Designer&apos;s Street
        </span>
        <p className="font-sans text-xs text-[#A0A0A0] mt-1 leading-relaxed max-w-xs">
          Exclusive, limited-edition collections from India&apos;s most celebrated designer houses.
        </p>
      </div>

      {/* Links */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#A0A0A0] mb-3">
            Shop
          </h3>
          <ul className="space-y-2">
            {["Lehengas", "Sarees", "Sherwanis", "Kurtas", "Coats"].map((item) => (
              <li key={item}>
                <Link href={`/category/${item.toLowerCase()}`} className="font-sans text-xs text-[#E0E0E0] hover:text-white transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#A0A0A0] mb-3">
            Company
          </h3>
          <ul className="space-y-2">
            {["Our Story", "The Houses", "Bespoke", "Careers"].map((item) => (
              <li key={item}>
                <Link
                  href={item === "The Houses" ? "/store" : item === "Bespoke" ? "/bespoke" : "#"}
                  className="font-sans text-xs text-[#E0E0E0] hover:text-white transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Concierge */}
      <div className="border-t border-[#4A4A4A] pt-6 mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-[#A0A0A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          <div>
            <p className="font-sans text-xs font-semibold text-[#FAFAFA]">Speak to a Stylist</p>
            <p className="font-sans text-[10px] text-[#A0A0A0]">Concierge available Mon–Sat, 10am–7pm IST</p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <p className="font-sans text-[10px] text-[#7A7A7A]">
        © {new Date().getFullYear()} Designer&apos;s Street. All rights reserved.
      </p>
    </footer>
  );
}
