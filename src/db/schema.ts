import { pgTable, index, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
export const resourceFiles = pgTable(
  'resource_files',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    path: varchar('path', { length: 255 }).notNull(),
    extension: varchar('extension', { length: 255 }).notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [index().on(table.path)],
);
