import Anthropic from "@anthropic-ai/sdk";
import { User } from "@/lib/db/schema";
import { createPropmpt, TEXT_SYSTEM_PROMPT, IMAGE_SYSTEM_PROMPT, PDF_SYSTEM_PROMPT } from "@/lib/prompt/docs"; 
import { getText } from "@/lib/pdftotext";

// Select model https://docs.anthropic.com/en/docs/about-claude/models
// model: "claude-3-5-sonnet-20241022",
// const MODEL = "claude-3-5-sonnet-latest";
const FAST_MODEL = "claude-3-5-haiku-latest";
const EXPENSIVE_MODEL = "claude-3-5-sonnet-latest";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function extractTextFromFile(user: User, fileUrl: string): Promise<string | null> {
  const response = await fetch(fileUrl);
  const buffer = await response.arrayBuffer();
  const fileBuffer = Buffer.from(buffer);
  const mediaType = response.headers.get('content-type') || 'application/pdf';
  let pdfAsText: boolean = true;
  const isPDFFile = mediaType.includes("pdf") && !pdfAsText;
  let systemPrompt;
  let anthropicContent;
  if (mediaType === "application/pdf") {
    const text = await getText(fileBuffer);
    if (!pdfAsText) {
      systemPrompt = PDF_SYSTEM_PROMPT;
      anthropicContent = [
        {
          type: "document",
          source: {
            media_type: 'application/pdf',
            type: 'base64',
            data: fileBuffer.toString('base64'),
          },
        },
        {
          type: "text",
          text: await createPropmpt(user, null, null),
        },
      ];
    } else {
      systemPrompt = TEXT_SYSTEM_PROMPT;
      anthropicContent = [
        {
          type: "text",
          text: await createPropmpt(user, null, text),
        },
      ]
    }
  } else {
    systemPrompt = IMAGE_SYSTEM_PROMPT;
    anthropicContent = [
      {
        type: "text",
        text: await createPropmpt(user, null, null),
      },
      {
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: fileBuffer.toString('base64'),
        },
      },
    ]
  }
  let message;
  if (isPDFFile) {
    message = await anthropic.beta.messages.create({
        model: !pdfAsText ? EXPENSIVE_MODEL : FAST_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        betas: !pdfAsText ? ["pdfs-2024-09-25"] : [],
        messages: [{
          role: "user",
          // @ts-expect-error Maybe we will change the content here in the future
          content: anthropicContent,
        }],
    });
  } else {
    message = await anthropic.messages.create({
      model: FAST_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{
        role: "user",
        // @ts-expect-error Maybe we will change the content here in the future
        content: anthropicContent,
      }],
  })
  }
  console.timeEnd("anthropic")
  const responseText = message.content[0].type === "text" ? message.content[0].text : null;
  return responseText;
}