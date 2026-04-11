# Readme AI

Browser extension (WXT + React) для управления репозиториями GitHub.

## Стек

- **WXT** - фреймворк для browser extensions
- **React** - UI компоненты
- **TypeScript** - типизация
- **pnpm** - пакетный менеджер

## Возможности

- Клонирование GitHub репозиториев во временную папку
- Пушинг изменений обратно в GitHub через REST API
- Сохранение GitHub токена в storage браузера

## Поддерживаемые браузеры

- Chrome (Manifest V3)
- Firefox (Manifest V2)

## Установка Node.js

```bash
# Установка nvm (если нет)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Установка Node.js 20 (обязательно)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20

# Проверка
node -v  # должно быть v20.x.x
```

## Установка зависимостей

```bash
pnpm install
```

## Команды

```bash
# Сборка Chrome
pnpm build

# Сборка Firefox
pnpm build:firefox

# Создание zip архива
pnpm zip
pnpm zip:firefox
```

## Структура проекта

```
readme-ai/
├── entrypoints/
│   ├── background/main.ts    # Background script (GitHub API логика)
│   ├── popup/index.html      # Popup UI (React/HTML)
│   └── options/index.html    # Options page (настройки)
├── wxt.config.ts             # WXT конфигурация
├── package.json              # Зависимости
└── tsconfig.json             # TypeScript конфиг
```

## Установка в браузер

### Chrome
1. Выполнить `pnpm build`
2. Открыть `chrome://extensions`
3. Включить "Режим разработчика"
4. Нажать "Загрузить распакованное"
5. Выбрать папку `.output/chrome-mv3`

### Firefox
1. Выполнить `pnpm build:firefox`
2. Открыть `about:debugging`
3. Нажать "Загрузить временное дополнение"
4. Выбрать файл `manifest.json` из папки `.output/firefox-mv2`

## Использование

1. Нажать на иконку расширения
2. Ввести URL репозитория (например `https://github.com/user/repo`)
3. Ввести GitHub Personal Access Token (нужен `repo` scope для приватных репозиториев)
4. Нажать "Clone Repository" для загрузки
5. Редактировать файлы локально
6. Нажать "Push Changes" для коммита и пуша

## Известные проблемы

- **pnpm dev** - может не работать из-за бага WXT
- Используйте `pnpm build` + ручную перезагрузку расширения для тестирования
- Требуется Node.js 20 (проверено на 20.20.2)