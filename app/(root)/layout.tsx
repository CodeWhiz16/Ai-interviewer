import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="MockMate Logo" width={38} height={32} />
          <h2 className="text-primary-100">Laksh.AI</h2>
        </Link>
      </nav>
<div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute min-w-full min-h-full object-cover opacity-[0.2]" // Keep opacity low like before
  >
    <source src="/bg2.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
  
</div>
      {children}
    </div>
  );
};

export default Layout;
