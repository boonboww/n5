<script setup lang="ts">
import type { Word } from '~/composables/useVocabulary'

const route = useRoute()
const router = useRouter()
const { wordsForLessons } = useVocabulary()

const lessonIds = computed(() =>
  String(route.query.lessons ?? '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value)),
)
const mode = computed(() => (route.query.mode === 'typing' ? 'typing' : 'flashcard'))

const queue = ref<Word[]>([])
const index = ref(0)
const flipped = ref(false)
const ready = ref(false)

const answer = ref('')
const status = ref<'idle' | 'correct' | 'wrong'>('idle')
const correctCount = ref(0)
const input = useTemplateRef<HTMLInputElement>('input')

const current = computed(() => queue.value[index.value])
const isLast = computed(() => index.value === queue.value.length - 1)
const finished = computed(
  () => ready.value && queue.value.length > 0 && index.value >= queue.value.length,
)

let advanceTimer: ReturnType<typeof setTimeout> | undefined
function cancelAdvance() {
  clearTimeout(advanceTimer)
  advanceTimer = undefined
}

/**
 * Trộn ở client thôi: trộn lúc render phía server sẽ ra thứ tự khác client
 * và hỏng hydration.
 */
function restart() {
  cancelAdvance()
  queue.value = shuffle(wordsForLessons(lessonIds.value))
  index.value = 0
  flipped.value = false
  correctCount.value = 0
  resetPrompt()
}

function resetPrompt() {
  answer.value = ''
  status.value = 'idle'
  if (mode.value === 'typing') nextTick(() => input.value?.focus())
}

onMounted(async () => {
  // Bản build tĩnh phân giải URL thật sau khi component mount: lúc đó
  // route.query vẫn rỗng. Đợi router sẵn sàng rồi mới dựng hàng đợi.
  await router.isReady()
  restart()
  ready.value = true
})

// Và nếu URL còn đổi sau đó nữa thì dựng lại, đừng để hàng đợi kẹt rỗng.
watch(lessonIds, restart)
onBeforeUnmount(cancelAdvance)

function next() {
  cancelAdvance()
  flipped.value = false
  index.value += 1
  resetPrompt()
}

function previous() {
  if (index.value === 0) return
  cancelAdvance()
  flipped.value = false
  index.value -= 1
  resetPrompt()
}

/** Enter: đang chờ thì chấm, đã sai rồi thì bấm tiếp sang từ sau. */
function submit() {
  if (status.value === 'wrong') {
    next()
    return
  }
  if (status.value === 'correct' || answer.value.trim() === '' || !current.value) return

  if (isRomajiMatch(answer.value, current.value.kana)) {
    status.value = 'correct'
    correctCount.value += 1
    advanceTimer = setTimeout(next, 600)
  } else {
    status.value = 'wrong'
  }
}

/** Cỡ kana co lại theo độ dài từ để từ dài không tràn ở màn 375px. */
const kanaClass = computed(() => {
  const length = current.value?.kana.length ?? 0
  if (length <= 4) return 'text-[clamp(3.25rem,19vw,5.5rem)]'
  if (length <= 6) return 'text-[clamp(2.5rem,13vw,4rem)]'
  if (length <= 9) return 'text-[clamp(2rem,9.5vw,3rem)]'
  return 'text-[clamp(1.6rem,7.5vw,2.5rem)]'
})

/**
 * Nghĩa tiếng Việt là đề bài khi gõ romaji. Nghĩa có thể dài tới vài chục ký tự
 * vì hay kèm giải thích trong ngoặc, nên ưu tiên cho xuống dòng hơn là co chữ
 * bé lại — đây là thứ duy nhất cần đọc trên màn hình.
 */
const meaningClass = computed(() => {
  const length = current.value?.meaning.length ?? 0
  if (length <= 10) return 'text-[clamp(2.25rem,11vw,3.25rem)]'
  if (length <= 20) return 'text-[clamp(1.875rem,9vw,2.75rem)]'
  if (length <= 34) return 'text-[clamp(1.5rem,7vw,2.25rem)]'
  return 'text-[clamp(1.25rem,5.5vw,1.75rem)]'
})

const lessonLabel = computed(() =>
  lessonIds.value.length === 0 ? '' : `Bài ${lessonIds.value.join(', ')}`,
)
</script>

<template>
  <main class="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-[env(safe-area-inset-bottom)]">
    <!-- Chưa mounted thì chưa có hàng đợi: giữ khung trống, đừng nháy nội dung sai. -->
    <div v-if="!ready" class="flex-1" />

    <p v-else-if="queue.length === 0" class="mt-24 text-center text-sm text-muted">
      Không có từ nào để học.
      <NuxtLink to="/" class="mt-4 block font-medium text-accent">Về trang chủ</NuxtLink>
    </p>

    <!-- Hết từ -->
    <section
      v-else-if="finished"
      class="flex flex-1 flex-col items-center justify-center gap-8 text-center"
    >
      <p class="text-lg">
        Xong <span class="font-semibold">{{ queue.length }} từ</span>
        <span v-if="mode === 'typing'" class="text-muted">
          · đúng {{ correctCount }}/{{ queue.length }}</span>
        <span v-if="lessonLabel" class="text-muted"> · {{ lessonLabel }}</span>
      </p>
      <div class="w-full space-y-3">
        <button
          type="button"
          class="min-h-14 w-full rounded-2xl bg-accent text-base font-semibold text-accent-ink"
          @click="restart"
        >
          Học lại
        </button>
        <NuxtLink
          to="/"
          class="flex min-h-14 w-full items-center justify-center rounded-2xl border border-line bg-card text-base font-medium"
        >
          Về trang chủ
        </NuxtLink>
      </div>
    </section>

    <template v-else-if="current">
      <header class="flex min-h-14 shrink-0 items-center justify-between">
        <NuxtLink to="/" class="-ml-2 flex min-h-11 items-center px-2 text-sm text-muted">
          ← Thoát
        </NuxtLink>
        <p class="font-mono text-sm text-muted tabular-nums">
          {{ index + 1 }} / {{ queue.length }}
        </p>
      </header>

      <!-- Flashcard: tấm thẻ là thứ duy nhất được nổi bật -->
      <template v-if="mode === 'flashcard'">
        <div class="relative flex-1 perspective-distant">
          <!--
            :key theo index: sang từ khác thì tạo thẻ mới, đứng sẵn ở mặt trước.
            Nếu dùng lại thẻ cũ, nó sẽ xoay ngược từ mặt sau về và trong lúc xoay
            lộ nghĩa của từ tiếp theo.
          -->
          <button
            :key="index"
            type="button"
            class="absolute inset-0 w-full transition-transform duration-500 ease-out transform-3d motion-reduce:transition-none"
            :class="{ 'rotate-y-180': flipped }"
            :aria-label="flipped ? 'Chạm để xem lại mặt trước' : 'Chạm để lật thẻ'"
            @click="flipped = !flipped"
          >
            <!-- Mặt trước -->
            <div
              class="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-3xl border border-line bg-card px-5 py-10 text-center shadow-sm backface-hidden"
              :aria-hidden="flipped"
            >
              <p class="kana font-medium wrap-anywhere" :class="kanaClass">
                {{ current.kana }}
              </p>
              <p class="text-xs text-muted">Chạm để lật</p>
            </div>

            <!-- Mặt sau -->
            <div
              class="absolute inset-0 flex rotate-y-180 flex-col items-center justify-center gap-3 rounded-3xl border border-line bg-card px-5 py-10 text-center shadow-sm backface-hidden"
              :aria-hidden="!flipped"
            >
              <p class="kana text-[clamp(1.75rem,8vw,2.5rem)] text-muted wrap-anywhere">
                {{ current.kana }}
              </p>
              <p class="font-mono text-lg text-muted">{{ current.romaji }}</p>
              <p class="text-2xl font-medium wrap-anywhere">{{ current.meaning }}</p>
            </div>
          </button>
        </div>

        <!-- Nút to ở nửa dưới màn hình -->
        <div class="grid shrink-0 grid-cols-2 gap-3 py-5">
          <button
            type="button"
            class="min-h-16 rounded-2xl border border-line bg-card text-base font-medium disabled:opacity-35"
            :disabled="index === 0"
            @click="previous"
          >
            Trước
          </button>
          <button
            type="button"
            class="min-h-16 rounded-2xl bg-accent text-base font-semibold text-accent-ink"
            @click="next"
          >
            {{ isLast ? 'Xong' : 'Sau' }}
          </button>
        </div>
      </template>

      <!-- Gõ romaji -->
      <template v-else>
        <!--
          Đề bài là nghĩa tiếng Việt, không phải kana: hiện kana rồi gõ lại
          romaji của chính nó thì chỉ là đánh vần, không phải nhớ từ.
        -->
        <section class="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <p class="font-medium wrap-anywhere" :class="meaningClass">
            {{ current.meaning }}
          </p>

          <!-- Ô kết quả giữ chỗ sẵn để đề bài không nhảy khi chấm. -->
          <div class="min-h-32 w-full" aria-live="polite">
            <div v-if="status === 'correct'" class="space-y-2">
              <p class="text-sm font-semibold text-ok">Đúng</p>
              <p class="kana text-[clamp(1.75rem,8vw,2.5rem)] wrap-anywhere">{{ current.kana }}</p>
            </div>
            <div v-else-if="status === 'wrong'" class="space-y-2">
              <p class="text-sm text-bad">Chưa đúng</p>
              <p class="kana text-[clamp(1.75rem,8vw,2.5rem)] wrap-anywhere">{{ current.kana }}</p>
              <p class="font-mono text-lg text-muted">{{ current.romaji }}</p>
            </div>
          </div>
        </section>

        <form class="shrink-0 space-y-3 py-5" @submit.prevent="submit">
          <input
            ref="input"
            v-model="answer"
            type="text"
            autocapitalize="off"
            autocorrect="off"
            autocomplete="off"
            spellcheck="false"
            autofocus
            enterkeyhint="go"
            placeholder="gõ romaji"
            aria-label="Gõ romaji của từ"
            class="min-h-14 w-full rounded-2xl border-2 bg-card px-4 text-center font-mono text-lg outline-none"
            :class="{
              'border-line': status === 'idle',
              'border-ok': status === 'correct',
              'border-bad': status === 'wrong',
            }"
          >
          <button
            type="submit"
            class="min-h-16 w-full rounded-2xl bg-accent text-base font-semibold text-accent-ink"
          >
            {{ status === 'wrong' ? (isLast ? 'Xong' : 'Tiếp') : 'Kiểm tra' }}
          </button>
        </form>
      </template>
    </template>
  </main>
</template>
