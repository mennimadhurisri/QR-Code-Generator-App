import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const BUCKET_NAME = 'make-d97a95f5-qr-files';

// Initialize storage bucket
async function initStorage() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 52428800, // 50MB
      });
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('Storage bucket created successfully');
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

initStorage();

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Upload endpoint
app.post('/make-server-d97a95f5/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const type = formData.get('type') as string;
    const id = generateId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

    if (type === 'text') {
      const content = formData.get('content') as string;
      
      if (!content) {
        return c.json({ error: 'No content provided' }, 400);
      }

      const dataToStore = {
        type: 'text',
        content,
        createdAt: new Date().toISOString(),
        expiresAt,
      };
      
      console.log('Storing text content with ID:', id);
      console.log('Data to store:', dataToStore);
      
      await kv.set(id, dataToStore);
      
      // Verify it was stored
      const verification = await kv.get(id);
      console.log('Verification - data stored:', verification);

      return c.json({ id, type: 'text' });
    } else {
      const file = formData.get('file') as File;
      
      if (!file) {
        return c.json({ error: 'No file provided' }, 400);
      }

      const fileName = `${id}-${file.name}`;
      const fileBuffer = await file.arrayBuffer();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return c.json({ error: `Failed to upload file: ${uploadError.message}` }, 500);
      }

      // Store metadata in KV
      await kv.set(id, {
        type,
        fileName,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
        createdAt: new Date().toISOString(),
        expiresAt,
      });

      return c.json({ id, type });
    }
  } catch (error) {
    console.error('Error in upload endpoint:', error);
    return c.json({ error: `Upload failed: ${error.message}` }, 500);
  }
});

// Get content endpoint
app.get('/make-server-d97a95f5/content/:id', async (c) => {
  try {
    const id = c.req.param('id');
    console.log('Fetching content for ID:', id);
    
    const contentData = await kv.get(id);
    console.log('Data from KV store:', contentData);

    if (!contentData) {
      console.log('No data found for ID:', id);
      return c.json({ error: 'Content not found or expired' }, 404);
    }

    console.log('Content data type:', typeof contentData, contentData);

    // Check if content has expired (24 hours)
    if (contentData.expiresAt && new Date(contentData.expiresAt) < new Date()) {
      // Delete expired content
      await kv.del(id);
      if (contentData.fileName) {
        await supabase.storage.from(BUCKET_NAME).remove([contentData.fileName]);
      }
      return c.json({ error: 'Content has expired (24 hour limit)' }, 410);
    }

    if (contentData.type === 'text') {
      return c.json({
        type: 'text',
        content: contentData.content,
        expiresAt: contentData.expiresAt,
      });
    } else {
      // Generate signed URL for file
      const { data: signedUrlData, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(contentData.fileName, 86400); // 24 hours expiry

      if (error) {
        console.error('Error creating signed URL:', error);
        return c.json({ error: 'Failed to retrieve file' }, 500);
      }

      return c.json({
        type: contentData.type,
        fileUrl: signedUrlData.signedUrl,
        fileName: contentData.originalName,
        fileType: contentData.fileType,
        expiresAt: contentData.expiresAt,
      });
    }
  } catch (error) {
    console.error('Error in content endpoint:', error);
    return c.json({ error: `Failed to retrieve content: ${error.message}` }, 500);
  }
});

// Debug endpoint to list all keys
app.get('/make-server-d97a95f5/debug/list', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Get all data from the KV table
    const { data, error } = await supabase
      .from('kv_store_d97a95f5')
      .select('key, value');
    
    if (error) {
      throw error;
    }
    
    console.log('All keys in KV store:', data);
    return c.json({ 
      count: data?.length || 0,
      items: data || []
    });
  } catch (error) {
    console.error('Error listing keys:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Debug endpoint to test connectivity
app.get('/make-server-d97a95f5/debug/health', async (c) => {
  return c.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  });
});

Deno.serve(app.fetch);
