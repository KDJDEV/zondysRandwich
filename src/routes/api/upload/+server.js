import { createClient } from '@supabase/supabase-js';
import { json } from '@sveltejs/kit'; // Import json helper
import sharp from 'sharp'; // Import sharp for image processing
import crypto from 'crypto'; // Import crypto for generating random hashes
import 'dotenv/config';

export const config = {
    runtime: 'nodejs',
};

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const generateRandomHash = () => {
    return crypto.randomBytes(16).toString('hex');
};

export const POST = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('image');

        if (!file) {
            return json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();

        const resizedImageBuffer = await sharp(Buffer.from(buffer))
            .jpeg({ quality: 70, progressive: true })
            .toBuffer();

        const randomHash = generateRandomHash();
        const fileName = `uploads/${randomHash}.jpg`;

        const { data, error: uploadError } = await supabase.storage
            .from('sandwiches')
            .upload(fileName, resizedImageBuffer, {
                contentType: 'image/jpeg',
                upsert: false,
            });

        if (uploadError) {
            return json({ error: uploadError.message }, { status: 500 });
        }

        const resp = supabase.storage
            .from('sandwiches')
            .getPublicUrl(fileName);

        return json({ imageUrl: resp.data.publicUrl }, { status: 200 });
    } catch (err) {
        return json({ error: 'Server error' }, { status: 500 });
    }
};