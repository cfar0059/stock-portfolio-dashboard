import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { EnvVars } from "./config/env.schema";
import { PrismaService } from "./prisma/prisma.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get<ConfigService<EnvVars>>(ConfigService);
  const port = configService.get<number>("API_PORT", 4000);
  const nodeEnv = configService.get<string>("NODE_ENV") ?? "development";
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  if (nodeEnv !== "production") {
    app.enableCors({
      origin: "http://localhost:3000",
      credentials: true,
    });
  }

  await app.listen(port);
}

void bootstrap();
