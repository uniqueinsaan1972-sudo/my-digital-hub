'use client';

export default function Home() {
  const categories = [
    { emoji: '🖼️', name: 'Images', count: '1,234' },
    { emoji: '🎨', name: 'Graphics', count: '856' },
    { emoji: '🎬', name: 'Videos', count: '342' },
    { emoji: '📁', name: 'Files', count: '567' },
    { emoji: '📱', name: 'APKs', count: '189' },
    { emoji: '💻', name: 'Code', count: '423' },
  ];

  const resources = [
    { title: 'UI Design Kit', category: 'Graphics', downloads: '2.5K' },
    { title: 'Nature Wallpapers', category: 'Images', downloads: '5.2K' },
    { title: 'Tutorial Videos', category: 'Videos', downloads: '1.8K' },
    { title: 'Web Templates', category: 'Files', downloads: '3.1K' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              ⚡ UniqueVault
            </span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#" className="text-gray-400 hover:text-white">Browse</a>
            <a href="#" className="text-gray-400 hover:text-white">Upload</a>
            <a href="#" className="text-gray-400 hover:text-white">About</a>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">Sign In</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold text-white mb-6">
          Free Digital Assets <br />
          <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            For Creators
          </span>
        </h1>
        <p className="text-xl text-gray-400 mb-12">
          Download images, graphics, videos, APKs & code. All FREE! 🎁
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-20">
          <input
            type="text"
            placeholder="🔍 Search images, graphics, videos..."
            className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white mb-12">📂 Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-blue-600 to-cyan-600 p-8 rounded-2xl cursor-pointer hover:scale-105 transition"
            >
              <div className="text-5xl mb-4">{cat.emoji}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{cat.name}</h3>
              <p className="text-white/80 text-lg">{cat.count} assets</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Downloads */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white mb-12">🔥 Trending Downloads</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, idx) => (
            <div key={idx} className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 border border-gray-700">
              <div className="bg-gray-700 h-40 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-4xl">📥</span>
              </div>
              <h3 className="text-white font-semibold mb-2">{resource.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{resource.category}</p>
              <div className="flex justify-between items-center">
                <span className="text-blue-400">{resource.downloads} ⬇️</span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Get</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="bg-gray-800 rounded-xl p-8">
            <p className="text-4xl font-bold text-blue-500 mb-2">12,500+</p>
            <p className="text-gray-400">Total Assets</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-8">
            <p className="text-4xl font-bold text-cyan-500 mb-2">50K+</p>
            <p className="text-gray-400">Downloads</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-8">
            <p className="text-4xl font-bold text-purple-500 mb-2">100%</p>
            <p className="text-gray-400">FREE</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Want to Contribute?</h2>
          <p className="text-white/90 mb-8">Upload your designs and earn 💰</p>
          <button className="bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100">
            Start Uploading
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">UniqueVault</h4>
              <p className="text-gray-400">Free digital assets</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Browse</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#">Images</a></li>
                <li><a href="#">Graphics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Creators</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#">Upload</a></li>
                <li><a href="#">Earnings</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 UniqueVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}