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
| Воксельная сцена | `src/components/three/` (раскладка ника в `formations.ts`) |

## 3D и облегчённая версия

Наверху главной кубы собирают ник: под курсором воксели набухают, от движения курсора по буквам идут волны. На телефонах (до 768px) 3D нет совсем, вместо него ник набран обычным шрифтом. При прокрутке он уезжает вверх вместе со страницей. На десктопе полная версия включается автоматически на мощных устройствах, посетитель может переключить режим кнопкой в шапке, выбор сохраняется.

## Живые данные

- GitHub и Modrinth: на сервере, кешируются на час (`src/lib/live.ts`).
- Статус Discord: через [Lanyard](https://github.com/Phineas/lanyard), для работы нужно состоять на их Discord-сервере.

## Аналитика

Vercel Analytics работает всегда (без cookie). PostHog подключается только после согласия в баннере. Переменные окружения описаны в `.env.example`.
