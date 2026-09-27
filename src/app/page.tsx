import { HomeView } from "@/components/views/home-view";
import { RedirectIfNew } from "@/components/views/redirect-if-new";

export default function Home() {
  return (
    <>
      <RedirectIfNew />
      <HomeView />
    </>
  );
}
