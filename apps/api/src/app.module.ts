import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { validateEnv } from "./config/env.schema";
import { join } from "path";
import { PortfolioModule } from "./portfolio/portfolio.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, "..", ".env"),
      validate: validateEnv,
    }),
    PrismaModule,
    HealthModule,
    PortfolioModule,
  ],
})
export class AppModule {}
