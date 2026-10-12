import { cookies } from "next/headers";
import AccessGate from "@/components/AccessGate";
import { accessCookieName, getAccessQuestion, hasSiteAccess } from "@/lib/siteAccess";
import Hero from "@/components/layout/Hero";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import Feed from "@/components/memes/Feed";
import PostProvider from "@/components/memes/post/PostProvider";

export default async function Home() {
  const session = (await cookies()).get(accessCookieName)?.value;
  if (!hasSiteAccess(session)) return <AccessGate question={getAccessQuestion()} />;

  return (
    <PostProvider>
      <div className="flex flex-1 flex-col bg-cream font-sans text-merle-dark">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
          <Hero />
          <Feed />
        </main>
        <SiteFooter />
      </div>
    </PostProvider>
  );
}
