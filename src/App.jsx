
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.body.className = isDarkMode
      ? 'bg-gray-900 text-gray-100'
      : 'bg-gray-50 text-gray-900';
  }, [isDarkMode]);

  const handleImageUpload = (event) => {
    const file = event.target.files ? event.target.files[0] : event.dataTransfer.files[0];
    if (file && ['image/jpeg', 'image/png'].includes(file.type)) {
      setImage(file);
    } else {
      alert('Please upload only .jpg or .png files.');
      setImage(null);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleImageUpload(event);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const generateCaption = async () => {
    if (!image) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setCaption(data.caption || 'No caption generated.');
    } catch (error) {
      console.error('Error generating caption:', error);
      setCaption('Error generating caption');
    }
    setLoading(false);
  };

  const downloadCaption = () => {
    if (caption) {
      const blob = new Blob([caption], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'caption.txt';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const saveToDatabase = async () => {
    if (image && caption) {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);

      try {
        await fetch('http://localhost:8000/save', {
          method: 'POST',
          body: formData,
        });
        alert('Image and caption saved to database!');
      } catch (error) {
        console.error('Error saving to database:', error);
        alert('Error saving to database');
      }
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Image Caption Generator</h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">Generate Captions from any Image</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Upload your image and get intelligent, context-aware captions instantly.
            </p>
          </div>

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('imageUpload').click()}
            className="border-2 border-dashed border-blue-500 dark:border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 text-center rounded-xl cursor-pointer hover:border-blue-600 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-300 transform hover:scale-[1.02] mb-6"
          >
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageUpload}
              className="hidden"
              id="imageUpload"
            />
            <div className="flex flex-col items-center justify-center">
              <span className="text-6xl mb-4 text-blue-500 dark:text-blue-400">📷</span>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Drag and drop an image here, or click browse</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                JPG and PNG image formats supported
              </p>
            </div>
            {image && (
              <div className="mt-6 flex items-center justify-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="max-h-32 object-contain mr-4 rounded-lg shadow-lg"
                />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-200">✅ Selected: {image.name}</p>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={generateCaption}
            disabled={loading || !image}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-4 rounded-xl mb-4 transition-all duration-300 transform hover:scale-[1.02] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-blue-500/25"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Generating...
              </span>
            ) : (
              '✨ Generate Caption'
            )}
          </button>

          {/* Caption Preview */}
          {caption && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl shadow-lg border border-green-200/50 dark:border-green-400/20 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {image && (
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Generated Caption"
                      className="max-h-24 object-contain mr-4 rounded-lg shadow-lg"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Generated Caption:</p>
                    <p className="text-xl text-gray-800 dark:text-gray-100">"{caption}"</p>
                  </div>
                </div>
                <button
                  onClick={downloadCaption}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  📥 Download
                </button>
              </div>
            </div>
          )}

          {/* Save to Database */}
          {caption && (
            <button
              onClick={saveToDatabase}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-4 px-4 rounded-xl mb-6 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/25"
            >
              💾 Save to Database
            </button>
          )}

          {/* How It Works */}
          <div className="text-center mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50 transition-all duration-300 transform hover:scale-105">
                <span className="text-4xl mb-3 text-blue-500 dark:text-blue-400">📤</span>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">Upload an Image</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Drag & drop or click to select</p>
              </div>
              <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50 transition-all duration-300 transform hover:scale-105">
                <span className="text-4xl mb-3 text-purple-500 dark:text-purple-400">🧠</span>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">Our AI model analyzes the image</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Advanced computer vision</p>
              </div>
              <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50 transition-all duration-300 transform hover:scale-105">
                <span className="text-4xl mb-3 text-green-500 dark:text-green-400">✍️</span>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">A caption is generated</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Intelligent descriptions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

