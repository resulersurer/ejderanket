import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Set up WebSocket constructor for Neon
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

const isInvalidUrl = (url: string | undefined) => {
  if (!url) return true;
  const trimmed = url.trim();
  return (
    trimmed === '' ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    (!trimmed.startsWith('postgresql://') && !trimmed.startsWith('postgres://')) ||
    trimmed.includes('username:password') ||
    trimmed.includes('ep-xxxx')
  );
};

const prismaClientSingleton = () => {
  let databaseUrl = process.env.DATABASE_URL;

  // In Prisma 7, we MUST pass an adapter. If DATABASE_URL is not set yet,
  // we use a dummy connection string to construct the client without errors.
  if (isInvalidUrl(databaseUrl)) {
    databaseUrl = 'postgresql://dummy:dummy@ep-dummy-123456.us-east-1.aws.neon.tech/neondb';
  } else if (databaseUrl) {
    // Sanitize the connection string by removing parameters like channel_binding
    // that may cause parsing issues in the serverless driver, defaulting to localhost.
    databaseUrl = databaseUrl.replace(/[\?&]channel_binding=[^&]+/g, '');
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
