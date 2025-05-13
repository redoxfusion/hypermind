import { Experience } from "../../../components/Experience";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function Home() {
  return (
    <main className={`${poppins.className} h-screen min-h-screen font-poppins`}>
      <Experience />
    </main>
  );
}
