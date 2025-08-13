import { createClient } from '@supabase/supabase-js';
import { json } from '@sveltejs/kit';
import sharp from 'sharp';
import crypto from 'crypto';
import OpenAI from 'openai';
import 'dotenv/config';

export const config = {
  runtime: 'nodejs',
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateRandomHash = () => crypto.randomBytes(16).toString('hex');

export const POST = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Convert to base64 data URI for moderation input
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Call OpenAI moderation endpoint
    const moderationResponse = await openai.moderations.create({
      model: 'omni-moderation-latest',
      input: [
        {
          type: 'image_url',
          image_url: { url: base64Image },
        },
      ],
    });

    // Check moderation results
    const result = moderationResponse.results?.[0];
    if (result?.flagged) {
      // You can log categories if you want more info on what was flagged
      // e.g. console.log(result.categories, result.category_scores);
      return json({ error: 'Image content flagged as inappropriate.' }, { status: 400 });
    }

    // Image passed moderation, proceed to resize and upload
    const resizedImageBuffer = await sharp(buffer)
      .jpeg({ quality: 70, progressive: true })
      .toBuffer();

    const randomHash = generateRandomHash();
    const fileName = `uploads/${randomHash}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('sandwiches')
      .upload(fileName, resizedImageBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      return json({ error: uploadError.message }, { status: 500 });
    }

    const publicUrlResponse = supabase.storage
      .from('sandwiches')
      .getPublicUrl(fileName);

    return json({ imageUrl: publicUrlResponse.data.publicUrl }, { status: 200 });
  } catch (err) {
    console.error('Upload error:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};
