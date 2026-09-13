<script setup lang="ts">
const { lessons, wordsForLessons } = useVocabulary()

type Mode = 'flashcard' | 'typing'

const selected = ref<number[]>([])
const mode = ref<Mode>('flashcard')

const allSelected = computed(
  () => lessons.length > 0 && selected.value.length === lessons.length,
)
const wordCount = computed(() => wordsForLessons(selected.value).length)

function toggleAll() {
  selected.value = allSelected.value ? [] : lessons.map((lesson) => lesson.lesson)
}

function start() {
  if (wordCount.value === 0) return
  navigateTo({
    path: '/study',
    query: {
      lessons: [...selected.value].sort((a, b) => a - b).join(','),
      mode: mode.value,
    },
  })
}
</script>

<template>
  <main class="mx-auto min-h-dvh w-full max-w-md px-5 pt-10 pb-40">
    <header>
      <h1 class="text-2xl font-semibold tracking-tight">Từ vựng N5</h1>
      <p class="mt-1 text-sm text-muted">Minna no Nihongo</p>
    </header>

    <p v-if="lessons.length === 0" class="mt-10 rounded-2xl border border-line bg-card p-5 text-sm text-muted">
      Chưa có từ nào. Thêm từ vào <code class="font-mono">vocabulary.json</code> rồi tải lại trang.
    </p>

    <template v-else>
      <section class="mt-9">
        <div class="flex items-baseline justify-between">
          <h2 class="text-sm font-semibold tracking-wide text-muted uppercase">Chọn bài</h2>
          <button
            type="button"
            class="-mr-2 min-h-11 px-2 text-sm font-medium text-accent"
            @click="toggleAll"
          >
            {{ allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả' }}
          </button>
        </div>

        <ul class="mt-1 space-y-2">
          <li v-for="lesson in lessons" :key="lesson.lesson">
            <label
              class="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 transition-colors"
              :class="
                selected.includes(lesson.lesson)
                  ? 'border-accent bg-accent-soft'
                  : 'border-line bg-card'
              "
            >
              <input v-model="selected" type="checkbox" :value="lesson.lesson" class="peer sr-only" >
              <span
                class="grid size-6 shrink-0 place-items-center rounded-md border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-paper"
                :class="
                  selected.includes(lesson.lesson)
                    ? 'border-accent bg-accent text-accent-ink'
                    : 'border-line'
                "
              >
                <svg
                  v-if="selected.includes(lesson.lesson)"
                  viewBox="0 0 16 16"
                  class="size-4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="m3.5 8.5 3 3 6-7" />
                </svg>
              </span>
              <span class="font-medium">Bài {{ lesson.lesson }}</span>
              <span class="ml-auto text-sm text-muted">{{ lesson.count }} từ</span>
            </label>
          </li>
        </ul>
      </section>

      <section class="mt-9">
        <h2 class="text-sm font-semibold tracking-wide text-muted uppercase">Kiểu học</h2>
        <div class="mt-2 grid grid-cols-2 gap-2">
          <button
            v-for="option in [
              { value: 'flashcard' as const, label: 'Flashcard', hint: 'Lật thẻ' },
              { value: 'typing' as const, label: 'Gõ romaji', hint: 'Nghĩa → romaji' },
            ]"
            :key="option.value"
            type="button"
            class="min-h-16 rounded-2xl border px-3 text-left transition-colors"
            :class="
              mode === option.value ? 'border-accent bg-accent-soft' : 'border-line bg-card'
            "
            :aria-pressed="mode === option.value"
            @click="mode = option.value"
          >
            <span class="block font-medium">{{ option.label }}</span>
            <span class="mt-0.5 block text-xs text-muted">{{ option.hint }}</span>
          </button>
        </div>
      </section>

      <div
        class="fixed inset-x-0 bottom-0 border-t border-line bg-paper/95 backdrop-blur"
        style="padding-bottom: env(safe-area-inset-bottom)"
      >
        <div class="mx-auto w-full max-w-md px-5 py-4">
          <button
            type="button"
            class="min-h-14 w-full rounded-2xl bg-accent text-base font-semibold text-accent-ink transition-opacity disabled:opacity-40"
            :disabled="wordCount === 0"
            @click="start"
          >
            {{ wordCount === 0 ? 'Chọn ít nhất một bài' : `Bắt đầu · ${wordCount} từ` }}
          </button>
        </div>
      </div>
    </template>
  </main>
</template>
