import { describe, expect, it } from 'vitest'
import { isRomajiMatch, normalizeKana } from '../app/utils/romaji'

describe('isRomajiMatch', () => {
  const cases: Array<[string, string[]]> = [
    ['わたし', ['watashi', 'watasi']],
    ['つくえ', ['tsukue', 'tukue']],
    ['コーヒー', ['koohii', 'ko-hi-']],
    ['しんぶん', ['shinbun', 'shimbun']],
    ['じゃあ', ['jaa', 'zyaa']],
    ['コーヒー', ['kouhii']],
    ['せんせい', ['sensei', 'sensee']],
    ['がっこう', ['gakkou', 'gakkoo']],
    // Dữ liệu thật có romaji nhiều chữ: dấu cách không được làm sai đáp án.
    ['けんきゅうします', ['kenkyuu shimasu', 'kenkyuushimasu', 'kenkyuu  shimasu']],
    ['もうすこし', ['mou sukoshi', 'mousukoshi', 'moo sukoshi']],
    ['コピーします', ['kopii shimasu', 'kopiishimasu', 'kopi-shimasu']],
  ]

  for (const [kana, inputs] of cases) {
    for (const input of inputs) {
      it(`${kana} chấp nhận "${input}"`, () => {
        expect(isRomajiMatch(input, kana)).toBe(true)
      })
    }
  }

  it('bỏ qua hoa thường và khoảng trắng thừa', () => {
    expect(isRomajiMatch('  WaTaShi ', 'わたし')).toBe(true)
  })

  it('từ chối input rỗng', () => {
    expect(isRomajiMatch('', 'わたし')).toBe(false)
    expect(isRomajiMatch('   ', 'わたし')).toBe(false)
  })

  it('từ chối từ khác', () => {
    expect(isRomajiMatch('sensei', 'わたし')).toBe(false)
    expect(isRomajiMatch('tukue', 'つくえです')).toBe(false)
  })
})

describe('normalizeKana', () => {
  it('khai triển ー thành nguyên âm đứng trước', () => {
    expect(normalizeKana('コーヒー')).toBe('こおひい')
    expect(normalizeKana('ラーメン')).toBe('らあめん')
  })

  it('gom các cách viết cùng một âm dài', () => {
    expect(normalizeKana('こうひい')).toBe(normalizeKana('コーヒー'))
    expect(normalizeKana('せんせい')).toBe(normalizeKana('せんせえ'))
  })

  it('đưa katakana về hiragana', () => {
    expect(normalizeKana('テレビ')).toBe('てれび')
  })
})
