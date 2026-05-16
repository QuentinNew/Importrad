import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CardRepository } from './card.repository';

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const NVIDIA_MODEL = 'meta/llama-3.1-8b-instruct';

@Injectable()
export class DefinitionService {
  private readonly logger = new Logger(DefinitionService.name);

  constructor(private readonly cardRepository: CardRepository) {}

  async getDefinition(
    id: string,
    word: string,
    lang: 'en' | 'fr',
    cached: string | null,
  ): Promise<string> {
    if (cached) {
      return cached;
    }

    const definition = await this.fetchFromLlm(word, lang);
    await this.cardRepository.updateDefinition(id, lang, definition);
    return definition;
  }

  private async fetchFromLlm(word: string, lang: 'en' | 'fr'): Promise<string> {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('NVIDIA_API_KEY is not configured');
    }

    const language = lang === 'en' ? 'English' : 'French';
    const prompt = `Give a short definition and one example sentence for the ${language} word/phrase "${word}". Respond in ${language} only. Format: Definition: ... Example: ...`;

    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      this.logger.error(`NVIDIA API error ${response.status}: ${text}`);
      throw new InternalServerErrorException('Failed to fetch definition from LLM');
    }

    const data = (await response.json()) as { choices: { message: { content: string } }[] };
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new InternalServerErrorException('Empty response from LLM');
    }
    return content.trim();
  }
}
