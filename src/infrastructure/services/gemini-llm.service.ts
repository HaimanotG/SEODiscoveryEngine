import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { LlmService, LlmAnalysisResult } from '../../application/ports/outgoing/llm.service';
import { JsonLdSchema } from '../../domain/entities/analysis-job.entity';

@Injectable()
export class GeminiLlmService implements LlmService {
  private ai: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  async generateSchemaFromHtml(html: string, url: string): Promise<LlmAnalysisResult> {
    const startTime = Date.now();

    try {
      const content = this.extractTextContent(html);
      const prompt = this.buildPrompt(content, url);

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
        },
        contents: prompt,
      });

      const processingTime = Date.now() - startTime;
      const jsonLdText = response.text;

      if (!jsonLdText) {
        throw new Error('Empty response from Gemini AI');
      }

      const jsonLd: JsonLdSchema = JSON.parse(jsonLdText);

      return {
        jsonLd,
        confidence: 0.85, // Gemini typically provides high-quality results
        processingTime,
      };
    } catch (error) {
      throw new Error(`Gemini analysis failed: ${error.message}`);
    }
  }

  getProviderName(): string {
    return 'gemini';
  }

  isConfigured(): boolean {
    return !!this.configService.get<string>('GEMINI_API_KEY');
  }

  private extractTextContent(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000);
  }

  private buildPrompt(content: string, url: string): string {
    return `Analyze the following webpage content and generate appropriate Schema.org JSON-LD structured data.

URL: ${url}
Content: ${content}

Requirements:
- Generate valid Schema.org JSON-LD markup
- Choose the most appropriate schema type (Article, Product, Organization, etc.)
- Include relevant properties based on the content
- Ensure the @context is "https://schema.org"
- Return only valid JSON without any markdown formatting

Respond with a JSON object in this format:
{
  "@context": "https://schema.org",
  "@type": "...",
  ...
}`;
  }
}