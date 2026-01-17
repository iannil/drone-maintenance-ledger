import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";

import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/http-exception.filter";
import { validateEnv, isProduction } from "./common/config/env.config";

async function bootstrap() {
  // Validate environment configuration at startup
  try {
    const envConfig = validateEnv();
    console.log(`Environment validated: ${envConfig.NODE_ENV} mode`);
  } catch (error) {
    console.error("Failed to start: Environment validation error");
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });
  const configService = app.get(ConfigService);
  const logger = new Logger("Bootstrap");

  // Security - Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Required for Swagger UI
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false, // Required for Swagger UI
    })
  );

  // Global prefix
  app.setGlobalPrefix("api");

  // CORS
  const corsOrigin = configService.get<string>("CORS_ORIGIN", "http://localhost:3000");
  app.enableCors({
    origin: corsOrigin.split(",").map((o) => o.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle("Drone Maintenance Ledger API")
    .setDescription("无人机维保账本系统 API")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();

  try {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: "none",
        filter: true,
        showRequestDuration: true,
      },
    });
  } catch (error) {
    console.error("Failed to create Swagger document:", error);
  }

  const port = configService.get<number>("API_PORT", 3001);
  await app.listen(port);

  logger.log(`🚀 API server running on http://localhost:${port}`);
  logger.log(`📚 API documentation: http://localhost:${port}/api/docs`);
  logger.log(`💓 Health check: http://localhost:${port}/api/health`);
}

bootstrap();
