# Readme AI

VSCode плагин для генерации README с помощью AI и repomix.

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
  "apiUrl": "https://api.openai.com/v1/",
  "apiKey": "your-api-key",
  "model": "gpt4",
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

## Структура проекта

```
src/
├── config/          # Конфиги (типы, repomix)
├── services/        # Бизнес-логика
│   ├── config.ts    # Работа с файлами
│   ├── repomix.ts   # Запуск repomix
│   ├── ai.ts        # Запросы к AI
│   └── token.ts     # Подсчёт токенов
├── commands/       # Команды VSCode
├── ui/             # TreeView
└── extension.ts    # Точка входа
```

## Разработка

```bash
# Компиляция
npm run compile

# Сборка .vsix
npm run package

# Автоперекомпиляция
npm run watch
```