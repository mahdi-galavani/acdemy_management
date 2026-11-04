import type { PoolClient } from 'pg';
import { getPool, inMemoryStore, usesPostgres } from './db';

// Identifiers come only from this allowlist; values always use SQL parameters.
const fields = {
  courses: 'id title slug category price discountPrice capacity enrolledCount format formatLabel duration sessionsCount certificate instructor instructorRole syllabusItems prerequisites level startDate schedule image status description materialsProvided',
  products: 'id title category subcategory price isPerKg minWeightKg image description ingredients leadTimeDays inStock isPopular',
  students: 'id fullName nationalCode phone email notes createdAt',
  course_enrollments: 'id studentId courseId courseTitle enrolledAt tuitionTotal tuitionPaid paymentStatus certificateIssued status notes',
  orders: 'id orderNumber customerName customerPhone deliveryDate deliveryAddress items totalAmount status notes createdAt',
  faqs: 'id question answer category order',
  admins: 'id username password_hash role',
  site_settings: 'id data',
} as const;
export type Table = keyof typeof fields;
const column = (key: string) => key === 'order' ? 'sort_order' : key.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`);
const jsonFields = new Set(['syllabusItems', 'ingredients', 'items', 'data']);
const numberFields = new Set(['price', 'discountPrice', 'minWeightKg', 'totalAmount', 'tuitionTotal', 'tuitionPaid']);
function decode(table: Table, row: any) {
  return Object.fromEntries(fields[table].split(' ').map(key => {
    let value = row[column(key)];
    if (value instanceof Date) value = value.toISOString();
    if (numberFields.has(key) && value != null) value = Number(value);
    return [key, value];
  }));
}

type Memory = Record<Table, any[]>;
function memorySnapshot(): Memory {
  return structuredClone({
    ...inMemoryStore,
    students: inMemoryStore.students.map(({ enrollments, ...student }) => student),
    course_enrollments: inMemoryStore.students.flatMap(s => s.enrollments.map(e => ({ ...e, studentId: s.id }))),
    site_settings: [{ id: 'main', data: inMemoryStore.siteSettings }],
  }) as Memory;
}
function commitMemory(state: Memory) {
  for (const key of ['courses', 'products', 'orders', 'faqs', 'admins'] as const) (inMemoryStore as any)[key] = state[key];
  inMemoryStore.students = state.students.map(s => ({ ...s, enrollments: state.course_enrollments.filter(e => e.studentId === s.id).map(({ studentId, ...e }) => e) }));
  inMemoryStore.siteSettings = state.site_settings.find(s => s.id === 'main')?.data;
}

export class Repository {
  constructor(private client?: PoolClient, private memory?: Memory) {}
  async list(table: Table): Promise<any[]> {
    if (this.memory) return structuredClone(this.memory[table]);
    const result = await this.client!.query(`SELECT * FROM ${table}`);
    return result.rows.map(row => decode(table, row));
  }
  async get(table: Table, id: string): Promise<any | undefined> {
    if (this.memory) return structuredClone(this.memory[table].find(row => row.id === id));
    const result = await this.client!.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return result.rows[0] && decode(table, result.rows[0]);
  }
  async save(table: Table, value: any) {
    const keys = fields[table].split(' ');
    const clean = Object.fromEntries(keys.map(key => [key, value[key] ?? null]));
    if (this.memory) {
      const rows = this.memory[table];
      const index = rows.findIndex(row => row.id === clean.id);
      if (index < 0) rows.push(structuredClone(clean)); else rows[index] = structuredClone(clean);
    } else {
      const columns = keys.map(column);
      await this.client!.query(
        `INSERT INTO ${table} (${columns.join(',')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')}) ON CONFLICT (id) DO UPDATE SET ${columns.filter(c => c !== 'id').map(c => `${c}=EXCLUDED.${c}`).join(',')}`,
        keys.map(key => jsonFields.has(key) ? JSON.stringify(clean[key]) : clean[key]),
      );
    }
    return clean;
  }
  async remove(table: Table, id?: string) {
    if (this.memory) this.memory[table] = id === undefined ? [] : this.memory[table].filter(row => row.id !== id);
    else await this.client!.query(`DELETE FROM ${table}${id === undefined ? '' : ' WHERE id = $1'}`, id === undefined ? [] : [id]);
  }
}

let memoryQueue: Promise<unknown> = Promise.resolve();
export async function withRepository<T>(write: boolean, fn: (repo: Repository) => Promise<T>): Promise<T> {
  if (!usesPostgres()) {
    // Serialize the whole mutation and commit only on success (rollback on exceptions).
    const task = memoryQueue.then(async () => {
      const state = memorySnapshot();
      const result = await fn(new Repository(undefined, state));
      if (write) commitMemory(state);
      return result;
    });
    memoryQueue = task.catch(() => {});
    return task;
  }
  const client = await getPool()!.connect();
  try {
    await client.query(write ? 'BEGIN' : 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    // Small academy workload: serialize mutations, including bulk restores and capacity checks.
    if (write) await client.query('SELECT pg_advisory_xact_lock(72461031)');
    const result = await fn(new Repository(client));
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { client.release(); }
}

export async function studentsWithEnrollments(repo: Repository) {
  const [students, enrollments] = await Promise.all([repo.list('students'), repo.list('course_enrollments')]);
  return students.map(s => ({ ...s, enrollments: enrollments.filter(e => e.studentId === s.id).map(({ studentId, ...e }) => e) }));
}
