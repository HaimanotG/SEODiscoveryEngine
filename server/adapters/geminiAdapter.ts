import { GoogleGenAI } from "@google/genai";
import { BaseLlmAdapter, LlmAnalysisResult, JsonLdSchema } from "./llmAdapter.js";
import { config } from "../config/index.js";

export class GeminiAdapter extends BaseLlmAdapter {
  private ai: GoogleGenAI;

  constructor(apiKey?: string) {
    super();
    this.ai = new GoogleGenAI({ 
      apiKey: apiKey || config.llm.gemini.apiKey 
    });
  }

  async generateSchemaFromHtml(html: string, url: string): Promise<LlmAnalysisResult> {
    const startTime = Date.now();
    
    try {
      const content = this.extractTextContent(html);
      const prompt = this.buildPrompt(content, url);

      const response = await this.ai.models.generateContent({
        model: config.llm.gemini.model,
        config: {
          systemInstruction: "You are an expert in Schema.org structured data. Generate accurate JSON-LD markup for web pages. Always respond with valid JSON only.",
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              "@context": { type: "string" },
              "@type": { type: "string" },
            },
            required: ["@context", "@type"],
          },
        },
        contents: prompt,
      });

      const jsonLdText = response.text;
      if (!jsonLdText) {
        throw new Error("Empty response from Gemini");
      }

      const jsonLd: JsonLdSchema = JSON.parse(jsonLdText);
      
      // Validate basic schema structure
      if (!jsonLd["@context"] || !jsonLd["@type"]) {
        throw new Error("Invalid Schema.org structure");
      }

      const processingTime = Date.now() - startTime;

      return {
        jsonLd,
        confidence: 0.85, // Gemini confidence estimation
        processingTime,
      };
    } catch (error) {
      throw new Error(`Gemini analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getProviderName(): string {
    return "gemini";
  }

  isConfigured(): boolean {
    return !!config.llm.gemini.apiKey;
  }
}
