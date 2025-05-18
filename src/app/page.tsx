import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="w-full max-w-5xl px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Adaptive Multi-Modal Chat Interface
        </h1>
        
        <p className="text-xl mb-10 max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
          A next-generation chat experience that goes beyond text to handle rich media intelligently
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <FeatureCard 
            title="Context-Aware"
            description="Smart input methods that suggest appropriate media types based on conversation context"
          />
          <FeatureCard 
            title="Smart Layout"
            description="Dynamic UI adjustments based on content type and conversation flow"
          />
          <FeatureCard 
            title="Specialized Viewers"
            description="Purpose-built components for code, spreadsheets, charts and more"
          />
        </div>

        <Link href="/chat" className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Try the Demo
          <ArrowRight className="ml-2" size={18} />
        </Link>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-3 text-blue-700 dark:text-blue-400">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
}
