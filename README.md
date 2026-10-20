# Petaloff — portfolio

Персональный сайт: Discord-боты, моды и плагины для Minecraft, блог.

**Стек:** Next.js 16 (App Router, Cache Components), React 19, React Three Fiber + drei, GSAP ScrollTrigger + Lenis, Motion, Tailwind CSS 4, next-intl (RU/EN), MDX, Vercel.

## Запуск

```bash
npm install
npm run dev
```

## Где что лежит

| Что | Где |
| --- | --- |
| Проекты (карточки) | `content/projects.ts` |
| Кейсы проектов | `content/projects/<slug>.<ru\|en>.mdx` (и `caseStudy: true` в карточке) |
| Посты блога | `content/blog/<slug>.mdx`, метаданные в `export const meta` (`lang`, `tags`, `date`) |
| Тексты интерфейса | `messages/ru.json`, `messages/en.json` |
| Контакты, ники, стек | `src/lib/site.ts` |
| Воксельная сцена | `src/components/three/` (раскладки кубов в `formations.ts`) |

## 3D и облегчённая версия

В шапке кубы собирают ник целиком, а при прокрутке справа по одной появляются его буквы: «Обо мне» — P-E-T, «Стек» — A-L-O, «Контакты» — F-F (`sectionLetters` в `src/lib/scene.ts`). Полная версия включается автоматически на мощных устройствах с мышью, на телефонах по умолчанию облегчённая. Посетитель может переключить режим кнопкой в шапке, выбор сохраняется.

## Живые данные

- GitHub и Modrinth: на сервере, кешируются на час (`src/lib/live.ts`).
- Статус Discord: через [Lanyard](https://github.com/Phineas/lanyard), для работы нужно состоять на их Discord-сервере.

## Аналитика

Vercel Analytics работает всегда (без cookie). PostHog подключается только после согласия в баннере. Переменные окружения описаны в `.env.example`.
