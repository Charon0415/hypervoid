import { isEmailConfigured } from "@/lib/email";
import { VoidEntryLogin } from "@/components/VoidEntryLogin";

export default function Home() {
  return <VoidEntryLogin emailEnabled={isEmailConfigured()} />;
}
