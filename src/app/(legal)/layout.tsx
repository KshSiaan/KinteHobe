import Navbar from "@/components/core/base/navbar";
import { DetailedFooter } from "@/components/footer-detailed";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <DetailedFooter />
    </>
  );
}
