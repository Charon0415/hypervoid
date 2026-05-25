import { CommandPalette } from "@/components/CommandPalette";
import { buildCommandIndex, type CommandIndexItem } from "@/lib/command-index";

export async function CommandPaletteHost() {
  let index: CommandIndexItem[];
  try {
    index = await buildCommandIndex();
  } catch {
    // DB unavailable — render an empty index, palette still works for pages.
    index = [];
  }
  return <CommandPalette index={index} />;
}
