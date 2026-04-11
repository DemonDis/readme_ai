# README AI

Браузерное расширение для генерации и публикации файлов README на GitHub с предпросмотром в реальном времени.

## Возможности

- **Предпросмотр в реальном времени** — Рендеринг markdown по мере ввода
- **Интеграция с GitHub** — Загрузка и публикация README.md напрямую в репозитории
- **Кросс-браузерность** — Работает в Chrome, Firefox, Safari, Edge

## Установка

```bash
npm install
npm run build
```

1. Откройте `chrome://extensions`
2. Включите "Режим разработчика"
3. Нажмите "Загрузить распакованное расширение"
4. Выберите папку `.output/chrome-mv3/`

## Использование

1. Нажмите на иконку расширения
2. Введите ваш Personal Access Token (PAT) с правами `repo`
3. Выберите репозиторий из списка
4. Редактируйте markdown в левой панели
5. Смотрите предпросмотр в правой панели
6. Нажмите "Publish to GitHub"

## GitHub Token

Создать токен можно здесь: https://github.com/settings/tokens

Необходимые права:
- `repo` — для приватных репозиториев

## Команды

- `npm run dev` — Режим разработки с hot reload
- `npm run build` — Сборка для всех браузеров

### Сборка для конкретного браузера

```bash
npx wxt build --browser chrome   # Chrome, Edge, Brave
npx wxt build --browser firefox
npx wxt build --browser safari
```

Вывод в `.output/{browser}/`