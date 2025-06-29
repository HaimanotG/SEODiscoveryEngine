import 'reflect-metadata';
import { bootstrapNestJS } from './nestjs-server';

// Test the new NestJS architecture
async function testArchitecture() {
  console.log('🚀 Testing NestJS DDD/CQRS Architecture...');
  
  try {
    // Start NestJS application on port 5001
    await bootstrapNestJS();
    
    // Test the new API endpoints after a brief delay
    setTimeout(async () => {
      const testPayload = {
        domainId: 1,
        url: 'https://example.com/test-nestjs-architecture',
        htmlContent: `
          <html>
            <head><title>NestJS Test Product - Architecture Validation</title></head>
            <body>
              <h1>NestJS Architecture Test Product</h1>
              <p>Testing Domain-Driven Design with CQRS patterns</p>
              <div class="price">$149.99</div>
              <ul>
                <li>Scalable architecture</li>
                <li>Maintainable codebase</li>
                <li>Easy feature additions</li>
              </ul>
            </body>
          </html>
        `
      };

      console.log('📝 Testing CQRS Command/Query Pattern...');
      
      // Test the new NestJS API
      const response = await fetch('http://localhost:5001/api/v2/analysis/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ NestJS CQRS Architecture Working:', result);
      } else {
        console.log('❌ NestJS Test Failed:', response.status);
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Architecture Test Error:', error);
  }
}

testArchitecture();