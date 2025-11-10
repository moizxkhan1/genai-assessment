import { createApp } from "./app";
import { env } from "./config/env";
import { connectMongo } from "./db/mongo";

async function main() {
  try {
    await connectMongo();
    const app = createApp();
    app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`API ready on http://localhost:${env.PORT}`);
    });
  } catch (err) {
    console.error("Failed to start API:", err);
    process.exit(1);
  }
}

void main();
