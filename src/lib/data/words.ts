import type { Word } from "$lib/types";

// SSG-friendly loader: words are plain JSON files committed to the repo.
// Sveltia CMS manages `content/words/*.json` and commits changes to GitHub.

// From this file (src/lib/data/words.ts) we need to go up three levels
// to reach the project root, then into content/words.
const modules = import.meta.glob("../../../content/words/*.json", {
  eager: true,
});

const normaliseModule = (mod: unknown): any => {
  if (mod && typeof mod === "object" && "default" in (mod as any)) {
    return (mod as any).default;
  }
  return mod;
};

const rawWords = Object.entries(modules)
  .map(([path, mod]) => {
    const data = normaliseModule(mod) as any;
    const filename = path.split("/").pop() ?? "";
    const id = filename.replace(/\.json$/i, "");

    if (!data || typeof data.nikud !== "string" || !data.nikud.trim()) {
      return null;
    }

    const word: Word = {
      id,
      nikud: data.nikud,
      imageUrl: data.image,
      soundUrl: data.sound ?? null,
      level: Number(data.level ?? 1) || 1,
    };
    return word;
  })
  .filter((w) => w !== null);

export const allWords: Word[] = rawWords as Word[];

export const getWordsForLevel = (level: number): Word[] =>
  allWords.filter((w) => w.level === level);
