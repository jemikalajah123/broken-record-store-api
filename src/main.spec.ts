import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

// ✅ Mock NestFactory
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

// ✅ Mock SwaggerModule correctly
jest.mock('@nestjs/swagger', () => {
  const actualSwagger = jest.requireActual('@nestjs/swagger');

  return {
    ...actualSwagger, // Keep actual Swagger decorators
    SwaggerModule: {
      createDocument: jest.fn().mockReturnValue({}), // Mock API doc generation
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

describe('Bootstrap', () => {
  let app: any;
  let bootstrapFn: () => Promise<void>;

  beforeEach(async () => {
    process.env.PORT = '4000';

    app = {
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue(app);

    // ✅ Properly import `bootstrap` function
    const { bootstrap } = jest.requireActual('./main');  
    bootstrapFn = bootstrap; // Assign the function

    await bootstrapFn(); // ✅ Ensure it runs before assertions
  });

  afterEach(() => {
    delete process.env.PORT;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should start the application', async () => {
    expect(NestFactory.create).toHaveBeenCalledWith(expect.any(Function));
    expect(app.useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(app, expect.any(Object));
    expect(SwaggerModule.setup).toHaveBeenCalledWith('swagger', app, expect.any(Object));
    expect(app.listen).toHaveBeenCalledWith(process.env.PORT);
  });
});
