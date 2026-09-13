# Từ vựng N5

Web ôn từ vựng N5 (Minna no Nihongo) cho điện thoại. Chỉ kana, không kanji.

Hai kiểu học:

- **Flashcard** — hiện kana, chạm để lật xem romaji và nghĩa.
- **Gõ romaji** — hiện **nghĩa tiếng Việt**, bạn gõ romaji của từ đó rồi Enter. Gõ đúng thì tự sang từ sau; gõ sai thì hiện kana và romaji đúng.

## Chạy

```bash
npm install
npm run dev        # máy chủ dev
npm test           # test so khớp romaji
npm run generate   # build tĩnh, ra .output/public
```

Bản build là web tĩnh thuần, thả `.output/public` lên bất kỳ hosting tĩnh nào là chạy.

## Thêm từ vựng

Sửa [`vocabulary.json`](./vocabulary.json) ở gốc project. Mỗi từ một dòng:

```json
{ "lesson": 1, "kana": "わたし", "romaji": "watashi", "meaning": "tôi" }
```

| Trường | Nội dung |
| --- | --- |
| `lesson` | Số bài |
| `kana` | Hiragana/katakana, chữ hiện to trên thẻ |
| `romaji` | Cách đọc |
| `meaning` | Nghĩa tiếng Việt |

Danh sách bài ở trang chủ **tự suy ra từ file này**. Thêm bài 3 vào là trang chủ có bài 3 ngay, không phải sửa code.

## So khớp romaji

Không so chuỗi thô. Romaji bạn gõ được đổi sang kana rồi mới so kana với kana, nên mọi cách viết hợp lệ đều được chấp nhận:

- `watashi` = `watasi`, `tsukue` = `tukue`, `shinbun` = `shimbun`
- `koohii` = `kouhii` = `ko-hi-` cho コーヒー
- Không phân biệt hoa thường, bỏ qua khoảng trắng thừa

Code ở [`app/utils/romaji.ts`](./app/utils/romaji.ts), test ở [`test/romaji.test.ts`](./test/romaji.test.ts).

## Lưu ý

Web **không lưu tiến độ**. Tải lại trang là bắt đầu lại từ đầu — không localStorage, không cookie, không đăng nhập, không backend.

## Stack

Nuxt 4 + Vue 3 + TypeScript + Tailwind v4 + wanakana.

Tailwind v4 nối qua plugin Vite trong `nuxt.config.ts`, cấu hình nằm trong `app/assets/css/main.css` bằng `@theme`. **Không có `tailwind.config.js`** — v4 không dùng file đó.
