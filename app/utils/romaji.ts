import { toHiragana, toKana, toRomaji } from 'wanakana'

const KANA_FOR_VOWEL: Record<string, string> = {
  a: 'あ',
  i: 'い',
  u: 'う',
  e: 'え',
  o: 'お',
}

/** Nguyên âm của một kana, ví dụ こ → "o", ょ → "o", ん → undefined. */
function vowelOf(kana: string | undefined): string | undefined {
  if (!kana) return undefined
  return toRomaji(kana).match(/[aiueo]/g)?.pop()
}

/**
 * Khai triển dấu kéo dài ー thành nguyên âm đứng trước: こーひー → こおひい.
 * Không có bước này thì người gõ `koohii` cho コーヒー sẽ bị báo sai oan.
 */
function expandLongVowels(kana: string): string {
  let out = ''
  for (const char of kana) {
    if (char !== 'ー' && char !== 'ｰ') {
      out += char
      continue
    }
    const vowel = vowelOf(out.at(-1))
    out += vowel ? KANA_FOR_VOWEL[vowel] : ''
  }
  return out
}

/**
 * Gom các cách viết cùng một âm dài về một dạng: こう và こお (kouhii / koohii),
 * せい và せえ (sensei / sensee) đều về dạng nguyên âm đôi.
 */
function foldLongVowels(kana: string): string {
  let out = ''
  for (const char of kana) {
    const previous = vowelOf(out.at(-1))
    if (char === 'う' && previous === 'o') out += 'お'
    else if (char === 'い' && previous === 'e') out += 'え'
    else out += char
  }
  return out
}

/** Bỏ mọi khoảng trắng, kể cả dấu cách toàn rộng 　 của bàn phím tiếng Nhật. */
function stripSpaces(value: string): string {
  return value.replace(/[\s　]+/g, '')
}

/** Đưa một chuỗi kana về dạng chuẩn để so sánh: hiragana, âm dài đã gom. */
export function normalizeKana(value: string): string {
  // convertLongVowelMark: false — wanakana đổi コー thành こう, ta tự khai triển
  // thành こお cho khớp với cách người học gõ nguyên âm đôi.
  const hiragana = toHiragana(value.trim().toLowerCase(), { convertLongVowelMark: false })
  return stripSpaces(foldLongVowels(expandLongVowels(hiragana)))
}

/** Chuyển romaji người dùng gõ thành kana chuẩn. */
export function romajiToKana(input: string): string {
  const prepared = stripSpaces(input.toLowerCase())
    // shimbun / shinbun đều đúng: m đứng trước b, p, m thực chất là ん.
    .replace(/m(?=[bpm])/g, 'n')
  return normalizeKana(toKana(prepared))
}

/** So romaji người dùng gõ với kana của từ, theo kana chứ không so chuỗi thô. */
export function isRomajiMatch(input: string, expectedKana: string): boolean {
  const typed = romajiToKana(input)
  return typed !== '' && typed === normalizeKana(expectedKana)
}
