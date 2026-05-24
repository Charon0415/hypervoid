import { redirect } from "next/navigation";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function RandomPostPage() {
  const posts = await getAllPosts();
  if (posts.length === 0) {
    redirect("/posts");
  }
  const pick = posts[Math.floor(Math.random() * posts.length)];
  redirect(`/posts/${pick.slug}`);
}
