## Error Type
Runtime TypeError

## Error Message
Cannot read properties of undefined (reading 'trim')


    at ChatWidget (src\components\chat\ChatWidget.tsx:226:38)
    at RootLayout (src\app\layout.tsx:177:19)

## Code Frame
  224 |                   <button
  225 |                     type="submit"
> 226 |                     disabled={!input.trim() || connectionStatus === 'offline' || isLoading}
      |                                      ^
  227 |                     className="px-4 py-2 bg-brixa text-white rounded-lg hover:bg-brixa-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
  228 |                     aria-label="送信"
  229 |                   >

Next.js version: 16.0.11 (Webpack)
