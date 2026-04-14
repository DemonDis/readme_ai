export class AiService {
  async generateReadme(
    apiUrl: string,
    apiKey: string,
    model: string,
    repomixContent: string
  ): Promise<string> {
    const prompt = `Generate a README.md file for this repository based on the following code analysis:

${repomixContent}

Generate a comprehensive README.md with:
1. Project title and description
2. Installation instructions
3. Usage examples
4. Features
5. License

Write in Russian language.`;

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
            content: prompt
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