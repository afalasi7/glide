import { Header } from "@/components/Header";
import { Hero } from "@/components/story/Hero";
import { Day } from "@/components/story/Day";
import { Moves } from "@/components/story/Moves";
import { Wallet } from "@/components/story/Wallet";
import { Devices } from "@/components/story/Devices";
import { Finale } from "@/components/story/Finale";

export default function Home() {
  return (
    <>
      <Header active="story" />
      <main>
        <Hero />
        <Day />
        <Moves />
        <Wallet />
        <Devices />
        <Finale />
      </main>
    </>
  );
}
