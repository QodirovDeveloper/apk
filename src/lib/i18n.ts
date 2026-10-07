import type { Lang, Level } from './plan.js';

const ru = {
  tagline: 'Разбей день на задачи. Сначала главное, между задачами перемена со звонком.',
  helpTitle: 'Как это работает',
  step1: 'Добавь задачи и укажи, сколько минут нужно на каждую.',
  step2: 'Выбери важность. «Главное» встанет наверх, «Можно потом» уйдёт в конец.',
  step3: 'Нажми «Старт». Когда время выйдет, прозвенит звонок и начнётся перемена.',
  gotIt: 'Понятно, начнём', showHelp: 'Как пользоваться?',
  now: 'СЕЙЧАС', brk: 'ПЕРЕМЕНА', dayDone: 'ДЕНЬ ЗАКРЫТ', allDone: 'Всё сделано. Отдыхай!',
  breakText: 'Встань, попей воды, разомнись.', next: 'Дальше: {name}', lastOne: 'Последняя задача на сегодня',
  noTasks: 'Задач пока нет', noTasksHint: 'Напиши задачу ниже и нажми «Добавить».',
  progress: '{d} из {n} готово', stats: 'Сделано задач: {n}. Время в работе: {t}.',
  start: 'Старт', pause: 'Пауза', resume: 'Продолжить', doneNext: 'Готово, дальше',
  skipBreak: 'Пропустить перемену', restart: 'Начать день заново',
  startAt: 'Начало дня', nowTime: 'Сейчас', breakLen: 'Перемена', min: 'мин', h: 'ч', sound: 'Звонок',
  tasksTitle: 'Мои задачи', total: 'Всего {t}, закончишь в {end}',
  addPlaceholder: 'Что нужно сделать?', add: 'Добавить',
  lvl1: 'Главное', lvl2: 'Важное', lvl3: 'Можно потом',
  stDone: 'Сделано', stActive: 'Идёт', stWait: 'Ждёт', breakRow: 'перемена {m} мин',
  save: 'Сохранить', cancel: 'Отмена',
  added: 'Задача добавлена', deleted: 'Задача удалена', undo: 'Вернуть', restarted: 'День начат заново',
  orderChanged: 'Порядок изменился, день начат заново', cleared: 'Список очищен',
  templateLoaded: 'Пример загружен. Меняй его под себя.', emptyName: 'Напиши название задачи',
  empty: 'Список пуст. Добавь свою задачу или возьми готовый пример:',
  clearAll: 'Очистить список', settings: 'Настройки дня', language: 'Язык',
  privacy: 'Задачи хранятся только на этом телефоне.',
};

type Dict = typeof ru;

const uz: Dict = {
  tagline: "Kuningizni vazifalarga bo'ling. Avval eng muhimi, vazifalar orasida qo'ng'iroq bilan tanaffus.",
  helpTitle: 'Bu qanday ishlaydi',
  step1: "Vazifalarni qo'shing va har biriga necha daqiqa kerakligini yozing.",
  step2: "Muhimligini tanlang. «Eng muhim» tepaga chiqadi, «Keyinroq» oxiriga tushadi.",
  step3: "«Boshlash»ni bosing. Vaqt tugaganda qo'ng'iroq chalinadi va tanaffus boshlanadi.",
  gotIt: 'Tushunarli, boshladik', showHelp: 'Qanday foydalaniladi?',
  now: 'HOZIR', brk: 'TANAFFUS', dayDone: 'KUN YAKUNLANDI', allDone: 'Hammasi bajarildi. Dam oling!',
  breakText: "Turing, suv iching, biroz harakat qiling.", next: 'Keyingisi: {name}', lastOne: 'Bugungi oxirgi vazifa',
  noTasks: "Hozircha vazifa yo'q", noTasksHint: "Quyida vazifani yozing va «Qo'shish»ni bosing.",
  progress: '{n} tadan {d} tasi bajarildi', stats: 'Bajarilgan vazifalar: {n}. Ishlangan vaqt: {t}.',
  start: 'Boshlash', pause: 'Pauza', resume: 'Davom etish', doneNext: 'Tayyor, keyingisi',
  skipBreak: "Tanaffusni o'tkazib yuborish", restart: 'Kunni qaytadan boshlash',
  startAt: 'Kun boshlanishi', nowTime: 'Hozir', breakLen: 'Tanaffus', min: 'daq', h: 'soat', sound: "Qo'ng'iroq",
  tasksTitle: 'Mening vazifalarim', total: 'Jami {t}, {end} da tugatasiz',
  addPlaceholder: 'Nima qilish kerak?', add: "Qo'shish",
  lvl1: 'Eng muhim', lvl2: 'Muhim', lvl3: 'Keyinroq',
  stDone: 'Bajarildi', stActive: 'Ketmoqda', stWait: 'Navbatda', breakRow: 'tanaffus {m} daq',
  save: 'Saqlash', cancel: 'Bekor qilish',
  added: "Vazifa qo'shildi", deleted: "Vazifa o'chirildi", undo: 'Qaytarish', restarted: 'Kun qaytadan boshlandi',
  orderChanged: "Tartib o'zgardi, kun qaytadan boshlandi", cleared: 'Ro\'yxat tozalandi',
  templateLoaded: "Namuna yuklandi. Uni o'zingizga moslang.", emptyName: 'Vazifa nomini yozing',
  empty: "Ro'yxat bo'sh. O'z vazifangizni qo'shing yoki tayyor namunani tanlang:",
  clearAll: "Ro'yxatni tozalash", settings: 'Kun sozlamalari', language: 'Til',
  privacy: 'Vazifalar faqat shu telefonda saqlanadi.',
};

const en: Dict = {
  tagline: 'Split your day into tasks. Most important first, with a bell and a break between tasks.',
  helpTitle: 'How it works',
  step1: 'Add tasks and set how many minutes each one needs.',
  step2: 'Pick a priority. Top priority goes first, Later goes to the end.',
  step3: 'Press Start. When time is up, a bell rings and the break begins.',
  gotIt: "Got it, let's start", showHelp: 'How does it work?',
  now: 'NOW', brk: 'BREAK', dayDone: 'DAY COMPLETE', allDone: 'All done. Time to rest!',
  breakText: 'Stand up, drink some water, stretch.', next: 'Next: {name}', lastOne: 'Last task for today',
  noTasks: 'No tasks yet', noTasksHint: 'Type a task below and press Add.',
  progress: '{d} of {n} done', stats: 'Tasks done: {n}. Time worked: {t}.',
  start: 'Start', pause: 'Pause', resume: 'Resume', doneNext: 'Done, next',
  skipBreak: 'Skip break', restart: 'Restart day',
  startAt: 'Day starts', nowTime: 'Now', breakLen: 'Break', min: 'min', h: 'h', sound: 'Bell',
  tasksTitle: 'My tasks', total: 'Total {t}, done by {end}',
  addPlaceholder: 'What needs doing?', add: 'Add',
  lvl1: 'Top priority', lvl2: 'Important', lvl3: 'Later',
  stDone: 'Done', stActive: 'In progress', stWait: 'Waiting', breakRow: 'break {m} min',
  save: 'Save', cancel: 'Cancel',
  added: 'Task added', deleted: 'Task deleted', undo: 'Undo', restarted: 'Day restarted',
  orderChanged: 'Order changed, day restarted', cleared: 'List cleared',
  templateLoaded: 'Example loaded. Make it your own.', emptyName: 'Type a task name',
  empty: 'Your list is empty. Add a task or start from an example:',
  clearAll: 'Clear list', settings: 'Day settings', language: 'Language',
  privacy: 'Tasks are stored only on this phone.',
};

export type Key = keyof Dict;
const DICTS: Record<Lang, Dict> = { ru, uz, en };

export function makeTr(lang: Lang) {
  return (key: Key, vars?: Record<string, string | number>) => {
    let s = DICTS[lang][key] ?? ru[key];
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(String(vars[k]));
    return s;
  };
}
export type Tr = ReturnType<typeof makeTr>;

export function dur(tr: Tr, min: number): string {
  const h = Math.floor(min / 60), m = min % 60;
  if (!h) return `${m} ${tr('min')}`;
  return m ? `${h} ${tr('h')} ${m} ${tr('min')}` : `${h} ${tr('h')}`;
}

export const levelKey = (pr: Level): Key => (pr === 1 ? 'lvl1' : pr === 2 ? 'lvl2' : 'lvl3');

// Intl yo'q bo'lishi mumkin, shuning uchun sanani o'zimiz yozamiz
const DAYS: Record<Lang, string[]> = {
  ru: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  uz: ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};
const MONTHS: Record<Lang, string[]> = {
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
export function today(lang: Lang, d: Date): string {
  const day = DAYS[lang][d.getDay()], month = MONTHS[lang][d.getMonth()], n = d.getDate();
  const text = lang === 'uz' ? `${day}, ${n}-${month}` : `${day}, ${n} ${month}`;
  return text.toUpperCase();
}

// Tayyor namunalar: [nomi, daqiqa, muhimlik]
type Tpl = { label: string; tasks: [string, number, Level][] };
export const TEMPLATES: Record<Lang, Tpl[]> = {
  ru: [
    { label: 'Школа', tasks: [['Математика', 40, 1], ['Родной язык', 30, 1], ['Английский язык', 30, 2], ['Чтение', 30, 2], ['Рисование', 20, 3]] },
    { label: 'Университет', tasks: [['Лекция и конспект', 60, 1], ['Практика и задачи', 60, 1], ['Повторение', 30, 2], ['Статья или книга', 30, 3]] },
    { label: 'Работа', tasks: [['Самая важная задача дня', 90, 1], ['Почта и сообщения', 30, 2], ['Встречи', 45, 2], ['Мелкие дела', 30, 3]] },
    { label: 'Дом', tasks: [['Готовка', 45, 1], ['Спорт', 30, 1], ['Уборка', 30, 2], ['Чтение для себя', 30, 3]] },
  ],
  uz: [
    { label: 'Maktab', tasks: [['Matematika', 40, 1], ['Ona tili', 30, 1], ['Ingliz tili', 30, 2], ["Kitob o'qish", 30, 2], ['Rasm chizish', 20, 3]] },
    { label: 'Universitet', tasks: [["Ma'ruza va konspekt", 60, 1], ['Amaliyot va masalalar', 60, 1], ['Takrorlash', 30, 2], ['Maqola yoki kitob', 30, 3]] },
    { label: 'Ish', tasks: [['Kunning eng muhim vazifasi', 90, 1], ['Pochta va xabarlar', 30, 2], ['Uchrashuvlar', 45, 2], ['Mayda ishlar', 30, 3]] },
    { label: 'Uy', tasks: [['Ovqat tayyorlash', 45, 1], ['Sport', 30, 1], ['Tozalash', 30, 2], ["O'zim uchun kitob", 30, 3]] },
  ],
  en: [
    { label: 'School', tasks: [['Math', 40, 1], ['Native language', 30, 1], ['English', 30, 2], ['Reading', 30, 2], ['Drawing', 20, 3]] },
    { label: 'University', tasks: [['Lecture and notes', 60, 1], ['Practice problems', 60, 1], ['Review', 30, 2], ['Article or book', 30, 3]] },
    { label: 'Work', tasks: [['Most important task of the day', 90, 1], ['Email and messages', 30, 2], ['Meetings', 45, 2], ['Small tasks', 30, 3]] },
    { label: 'Home', tasks: [['Cooking', 45, 1], ['Exercise', 30, 1], ['Cleaning', 30, 2], ['Reading for fun', 30, 3]] },
  ],
};
