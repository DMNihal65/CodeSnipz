// import type { Config } from 'drizzle-kit';
// import * as dotenv from 'dotenv';
// dotenv.config();

// export default {
//   schema: './src/lib/db/schema.ts',
//   out: './drizzle',
//   driver: 'pg',
//   dbCredentials: {
//     connectionString: process.env.NEXT_PUBLIC_DB_URL,
//   },
// } satisfies Config;


// import type { Config } from "drizzle-kit";
/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./lib/db/schema.js",
  out: "./drizzle",
  dialect:'postgresql',
//   driver: "pg",
  dbCredentials: {
    url: "postgresql://ai_interview_owner:pIf2jnB6XvFG@ep-crimson-glitter-a59ijgnq.us-east-2.aws.neon.tech/code_snipz?sslmode=require",
  },
};