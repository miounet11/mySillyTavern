// Defer heavy/native deps to dynamic imports inside functions to avoid bundling issues in dev
import fs from 'fs/promises'
import path from 'path'

export interface CharacterCardData {
  name: string
  description: string
  personality: string
  scenario: string
  first_mes: string
  mes_example: string
  creator_notes?: string
  system_prompt?: string
  post_history_instructions?: string
  alternate_greetings?: string[]
  character_book?: any
  tags?: string[]
  creator?: string
  character_version?: string
  extensions?: any
}

export interface CharacterCardV2 {
  spec: 'chara_card_v2'
  spec_version: '2.0'
  data: CharacterCardData
}

/**
 * Encode character data into PNG tEXt chunk format
 */
export function encodeCharacterCard(card: CharacterCardV2): string {
  const jsonString = JSON.stringify(card)
  return Buffer.from(jsonString).toString('base64')
}

/**
 * Decode character data from PNG tEXt chunk
 */
export function decodeCharacterCard(encodedData: string): CharacterCardV2 {
  try {
    const decoded = Buffer.from(encodedData, 'base64').toString('utf-8')
    return JSON.parse(decoded) as CharacterCardV2
  } catch (error) {
    // Try without base64 decoding
    return JSON.parse(encodedData) as CharacterCardV2
  }
}

/**
 * Create a PNG image with embedded character card data
 */
export async function createCharacterCardPNG(
  card: CharacterCardV2,
  avatarPath?: string
): Promise<Buffer> {
  const { PNG } = await import('pngjs')
  const width = 512
  const height = 512
  
  let imageBuffer: Buffer

  if (avatarPath && avatarPath.startsWith('/uploads/')) {
    // Load existing avatar image
    try {
      const fullPath = path.join(process.cwd(), 'public', avatarPath)
      const imageData = await fs.readFile(fullPath)
      const png = (await import('pngjs')).PNG.sync.read(imageData)
      
      // Resize if necessary (simplified - in production use sharp or similar)
      imageBuffer = PNG.sync.write(png)
    } catch (error) {
      console.error('Error loading avatar:', error)
      // Fall back to placeholder
      imageBuffer = await createPlaceholderImage(width, height, card.data.name)
    }
  } else {
    // Create placeholder image
    imageBuffer = await createPlaceholderImage(width, height, card.data.name)
  }

  // Parse the PNG
  const PNGModule = (await import('pngjs')).PNG
  const png = PNGModule.sync.read(imageBuffer)

  // Encode character data
  const encodedData = encodeCharacterCard(card)

  // Add tEXt chunk with character data
  // Note: pngjs doesn't have built-in tEXt chunk support, so we need to manually add it
  const textChunk = createTextChunk('chara', encodedData)
  const finalPng = addChunkToPNG(png, textChunk)

  return PNGModule.sync.write(finalPng)
}

/**
 * Embed JSON data into PNG tEXt chunk
 */
async function embedDataInPNG(imageBuffer: Buffer, jsonData: string): Promise<Buffer> {
  const PNG = (await import('pngjs')).PNG
  
  try {
    // Parse the PNG
    const png = PNG.sync.read(imageBuffer)
    
    // Create tEXt chunk with character data
    // PNG tEXt chunk format: keyword\0text
    const keyword = 'chara' // Standard keyword for character cards
    const textData = Buffer.concat([
      Buffer.from(keyword),
      Buffer.from([0]), // Null separator
      Buffer.from(jsonData, 'utf8')
    ])
    
    // Write PNG with custom tEXt chunk
    const options = {
      text: {
        [keyword]: jsonData
      }
    }
    
    // Re-encode PNG with embedded data
    const outputBuffer = PNG.sync.write(png, options as any)
    return outputBuffer
  } catch (error) {
    console.error('Error embedding data in PNG:', error)
    // If embedding fails, return original image
    // Character data can still be exported as JSON separately
    return imageBuffer
  }
}

/**
 * Create a simple placeholder image
 */
async function createPlaceholderImage(
  width: number,
  height: number,
  name: string
): Promise<Buffer> {
  const { PNG } = await import('pngjs')
  const png = new PNG({ width, height })

  // Fill with a gradient
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2
      
      // Create a simple gradient based on character name hash
      const hash = hashString(name)
      const r = (hash % 200) + 55
      const g = ((hash * 2) % 200) + 55
      const b = ((hash * 3) % 200) + 55
      
      png.data[idx] = r
      png.data[idx + 1] = g
      png.data[idx + 2] = b
      png.data[idx + 3] = 255
    }
  }

  return (await import('pngjs')).PNG.sync.write(png)
}

/**
 * Create a PNG tEXt chunk
 */
function createTextChunk(keyword: string, text: string): Buffer {
  const keywordBuffer = Buffer.from(keyword, 'latin1')
  const textBuffer = Buffer.from(text, 'latin1')
  
  // tEXt chunk format: keyword + null byte + text
  const chunkData = Buffer.concat([
    keywordBuffer,
    Buffer.from([0]), // null separator
    textBuffer
  ])

  // Calculate CRC
  const chunkType = Buffer.from('tEXt', 'latin1')
  const crc = calculateCRC(Buffer.concat([chunkType, chunkData]))

  // Create chunk: length + type + data + CRC
  const length = Buffer.alloc(4)
  length.writeUInt32BE(chunkData.length, 0)

  const crcBuffer = Buffer.alloc(4)
  crcBuffer.writeUInt32BE(crc, 0)

  return Buffer.concat([length, chunkType, chunkData, crcBuffer])
}

/**
 * Add a chunk to PNG data
 */
async function addChunkToPNG(png: any, chunk: Buffer): Promise<any> {
  // This is a simplified version
  // In a production environment, you'd properly insert the chunk before IEND
  
  // For now, we'll add it to the text property if available
  if (!(png as any).text) {
    (png as any).text = {}
  }
  
  // Extract keyword and text from chunk
  const chunkData = chunk.slice(8, -4) // Remove length, type, and CRC
  const nullIndex = chunkData.indexOf(0)
  const keyword = chunkData.slice(0, nullIndex).toString('latin1')
  const text = chunkData.slice(nullIndex + 1).toString('latin1')
  
  ;(png as any).text[keyword] = text
  
  return png
}

/**
 * Calculate CRC32 for PNG chunks
 */
function calculateCRC(buffer: Buffer): number {
  let crc = 0xffffffff
  
  for (let i = 0; i < buffer.length; i++) {
    crc = crcTable[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8)
  }
  
  return crc ^ 0xffffffff
}

// CRC table for PNG
const crcTable: number[] = (() => {
  const table: number[] = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c
  }
  return table
})()

/**
 * Simple string hash function
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

/**
 * Extract character card from PNG buffer
 */
export function extractCharacterCardFromPNG(pngBuffer: Buffer): CharacterCardV2 | null {
  try {
    const PNGMod = require('pngjs') as any
    const png = PNGMod.PNG.sync.read(pngBuffer) as any
    
    if (png.text && png.text.chara) {
      return decodeCharacterCard(png.text.chara)
    }
    
    return null
  } catch (error) {
    console.error('Error extracting character card from PNG:', error)
    return null
  }
}

