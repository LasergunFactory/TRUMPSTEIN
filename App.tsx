import React, { useState, useRef, useEffect, useCallback } from 'react';

const FILE_CONTENTS = {
  indexHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TRUMPSTEIN REDACTOR</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #050505; color: #e5e5e5; }
  </style>
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@^19.2.3",
      "react-dom": "https://esm.sh/react-dom@^19.2.3"
    }
  }
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./index.tsx"></script>
</body>
</html>`,
  indexTsx: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}`,
  metadataJson: `{
  "name": "TRUMPSTEIN REDACTOR",
  "description": "Secure text redaction tool.",
  "requestFramePermissions": []
}`
};

const SAMPLE_TEXT = `MEMORANDUM FOR THE DIRECTOR
SUBJECT: PROJECT TRUMPSTEIN - STATUS UPDATE (TOP SECRET)

This document confirms that the TRUMPSTEIN protocol has reached 98% efficiency.
Operation "GHOST CURTAIN" is now active in Sector 4.

SENSITIVE ASSETS:
- Location: 34.0522° N, 118.2437° W (Vault 9)
- Agent Contact: Victor T. at (555) 019-2024
- Network ID: 192.168.1.254

Failure to redact these coordinates before public release will result in 
immediate Level 7 clearance revocation.

REDACTED BY: OFFICE OF THE DIRECTOR`;

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT);
  const [intensity, setIntensity] = useState<number>(40);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeploymentHelp, setShowDeploymentHelp] = useState(false);

  const downloadAllFiles = async () => {
    setIsDownloading(true);
    try {
      // @ts-ignore - JSZip is loaded via CDN in index.html
      const zip = new window.JSZip();
      zip.file("index.html", FILE_CONTENTS.indexHtml);
      zip.file("index.tsx", FILE_CONTENTS.indexTsx);
      zip.file("metadata.json", FILE_CONTENTS.metadataJson);
      
      const response = await fetch('./App.tsx');
      const appContent = await response.text();
      zip.file("App.tsx", appContent);

      const content = await zip.generateAsync({ type: "blob" });
      // @ts-ignore - saveAs is loaded via CDN in index.html
      window.saveAs(content, "redactor-files-to-upload.zip");
      setShowDeploymentHelp(true);
    } catch (err) {
      alert("Error creating ZIP. Try copying text manually.");
    }
    setIsDownloading(false);
  };

  const generateRedaction = useCallback(() => {
    setIsProcessing(true);
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 800;
      const height = 1100;
      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#cc0000';
      ctx.font = 'bold 12px "Inter", sans-serif';
      ctx.fillText('TRUMPSTEIN CLASSIFIED MANIFEST // SECURE PROTOCOL', 70, 45);
      ctx.fillRect(70, 52, 660, 1.5);

      ctx.strokeStyle = '#cc0000';
      ctx.lineWidth = 3;
      ctx.strokeRect(580, 70, 150, 45);
      ctx.fillStyle = '#cc0000';
      ctx.font = 'bold 16px "Inter", sans-serif';
      ctx.fillText('REDACTED', 610, 100);

      ctx.font = '16px "Courier New", monospace';
      ctx.textBaseline = 'top';
      const lines = inputText.split('\n');
      let y = 140;
      const margin = 70;
      const maxWidth = width - (margin * 2);
      const lineHeight = 26;

      lines.forEach(line => {
        const words = line.split(/(\s+)/);
        let x = margin;
        words.forEach(word => {
          if (word === '') return;
          const metrics = ctx.measureText(word);
          if (x + metrics.width > maxWidth && word.trim() !== '') {
            x = margin;
            y += lineHeight;
          }
          const shouldRedact = Math.random() * 100 < intensity && word.trim() !== '';
          if (shouldRedact) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(x - 1, y - 2, metrics.width + 2, 20);
          } else {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillText(word, x, y);
          }
          x += metrics.width;
        });
        y += lineHeight;
      });

      ctx.fillStyle = '#aaaaaa';
      ctx.font = '10px monospace';
      ctx.fillText(`ARCHIVE LOG: ${new Date().toLocaleString()}`, 70, height - 50);

      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.9));
      setIsProcessing(false);
    }, 400);
  }, [inputText, intensity]);

  useEffect(() => {
    generateRedaction();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-red-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-black text-white shadow-[0_0_25px_rgba(220,38,38,0.5)] text-xl">T</div>
            <div>
              <h1 className="font-black text-xl tracking-tighter text-white uppercase italic leading-none">Trumpstein</h1>
              <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em]">Redactor v2.0</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={downloadAllFiles}
              disabled={isDownloading}
              className="bg-white text-black hover:bg-zinc-200 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-2xl active:scale-95 border-4 border-red-600/20"
            >
              {isDownloading ? "Creating ZIP..." : "1. Click to Get Files"}
            </button>
            <button 
              onClick={() => setShowDeploymentHelp(!showDeploymentHelp)}
              className="text-zinc-500 hover:text-white text-[10px] font-bold uppercase tracking-widest border border-zinc-800 px-4 py-3 rounded-full"
            >
              Instructions
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Step-by-Step Guide for non-coders */}
        {(showDeploymentHelp || isDownloading) && (
          <div className="mb-12 p-10 bg-zinc-900/50 border border-white/10 rounded-[3rem] animate-in fade-in slide-in-from-top-4 duration-700 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-white font-black uppercase tracking-[0.3em] text-sm">Deployment Checklist (Important)</h2>
              <button onClick={() => setShowDeploymentHelp(false)} className="text-zinc-600 hover:text-white">✕</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: "01", title: "Download", desc: "Click the white button above to get your ZIP file." },
                { step: "02", title: "Unzip", desc: "Open the ZIP file on your computer to find the 4 files." },
                { step: "03", title: "GitHub", desc: "Create a NEW project on GitHub and upload those 4 files." },
                { step: "04", title: "Launch", desc: "Go to Settings > Pages to get your live website link!" }
              ].map((item, i) => (
                <div key={i} className="bg-black/40 p-6 rounded-3xl border border-white/5">
                  <span className="text-red-600 font-black text-2xl mb-2 block">{item.step}</span>
                  <h3 className="text-white font-bold text-xs uppercase mb-2 tracking-widest">{item.title}</h3>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
              Note: I cannot put files on GitHub for you. You must upload them yourself!
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Editor */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 block mb-4">Intel Terminal</label>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full h-96 bg-black/60 border border-white/5 rounded-3xl p-6 text-sm focus:ring-1 focus:ring-red-600 focus:outline-none transition-all resize-none font-mono text-zinc-400 placeholder:text-zinc-800"
                  placeholder="Paste text to redact here..."
                />
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Masking Strength</label>
                  <span className="text-3xl font-black text-white">{intensity}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-red-600"
                />
              </div>

              <button 
                onClick={generateRedaction}
                disabled={isProcessing}
                className="w-full bg-red-600 text-white h-20 rounded-3xl font-black uppercase tracking-[0.4em] text-xs hover:bg-red-500 active:scale-[0.98] transition-all shadow-2xl shadow-red-900/20"
              >
                {isProcessing ? "Analyzing Intel..." : "Generate Redacted Image"}
              </button>
            </div>
          </div>

          {/* Result */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Secure Image Preview</h2>
              </div>
              {previewUrl && (
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = "redacted_intel.jpg";
                    link.href = previewUrl;
                    link.click();
                  }}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/5 transition-all flex items-center gap-2"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Save JPG
                </button>
              )}
            </div>

            <div className="bg-black rounded-[3rem] border border-white/5 p-12 min-h-[850px] flex items-center justify-center relative overflow-hidden group shadow-inner">
              <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              {previewUrl ? (
                <div className="relative z-10 shadow-[0_60px_120px_-30px_rgba(0,0,0,1)] transition-transform duration-700 group-hover:scale-[1.01] border border-zinc-900">
                  <img src={previewUrl} alt="Output" className="max-h-[75vh] w-auto" />
                </div>
              ) : (
                <div className="text-zinc-900 font-black uppercase tracking-[1em] text-xl animate-pulse">Scanning System</div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-24 text-center border-t border-white/5 mt-20">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-800">
          Trumpstein Ghost Protocol &bull; 100% Client-Side
        </p>
      </footer>
    </div>
  );
};

export default App;