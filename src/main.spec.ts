import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('@nestjs/swagger', () => {
  const actualSwagger = jest.requireActual('@nestjs/swagger');
  return {
    ...actualSwagger,
    SwaggerModule: {
      createDocument: jest.fn().mockReturnValue({}),
      setup: jest.fn(),
    },
    DocumentBuilder: jest.fn(() => ({
      setTitle: jest.fn().mockReturnThis(),
      setDescription: jest.fn().mockReturnThis(),
      setVersion: jest.fn().mockReturnThis(),
      addBearerAuth: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({}),
    })),
  };
});

describe('Application Bootstrap', () => {
  let app: any;

  beforeEach(async () => {
    app = {
      useGlobalPipes: jest.fn(),
      enableCors: jest.fn(),
      listen: jest.fn(),
    };

    // Mock the create method to return the mocked app
    (NestFactory.create as jest.Mock).mockResolvedValue(app);

    // Dynamically import the main file to trigger the bootstrap function
    await import('./main');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should initialize the application correctly', async () => {
    // Verify that NestFactory.create was called with AppModule
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);

    // Verify that global pipes were set up
    expect(app.useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));

    // Verify that CORS was enabled
    expect(app.enableCors).toHaveBeenCalledWith({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Authorization',
    });

    // Verify that Swagger document was created and setup
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(
      app,
      expect.any(Object),
    );
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'swagger',
      app,
      expect.any(Object),
    );

    // Verify that the app was instructed to listen on the specified port
    expect(app.listen).toHaveBeenCalledWith(expect.any(Number));
  });
});
