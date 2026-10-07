// Android modullariga ko'prik (MainApplication'da ro'yxatdan o'tgan).
// Faqat background thread'da (effect va event handler ichida) chaqiriladi.
// Brauzerdagi preview'da modullar yo'q: unda xotirada saqlaymiz va ovoz chiqarmaymiz.

const KEY = 'time-management-v1';
let memory: string | null = null;

function modules() {
  return typeof NativeModules === 'undefined' ? undefined : NativeModules;
}

export function loadState(cb: (raw: string | null) => void) {
  const storage = modules()?.NativeLocalStorageModule;
  if (!storage) {
    cb(memory);
    return;
  }
  try {
    storage.getStorageItem(KEY, (value) => cb(value ?? null));
  } catch {
    cb(null);
  }
}

export function saveState(raw: string) {
  memory = raw;
  try {
    modules()?.NativeLocalStorageModule?.setStorageItem(KEY, raw);
  } catch {
    // saqlab bo'lmadi: ilova ishlashda davom etadi
  }
}

export function ring() {
  try {
    modules()?.BellModule?.ring();
  } catch {
    // ovozsiz qurilma
  }
}

export function keepAwake(on: boolean) {
  try {
    modules()?.BellModule?.keepAwake(on);
  } catch {
    // ixtiyoriy imkoniyat
  }
}
