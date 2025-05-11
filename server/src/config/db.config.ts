// import postgres from 'postgres';
// import dotenv from 'dotenv';
// dotenv.config();

// const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

// export const sql = postgres({
//   host: PGHOST,
//   database: PGDATABASE,
//   username: PGUSER,
//   password: PGPASSWORD,
//   port: 5432,
//   ssl: 'require',
//   connection: {
//     options: `project=${ENDPOINT_ID}`,
//   },
// });

// export default sql;



import pkg from 'pg';

const { Pool } = pkg;
export const sql = new Pool({ connectionString: process.env.DATABASE_URL });

export default sql;