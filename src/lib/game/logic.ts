// Game-domain helpers, adapted from the original React game's gameLogic.ts
// Kept framework-agnostic so it can be reused in tests or other UIs.

export const EXTRA_LETTERS_BY_LEVEL: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getRandomExtraLetters = (
  allLetters: string[],
  correctLetters: string[],
  count: number
): string[] => {
  const available = allLetters.filter((letter) => !correctLetters.includes(letter));
  const shuffled = shuffleArray(available);
  return shuffled.slice(0, count);
};

export const calculateScore = (level: number, wordLength: number): number => {
  return level * wordLength * 10;
};

// Hebrew nikud marks (Unicode combining diacritics)
const NIKUD_MARKS = [
  '\u05B0', // שווא
  '\u05B1', // חטף סגול
  '\u05B2', // חטף פתח
  '\u05B3', // חטף קמץ
  '\u05B4', // חיריק
  '\u05B5', // צרה
  '\u05B6', // סגול
  '\u05B7', // פתח
  '\u05B8', // קמץ
  '\u05B9', // חולם
  '\u05BA', // חולם חסר
  '\u05BB', // קובוץ
  '\u05BC', // דגש/מפיק
  '\u05BD', // מטפו
  '\u05BE', // מקף
  '\u05BF', // רפה
  '\u05C0', // פסקא
  '\u05C1', // שין שמאלית
  '\u05C2', // שין ימנית
  '\u05C3', // שין אמצעית
  '\u05C4', // שין עליונה
  '\u05C5', // שין תחתונה
  '\u05C6', // שין שמאלית עליונה
  '\u05C7' // שין ימנית עליונה
];

export interface ParsedCharacter {
  letter: string;
  nikud: string | null;
  isLetter: boolean;
}

export const parseHebrewWord = (word: string): ParsedCharacter[] => {
  const result: ParsedCharacter[] = [];
  let i = 0;

  // Vowel marks that can form תנועות ארוכות with ו/י
  const LONG_VOWEL_MARKS = ['\u05B9', '\u05BA', '\u05BB', '\u05B4'];

  const NON_VOWEL_MARKS = ['\u05BC'];

  while (i < word.length) {
    const char = word[i];
    const code = char.charCodeAt(0);

    // Check if it's a Hebrew letter (U+05D0 to U+05EA)
    if (code >= 0x05d0 && code <= 0x05ea) {
      let nikud = '';
      let j = i + 1;

      // Collect nikud marks that come directly after the letter
      while (j < word.length) {
        const nextChar = word[j];
        if (NIKUD_MARKS.includes(nextChar)) {
          nikud += nextChar;
          j++;
        } else {
          break;
        }
      }

      // (Long-vowel handling kept identical to original for correctness)
      if (j < word.length) {
        const nextChar = word[j];
        const nextCode = nextChar.charCodeAt(0);

        if (nextCode === 0x05d5 || nextCode === 0x05d9) {
          let tempK = j + 1;
          let foundLongVowel = false;
          let vowelMark = '';
          let finalK = tempK;
          let shurukDagesh = '';

          if (nextCode === 0x05d9 && nikud && nikud.includes('\u05B4')) {
            let yodHasVowel = false;
            let checkK = tempK;
            while (checkK < word.length) {
              const checkChar = word[checkK];
              if (NIKUD_MARKS.includes(checkChar)) {
                if (
                  LONG_VOWEL_MARKS.includes(checkChar) ||
                  ['\u05B5', '\u05B6', '\u05B7', '\u05B8'].includes(checkChar)
                ) {
                  yodHasVowel = true;
                  break;
                } else if (NON_VOWEL_MARKS.includes(checkChar)) {
                  checkK++;
                } else {
                  yodHasVowel = true;
                  break;
                }
              } else {
                break;
              }
            }

            if (!yodHasVowel) {
              foundLongVowel = true;
              vowelMark = '';
              finalK = tempK;
            }
          }

          if (!foundLongVowel && nextCode === 0x05d5 && tempK < word.length) {
            const dageshChar = word[tempK];
            if (dageshChar === '\u05BC') {
              foundLongVowel = true;
              vowelMark = '';
              shurukDagesh = dageshChar;
              finalK = tempK + 1;
            }
          }

          if (!foundLongVowel) {
            let vowelOnVavYod = '';

            while (tempK < word.length) {
              const nikudChar = word[tempK];
              if (NIKUD_MARKS.includes(nikudChar)) {
                if (LONG_VOWEL_MARKS.includes(nikudChar)) {
                  vowelOnVavYod = nikudChar;

                  if (nikudChar === '\u05B9' || nikudChar === '\u05BA') {
                    foundLongVowel = true;
                    vowelMark = nikudChar;
                    finalK = tempK + 1;
                    break;
                  } else if (nikudChar === '\u05B4' && nextCode === 0x05d9) {
                    const prevHasVowel =
                      nikud &&
                      nikud.split('').some((m) =>
                        ['\u05B9', '\u05BA', '\u05B5', '\u05B6', '\u05B7', '\u05B8'].includes(m)
                      );

                    if (!prevHasVowel) {
                      foundLongVowel = true;
                      vowelMark = nikudChar;
                      finalK = tempK + 1;
                      break;
                    } else {
                      break;
                    }
                  } else if (nikudChar === '\u05BB') {
                    foundLongVowel = true;
                    vowelMark = nikudChar;
                    finalK = tempK + 1;
                    break;
                  } else {
                    break;
                  }
                } else if (NON_VOWEL_MARKS.includes(nikudChar)) {
                  tempK++;
                } else {
                  break;
                }
              } else {
                break;
              }
            }

            if (!foundLongVowel && !vowelOnVavYod) {
              while (tempK < word.length) {
                const vowelChar = word[tempK];
                if (LONG_VOWEL_MARKS.includes(vowelChar)) {
                  foundLongVowel = true;
                  vowelMark = vowelChar;
                  finalK = tempK + 1;
                  break;
                } else if (NIKUD_MARKS.includes(vowelChar) && NON_VOWEL_MARKS.includes(vowelChar)) {
                  tempK++;
                } else {
                  break;
                }
              }
            }
          }

          if (foundLongVowel) {
            const combinedLetter = char + nikud + nextChar + (shurukDagesh || '');
            result.push({
              letter: combinedLetter,
              nikud: vowelMark || null,
              isLetter: true
            });
            i = finalK;
            continue;
          }
        }
      }

      result.push({
        letter: char,
        nikud: nikud || null,
        isLetter: true
      });

      i = j;
    } else if (NIKUD_MARKS.includes(char)) {
      result.push({
        letter: '',
        nikud: char,
        isLetter: false
      });
      i++;
    } else {
      i++;
    }
  }

  return result;
};

export const splitLongVowel = (
  letter: string
): { isLongVowel: boolean; baseLetter: string; vavYod: string | null } => {
  let vavYodStartIndex = -1;
  let vavYodChar = '';

  for (let i = 0; i < letter.length; i++) {
    const char = letter[i];
    const code = char.charCodeAt(0);
    if (code === 0x05d5 || code === 0x05d9) {
      vavYodStartIndex = i;
      vavYodChar = char;
      break;
    }
  }

  if (vavYodStartIndex === -1) {
    return { isLongVowel: false, baseLetter: letter, vavYod: null };
  }

  const baseLetter = letter.substring(0, vavYodStartIndex);
  const vavYod = vavYodChar ? letter.substring(vavYodStartIndex) : '';

  return {
    isLongVowel: true,
    baseLetter,
    vavYod
  };
};

export const extractLetters = (word: string): string[] => {
  const parsed = parseHebrewWord(word);
  return parsed.filter((p) => p.isLetter).map((p) => p.letter);
};

export const extractNikud = (word: string): (string | null)[] => {
  const parsed = parseHebrewWord(word);
  return parsed.filter((p) => p.isLetter).map((p) => p.nikud);
};

export const getWordStructure = (
  word: string
): { letters: string[]; nikud: (string | null)[] } => {
  const parsed = parseHebrewWord(word);
  const letters = parsed.filter((p) => p.isLetter).map((p) => p.letter);
  const nikud = parsed.filter((p) => p.isLetter).map((p) => p.nikud);
  return { letters, nikud };
};

export const normalizeHebrewText = (text: string): string => {
  if (!text) return '';

  const parsed = parseHebrewWord(text);
  return parsed
    .filter((p) => p.isLetter)
    .map((p) => {
      const letter = p.letter;
      const nikud = p.nikud || '';
      const sortedNikud = nikud.split('').sort().join('');
      return letter + sortedNikud;
    })
    .join('');
};

// Remove nikud (Hebrew combining marks) from a pointed word to get the plain form
export const deriveWordFromNikud = (nikudWord: string): string => {
  // Hebrew combining marks: U+0591–U+05C7
  return nikudWord.replace(/[\u0591-\u05C7]/g, '');
};


