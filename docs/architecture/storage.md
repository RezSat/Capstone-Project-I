# Storage Architecture

## Overview

File uploads (product and category images) are stored on the server filesystem with metadata tracked in the database.

## Storage Model

- Files are received via FormData and written to disk
- Metadata is saved to the `files` table
- File records track kind, access, MIME type, size, and storage path

## Storage Paths

- Product images: `public/uploads/products/{productId}/images/`
- Category images: `public/uploads/categories/{categoryId}/images/`

## Access Model

- Default access is private
- Product images may be public when explicitly enabled
- Documents remain private

## File Metadata

| Field | Description |
|---|---|
| kind | image, document, video, other |
| access | public or private |
| originalName | Original filename |
| mimeType | MIME type |
| sizeBytes | File size |
| storageKey | Storage path |
| publicUrl | Public URL if applicable |
