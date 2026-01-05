import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { EnvVars } from "./config/env.schema";
import { PrismaService } from "./prisma/prisma.service";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new Logger("Bootstrap");

  // Register global middleware
  app.use(new RequestIdMiddleware().use.bind(new RequestIdMiddleware()));

  // Register global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Register global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

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
  logger.log(`Server running on port ${port} (${nodeEnv})`);
}

void bootstrap();
