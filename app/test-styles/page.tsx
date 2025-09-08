export default function TestStylesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Style Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Tailwind Test */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Basic Tailwind</h2>
            <p className="text-gray-600">If you can see this styled properly, Tailwind CSS is working!</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-4 transition-colors">
              Test Button
            </button>
          </div>

          {/* Glassmorphism Test */}
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Glassmorphism</h2>
            <p className="text-gray-600">This should have glassmorphism effects.</p>
            <div className="w-full h-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded mt-4"></div>
          </div>

          {/* Animation Test */}
          <div className="bg-white/20 backdrop-blur-lg rounded-lg p-6 border border-white/30">
            <h2 className="text-2xl font-bold text-white mb-4">Animations</h2>
            <div className="w-12 h-12 bg-emerald-500 rounded-full animate-bounce mb-4"></div>
            <div className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent animate-pulse">
              Gradient Text
            </div>
          </div>

          {/* Custom Animation Test */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Custom Animations</h2>
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-blue-500 rounded-2xl animate-float mx-auto mb-4"></div>
            <p className="text-center text-gray-600">This should float up and down</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-white hover:text-blue-200 underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
