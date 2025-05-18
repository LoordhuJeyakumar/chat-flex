# Chat-Flex: Adaptive Multi-Modal Chat Interface

![Chat-Flex Banner](https://via.placeholder.com/1200x300/4f46e5/ffffff?text=Chat-Flex)

Chat-Flex is a next-generation chat interface that intelligently adapts to multiple content types for truly seamless communication. Built with Next.js, TypeScript, and Tailwind CSS, it provides a modern UI for handling text, code, images, audio, documents, spreadsheets, charts, and diagrams.

[![Next.js](https://img.shields.io/badge/Next.js-13+-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

## 🌟 Features

### Content Type Support
- **Text**: Rich text messaging with markdown support
- **Code**: Syntax highlighted code blocks with language detection
- **Image**: Image display with captions and full-size preview
- **Audio**: Audio playback with transcription support
- **Document**: Document rendering with annotation capabilities
- **Spreadsheet**: Tabular data display with sorting and filtering
- **Chart**: Data visualization with multiple chart types
- **Diagram**: Flow diagrams and sequence charts

### UI/UX Features
- **Context-Aware Input**: Smart suggestions based on conversation context
- **Adaptive Layout**: Dynamic UI that adjusts based on content type
- **Responsive Design**: Seamless experience across all device sizes
- **Dark Mode**: Full dark mode support with automatic detection
- **Annotations**: Add comments and highlights to messages
- **Message Organization**: Create, manage, and switch between conversations
- **Content Suggestion**: AI-powered content type recommendations

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Component Architecture**: Reusable, modular components
- **State Management**: Efficient state updates with React hooks
- **Conversation Persistence**: Auto-save and restore conversations
- **Performance Optimized**: Memoization and virtualization for large chats
- **Accessibility**: ARIA compliant with keyboard navigation support

## 📸 Screenshots

<table>
  <tr>
    <td><img src="https://via.placeholder.com/400x300/4f46e5/ffffff?text=Chat+Interface" alt="Chat Interface" /></td>
    <td><img src="https://via.placeholder.com/400x300/4f46e5/ffffff?text=Code+View" alt="Code View" /></td>
  </tr>
  <tr>
    <td><img src="https://via.placeholder.com/400x300/4f46e5/ffffff?text=Chart+Rendering" alt="Chart Rendering" /></td>
    <td><img src="https://via.placeholder.com/400x300/4f46e5/ffffff?text=Document+View" alt="Document View" /></td>
  </tr>
</table>

## 🚀 Getting Started

### Prerequisites
- Node.js 16.8.0 or later
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/chat-flex.git
cd chat-flex

# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Run the development server
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
# Build the application
npm run build
# or
yarn build

# Start the production server
npm run start
# or
yarn start
```

## 🏗️ Architecture

### Project Structure

```
chat-flex/
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js app directory
│   │   ├── api/        # API routes
│   │   ├── chat/       # Chat interface page
│   │   └── page.tsx    # Landing page
│   ├── components/     # React components
│   │   ├── chat/       # Chat-related components
│   │   ├── context/    # Context providers
│   │   ├── ui/         # UI components
│   │   └── ...         # Other component categories
│   ├── data/           # Mock data and constants
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── store/          # State management
│   └── types/          # TypeScript type definitions
├── .env                # Environment variables
├── next.config.js      # Next.js configuration
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

### Core Components

#### AdaptiveMultiModalChat

The main chat component that handles different content types and adapts the UI accordingly.

```tsx
<AdaptiveMultiModalChat
  conversationId="conv-123"
  initialMessages={messages}
  onMessagesUpdate={handleMessagesUpdate}
/>
```

#### Content Renderers

Specialized components for rendering different content types:

- `RenderContent`: Main content renderer that dispatches to type-specific renderers
- `CodeRenderer`: Syntax-highlighted code display
- `ImageRenderer`: Image display with caption support
- `ChartRenderer`: Dynamic chart visualization
- `DocumentRenderer`: Document viewer with annotation support
- `SpreadsheetRenderer`: Tabular data display
- `DiagramRenderer`: Flow and sequence diagram visualization

### Data Flow

```
┌────────────────────┐      ┌──────────────────┐      ┌───────────────┐
│  User Input/Event  │─────▶│  State Update    │─────▶│  UI Render    │
└────────────────────┘      └──────────────────┘      └───────────────┘
         │                          │                         │
         │                          │                         │
         ▼                          ▼                         ▼
┌────────────────────┐      ┌──────────────────┐      ┌───────────────┐
│  Content Creation  │      │  Conversation    │      │  Component    │
│  & Processing      │      │  Persistence     │      │  Adaptation   │
└────────────────────┘      └──────────────────┘      └───────────────┘
```

## 💻 Usage Examples

### Creating a New Conversation

```tsx
// In your component
const handleCreateNewConversation = () => {
  const newId = `conv-${Date.now()}`;
  
  const newConversation = {
    id: newId,
    title: "New Conversation",
    messages: []
  };
  
  // Add to state
  setConversations(prev => ({
    ...prev,
    [newId]: newConversation
  }));
  
  // Set as active
  setActiveConversationId(newId);
};
```

### Sending Different Content Types

```tsx
// Text message
handleSendMessage('text', 'Hello world!');

// Code message
handleSendMessage('code', `function greeting() {
  return "Hello world!";
}`, { language: 'javascript' });

// Image message
handleSendMessage('image', imageUrl, { 
  caption: 'Project diagram' 
});

// Document message
handleSendMessage('document', documentContent, {
  fileName: 'spec.pdf',
  fileType: 'application/pdf'
});
```

### Using Annotations

```tsx
// Adding an annotation to a message
const handleAddAnnotation = (messageId, comment) => {
  const newAnnotation = {
    id: `annotation-${Date.now()}`,
    comment,
    timestamp: new Date()
  };
  
  setAnnotations(prev => ({
    ...prev,
    [messageId]: [...(prev[messageId] || []), newAnnotation]
  }));
};
```

## 🧩 Key Features Implementation

### Context-Aware Input Suggestions

The application analyzes conversation content to suggest appropriate media types based on keywords and content patterns:

```tsx
const analyzeResponseForSuggestions = (message) => {
  if (message.sender !== 'ai') return;

  const content = typeof message.content === 'string' 
    ? message.content 
    : message.content.type === 'text' ? message.content.data : '';
    
  // Keyword-based suggestion
  if (content.includes('code') || content.includes('function')) {
    setContentSuggestion({ type: 'code', confidence: 0.8 });
  } else if (content.includes('image') || content.includes('picture')) {
    setContentSuggestion({ type: 'image', confidence: 0.8 });
  }
  // Additional content type detection...
};
```

### Responsive Layout

The chat interface adapts to different screen sizes with a collapsible sidebar on mobile:

```tsx
// Handle window resize for responsive layout
useEffect(() => {
  const checkScreenSize = () => {
    setIsSmallScreen(window.innerWidth < 768);
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  };
  
  // Initial check
  checkScreenSize();
  
  // Add event listener
  window.addEventListener('resize', checkScreenSize);
  
  // Cleanup
  return () => window.removeEventListener('resize', checkScreenSize);
}, []);
```

## 🛠️ Technologies Used

- **[Next.js](https://nextjs.org/)**: React framework for production
- **[TypeScript](https://www.typescriptlang.org/)**: Static type checking
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[Lucide Icons](https://lucide.dev/)**: Beautiful SVG icons
- **[React Hooks](https://reactjs.org/docs/hooks-intro.html)**: State and side-effect management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Team](https://nextjs.org/)
- [Tailwind CSS Team](https://tailwindcss.com/)
- [React Team](https://reactjs.org/)
- All open-source contributors whose libraries we've used

---

Created with ❤️ for better chat experiences