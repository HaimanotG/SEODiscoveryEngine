export interface JsonLdSchema {
  "@context": string;
  "@type": string;
  [key: string]: any;
}

export interface LlmAnalysisResult {
  jsonLd: JsonLdSchema;
  confidence: number;
  processingTime: number;
}

export interface LlmAdapter {
  generateSchemaFromHtml(html: string, url: string): Promise<LlmAnalysisResult>;
  getProviderName(): string;
  isConfigured(): boolean;
}

export abstract class BaseLlmAdapter implements LlmAdapter {
  abstract generateSchemaFromHtml(html: string, url: string): Promise<LlmAnalysisResult>;
  abstract getProviderName(): string;
  abstract isConfigured(): boolean;

  protected extractTextContent(html: string): string {
    // Simple HTML tag removal for content extraction
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000); // Limit content length
  }

  protected buildPrompt(content: string, url: string): string {
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
