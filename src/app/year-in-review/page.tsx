import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function YearInReviewIndex() {
  const year = new Date().getFullYear();
  redirect(`/year-in-review/${year}`);
}
