  import Link from 'next/link';
  import { ArrowRight, MessageSquare, LayoutGrid, Code, ChartBar, ImageIcon, FileText } from 'lucide-react';


  export default function Home() {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950">
        {/* Hero Section */}
        <div className="flex-1 w-full flex flex-col items-center justify-center px-4 py-16 md:py-24">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-200/20 dark:from-blue-900/20 to-transparent" />
          
          <div className="relative w-full max-w-6xl mx-auto text-center z-10">
            {/* Animated Badge */}
            <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Next Generation Chat Interface</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 animate-fade-in">
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 animate-gradient-x">
                Adaptive Multi-Modal
              </span>
              <br/>
              <span className="inline-block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 dark:from-indigo-400 dark:via-violet-400 dark:to-blue-400">
                Chat Interface
              </span>
              <span className="ml-3 relative font-black text-5xl md:text-7xl bg-clip-text text-transparent 
                bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 
                dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 
                animate-gradient-x hover:scale-105 transition-transform
                drop-shadow-[0_0_0.5rem_rgba(59,130,246,0.5)]
                dark:drop-shadow-[0_0_0.5rem_rgba(96,165,250,0.5)]
                before:content-[''] before:absolute before:-inset-1
                before:bg-gradient-to-r before:from-blue-600/20 before:via-purple-600/20 before:to-pink-600/20
                before:blur-xl before:rounded-full before:-z-10">
                Chat-Flex
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-600 dark:text-gray-300 leading-relaxed">
              Experience communication reimagined — a chat platform that intelligently adapts to <span className="text-blue-600 dark:text-blue-400 font-semibold">multiple content types</span> for truly seamless interactions.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/chat" className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/25">
                Try the Demo
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <a href="#features" className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700">
                Learn More
              </a>
            </div>
            
            {/* Preview Mockup */}
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-20 dark:opacity-30 transform -rotate-1"></div>
              <div className="relative bg-white dark:bg-gray-850 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
                <div className="h-10 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                </div>
                <div className="flex h-80 md:h-96">
                  <div className="w-1/4 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-3">
                    <div className="h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-md mb-2 w-3/4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-md mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-md w-5/6"></div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex mb-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="ml-3 flex-1">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
                        <div className="h-16 bg-blue-100 dark:bg-blue-900/20 rounded-md w-2/3"></div>
                      </div>
                    </div>
                    <div className="flex mb-4 justify-end">
                      <div className="mr-3 flex-1 flex justify-end">
                        <div className="h-20 bg-indigo-100 dark:bg-indigo-900/20 rounded-md w-2/3"></div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="flex mb-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="ml-3 flex-1">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
                        <div className="h-32 bg-purple-100 dark:bg-purple-900/20 rounded-md w-11/12"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="w-full bg-white dark:bg-gray-900 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Powerful Features
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover how our adaptive interface transforms communication across different content types
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<MessageSquare className="text-blue-500" size={24} />}
                title="Context-Aware Input"
                description="AI-powered suggestions adapt to your conversation, recommending the most appropriate content type for your needs"
              />
              <FeatureCard 
                icon={<LayoutGrid className="text-indigo-500" size={24} />}
                title="Smart Layout"
                description="Dynamic UI adjustments based on content type and conversation flow for optimal viewing and interaction"
              />
              <FeatureCard 
                icon={<Code className="text-green-500" size={24} />}
                title="Code Visualization"
                description="Specialized syntax highlighting and execution environment for sharing and reviewing code snippets"
              />
              <FeatureCard 
                icon={<ChartBar className="text-purple-500" size={24} />}
                title="Data Visualization"
                description="Interactive charts and graphs for data representation with custom styling options"
              />
              <FeatureCard 
                icon={<ImageIcon className="text-pink-500" size={24} />}
                title="Rich Media"
                description="Seamless integration of images, audio, video, and interactive media within conversations"
              />
              <FeatureCard 
                icon={<FileText className="text-orange-500" size={24} />}
                title="Document Analysis"
                description="Advanced document rendering with annotation capabilities and collaborative review tools"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to transform your chat experience?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users already enjoying our next-generation communication platform
            </p>
            <Link href="/chat" className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-medium rounded-xl transition-all transform hover:scale-105 shadow-lg">
              Start Chatting Now
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Chat-Flex
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                &copy; 2025 Adaptive Multi-Modal Chat Interface
              </p>
            </div>
          
              <Link href="https://github.com/LoordhuJeyakumar/chat-flex" target="_blank" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                GitHub
              </Link>
            </div>
      
        </footer>
      </div>
    );
  }

  function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900 group">
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 inline-block rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>
    );
  }
