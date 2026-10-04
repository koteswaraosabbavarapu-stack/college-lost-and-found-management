import axios from 'axios';

// Helper to convert and compress image file to lightweight Base64 data URL
export const compressImageToBase64 = (file, maxWidth = 900, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (err) {
          resolve(readerEvent.target.result);
        }
      };
      img.onerror = () => {
        resolve(readerEvent.target.result);
      };
      img.src = readerEvent.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const uploadService = {
  async uploadImage(file) {
    // 1. Generate local compressed Base64 data URL first
    let base64Preview = '';
    try {
      base64Preview = await compressImageToBase64(file);
    } catch (e) {
      console.warn('Base64 conversion fallback failed:', e);
    }

    // 2. Attempt backend upload with quick timeout
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : '',
        },
        timeout: 2500, // 2.5s timeout for fast offline/static fallback
      });

      if (response.data && response.data.data && response.data.data.filePath) {
        return response.data;
      }
    } catch (err) {
      console.info('Backend upload endpoint not responding; using compressed offline image.');
    }

    // 3. Instant Fallback: Use the compressed base64 Data URL
    if (base64Preview) {
      return {
        success: true,
        data: {
          filePath: base64Preview,
        },
        message: 'Image processed successfully',
      };
    }

    throw new Error('Unable to process the selected image file');
  },
};

