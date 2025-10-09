import multer from 'multer'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import crypto from 'crypto'

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 5

// File type detection using magic numbers
const FILE_SIGNATURES: Record<string, Buffer[]> = {
  'image/jpeg': [
    Buffer.from([0xff, 0xd8, 0xff]),
    Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
    Buffer.from([0xff, 0xd8, 0xff, 0xe1]),
    Buffer.from([0xff, 0xd8, 0xff, 0xee]),
  ],
  'image/png': [
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  ],
  'image/webp': [
    Buffer.from('RIFF', 'ascii'),
  ],
}

/**
 * Validate file type using magic numbers (more secure than checking MIME type only)
 */
function validateFileType(buffer: Buffer, mimetype: string): boolean {
  const signatures = FILE_SIGNATURES[mimetype]
  if (!signatures) return false

  return signatures.some(signature => {
    if (mimetype === 'image/webp') {
      // WebP has RIFF at the beginning and WEBP at offset 8
      return buffer.subarray(0, 4).equals(signature) &&
             buffer.subarray(8, 12).equals(Buffer.from('WEBP', 'ascii'))
    }
    return buffer.subarray(0, signature.length).equals(signature)
  })
}

/**
 * Generate secure filename
 */
function generateSecureFilename(originalName: string, extension: string): string {
  const timestamp = Date.now()
  const randomId = uuidv4()
  const hash = crypto.createHash('md5').update(originalName + timestamp).digest('hex').substring(0, 8)
  
  return `${timestamp}-${hash}-${randomId}${extension}`
}

/**
 * Sanitize filename
 */
function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts and dangerous characters
  return path.basename(filename)
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .substring(0, 255)
}

/**
 * Multer configuration for secure file uploads
 */
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
    fields: 10, // Limit number of non-file fields
    fieldNameSize: 50, // Limit field name size
    fieldSize: 1024, // Limit field value size
  },
  fileFilter: (req, file, cb) => {
    try {
      // Check MIME type
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`))
      }

      // Sanitize filename
      const sanitizedName = sanitizeFilename(file.originalname)
      if (!sanitizedName) {
        return cb(new Error('Invalid filename'))
      }

      // Update the file object with sanitized name
      file.originalname = sanitizedName

      cb(null, true)
    } catch (error) {
      cb(error as Error)
    }
  },
})

/**
 * Additional validation for uploaded files
 */
export async function validateUploadedFile(file: Express.Multer.File): Promise<void> {
  // Check if file exists
  if (!file || !file.buffer) {
    throw new Error('No file provided')
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Validate file type using magic numbers
  if (!validateFileType(file.buffer, file.mimetype)) {
    throw new Error('File type validation failed. The file content does not match the declared MIME type.')
  }

  // Additional check using Sharp (will throw if not a valid image)
  try {
    const metadata = await sharp(file.buffer).metadata()
    
    // Check image dimensions (prevent extremely large images)
    if (metadata.width && metadata.height) {
      if (metadata.width > 4096 || metadata.height > 4096) {
        throw new Error('Image dimensions too large. Maximum: 4096x4096')
      }
      
      if (metadata.width < 10 || metadata.height < 10) {
        throw new Error('Image dimensions too small. Minimum: 10x10')
      }
    }
  } catch (error) {
    throw new Error('Invalid image file')
  }
}

/**
 * Process and optimize uploaded image
 */
export async function processAndOptimizeImage(
  buffer: Buffer,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'jpeg' | 'png' | 'webp'
  } = {}
): Promise<{
  buffer: Buffer
  filename: string
  metadata: sharp.Metadata
}> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 85,
    format = 'jpeg'
  } = options

  try {
    // Get original image metadata
    const originalMetadata = await sharp(buffer).metadata()
    
    // Process image
    let processedImage = sharp(buffer)

    // Resize if necessary
    if (originalMetadata.width && originalMetadata.height) {
      if (originalMetadata.width > maxWidth || originalMetadata.height > maxHeight) {
        processedImage = processedImage.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
      }
    }

    // Convert to desired format and optimize
    let outputBuffer: Buffer
    let extension: string

    switch (format) {
      case 'jpeg':
        outputBuffer = await processedImage
          .jpeg({ quality, progressive: true })
          .toBuffer()
        extension = '.jpg'
        break
      case 'png':
        outputBuffer = await processedImage
          .png({ compressionLevel: 9, adaptiveFiltering: true })
          .toBuffer()
        extension = '.png'
        break
      case 'webp':
        outputBuffer = await processedImage
          .webp({ quality, effort: 6 })
          .toBuffer()
        extension = '.webp'
        break
      default:
        throw new Error('Unsupported format')
    }

    // Generate secure filename
    const filename = generateSecureFilename('processed_image', extension)

    // Get processed metadata
    const processedMetadata = await sharp(outputBuffer).metadata()

    return {
      buffer: outputBuffer,
      filename,
      metadata: processedMetadata
    }
  } catch (error) {
    throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Create thumbnail from image
 */
export async function createThumbnail(
  buffer: Buffer,
  size: number = 300
): Promise<{
  buffer: Buffer
  filename: string
}> {
  try {
    const thumbnailBuffer = await sharp(buffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer()

    const filename = generateSecureFilename('thumbnail', '.jpg')

    return {
      buffer: thumbnailBuffer,
      filename
    }
  } catch (error) {
    throw new Error(`Thumbnail creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Upload to cloud storage (placeholder - implement based on your provider)
 */
export async function uploadToCloudStorage(
  buffer: Buffer,
  filename: string,
  folder: string = 'uploads'
): Promise<string> {
  // This is a placeholder implementation
  // Replace with your cloud storage provider (AWS S3, Cloudinary, etc.)
  
  try {
    // Example for Cloudinary (you'll need to configure this)
    // const result = await cloudinary.uploader.upload_stream({
    //   folder: folder,
    //   public_id: path.parse(filename).name,
    //   resource_type: 'image',
    // }, buffer)
    // return result.secure_url

    // For now, return a mock URL
    const mockUrl = `https://example-storage.com/${folder}/${filename}`
    console.log(`Mock upload: ${mockUrl}`)
    return mockUrl
  } catch (error) {
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Complete file processing workflow
 */
export async function processFileUpload(
  file: Express.Multer.File,
  options: {
    createThumbnail?: boolean
    folder?: string
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'jpeg' | 'png' | 'webp'
  } = {}
): Promise<{
  originalUrl: string
  thumbnailUrl?: string
  metadata: sharp.Metadata
}> {
  const {
    createThumbnail: shouldCreateThumbnail = true,
    folder = 'uploads',
    ...processOptions
  } = options

  // Validate uploaded file
  await validateUploadedFile(file)

  // Process and optimize image
  const { buffer, filename, metadata } = await processAndOptimizeImage(file.buffer, processOptions)

  // Upload processed image
  const originalUrl = await uploadToCloudStorage(buffer, filename, folder)

  let thumbnailUrl: string | undefined

  // Create and upload thumbnail if requested
  if (shouldCreateThumbnail) {
    const { buffer: thumbnailBuffer, filename: thumbnailFilename } = await createThumbnail(buffer)
    thumbnailUrl = await uploadToCloudStorage(thumbnailBuffer, thumbnailFilename, `${folder}/thumbnails`)
  }

  return {
    originalUrl,
    thumbnailUrl,
    metadata
  }
}

/**
 * Error handler for multer errors
 */
export function handleMulterError(error: any, req: any, res: any, next: any) {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          error: 'File too large',
          message: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
        })
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          error: 'Too many files',
          message: `Maximum ${MAX_FILES} files allowed`
        })
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          error: 'Unexpected file',
          message: 'Unexpected file field'
        })
      default:
        return res.status(400).json({
          error: 'Upload error',
          message: error.message
        })
    }
  }

  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message
    })
  }

  next(error)
}