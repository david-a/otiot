import type { Word } from "$lib/types";

// SSG-friendly loader: words are plain JSON files committed to the repo.
// Sveltia CMS manages `content/words/*.json` and commits changes to GitHub.

const modules = import.meta.glob("../../content/words/*.json", {
  eager: true,
});

const normaliseModule = (mod: unknown): any => {
  if (mod && typeof mod === "object" && "default" in (mod as any)) {
    return (mod as any).default;
  }
  return mod;
};

export const allWords: Word[] = Object.entries(modules).map(([path, mod]) => {
  const data = normaliseModule(mod) as any;
  const filename = path.split("/").pop() ?? "";
  const id = filename.replace(/\.json$/i, "");

  return {
    id,
    word: data.word,
    nikud: data.nikud,
    imageUrl: data.image,
    soundUrl: data.sound ?? null,
    level: Number(data.level ?? 1),
  };
});

export const getWordsForLevel = (level: number): Word[] =>
  allWords.filter((w) => w.level === level);
