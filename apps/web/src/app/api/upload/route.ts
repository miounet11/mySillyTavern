import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { nanoid } from 'nanoid'
import { db } from '@sillytavern-clone/database'
import crypto from 'crypto'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

// Calculate file hash for deduplication
function calculateHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const uploadedBy = formData.get('uploadedBy') as string | 'default'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', code: 'NO_FILE' },
        { status: 400 }
      )
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`, code: 'FILE_TOO_LARGE' },
        { status: 400 }
      )
    }

    // Read file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Calculate file hash
    const fileHash = calculateHash(buffer)

    // Check if file already exists by hash
    const existingFile = await db.findFirst('FileStorage', { hash: fileHash })
    if (existingFile) {
      return NextResponse.json({
        ...existingFile,
        message: 'File already exists',
        isDuplicate: true
      })
    }

    // Generate unique filename
    const ext = path.extname(file.name)
    const filename = `${nanoid()}${ext}`
    const filePath = path.join(UPLOAD_DIR, filename)

    // Save file to disk
    await writeFile(filePath, buffer)

    // Save file metadata to database
    const fileRecord = await db.create('FileStorage', {
      id: nanoid(),
      originalName: file.name,
      filename,
      mimeType: file.type,
      size: file.size,
      path: `/uploads/${filename}`,
      hash: fileHash,
      uploadedBy,
    })

    return NextResponse.json({
      ...fileRecord,
      message: 'File uploaded successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uploadedBy = searchParams.get('uploadedBy')
    const mimeType = searchParams.get('mimeType')

    const where: any = {}
    if (uploadedBy) where.uploadedBy = uploadedBy
    if (mimeType) where.mimeType = { contains: mimeType }

    const files = await db.findMany('FileStorage', {
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ files })

  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

