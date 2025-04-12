import { createClient } from '@supabase/supabase-js';
import { json } from '@sveltejs/kit'; // Import json helper
import sharp from 'sharp'; // Import sharp for image processing
import crypto from 'crypto'; // Import crypto for generating random hashes
import 'dotenv/config';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const generateRandomHash = () => {
    return crypto.randomBytes(16).toString('hex'); // Generates a 32-character hex string
};

export const POST = async ({ request }) => {
    try {
        // Parse form data from the request
        const formData = await request.formData();
        const file = formData.get('image'); // 'image' is the field name in the FormData

        if (!file) {
            return json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Convert the uploaded image to a buffer
        const buffer = await file.arrayBuffer();

        // Convert the image to JPEG and compress it to a smaller size (e.g., reduce quality)
        const resizedImageBuffer = await sharp(Buffer.from(buffer))
            .jpeg({ quality: 70, progressive: true }) // Reduce quality to 70, use progressive JPEG
            .toBuffer();

        // Generate a random file name using the random hash
        const randomHash = generateRandomHash();
        const fileName = `uploads/${randomHash}.jpg`; // Using the random hash as the file name

        // Upload the processed image to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from('sandwiches') // Replace with your Supabase bucket name
            .upload(fileName, resizedImageBuffer, {
                contentType: 'image/jpeg',
                upsert: false, // Don't overwrite existing files
            });

        if (uploadError) {
            return json({ error: uploadError.message }, { status: 500 });
        }

        // Get the public URL of the uploaded file
        const resp = supabase.storage
            .from('sandwiches')
            .getPublicUrl(fileName);

        return json({ imageUrl: resp.data.publicUrl }, { status: 200 });
    } catch (err) {
        return json({ error: 'Server error' }, { status: 500 });
    }
};
