import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Set up WebSocket constructor for Neon
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

const prismaClientSingleton = () => {
  let databaseUrl = process.env.DATABASE_URL;

  // In Prisma 7, we MUST pass an adapter. If DATABASE_URL is not set yet,
  // we use a dummy connection string to construct the client without errors.
  if (!databaseUrl || databaseUrl.includes('username:password') || databaseUrl.includes('ep-xxxx')) {
    databaseUrl = 'postgresql://dummy:dummy@localhost:5432/dummy';
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaNeon(pool as any);
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
