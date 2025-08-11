import { pgTable, uniqueIndex, index, serial, varchar, bigint, timestamp } from 'drizzle-orm/pg-core';
export const resourceFiles = pgTable(
  'resource_files',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    path: varchar('path', { length: 255 }).notNull(),
    extension: varchar('extension', { length: 255 }).notNull(),
    size: bigint({ mode: 'number' }).notNull().default(0),
    hash: varchar('hash', { length: 255 }).notNull(),
    perceptualHash: varchar('perceptual_hash', { length: 255 }),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex().on(table.path), index().on(table.hash), index().on(table.perceptualHash)],
);
