import { cookies } from "next/headers";
import { accessCookieName, getAccessQuestion, hasSiteAccess } from "@/lib/siteAccess";
import Hero from "@/components/layout/Hero";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import Feed from "@/components/memes/Feed";
import PostProvider from "@/components/memes/post/PostProvider";

export default async function Home({ searchParams }: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = (await cookies()).get(accessCookieName)?.value;
  const hasAccess = hasSiteAccess(session);
  const requestedMeme = (await searchParams).meme;
  const sharedMemeId = typeof requestedMeme === "string" ? requestedMeme : undefined;

  return (
    <PostProvider hasSiteAccess={hasAccess} baseUrl={process.env.BASE_URL ?? "https://rick-memes.nl"}>
      <div className="flex flex-1 flex-col bg-cream font-sans text-merle-dark">
        <SiteHeader showPostAction={hasAccess} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-12">
          <Hero hasAccess={hasAccess} question={getAccessQuestion()} sharedMemeId={sharedMemeId} />
          {hasAccess && <Feed sharedMemeId={sharedMemeId} />}
        </main>
        <SiteFooter showAdminAction={hasAccess} />
      </div>
    </PostProvider>
  );
}
