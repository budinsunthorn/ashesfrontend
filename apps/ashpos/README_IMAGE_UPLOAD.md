# Image Upload Functionality for Receipt Print Settings

This document describes the image upload functionality implemented for the receipt print settings.

## Features

- **Top Image Upload**: Upload and display an image at the top-center of the receipt
- **Bottom Image Upload**: Upload and display an image at the bottom-center of the receipt
- **Show/Hide Toggle**: Toggle visibility of each image independently
- **Image Dimensions**: Control the width and height of each image in pixels
- **Real-time Preview**: See how images will appear on the receipt in real-time
- **S3 Integration**: Images are stored in AWS S3 for reliable access

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# AWS S3 Configuration for Image Uploads
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET_NAME=your_s3_bucket_name
```

### 2. AWS S3 Bucket Setup

1. Create an S3 bucket in your AWS account
2. Configure the bucket for public read access (if needed)
3. Set up CORS policy for the bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 3. Install Dependencies

The following packages have been added to `package.json`:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid
npm install --save-dev @types/uuid
```

## Usage

### In the Receipt Print Settings

1. Navigate to the Print Settings page
2. Scroll to the Receipt section
3. Find the "Top Image" and "Bottom Image" sections
4. Toggle the switch to enable image upload for each position
5. Click on the upload area to select an image file
6. Adjust the image dimensions using the width and height inputs
7. The preview will update in real-time to show how the images will appear on the receipt

### Supported File Types

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### File Size Limit

Maximum file size: 5MB per image

## Technical Implementation

### Components

1. **ImageUpload Component** (`components/etc/ImageUpload.tsx`)
   - Handles file selection, validation, and upload
   - Provides UI for image preview and dimension controls
   - Includes show/hide toggle functionality

2. **S3 Upload Utility** (`utils/s3Upload.ts`)
   - Provides functions for uploading images to S3
   - Includes file validation and error handling
   - Supports both direct upload and presigned URL methods

3. **API Route** (`app/api/upload/image/route.ts`)
   - Handles image upload requests
   - Validates files and uploads to S3
   - Returns public URLs for uploaded images

### State Management

The following state variables have been added to the PrintSetting component:

```typescript
// Receipt Image states
const [receiptTopImageUrl, setReceiptTopImageUrl] = useState('');
const [receiptBottomImageUrl, setReceiptBottomImageUrl] = useState('');
const [showReceiptTopImage, setShowReceiptTopImage] = useState(false);
const [showReceiptBottomImage, setShowReceiptBottomImage] = useState(false);
const [receiptTopImageWidth, setReceiptTopImageWidth] = useState(200);
const [receiptTopImageHeight, setReceiptTopImageHeight] = useState(100);
const [receiptBottomImageWidth, setReceiptBottomImageWidth] = useState(200);
const [receiptBottomImageHeight, setReceiptBottomImageHeight] = useState(100);
```

### Backend Integration

**Note**: The current implementation stores image URLs in component state. To persist these settings, you'll need to:

1. Update the GraphQL schema to include image-related fields
2. Modify the `createPrintSetting` mutation to accept image data
3. Update the database schema to store image URLs and settings

### Example GraphQL Schema Addition

```graphql
type PrintSetting {
  # ... existing fields ...
  topImageUrl: String
  bottomImageUrl: String
  showTopImage: Boolean
  showBottomImage: Boolean
  topImageWidth: Int
  topImageHeight: Int
  bottomImageWidth: Int
  bottomImageHeight: Int
}

input createPrintSettingInput {
  # ... existing fields ...
  topImageUrl: String
  bottomImageUrl: String
  showTopImage: Boolean
  showBottomImage: Boolean
  topImageWidth: Int
  topImageHeight: Int
  bottomImageWidth: Int
  bottomImageHeight: Int
}
```

## Security Considerations

1. **File Validation**: All uploaded files are validated for type and size
2. **Unique Filenames**: Files are renamed with UUIDs to prevent conflicts
3. **Access Control**: Consider implementing user-specific upload paths
4. **CORS**: Configure CORS properly for your S3 bucket

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check AWS credentials and bucket permissions
2. **Images Not Displaying**: Verify S3 bucket is publicly accessible or configure proper CORS
3. **File Size Errors**: Ensure files are under 5MB limit
4. **File Type Errors**: Only supported image formats are allowed

### Debug Steps

1. Check browser console for error messages
2. Verify environment variables are set correctly
3. Test S3 bucket access manually
4. Check network tab for failed requests

## Future Enhancements

1. **Image Cropping**: Add ability to crop images before upload
2. **Multiple Formats**: Support for additional image formats
3. **Image Optimization**: Automatic image compression and optimization
4. **Drag & Drop**: Implement drag and drop file upload
5. **Bulk Upload**: Allow uploading multiple images at once 