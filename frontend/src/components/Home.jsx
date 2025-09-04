// import React, { useState, useEffect } from "react";

// const Home = () => {
//   const [image, setImage] = useState(null);
//   const [caption, setCaption] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [recent, setRecent] = useState([]);
//   const [guestUsed, setGuestUsed] = useState(false);

//   const token = localStorage.getItem("token");

//   // Fetch recent captions for logged-in users
//   useEffect(() => {
//     if (!token) return;

//     const fetchRecent = async () => {
//       try {
//         const res = await fetch("http://localhost:8000/history/recent", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         setRecent(data.items || []);
//       } catch (err) {
//         console.error("Error fetching recent captions:", err);
//       }
//     };

//     fetchRecent();
//   }, [token]);

//   const handleImageUpload = (event) => {
//     const file = event.target.files ? event.target.files[0] : event.dataTransfer.files[0];
//     if (file && ["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
//       setImage(file);
//     } else {
//       alert("Please upload only .jpg, .png or .gif files.");
//       setImage(null);
//     }
//   };

//   const handleDrop = (e) => { e.preventDefault(); handleImageUpload(e); };
//   const handleDragOver = (e) => e.preventDefault();

//   // Generate caption
//   const generateCaption = async () => {
//     if (!image) return;

//     // Guest user: only allow one caption
//     if (!token && guestUsed) {
//       alert("You must login to generate more captions.");
//       return;
//     }

//     setLoading(true);
//     const formData = new FormData();
//     formData.append("file", image);

//     try {
//       const res = await fetch("http://localhost:8000/caption/upload", {
//         method: "POST",
//         headers: token ? { Authorization: `Bearer ${token}` } : {},
//         body: formData,
//       });

//       if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.detail || "Failed to generate caption");
//       }

//       const data = await res.json();
//       setCaption(data.caption || "No caption generated.");

//       // Mark guest as used
//       if (!token) setGuestUsed(true);

//       // Update recent for logged-in users
//       if (token) {
//         const recentRes = await fetch("http://localhost:8000/history/recent", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const recentData = await recentRes.json();
//         setRecent(recentData.items || []);
//       }
//     } catch (err) {
//       console.error("Error generating caption:", err);
//       setCaption(err.message || "Error generating caption");
//     }
//     setLoading(false);
//   };

//   // Add copy caption function
//   const copyCaption = (text) => {
//     navigator.clipboard.writeText(text).then(() => {
//       alert("Caption copied to clipboard!");
//     }).catch((err) => {
//       console.error("Failed to copy caption:", err);
//       alert("Failed to copy caption.");
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
//       <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
//         {/* Left Sidebar */}
//         <div className="md:col-span-1 bg-white p-4 rounded-lg border shadow">
//           <h2 className="text-xl font-bold mb-4">Recent Captions</h2>
//           {token ? (
//             recent.length > 0 ? (
//               <ul className="space-y-4">
//                 {recent.map((item) => (
//                   <li key={item.id} className="p-3 bg-gray-100 rounded-md shadow-sm">
//                     <img src={item.image_url} alt="Recent" className="w-full h-24 object-cover rounded mb-2" />
//                     <p 
//                       className="text-sm text-gray-700 cursor-pointer hover:underline" 
//                       onClick={() => copyCaption(item.caption_text)}
//                     >
//                       {item.caption_text}
//                     </p>
//                   </li>
//                 ))}
//               </ul>
//             ) : <p className="text-gray-500">No recent captions.</p>
//           ) : <p className="text-gray-500">Login to see your recent captions.</p>}
//         </div>

//         {/* Main Section */}
//         <div className="md:col-span-3 bg-white p-6 rounded-lg border shadow">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold text-black mb-2">Image Caption Generator</h1>
//             <p className="text-lg text-gray-600">Upload your image and get AI-generated captions instantly.</p>
//           </div>

//           <div
//             onDrop={handleDrop}
//             onDragOver={handleDragOver}
//             onClick={() => document.getElementById("imageUpload").click()}
//             className="border-2 border-dashed border-gray-400 bg-gray-100 p-8 text-center rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-200 transition mb-6"
//           >
//             <input
//               type="file"
//               accept="image/jpeg,image/png,image/gif"
//               onChange={handleImageUpload}
//               className="hidden"
//               id="imageUpload"
//             />
//             {!image ? (
//               <>
//                 <p className="text-lg font-semibold text-black mb-2">Drag & drop an image here, or click to browse</p>
//                 <p className="text-sm text-gray-500">Supported: JPG, PNG, GIF</p>
//               </>
//             ) : (
//               <div className="mt-4">
//                 <img src={URL.createObjectURL(image)} alt="Preview" className="max-h-40 mx-auto rounded-lg shadow" />
//                 <p className="mt-2 text-gray-600">{image.name}</p>
//               </div>
//             )}
//           </div>

//           <button
//             onClick={generateCaption}
//             className="w-full bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg mb-4 hover:bg-gray-700 transition"
//           >
//             {loading ? "Generating..." : "Generate Caption"}
//           </button>

//           {caption && (
//             <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg mb-6">
//               <div className="flex items-center justify-between flex-col sm:flex-row">
//                 <div className="flex items-center mb-4 sm:mb-0">
//                   {image && <img src={URL.createObjectURL(image)} alt="Generated Caption" className="max-h-24 object-contain mr-4 rounded-lg shadow-lg" />}
//                   <div>
//                     <p className="text-sm font-medium text-gray-600 mb-1">Generated Caption:</p>
//                     <p className="text-xl text-black">"{caption}"</p>
//                   </div>
//                 </div>
//                 <button 
//                   onClick={() => copyCaption(caption)} 
//                   className="mt-4 sm:mt-0 bg-gray-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-500 transition"
//                 >
//                   Copy Caption
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* How It Works */}
//           <div className="text-center mt-8">
//             <h2 className="text-2xl font-semibold text-black mb-6">How It Works</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {[
//                 { step: 1, title: "Upload an Image", text: "Drag and drop or click to select your image", color: "bg-blue-500" },
//                 { step: 2, title: "AI Analysis", text: "Our advanced computer vision analyzes your image", color: "bg-green-500" },
//                 { step: 3, title: "Get Caption", text: "Receive an intelligent description of your image", color: "bg-purple-500" }
//               ].map(({ step, title, text, color }) => (
//                 <div key={step} className="flex flex-col items-center p-4 bg-gray-100 border border-gray-200 rounded-lg transition hover:bg-gray-200">
//                   <div className={`${color} w-12 h-12 mb-3 rounded-full flex items-center justify-center`}>
//                     <span className="text-xl text-white">{step}</span>
//                   </div>
//                   <p className="text-lg font-medium text-black mb-1">{title}</p>
//                   <p className="text-sm text-gray-500">{text}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;














import React, { useState, useEffect } from "react";

const Home = () => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);
  const [guestUsed, setGuestUsed] = useState(false);

  const [isWarning, setIsWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchRecent = async () => {
      try {
        const res = await fetch("http://localhost:8000/history/recent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRecent(data.items || []);
      } catch (err) {
        console.error("Error fetching recent captions:", err);
      }
    };

    fetchRecent();
  }, [token]);

  const handleImageUpload = (event) => {
    const file = event.target.files ? event.target.files[0] : event.dataTransfer.files[0];
    if (file && ["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      setImage(file);
      setCaption("");
      setIsWarning(false);
      setWarningMessage("");
    } else {
      alert("Please upload only .jpg, .png or .gif files.");
      setImage(null);
    }
  };

  const handleDrop = (e) => { e.preventDefault(); handleImageUpload(e); };
  const handleDragOver = (e) => e.preventDefault();

  const generateCaption = async () => {
    if (!image) return;

    if (!token && guestUsed) {
      alert("You must login to generate more captions.");
      return;
    }

    setLoading(true);
    setCaption("");
    setIsWarning(false);
    setWarningMessage("");

    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await fetch("http://localhost:8000/caption/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to generate caption");
      }

      const data = await res.json();

      if (data.warning) {
        setIsWarning(true);
        setWarningMessage(data.warning);
        setCaption(null);
      } else {
        setIsWarning(false);
        setCaption(data.caption || "No caption generated.");
      }

      if (!token) setGuestUsed(true);

      if (token && !data.warning) {
        const recentRes = await fetch("http://localhost:8000/history/recent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const recentData = await recentRes.json();
        setRecent(recentData.items || []);
      }
    } catch (err) {
      console.error("Error generating caption:", err);
      setIsWarning(true);
      setWarningMessage("⚠️ Warning: " + (err.message || "Error generating caption"));
    }

    setLoading(false);
  };

  const copyCaption = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert("Caption copied to clipboard!");
    }).catch((err) => {
      console.error("Failed to copy caption:", err);
      alert("Failed to copy caption.");
    });
  };

  const openModal = (item) => {
    setSelectedImage(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="md:col-span-1 bg-white p-4 rounded-lg border shadow">
          <h2 className="text-xl font-bold mb-4">Recent Captions</h2>
          {token ? (
            recent.length > 0 ? (
              <ul className="space-y-4">
                {recent.map((item) => (
                  <li key={item.id} className="p-3 bg-gray-100 rounded-md shadow-sm">
                    <img src={item.image_url} alt="Recent" className="w-full h-24 object-cover rounded mb-2 cursor-pointer hover:opacity-80"
                    onClick={()=> openModal(item)}
                    />
                    <p 
                      className="text-sm text-gray-700 cursor-pointer hover:underline" 
                      onClick={() => copyCaption(item.caption_text)}
                    >
                      {item.caption_text}
                    </p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-gray-500">No recent captions.</p>
          ) : <p className="text-gray-500">Login to see your recent captions.</p>}
        </div>

        {/* Main Section */}
        <div className="md:col-span-3 bg-white p-6 rounded-lg border shadow">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Image Caption Generator</h1>
            <p className="text-lg text-gray-600">Upload your image and get AI-generated captions instantly.</p>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById("imageUpload").click()}
            className="border-2 border-dashed border-gray-400 bg-gray-100 p-8 text-center rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-200 transition mb-6"
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImageUpload}
              className="hidden"
              id="imageUpload"
            />
            {!image ? (
              <>
                <p className="text-lg font-semibold text-black mb-2">Drag & drop an image here, or click to browse</p>
                <p className="text-sm text-gray-500">Supported: JPG, PNG, GIF</p>
              </>
            ) : (
              <div className="mt-4">
                <img src={URL.createObjectURL(image)} alt="Preview" className="max-h-40 mx-auto rounded-lg shadow" />
                <p className="mt-2 text-gray-600">{image.name}</p>
              </div>
            )}
          </div>

          <button
            onClick={generateCaption}
            disabled={!image || loading}
            className="w-full bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg mb-4 hover:bg-gray-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "Generate Caption"}
          </button>

          {/* Warning Display */}
          {isWarning && (
            <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg mb-6">
              <div className="flex items-center justify-between flex-col sm:flex-row">
                <div className="flex items-center mb-4 sm:mb-0">
                  {image && <img src={URL.createObjectURL(image)} alt="Warning" className="max-h-24 object-contain mr-4 rounded-lg shadow-lg" />}
                  <div>
                    <p className="text-lg text-yellow-800 flex items-center">
                      <span className="mr-2">⚠️</span>
                      Warning: This image cannot be accurately understood by the model
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Normal Caption Display */}
          {caption && !isWarning && (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg mb-6">
              <div className="flex items-center justify-between flex-col sm:flex-row">
                <div className="flex items-center mb-4 sm:mb-0">
                  {image && <img src={URL.createObjectURL(image)} alt="Generated Caption" className="max-h-24 object-contain mr-4 rounded-lg shadow-lg" />}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Generated Caption:</p>
                    <p className="text-xl text-black">"{caption}"</p>
                  </div>
                </div>
                <button 
                  onClick={() => copyCaption(caption)} 
                  className="mt-4 sm:mt-0 bg-gray-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-500 transition"
                >
                  Copy Caption
                </button>
              </div>
            </div>
          )}

          {/* How It Works */}
          <div className="text-center mt-8">
            <h2 className="text-2xl font-semibold text-black mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: 1, title: "Upload an Image", text: "Drag and drop or click to select your image", color: "bg-blue-500" },
                { step: 2, title: "AI Analysis", text: "Our advanced computer vision analyzes your image", color: "bg-green-500" },
                { step: 3, title: "Get Caption", text: "Receive an intelligent description of your image", color: "bg-purple-500" }
              ].map(({ step, title, text, color }) => (
                <div key={step} className="flex flex-col items-center p-4 bg-gray-100 border border-gray-200 rounded-lg transition hover:bg-gray-200">
                  <div className={`${color} w-12 h-12 mb-3 rounded-full flex items-center justify-center`}>
                    <span className="text-xl text-white">{step}</span>
                  </div>
                  <p className="text-lg font-medium text-black mb-1">{title}</p>
                  <p className="text-sm text-gray-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-black">Image Preview</h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <img 
                  src={selectedImage.image_url} 
                  alt="Selected" 
                  className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg object-contain"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Caption:</p>
                <p className="text-lg text-black">"{selectedImage.caption_text}"</p>
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={() => copyCaption(selectedImage.caption_text)}
                  className="bg-gray-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-gray-500 transition"
                >
                  Copy Caption
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;  