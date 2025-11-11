import sharp from 'sharp';
import axios from 'axios';

/**
 * Generate perceptual hash (pHash) for image similarity detection
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<String>} Perceptual hash string
 */
export const generatePerceptualHash = async (imageBuffer) => {
  try {
    // Resize to 8x8, convert to grayscale
    const resized = await sharp(imageBuffer)
      .resize(8, 8, { fit: 'fill' })
      .greyscale()
      .raw()
      .toBuffer();

    // Calculate average pixel value
    const pixels = Array.from(resized);
    const average = pixels.reduce((sum, val) => sum + val, 0) / pixels.length;

    // Generate hash based on comparison with average
    let hash = '';
    for (let pixel of pixels) {
      hash += pixel > average ? '1' : '0';
    }

    return hash;
  } catch (error) {
    console.error('Error generating perceptual hash:', error);
    throw error;
  }
};

/**
 * Calculate Hamming distance between two binary strings
 * @param {String} hash1 - First hash
 * @param {String} hash2 - Second hash
 * @returns {Number} Hamming distance
 */
export const hammingDistance = (hash1, hash2) => {
  if (hash1.length !== hash2.length) {
    throw new Error('Hashes must be of equal length');
  }

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      distance++;
    }
  }

  return distance;
};

/**
 * Calculate similarity percentage between two images
 * @param {String} hash1 - First perceptual hash
 * @param {String} hash2 - Second perceptual hash
 * @returns {Number} Similarity score (0-1)
 */
export const calculateSimilarity = (hash1, hash2) => {
  const distance = hammingDistance(hash1, hash2);
  const maxDistance = hash1.length;
  return 1 - (distance / maxDistance);
};

/**
 * Download image from URL and generate hash
 * @param {String} imageUrl - Image URL
 * @returns {Promise<String>} Perceptual hash
 */
export const getHashFromUrl = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000
    });

    const buffer = Buffer.from(response.data);
    return await generatePerceptualHash(buffer);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};

/**
 * Compare uploaded image with existing issue images
 * @param {Buffer} newImageBuffer - New image buffer
 * @param {Array} existingIssues - Array of issues with imageUrl
 * @param {Number} threshold - Similarity threshold (default 0.85)
 * @returns {Promise<Object|null>} Matching issue or null
 */
export const findSimilarImage = async (newImageBuffer, existingIssues, threshold = 0.85) => {
  try {
    const newHash = await generatePerceptualHash(newImageBuffer);

    for (const issue of existingIssues) {
      try {
        const existingHash = await getHashFromUrl(issue.imageUrl);
        const similarity = calculateSimilarity(newHash, existingHash);

        if (similarity >= threshold) {
          return {
            issue,
            similarity
          };
        }
      } catch (error) {
        console.error(`Error comparing with issue ${issue._id}:`, error);
        // Continue checking other issues
      }
    }

    return null;
  } catch (error) {
    console.error('Error in findSimilarImage:', error);
    throw error;
  }
};
