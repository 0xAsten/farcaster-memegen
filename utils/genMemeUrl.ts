export const MEMEGEN_API_BASE = 'https://api.memegen.link'

// Helper function to generate a meme URL
export function generateMemeUrl(
  templateId: string,
  textLines: string[] = [],
  format: string = 'jpg',
) {
  // Sanitize text for URL
  const sanitizeForUrl = (text: string) => {
    return text
      .replace(/ /g, '_')
      .replace(/\?/g, '~q')
      .replace(/&/g, '~a')
      .replace(/%/g, '~p')
      .replace(/#/g, '~h')
      .replace(/\//g, '~s')
      .replace(/\\/g, '~b')
      .replace(/</g, '~l')
      .replace(/>/g, '~g')
  }

  // If no text lines, just return the template
  if (!textLines.length) {
    return `${MEMEGEN_API_BASE}/images/${templateId}.${format}`
  }

  // Sanitize each text line, replacing empty lines with '_'
  const sanitizedLines = textLines.map((line) =>
    line.trim() === '' ? '_' : sanitizeForUrl(line),
  )

  // Generate the URL with all text lines
  const textPath = sanitizedLines.join('/')
  const url = `${MEMEGEN_API_BASE}/images/${templateId}/${textPath}.${format}`

  // Fix any double slashes in the path (but preserve protocol's double slash)
  const [protocol, rest] = url.split('://')
  const fixedRest = rest.replace(/\/\//g, '/_/')
  return `${protocol}://${fixedRest}`
}
