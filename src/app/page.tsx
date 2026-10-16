import { cookies } from "next/headers";
import { accessCookieName, getAccessQuestion, hasSiteAccess } from "@/lib/siteAccess";
import Hero from "@/components/layout/Hero";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import Feed from "@/components/memes/Feed";
import PostProvider from "@/components/memes/post/PostProvider";

export default async function Home() {
  const session = (await cookies()).get(accessCookieName)?.value;
  const hasAccess = hasSiteAccess(session);

  return (
    <PostProvider hasSiteAccess={hasAccess}>
      <div className="flex flex-1 flex-col bg-cream font-sans text-merle-dark">
        <SiteHeader showPostAction={hasAccess} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6">
          <Hero hasAccess={hasAccess} question={getAccessQuestion()} />
          {hasAccess && <Feed />}
        </main>
        <SiteFooter showAdminAction={hasAccess} />
      </div>
    </PostProvider>
  );
}
