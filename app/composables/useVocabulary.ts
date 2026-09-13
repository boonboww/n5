import rawWords from '~~/vocabulary.json'

export interface Word {
  lesson: number
  kana: string
  romaji: string
  meaning: string
}

export interface Lesson {
  lesson: number
  count: number
}

/** Đọc JSON một lần, ở tầng module — mọi trang dùng chung mảng này. */
const words: readonly Word[] = rawWords as Word[]

/**
 * Danh sách bài suy ra từ dữ liệu thực tế, không hardcode:
 * thêm bài mới vào vocabulary.json là web tự có bài đó.
 */
const lessons: readonly Lesson[] = (() => {
  const counts = new Map<number, number>()
  for (const word of words) {
    counts.set(word.lesson, (counts.get(word.lesson) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([lesson, count]) => ({ lesson, count }))
    .sort((a, b) => a.lesson - b.lesson)
})()

export function useVocabulary() {
  /** Gộp từ của các bài đã chọn, giữ thứ tự bài tăng dần. */
  function wordsForLessons(selected: readonly number[]): Word[] {
    const wanted = new Set(selected)
    return words.filter((word) => wanted.has(word.lesson))
  }

  return { words, lessons, wordsForLessons }
}
