# Migration System

Автоматическая система миграций для ZapSlot

## Структура

```
scripts/
├── run-migrations.ts          # Основной runner для data миграций
├── build-with-migrations.ts   # Сборка с автоматическими миграциями
├── dev-with-migrations.ts     # Разработка с автоматическими миграциями
└── migrations/
    ├── migrate-contractor-data.ts  # Миграция данных контракторов
    └── [other-migrations].ts       # Другие миграции данных
```

## Типы миграций

### 1. Schema Migrations (Prisma)
- Управляются командой `prisma migrate`
- Изменяют структуру базы данных
- Хранятся в `prisma/migrations/`

### 2. Data Migrations (Custom)
- Управляются нашим runner'ом
- Изменяют/мигрируют данные
- Хранятся в `scripts/migrations/`
- Отслеживаются в таблице `_data_migrations`

## Команды

### Разработка
```bash
npm run dev          # Обычная разработка (быстрый старт)
npm run dev:migrate  # Разработка с автоматическими миграциями
```

### Сборка
```bash
npm run build        # Сборка с автоматическими миграциями
npm run build:simple # Обычная сборка без миграций
```

### Миграции
```bash
npm run migrate              # Запустить только data миграции
npm run migrate:reset        # Сбросить и заново применить все миграции
npm run migrate:dev          # Создать новую schema миграцию
npm run db:push             # Прямая синхронизация схемы (без миграций)
npm run db:studio           # Открыть Prisma Studio
```

## Создание новой data миграции

1. Создайте файл в `scripts/migrations/` с описательным именем:
   ```typescript
   // scripts/migrations/002-add-categories.ts
   import { PrismaClient } from '@prisma/client'
   
   const prisma = new PrismaClient()
   
   async function addCategories() {
     console.log('🔄 Adding default categories...')
     
     const categories = [
       { name: 'Web Development', description: 'Website and web app development' },
       { name: 'Design', description: 'Graphic and UI/UX design services' },
       // ... другие категории
     ]
     
     for (const category of categories) {
       await prisma.contractorCategory.upsert({
         where: { name: category.name },
         update: {},
         create: category
       })
     }
     
     console.log('✅ Categories added successfully')
   }
   
   // Export default для migration runner
   export default addCategories
   
   // Run если вызывается напрямую
   if (import.meta.url === `file://${process.argv[1]}`) {
     addCategories()
       .catch(console.error)
       .finally(() => prisma.$disconnect())
   }
   ```

2. Миграция будет автоматически выполнена при следующем запуске `npm run dev` или `npm run build`

## Отслеживание миграций

Система автоматически отслеживает выполненные data миграции в таблице `_data_migrations`:
- `id` - уникальный ID
- `name` - имя файла миграции
- `executed_at` - дата выполнения

## Production Deployment

При деплое рекомендуется:
1. Использовать `npm run build` для автоматического применения всех миграций
2. Или выполнить миграции отдельно:
   ```bash
   npx prisma migrate deploy  # Schema миграции
   npm run migrate           # Data миграции
   npm run build:simple      # Сборка приложения
   ```

## Откат миграций

Для отката data миграций:
1. Удалите запись из `_data_migrations`
2. Вручную откатите изменения в данных
3. При необходимости используйте `npm run migrate:reset`

⚠️ **Внимание**: Data миграции не поддерживают автоматический откат. Планируйте изменения данных заранее!
