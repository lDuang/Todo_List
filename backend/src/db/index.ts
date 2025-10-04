import { drizzle } from 'drizzle-orm/node-postgres';  // drizzle orm库,用于 postgresql
import { Pool } from 'pg';  // postgresql 连接池管理库
import * as schema from './schema.js';  // 数据库表结构定义

// 打印数据库参数配置情况
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Not Loaded');

// 创建 Pool 连接池实例
const pool = new Pool({
  // 传入数据库链接 DATABASE_URL
  connectionString: process.env.DATABASE_URL,
});

// 注册时间监听器,持续捕获错误,出现错误打印,严重错误退出
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// drizzle 接收 链接池实例,以及数据库规范schema
// 并且返回 常量 db 作为使用 drizzle 操作数据库的实例
export const db = drizzle(pool, { schema });
