// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src *; connect-src 'self' https://api.cloudinary.com; img-src * blob: data:;",
          },
        ],
      },
    ]
  },
}
