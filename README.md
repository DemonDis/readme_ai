# Readme AI

Расширение браузера для управления репозиториями GitHub (клонирование, редактирование, пуш).

## Возможности

- Клонирование GitHub репозиториев во временную папку
- Пушинг изменений обратно в GitHub через REST API
- Сохранение GitHub токена в хранилище браузера

## Поддерживаемые браузеры

- Chrome (Manifest V3)
- Firefox (Manifest V2)

## Установка

```bash
# Установка зависимостей
pnpm install
```

## Разработка

```bash
# Chrome
pnpm dev

# Firefox
pnpm dev:firefox
```

## Сборка

```bash
# Chrome
pnpm build

# Firefox
pnpm build:firefox

# Создание zip архивов
pnpm zip
pnpm zip:firefox
```

## Использование

1. Нажмите на иконку расширения, чтобы открыть popup
2. Введите URL репозитория GitHub (например, `https://github.com/user/repo`)
3. Введите Personal Access Token GitHub (нужен scope `repo` для приватных репозиториев)
4. Нажмите "Clone Repository" для загрузки
5. Редактируйте файлы локально
6. Нажмите "Push Changes" для коммита и пуша

## Установка в браузер

### Chrome
1. Выполните `pnpm build`
2. Откройте `chrome://extensions`
3. Включите "Режим разработчика"
4. Нажмите "Загрузить распакованное расширение"
5. Выберите папку `.output/chrome-mv3`

### Firefox
1. Выполните `pnpm build:firefox`
2. Откройте `about:debugging`
3. Нажмите "Загрузить временное дополнение"
4. Выберите любой файл в папке `.output/firefox-mv2`