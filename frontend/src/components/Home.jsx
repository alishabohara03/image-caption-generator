import React, { useState } from 'react';

const Home = () => {
 const [image, setImage] = useState(null);
 const [caption, setCaption] = useState('');
 const [loading, setLoading] = useState(false);

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
   <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
     <div className="max-w-4xl mx-auto">
       {/* Header */}
       <div className="flex justify-between items-center mb-8">
         <h1 className="text-4xl font-bold text-black">Image Caption Generator</h1>
       </div>

       {/* Main Content */}
       <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-lg">
         <div className="text-center mb-8">
           <h2 className="text-3xl font-semibold text-black">Generate Captions from any Image</h2>
           <p className="text-lg text-gray-600 mt-2">
             Upload your image and get intelligent, context-aware captions instantly.
           </p>
         </div>

         {/* Upload Area */}
         <div
           onDrop={handleDrop}
           onDragOver={handleDragOver}
           onClick={() => document.getElementById('imageUpload').click()}
           className="border-2 border-dashed border-gray-400 bg-gray-100 p-8 text-center rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-200 transition mb-6"
         >
           <input
             type="file"
             accept="image/jpeg,image/png"
             onChange={handleImageUpload}
             className="hidden"
             id="imageUpload"
           />
           <div className="flex flex-col items-center justify-center">
             <div className="w-16 h-16 mb-4 bg-gray-300 rounded-full flex items-center justify-center">
               <span className="text-2xl text-gray-600">+</span>
             </div>
             <p className="text-lg font-semibold text-black mb-2">Drag and drop an image here, or click to browse</p>
             <p className="text-sm text-gray-500">
               JPG and PNG image formats supported
             </p>
           </div>
           {image && (
             <div className="mt-6 flex items-center justify-center p-4 bg-gray-50 rounded-lg">
               <img
                 src={URL.createObjectURL(image)}
                 alt="Preview"
                 className="max-h-32 object-contain mr-4 rounded-lg shadow-lg"
               />
               <p className="text-lg font-medium text-black">Selected: {image.name}</p>
             </div>
           )}
         </div>

         {/* Generate Button */}
         <button
           onClick={generateCaption}
           disabled={loading || !image}
           className="w-full bg-gray-800 text-white font-semibold py-4 px-4 rounded-lg mb-4 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
         >
           {loading ? (
             <span className="flex items-center justify-center">
               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
               Generating Caption...
             </span>
           ) : (
             'Generate Caption'
           )}
         </button>

         {/* Caption Preview */}
         {caption && (
           <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg mb-6">
             <div className="flex items-center justify-between flex-col sm:flex-row">
               <div className="flex items-center mb-4 sm:mb-0">
                 {image && (
                   <img
                     src={URL.createObjectURL(image)}
                     alt="Generated Caption"
                     className="max-h-24 object-contain mr-4 rounded-lg shadow-lg"
                   />
                 )}
                 <div>
                   <p className="text-sm font-medium text-gray-600 mb-1">Generated Caption:</p>
                   <p className="text-xl text-black">"{caption}"</p>
                 </div>
               </div>
               <button
                 onClick={downloadCaption}
                 className="mt-4 sm:mt-0 bg-gray-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-500 transition"
               >
                 Download Caption
               </button>
             </div>
           </div>
         )}

         {/* Save to Database */}
         {caption && (
           <button
             onClick={saveToDatabase}
             className="w-full bg-gray-800 text-white font-semibold py-4 px-4 rounded-lg mb-6 hover:bg-gray-700 transition"
           >
             Save to Database
           </button>
         )}

         {/* How It Works */}
         <div className="text-center mt-8">
           <h2 className="text-2xl font-semibold text-black mb-6">How It Works</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="flex flex-col items-center p-4 bg-gray-100 border border-gray-200 rounded-lg transition hover:bg-gray-200">
               <div className="w-12 h-12 mb-3 bg-blue-500 rounded-full flex items-center justify-center">
                 <span className="text-xl text-white">1</span>
               </div>
               <p className="text-lg font-medium text-black mb-1">Upload an Image</p>
               <p className="text-sm text-gray-500">Drag and drop or click to select your image</p>
             </div>
             <div className="flex flex-col items-center p-4 bg-gray-100 border border-gray-200 rounded-lg transition hover:bg-gray-200">
               <div className="w-12 h-12 mb-3 bg-green-500 rounded-full flex items-center justify-center">
                 <span className="text-xl text-white">2</span>
               </div>
               <p className="text-lg font-medium text-black mb-1">AI Analysis</p>
               <p className="text-sm text-gray-500">Our advanced computer vision analyzes your image</p>
             </div>
             <div className="flex flex-col items-center p-4 bg-gray-100 border border-gray-200 rounded-lg transition hover:bg-gray-200">
               <div className="w-12 h-12 mb-3 bg-purple-500 rounded-full flex items-center justify-center">
                 <span className="text-xl text-white">3</span>
               </div>
               <p className="text-lg font-medium text-black mb-1">Get Caption</p>
               <p className="text-sm text-gray-500">Receive an intelligent description of your image</p>
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>
 );
};

export default Home;