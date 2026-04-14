# Readme AI - Руководство пользователя

VSCode расширение для генерации README файлов с помощью AI и repomix.

## Возможности

- 📦 Упаковка репозитория в единый файл с помощью **repomix**
- 🤖 Отправка кода в AI для генерации README
- 🔢 Подсчёт токенов для модели Qwen
- ⚙️ Автоматическое создание конфигов `.ilnsk` и `repomix.config.json`

## Установка

### Из исходников

```bash
npm install
npm run compile
npm run package
```

Установите полученный `.vsix` файл через VSCode: `Extensions: Install from VSIX`

### Режим разработки

```bash
npm install
npm run compile
# Нажмите F5 для запуска в режиме разработки
```

## Конфигурация

### Файл `.ilnsk`

Создаётся автоматически в корне проекта:

```json
{
  "apiUrl": "https://api.hydraai.ru/v1/",
  "apiKey": "your-api-key",
  "model": "hydra-gpt-mini",
  "prompt": "...",
  "gitmoji": true
}
```

### Файл `repomix.config.json`

Создаётся автоматически с оптимальными настройками для упаковки кода.

### Настройка через UI

1. Откройте **Explorer** (левая панель)
2. Нажмите **Readme AI → Setup**
3. Введите API URL, API Key и название модели

## Использование

1. Откройте **Explorer** → **Readme AI**
2. Нажмите **Generate README**
3. Плагин:
   - Запускает repomix → создаёт `repomix-output.xml`
   - Подсчитывает токены для Qwen
   - Отправляет код в AI
   - Создаёт `README.md`

## Команды

| Команда | Описание |
|---------|----------|
| `Readme AI: Setup` | Настройка параметров API |
| `Readme AI: Generate README` | Генерация README |

## Требования

- VSCode версии 1.115.0 или выше
- Node.js 18+

## Разработка

```bash
# Компиляция
npm run compile

# Сборка .vsix
npm run package

# Автоперекомпиляция
npm run watch
```

## Публикация

```bash
# Публикация в VSCode Marketplace
npm run publish

# Публикация с обновлением версии
npm run publish:minor
npm run publish:patch
```

---

**Примечание:** Перед публикацией создайте аккаунт publisher на https://marketplace.visualstudio.com/ и обновите поле `publisher` в `package.json`.