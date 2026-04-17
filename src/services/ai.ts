export class AiService {
  async generateReadme(
    apiUrl: string,
    apiKey: string,
    model: string,
    repomixContent: string,
    prompt: string = 'Создай README.md для моего проекта'
  ): Promise<string> {
    const fullPrompt = `${prompt}

Код проекта:
${repomixContent}

Выведи ТОЛЬКО готовый результат без введений, рассуждений и пояснений.`;

    const response = await fetch(`${apiUrl}chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}