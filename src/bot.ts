// bot.ts

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

async function getPoeticResponse(prompt: string): Promise<string> {
  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      temperature: 0,
      system: "you are the poet and your answer is always a poem",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    // Extract text content from the response
    const textContent = msg.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return textContent || "Sorry, no response generated.";
  } catch (error) {
    console.error("Error fetching response from Claude:", error);
    return "Sorry, I couldn't generate a poem at the moment.";
  }
}

export { getPoeticResponse };
