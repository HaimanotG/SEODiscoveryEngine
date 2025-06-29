import OpenAI from "openai";
import { BaseLlmAdapter, LlmAnalysisResult, JsonLdSchema } from "./llmAdapter.js";
import { config } from "../config/index.js";

export class OpenAiAdapter extends BaseLlmAdapter {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    super();
    this.openai = new OpenAI({ 
      apiKey: apiKey || config.llm.openai.apiKey 
    });
  }

  async generateSchemaFromHtml(html: string, url: string): Promise<LlmAnalysisResult> {
    const startTime = Date.now();
    
    try {
      const content = this.extractTextContent(html);
      const prompt = this.buildPrompt(content, url);

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: config.llm.openai.model,
        messages: [
          {
            role: "system",
            content: "You are an expert in Schema.org structured data. Generate accurate JSON-LD markup for web pages. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1500,
      });

      const jsonLdText = response.choices[0].message.content;
      if (!jsonLdText) {
        throw new Error("Empty response from OpenAI");
      }

      const jsonLd: JsonLdSchema = JSON.parse(jsonLdText);
      
      // Validate basic schema structure
      if (!jsonLd["@context"] || !jsonLd["@type"]) {
        throw new Error("Invalid Schema.org structure");
      }

      const processingTime = Date.now() - startTime;

      return {
        jsonLd,
        confidence: 0.9, // OpenAI typically has high confidence
        processingTime,
      };
    } catch (error) {
      throw new Error(`OpenAI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getProviderName(): string {
    return "openai";
  }

  isConfigured(): boolean {
    return !!config.llm.openai.apiKey;
  }
}
