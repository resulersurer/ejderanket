import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';

// WebSocket'i yalnızca Node.js ortamında yükle (Vercel serverless)
if (typeof global !== 'undefined' && typeof (global as any).WebSocket === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  neonConfig.webSocketConstructor = require('ws');
}

const prismaClientSingleton = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }

  // Prisma 7 + @prisma/adapter-neon: PrismaNeon doğrudan PoolConfig alıyor
  const adapter = new PrismaNeon({ connectionString: databaseUrl });

  return new PrismaClient({ adapter } as any);
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
