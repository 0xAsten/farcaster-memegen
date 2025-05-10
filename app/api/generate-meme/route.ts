import { generateText, tool } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import templatesData from '../../../lib/templates.json'
import { MEMEGEN_API_BASE, generateMemeUrl } from '../../../utils/genMemeUrl'

// Define the template interface to match the structure in templates.json
interface MemeTemplate {
  id: string
  name: string
  lines?: number
  overlays?: number
  styles?: string[]
  blank?: string
  example?: {
    text: string[]
    url: string
  }
  source?: string | null
  keywords?: string[]
  _self?: string
}

// Use the imported JSON directly
const MEME_TEMPLATES = templatesData as MemeTemplate[]

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json(
        { message: 'Missing required parameter: prompt' },
        { status: 400 },
      )
    }

    // Create a list of all template IDs with their names, lines, and example for the LLM
    const templatesList = MEME_TEMPLATES.map((template) => {
      const exampleText = template.example?.text || []
      return `{id: ${template.id}, name: ${template.name}, lines: ${
        template.lines || 2
      }, example: ${JSON.stringify(exampleText)}}`
    })

    let generatedMemeUrl: string | null = null

    const { text } = await generateText({
      model: google('models/gemini-1.5-flash'),
      temperature: 1,
      maxSteps: 5,
      tools: {
        generateMeme: tool({
          description: 'Generate a meme based on user prompt',
          parameters: z.object({
            templateId: z.string().describe('ID of the meme template'),
            textLines: z
              .array(z.string())
              .describe(
                'Array of text lines for the meme, matching the template line requirements',
              ),
          }),
          execute: async ({ templateId, textLines }) => {
            // Verify that the template exists
            const template = MEME_TEMPLATES.find((t) => t.id === templateId)

            // If template doesn't exist, use a default template
            if (!template) {
              console.log(
                `Template ID "${templateId}" not found. Using a random template as fallback.`,
              )
              // random template
              const randomTemplate =
                MEME_TEMPLATES[
                  Math.floor(Math.random() * MEME_TEMPLATES.length)
                ]
              templateId = randomTemplate.id

              // Adjust textLines length to match the template if needed
              const requiredLines = randomTemplate.lines || 2
              if (textLines.length !== requiredLines) {
                // Fill with empty strings if not enough lines
                while (textLines.length < requiredLines) {
                  textLines.push('')
                }
                // Trim if too many lines
                if (textLines.length > requiredLines) {
                  textLines = textLines.slice(0, requiredLines)
                }
              }
            } else {
              // Adjust textLines to match the template's required number of lines
              const requiredLines = template.lines || 2
              if (textLines.length !== requiredLines) {
                console.log(
                  `Adjusting text lines from ${textLines.length} to ${requiredLines} lines`,
                )
                // Fill with empty strings if not enough lines
                while (textLines.length < requiredLines) {
                  textLines.push('')
                }
                // Trim if too many lines
                if (textLines.length > requiredLines) {
                  textLines = textLines.slice(0, requiredLines)
                }
              }
            }

            // Generate meme URL with all text lines
            const memeUrl = generateMemeUrl(templateId, textLines)

            console.log(`Generated meme URL: ${memeUrl}`)
            generatedMemeUrl = memeUrl
            return { memeUrl, templateId, textLines }
          },
        }),
      },
      prompt: `Based on this prompt: "${prompt}", please generate a creative and funny meme. I'll help you select the most appropriate meme template and create text that fits well with both the template and the user's prompt.

Instructions:
1. Carefully analyze the user's prompt for specific emotions, situations, or cultural references.
2. Choose a meme template that BEST MATCHES the specific scenario, emotional tone, or logical structure of the prompt.
3. IMPORTANT: DO NOT default to popular templates like "Distracted Boyfriend" (distracted), "Drake" or "Change My Mind" simply because they're well-known.
4. Instead, prioritize template-content fit over template popularity. Look for templates that specifically match the:
   - Emotional reaction being expressed
   - Number of entities/concepts being compared
   - Type of situation (irony, realization, frustration, comparison, etc.)
5. Pay attention to the "lines" field which indicates how many text lines the template supports.
6. Study the "example" field to understand how the template is typically used - this contains sample text that works well with this template.
7. Create relevant and witty text lines for the meme that connects well with both the template's intended use and the user's request.
8. Provide exactly the right number of text lines for the chosen template.

Here are all available templates:
${templatesList}

After selecting a template, generate a meme with appropriate text lines (exactly matching the number of lines required by the template) that creates humor while staying relevant to the prompt.`,
      onStepFinish({ toolResults }) {
        console.log('Tool results:', toolResults)
        // Try to extract meme URL from tool results if not already captured
        if (!generatedMemeUrl && Array.isArray(toolResults)) {
          for (const result of toolResults) {
            // Check if this is a generateMeme result
            if (
              'toolName' in result &&
              result.toolName === 'generateMeme' &&
              'result' in result &&
              result.result &&
              typeof result.result === 'object' &&
              'memeUrl' in result.result
            ) {
              generatedMemeUrl = result.result.memeUrl as string
              break
            }
          }
        }
      },
    })

    return NextResponse.json({
      message: text,
      success: true,
      userPrompt: prompt,
      memeUrl: generatedMemeUrl,
    })
  } catch (error) {
    console.error('Meme generation error:', error)
    return NextResponse.json(
      { message: 'Error generating meme', error: (error as Error).message },
      { status: 500 },
    )
  }
}
