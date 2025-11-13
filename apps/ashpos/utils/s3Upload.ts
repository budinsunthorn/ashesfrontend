import Cookies from 'universal-cookie';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadImageToS3 = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    const cookies = new Cookies();
    const token = cookies.get('token');

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'receipt-image');

    // Get presigned URL from your backend
    const presignedUrlResponse = await fetch(`/api/upload/image`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }),
    });

    if (!presignedUrlResponse.ok) {
      throw new Error('Failed to get presigned URL');
    }

    const { presignedUrl, fileUrl } = await presignedUrlResponse.json();

    // Upload to S3 using presigned URL
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to S3');
    }

    return {
      success: true,
      url: fileUrl,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

// Alternative implementation using direct S3 upload (if you have AWS SDK configured)
export const uploadImageToS3Direct = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    const cookies = new Cookies();
    const token = cookies.get('token');

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'receipt-image');

    // Upload to your backend which will handle S3 upload
    const response = await fetch(`/api/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();

    return {
      success: true,
      url: result.url,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

// Utility function to validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
  }

  return { valid: true };
}; 