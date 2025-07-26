import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Helper function to create authenticated Supabase client
async function createAuthenticatedClient(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized')
  }

  const token = authHeader.replace('Bearer ', '')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
  
  // Verify the JWT token and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  return { supabase, user }
}

// POST /api/projects/images/upload - Upload project images
export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await createAuthenticatedClient(request)
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const imageType = formData.get('type') as string // 'banner' | 'logo' | 'screenshot'
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!imageType || !['banner', 'logo', 'screenshot'].includes(imageType)) {
      return NextResponse.json(
        { error: 'Invalid image type. Must be banner, logo, or screenshot' },
        { status: 400 }
      )
    }

    // Validate file type and size based on image type
    const validations = {
      banner: {
        types: ['image/jpeg', 'image/png', 'image/webp'],
        maxSize: 10 * 1024 * 1024, // 10MB
        bucket: 'game-banners'
      },
      logo: {
        types: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
        maxSize: 5 * 1024 * 1024, // 5MB
        bucket: 'game-logos'
      },
      screenshot: {
        types: ['image/jpeg', 'image/png', 'image/webp'],
        maxSize: 10 * 1024 * 1024, // 10MB
        bucket: 'game-screenshots'
      }
    }

    const validation = validations[imageType as keyof typeof validations]

    if (!validation.types.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${imageType}. Allowed: ${validation.types.join(', ')}` },
        { status: 400 }
      )
    }

    if (file.size > validation.maxSize) {
      const maxSizeMB = validation.maxSize / (1024 * 1024)
      return NextResponse.json(
        { error: `File size too large. Maximum ${maxSizeMB}MB allowed for ${imageType}` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${user.id}/${imageType}-${timestamp}.${fileExt}`

    // Convert file to array buffer for upload
    const fileBuffer = await file.arrayBuffer()
    const fileUint8Array = new Uint8Array(fileBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(validation.bucket)
      .upload(fileName, fileUint8Array, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Image upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(validation.bucket)
      .getPublicUrl(fileName)

    if (!urlData.publicUrl) {
      return NextResponse.json(
        { error: 'Failed to get public URL for uploaded image' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imageUrl: urlData.publicUrl,
      fileName: fileName.split('/')[1], // Just the filename without user ID
      imageType,
      message: `${imageType} uploaded successfully`
    })

  } catch (error) {
    console.error('Image upload API error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/projects/images/upload - Delete project image
export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user } = await createAuthenticatedClient(request)
    
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    const imageType = searchParams.get('type')
    
    if (!imageUrl || !imageType) {
      return NextResponse.json(
        { error: 'Image URL and type are required' },
        { status: 400 }
      )
    }

    if (!['banner', 'logo', 'screenshot'].includes(imageType)) {
      return NextResponse.json(
        { error: 'Invalid image type' },
        { status: 400 }
      )
    }

    // Determine bucket based on image type
    const buckets = {
      banner: 'game-banners',
      logo: 'game-logos',
      screenshot: 'game-screenshots'
    }

    const bucket = buckets[imageType as keyof typeof buckets]

    // Extract file path from URL
    const urlParts = imageUrl.split(`/storage/v1/object/public/${bucket}/`)
    if (urlParts.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid image URL format' },
        { status: 400 }
      )
    }

    const filePath = urlParts[1]
    
    // Verify user owns this file (should start with their user ID)
    if (!filePath.startsWith(user.id)) {
      return NextResponse.json(
        { error: 'Access denied to this image' },
        { status: 403 }
      )
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (deleteError) {
      console.error('Image deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    })

  } catch (error) {
    console.error('Image deletion API error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 