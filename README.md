# Adaptive Multi-Modal Chat Interface: A Next.js-based Rich Media Chat Application

A modern, performant chat interface built with Next.js 13+ that supports multiple content types including text, code, images, audio, documents, spreadsheets, and charts. Chat-Flex provides an adaptive UI that automatically adjusts based on content type and screen size, with built-in support for dark mode and accessibility features.

The application leverages Next.js 13+ features along with TypeScript for type safety and Tailwind CSS for styling. It implements advanced React patterns like memoization and context for optimal performance, while providing a rich set of UI components through a custom design system. The chat interface supports real-time thinking steps visualization, tool usage tracking, and contextual annotations, making it ideal for AI-assisted conversations and collaborative work.

## Repository Structure
```
.
├── src/                          # Source code directory
│   ├── app/                      # Next.js 13+ app directory structure
│   │   ├── api/                 # API routes for mock data and search
│   │   ├── chat/               # Chat page implementation
│   │   ├── conversation/       # Conversation pages and routing
│   │   └── search/            # Search functionality implementation
│   ├── components/             # React components organized by feature
│   │   ├── chat/              # Chat-specific components
│   │   ├── content/           # Content type renderers
│   │   ├── input/             # Input components
│   │   └── ui/                # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # State management using Zustand
│   └── types/                 # TypeScript type definitions
├── public/                     # Static assets
└── config files               # Configuration for Next.js, TypeScript, etc.
```

## Key Features

### Content Types Support
- **Text**: Rich text messages with markdown support
- **Code**: Syntax-highlighted code blocks with language detection
- **Images**: Image viewing with captions and annotations
- **Audio**: Audio playback with transcription support
- **Documents**: Document viewing with highlights and comments
- **Spreadsheets**: Interactive spreadsheet data display
- **Charts**: Dynamic chart rendering with multiple types
- **Diagrams**: Mermaid diagram support with live rendering

### Advanced UI Features
- Adaptive layout based on content type and screen size
- Real-time thinking steps visualization
- Tool usage tracking and display
- Dark mode support with smooth transitions
- Contextual annotations and highlights
- Responsive design for all screen sizes

### Technical Features
- Built with Next.js 13+ and TypeScript
- State management using Zustand
- Memoized components for optimal performance
- Real-time updates and persistence
- Comprehensive theming system
- Accessibility-first design
- Component-based architecture

### Performance Optimizations
- Automatic code splitting
- Image optimization
- Lazy loading of components
- Memoization of expensive calculations
- Efficient state updates
- Local storage caching

## Usage Instructions
### Prerequisites
- Node.js 16.8.0 or later
- npm or yarn package manager
- Git for version control

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd chat-flex

# Install dependencies
npm install
# or
yarn install

# Set up environment variables
cp .env.example .env.local
```

### Quick Start
1. Start the development server:
```bash
npm run dev
# or
yarn dev
```

2. Open your browser and navigate to `http://localhost:3000`

3. Create a new conversation by clicking the "Start New Conversation" button

### More Detailed Examples

#### Creating a Code-focused Chat
```typescript
// Example of sending a code message
const codeMessage = {
  type: "code",
  language: "typescript",
  data: `function example() {
    console.log("Hello World");
  }`
};
```

#### Using Multi-modal Features
```typescript
// Example of sending an image with caption
const imageMessage = {
  type: "image",
  data: "image-url.jpg",
  caption: "Example visualization"
};
```

## Development Setup

### Environment Setup
```bash
# Install development dependencies
npm install --save-dev @types/react @types/node

# Set up development environment
npm run dev
```

### Configuration
1. Configure Tailwind CSS:
```javascript
// tailwind.config.ts
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your custom colors
      }
    }
  }
}
```

2. Set up environment variables:
```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_ASSET_PREFIX=your_asset_prefix
```

## Theming

Chat-Flex supports comprehensive theming through CSS variables and Tailwind CSS:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  // ... other theme variables
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  // ... dark theme overrides
}
```

## Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

### Troubleshooting

#### Common Issues

1. **Conversation Not Loading**
   - Error: "Failed to load conversation"
   - Solution: Check localStorage for existing conversations
   - Debug: Enable console logging with `localStorage.debug = 'chat:*'`

2. **Content Type Not Rendering**
   - Verify content type is supported in `/src/types/core.ts`
   - Check content renderer components in `/src/components/content`

#### Performance Issues
- Enable React DevTools profiler to identify render bottlenecks
- Check for unnecessary re-renders using React.memo
- Verify memoization of expensive calculations

## Data Flow
The application implements a unidirectional data flow pattern with Zustand for state management.

```ascii
[User Input] -> [Content Processing] -> [State Update] -> [UI Render]
     ↑                                       |
     |                                      |
     └------- [Local Storage Cache] <-------┘
```

Key component interactions:
1. User input is captured through InputBar component
2. Content is processed and typed according to core.ts definitions
3. Conversation state is updated through Zustand store
4. UI components re-render based on state changes
5. Changes are persisted to localStorage for offline support
6. Search functionality indexes conversation content
7. Content renderers adapt based on content type

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

### Code Style
- Follow the TypeScript style guide
- Use functional components
- Implement proper error handling
- Write unit tests for new features

## License

This project is licensed under the MIT License - see the LICENSE file for details.