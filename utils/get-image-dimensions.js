const { imageSize } = require('image-size');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
// const fetch = require('node-fetch');
// const probe = require('probe-image-size');
const http = require('http');
const https = require('https');
const errorLogger = require('./error-logger');
const { getCache, setCache } = require('./cache');
const { currentLocale_ghost } = require('../config');

// // Current Solution:
// // Minimum required bytes for common image formats (approximate)
// const imageMinBytes = {
//   jpg: 410,
//   png: 33,
//   gif: 14,
//   webp: 30,
//   bmp: 26,
//   default: 256 // Fallback for other image types
// };

// const probeImage = async url => {
//   const response = await fetch(url);
//   if (!response.ok)
//     throw new Error(`Failed to fetch image: ${response.statusText}`);

//   const chunks = [];
//   const reader = response.body;
//   let buffer = Buffer.alloc(0);

//   for await (const chunk of reader) {
//     chunks.push(chunk);

//     try {
//       buffer = Buffer.concat([buffer, chunk]);

//       // Try to detect image format (first few bytes)
//       const { type } = imageSize(buffer);
//       const minBytes = imageMinBytes[type] || imageMinBytes.default;

//       // Check buffer length before probing image
//       if (buffer.length < minBytes) continue;

//       // Get dimensions
//       const dimensions = imageSize(buffer);
//       if (dimensions.width && dimensions.height) {
//         response.body.destroy(); // Stop downloading
//         return dimensions;
//       }
//     } catch (err) {
//       // Continue reading if more data is needed
//     }
//   }

//   throw new Error('Could not determine image size');
// };

// const probeImage = async (url, redirects = 0, maxRedirects = 5) => {
//   return new Promise((resolve, reject) => {
//     if (redirects > maxRedirects) {
//       return reject(new Error('Too many redirects'));
//     }

//     const client = url.startsWith('https') ? https : http;

//     const request = client.get(url, response => {
//       if (
//         response.statusCode >= 300 &&
//         response.statusCode < 400 &&
//         response.headers.location
//       ) {
//         // Follow redirect
//         return resolve(
//           getImageDimensions(response.headers.location, redirects + 1)
//         );
//       }
//       if (response.statusCode !== 200) {
//         return reject(
//           new Error(`Failed to fetch image: ${response.statusCode}`)
//         );
//       }

//       let buffer = Buffer.alloc(0);
//       const maxBufferSize = 1024; // Limit buffer to 1KB

//       response.on('data', chunk => {
//         buffer = Buffer.concat([buffer, chunk]);

//         try {
//           const dimensions = imageSize(buffer);
//           if (dimensions.width && dimensions.height) {
//             request.destroy(); // Stop downloading once we have dimensions
//             resolve(dimensions);
//           }
//         } catch (err) {
//           // Keep buffering if not enough data
//         }

//         // Trim buffer to prevent excessive memory usage
//         if (buffer.length > maxBufferSize) {
//           buffer = buffer.subarray(buffer.length - maxBufferSize);
//         }
//       });

//       response.on('end', () =>
//         reject(new Error('Could not determine image size'))
//       );
//       response.on('error', reject);
//     });

//     request.on('error', reject);
//   });
// };

// const probeImage = async url => {
//   const response = await fetch(url, { redirect: 'follow' });
//   if (!response.ok)
//     throw new Error(`Failed to fetch image: ${response.statusText}`);

//   const reader = response.body;
//   let buffer = Buffer.alloc(0);
//   const maxBufferSize = 1024; // Limit buffer to 1KB

//   for await (const chunk of reader) {
//     buffer = Buffer.concat([buffer, chunk]);

//     try {
//       const dimensions = imageSize(buffer);
//       if (dimensions.width && dimensions.height) {
//         response.body.destroy(); // Stop further downloading
//         return dimensions;
//       }
//     } catch (err) {
//       // If error occurs, continue reading more bytes
//     }

//     // Keep memory usage low by trimming old bytes
//     if (buffer.length > maxBufferSize) {
//       buffer = buffer.subarray(buffer.length - maxBufferSize);
//     }
//   }

//   throw new Error('Could not determine image size');
// };

// const http = require('http');
// const https = require('https');

// async function probeImage(url, redirects = 0, maxRedirects = 5) {
//   return new Promise((resolve, reject) => {
//     if (redirects > maxRedirects) {
//       return reject(new Error('Too many redirects'));
//     }

//     const client = url.startsWith('https') ? https : http;
//     const request = client.get(url, response => {
//       if (
//         response.statusCode >= 300 &&
//         response.statusCode < 400 &&
//         response.headers.location
//       ) {
//         // Follow redirects
//         return resolve(
//           getImageDimensions(
//             response.headers.location,
//             redirects + 1,
//             maxRedirects
//           )
//         );
//       }
//       if (response.statusCode !== 200) {
//         return reject(
//           new Error(`Failed to fetch image: ${response.statusCode}`)
//         );
//       }

//       let buffer = Buffer.alloc(0);
//       const CHECK_EVERY_KB = 4096; // Check dimensions every 4KB

//       response.on('data', chunk => {
//         buffer = Buffer.concat([buffer, chunk]);

//         // Check dimensions once we have enough data
//         if (buffer.length >= CHECK_EVERY_KB) {
//           try {
//             const dimensions = imageSize(buffer);
//             if (dimensions.width && dimensions.height) {
//               request.destroy(); // Stop downloading once dimensions are found
//               return resolve(dimensions);
//             }
//           } catch (err) {
//             // Not enough data yet, continue reading
//           }
//         }
//       });

//       response.on('end', () =>
//         reject(new Error('Could not determine image size'))
//       );
//       response.on('error', reject);
//     });

//     request.on('error', reject);
//   });
// }

// const http = require('http');
// const https = require('https');

// function probeImage(url) {
//   return new Promise((resolve, reject) => {
//     const client = url.startsWith('https') ? https : http;

//     client
//       .get(url, response => {
//         if (
//           response.statusCode >= 300 &&
//           response.statusCode < 400 &&
//           response.headers.location
//         ) {
//           return resolve(probeImage(response.headers.location)); // Follow redirect
//         }
//         if (response.statusCode !== 200) {
//           return reject(
//             new Error(`Failed to fetch image: ${response.statusCode}`)
//           );
//         }

//         let buffer = Buffer.alloc(0);
//         response.on('data', chunk => {
//           buffer = Buffer.concat([buffer, chunk]);

//           try {
//             const dimensions = imageSize(buffer);
//             if (dimensions.width && dimensions.height) {
//               response.destroy(); // Stop downloading once dimensions are found
//               return resolve(dimensions);
//             }
//           } catch (err) {
//             if (err.message.includes('unsupported')) {
//               response.destroy();
//               return reject(new Error('Unsupported image format'));
//             }
//           }
//         });

//         response.on('end', () =>
//           reject(new Error('Could not determine image size'))
//         );
//         response.on('error', reject);
//       })
//       .on('error', reject);
//   });
// }

// // Minimum required bytes for common image formats
// const imageMinBytes = {
//   jpg: 410,
//   png: 33,
//   gif: 14,
//   webp: 30,
//   bmp: 26,
//   default: 256 // Fallback
// };

// const probeImage = async url => {
//   const response = await fetch(url);
//   if (!response.ok)
//     throw new Error(`Failed to fetch image: ${response.statusText}`);

//   const reader = response.body.getReader();
//   let buffer = Buffer.alloc(0);

//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) break;

//     buffer = Buffer.concat([buffer, value]);

//     try {
//       const { type } = imageSize(buffer);
//       const minBytes = imageMinBytes[type] || imageMinBytes.default;
//       if (buffer.length < minBytes) continue;

//       const dimensions = imageSize(buffer);
//       if (dimensions.width && dimensions.height) {
//         reader.cancel(); // Stop downloading
//         return dimensions;
//       }
//     } catch {
//       // Keep reading if more data is needed
//     }
//   }

//   throw new Error('Could not determine image size');
// };

// const http = require('http');
// const https = require('https');

// function probeImage(url) {
//   return new Promise((resolve, reject) => {
//     const client = url.startsWith('https') ? https : http;

//     client
//       .get(url, response => {
//         if (
//           response.statusCode >= 300 &&
//           response.statusCode < 400 &&
//           response.headers.location
//         ) {
//           return resolve(probeImage(response.headers.location)); // Follow redirect
//         }
//         if (response.statusCode !== 200) {
//           return reject(
//             new Error(`Failed to fetch image: ${response.statusCode}`)
//           );
//         }

//         let buffer = [];
//         const MAX_BYTES = 8192; // Only keep up to 8KB in memory

//         response.on('data', chunk => {
//           buffer.push(chunk);
//           const data = Buffer.concat(buffer);

//           try {
//             const dimensions = imageSize(data);
//             if (dimensions.width && dimensions.height) {
//               response.destroy(); // Stop downloading once dimensions are found
//               return resolve(dimensions);
//             }
//           } catch (err) {
//             if (err.message.includes('unsupported')) {
//               response.destroy();
//               return reject(new Error('Unsupported image format'));
//             }
//           }

//           // Prevent excessive memory usage
//           if (data.length > MAX_BYTES) {
//             response.destroy();
//             reject(new Error('Image data too large or unrecognized format'));
//           }
//         });

//         response.on('error', reject);
//         response.on('end', () =>
//           reject(new Error('Could not determine image size'))
//         );
//       })
//       .on('error', reject);
//   });
// }

// const probeImage = async url => {
//   const response = await fetch(url);
//   if (!response.ok)
//     throw new Error(`Failed to fetch image: ${response.statusText}`);

//   const reader = response.body; // Node.js stream
//   let buffer = Buffer.alloc(0);

//   for await (const chunk of reader) {
//     buffer = Buffer.concat([buffer, chunk]);

//     try {
//       const dimensions = imageSize(buffer);
//       if (dimensions.width && dimensions.height) {
//         response.body.destroy(); // Stop downloading
//         return dimensions;
//       }
//     } catch (err) {
//       if (
//         err.message.includes('unsupported') ||
//         err.message.includes('invalid')
//       ) {
//         response.body.destroy();
//         throw new Error('Unsupported or corrupt image format');
//       }
//     }
//   }

//   throw new Error('Could not determine image size');
// };

// Kinda working? Pretty fast

// async function probeImage(url) {
//   return new Promise((resolve, reject) => {
//     const client = url.startsWith('https') ? https : http;

//     const request = client.get(url, response => {
//       if (
//         [301, 302, 307, 308].includes(response.statusCode) &&
//         response.headers.location
//       ) {
//         // Follow redirects
//         return probeImage(response.headers.location)
//           .then(resolve)
//           .catch(reject);
//       }
//       if (response.statusCode !== 200) {
//         return reject(
//           new Error(`Failed to fetch image: ${response.statusCode}`)
//         );
//       }

//       const chunks = [];

//       response.on('data', chunk => {
//         chunks.push(chunk);

//         try {
//           const dimensions = imageSize(Buffer.concat(chunks));
//           if (dimensions.width && dimensions.height) {
//             response.destroy(); // Stop downloading
//             return resolve(dimensions);
//           }
//         } catch (err) {
//           // Keep reading until we have enough data
//         }
//       });

//       response.on('end', () => {
//         try {
//           resolve(imageSize(Buffer.concat(chunks))); // Final check
//         } catch (err) {
//           reject(new Error('Could not determine image size'));
//         }
//       });

//       response.on('error', reject);
//     });

//     request.on('error', reject); // Handle request errors
//   });
// }

// // This seems to work well (but maybe only if redirects don't get followed?)
// async function probeImage(url, redirects = 0, maxRedirects = 5) {
//   try {
//     // Validate URL
//     new URL(url);
//   } catch (err) {
//     throw new Error('Invalid URL');
//   }

//   return new Promise((resolve, reject) => {
//     if (redirects > maxRedirects) {
//       return reject(new Error('Too many redirects'));
//     }

//     const noRedirectsLocales = ['chinese', 'italian'];
//     // const noRedirectsLocales = [];
//     const client = url.startsWith('https') ? https : http;
//     const request = client.get(url, response => {
//       if (
//         response.statusCode >= 300 &&
//         response.statusCode < 400 &&
//         response.headers.location
//       ) {
//         if (noRedirectsLocales.includes(currentLocale_ghost)) {
//           return reject(new Error('Redirects not allowed'));
//         }
//         // Follow redirect
//         // return resolve(
//         //   probeImage(response.headers.location, redirects + 1, maxRedirects)
//         // );
//         return probeImage(
//           response.headers.location,
//           redirects + 1,
//           maxRedirects
//         );
//       }

//       if (response.statusCode !== 200) {
//         return reject(
//           new Error(`Failed to fetch image: ${response.statusCode}`)
//         );
//       }

//       const chunks = [];

//       response.on('data', chunk => {
//         chunks.push(chunk);

//         try {
//           const dimensions = imageSize(Buffer.concat(chunks));
//           if (dimensions.width && dimensions.height) {
//             response.destroy(); // Stop downloading
//             return resolve(dimensions);
//           }
//         } catch (err) {
//           // Keep reading until we have enough data
//         }
//       });

//       response.on('end', () => {
//         try {
//           resolve(imageSize(Buffer.concat(chunks))); // Final check
//         } catch (err) {
//           reject(new Error('Could not determine image size'));
//         }
//       });

//       response.on('error', reject);
//     });

//     request.on('error', reject); // Handle request errors
//   });
// }

// async function probeImage(url) {
//   try {
//     const noRedirectsLocales = ['chinese', 'italian'];

//     if (!URL.canParse(url)) {
//       throw new Error('Invalid URL');
//     }

//     const response = await fetch(url, {
//       follow: noRedirectsLocales.includes(currentLocale_ghost) ? 0 : 5
//       // follow: 0
//     });

//     if (!response.ok) {
//       throw new Error(
//         `Failed to fetch image: ${response.status} ${response.statusText}`
//       );
//     }

//     const reader = response.body;
//     const chunks = [];
//     for await (const chunk of reader) {
//       chunks.push(chunk);

//       try {
//         const dimensions = imageSize(Buffer.concat(chunks));
//         if (dimensions.width && dimensions.height) {
//           response.body.destroy(); // Stop downloading
//           return dimensions;
//         }
//       } catch (err) {
//         // Keep reading until we have enough data
//       }
//     }
//   } catch (err) {
//     throw new Error('Could not determine image size');
//   }
// }

const probeImage = async url => {
  const noRedirectsLocales = ['chinese', 'italian'];

  try {
    // Validate URL
    new URL(url);

    // Fetch the image
    // const response = await fetch(url, {
    //   follow: noRedirectsLocales.includes(currentLocale_ghost) ? 0 : 5
    // });
    const response = await fetch(url);

    if (!response.ok)
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`
      );

    const reader = response.body;
    const chunks = [];

    for await (const chunk of reader) {
      chunks.push(chunk);

      try {
        const dimensions = imageSize(Buffer.concat(chunks));
        if (dimensions.width && dimensions.height) {
          response.body.destroy(); // Stop downloading
          return dimensions;
        }
      } catch {
        // Keep reading until we have enough data
      }
    }

    throw new Error('Could not determine image size');
  } catch (err) {
    // console.error(`probeImage error: ${err.message}`);
    errorLogger({ type: 'probeImage', name: err.message });
  }
};

const getImageDimensions = async (url, description) => {
  let imageDimensions = { width: 600, height: 400 };

  try {
    if (url.startsWith('data:')) {
      console.warn(`
        ---------------------------------------------------------------
        Warning: Skipping data URL for image dimensions in ${description.substring(0, 350)}...
        ---------------------------------------------------------------
        `);

      throw new Error('Data URL');
    }
    const cachedDimensions = getCache(url);
    if (cachedDimensions) imageDimensions = cachedDimensions;

    const fetchedImageDimensions = await probeImage(url);
    // const fetchedImageDimensions = await probe(url);
    imageDimensions = {
      width: fetchedImageDimensions?.width
        ? fetchedImageDimensions?.width
        : imageDimensions.width,
      height: fetchedImageDimensions?.height
        ? fetchedImageDimensions?.height
        : imageDimensions.height
    };

    setCache(url, imageDimensions);
  } catch (err) {
    errorLogger({ type: 'image', name: description });
  }

  return imageDimensions;
};

module.exports = getImageDimensions;
