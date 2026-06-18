# Attachment Extractor Tool

V1 launch-ready tool for extracting and managing message attachments.

## Overview

The Attachment Extractor is a standalone tool that provides:

- **File extraction** from message uploads
- **Category classification** (images, documents, archives, video, audio)
- **File validation** and error handling
- **Metadata extraction** (dimensions, duration, file info)
- **Isolated UI component** with no main app dependencies

## Architecture

```
attachment-extractor/
├── types.ts              # Type definitions
├── services.ts           # Pure extraction logic
├── hooks.ts              # React state management
├── AttachmentExtractorUI.tsx  # UI component
├── styles.css            # Isolated styles
├── fixtures.ts           # Mock data for testing
├── index.ts              # Local API surface
├── services.test.ts      # Unit tests
└── README.md             # This file
```

## Core Features

### File Categorization

- **image** - JPEG, PNG, GIF, WebP, SVG
- **document** - PDF, Word, Excel, PowerPoint, Text
- **archive** - ZIP, RAR, 7Z, GZIP
- **video** - MP4, MPEG, MOV, AVI
- **audio** - MP3, WAV, OGG, FLAC
- **other** - Any unsupported type

### Validation Rules

- File size limit: 50MB (configurable)
- MIME type whitelist: 26 supported types
- Automatic error classification
- Detailed error messages

### State Management

- **idle** - No extraction in progress
- **loading** - Files being processed
- **success** - Extraction completed successfully
- **error** - Extraction failed

## API Surface

### `useExtractor(options?)`

Main hook for extraction operations:

```typescript
const {
  state, // Current extraction state
  extract, // Extract files async
  selectAttachment, // Select single file
  selectAll, // Select all files
  deselectAll, // Clear selection
  removeAttachment, // Remove file
  clearAll, // Clear all files
  downloadAttachment, // Download single
  downloadSelected, // Download selected
  reset, // Reset to initial state
} = useExtractor(options);
```

### `extractAttachments(files, options?)`

Core extraction function:

```typescript
const result = await extractAttachments(files, {
  maxFileSize: 50 * 1024 * 1024,
  allowedMimeTypes: [...],
  extractMetadata: true,
  generateChecksum: false,
});

// Returns ExtractionResult
{
  success: boolean,
  attachments: Attachment[],
  errors: ExtractionError[],
  stats: ExtractionStats,
}
```

### `AttachmentExtractorUI`

React component for file extraction UI:

```typescript
<AttachmentExtractorUI
  options={extractionOptions}
  onFilesExtracted={(count) => console.log(`Extracted ${count} files`)}
/>
```

## Types

### Attachment

```typescript
type Attachment = {
  id: string; // Unique identifier
  name: string; // Original filename
  mimeType: string; // MIME type
  size: number; // File size in bytes
  category: FileCategory; // Categorized type
  extractedAt: Date; // Extraction timestamp
  checksum?: string; // Optional file hash
  metadata?: AttachmentMetadata; // Image/video/doc info
};
```

### ExtractionError

```typescript
type ExtractionError = {
  filename: string;
  mimeType?: string;
  reason: "unsupported_type" | "file_too_large" | "invalid_data" | "unknown";
  message: string;
};
```

### ExtractionStats

```typescript
type ExtractionStats = {
  totalProcessed: number;
  successfulExtractions: number;
  failedExtractions: number;
  totalSize: number;
  byCategory: Record<FileCategory, number>;
};
```

## Usage Example

### Basic Extraction

```typescript
import { AttachmentExtractorUI } from './attachment-extractor';

export function MyComponent() {
  return (
    <AttachmentExtractorUI
      onFilesExtracted={(count) => {
        console.log(`Successfully extracted ${count} files`);
      }}
    />
  );
}
```

### Advanced Hook Usage

```typescript
import { useExtractor } from './attachment-extractor';

export function FilePicker() {
  const {
    state,
    extract,
    selectAll,
    downloadSelected,
  } = useExtractor({
    maxFileSize: 100 * 1024 * 1024, // 100MB
    extractMetadata: true,
  });

  const handleFilesSelected = async (files: File[]) => {
    const result = await extract(files);
    if (result.success) {
      console.log(`Extracted ${result.attachments.length} files`);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => handleFilesSelected(Array.from(e.target.files || []))}
      />
      <button onClick={selectAll}>Select All</button>
      <button onClick={downloadSelected}>Download</button>

      {state.loadingState === 'loading' && <p>Processing...</p>}
      {state.error && <p>Error: {state.error}</p>}
    </div>
  );
}
```

### Custom Configuration

```typescript
import { extractAttachments, DEFAULT_CONFIG } from "./attachment-extractor";

// Override defaults
const customConfig = {
  ...DEFAULT_CONFIG,
  maxFileSize: 100 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
  extractMetadata: true,
  generateChecksum: true,
};

const result = await extractAttachments(files, customConfig);
```

## Testing

### Unit Tests

Run tests with fixtures and mocks:

```bash
npm run test -- tools/v1/individual/attachment-extractor/services.test.ts
```

### Mock Data

Fixtures provide safe test data without network calls:

```typescript
import { MOCK_FILES, MOCK_RESULTS, MOCK_ATTACHMENTS } from "./fixtures";

// Use in tests
const result = MOCK_RESULTS.successful();
const files = [MOCK_FILES.image_jpeg, MOCK_FILES.document_pdf];
```

## State Transitions

```
idle → loading → success/error
↓
selected/deselected files
↓
remove/clear operations
↓
back to idle
```

## Error Handling

Errors are automatically categorized:

| Reason             | Cause                     | Message                            |
| ------------------ | ------------------------- | ---------------------------------- |
| `file_too_large`   | Size exceeds limit        | File exceeds maximum size of 50 MB |
| `unsupported_type` | MIME type not whitelisted | File type X is not supported       |
| `invalid_data`     | File format corrupted     | File appears to be corrupted       |
| `unknown`          | Unexpected error          | Unknown error during extraction    |

## Performance

- **Debounce**: No artificial delays
- **Batch**: All files processed in parallel
- **Memory**: Efficient File API usage
- **Metadata**: Optional extraction (configurable)

## Isolation

✅ **No external dependencies** - Uses native browser APIs  
✅ **No network calls** - All logic local  
✅ **No secrets** - No credentials needed  
✅ **Folder-local** - Contained in `/tools/v1/individual/attachment-extractor`  
✅ **Self-contained** - Ready for future integration

## Future Integration

When connecting to the main mail app, create a separate issue for:

- Displaying extracted attachments in compose
- Saving attachments to message storage
- Adding attachment management to inbox
- Integrating with existing design system

This tool is ready for integration as-is, with no app modifications needed.

## License

Part of Stealth Mail - Attachment Extractor V1 Tool
