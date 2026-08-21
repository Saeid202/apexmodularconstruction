"use client";

import { useEffect, useState, useTransition } from "react";
import { 
  getVideos, 
  addVideo, 
  updateVideo, 
  deleteVideo, 
  VideoItem 
} from "@/app/actions/video-centre";

// Pure client-side YouTube ID extractor for instantaneous form validations
function extractYoutubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
import { 
  Video, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Star, 
  Loader2, 
  ArrowUpDown, 
  FileText,
  AlertCircle
} from "lucide-react";

// Local inline YouTube SVG icon to prevent compile failures due to Lucide package discrepancies
const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function AdminVideoCentrePage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [position, setPosition] = useState(0);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    setLoading(true);
    setError(null);
    const res = await getVideos();
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setVideos(res.data);
    }
    setLoading(false);
  }

  const handleResetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setYoutubeUrl("");
    setIsFeatured(false);
    setPosition(0);
  };

  const handleEditClick = (v: VideoItem) => {
    setEditingId(v.id);
    setTitle(v.title);
    setDescription(v.description || "");
    setYoutubeUrl(v.youtube_url);
    setIsFeatured(v.is_featured);
    setPosition(v.position);
    // Scroll smoothly to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !youtubeUrl.trim()) {
      setError("Project Title and YouTube URL are required.");
      return;
    }

    const videoId = extractYoutubeId(youtubeUrl);
    if (!videoId) {
      setError("Could not parse YouTube video ID. Please check the URL format.");
      return;
    }

    startTransition(async () => {
      let result;
      if (editingId) {
        result = await updateVideo(editingId, {
          title,
          description,
          youtubeUrl,
          isFeatured,
          position,
        });
      } else {
        result = await addVideo({
          title,
          description,
          youtubeUrl,
          isFeatured,
          position,
        });
      }

      if (!result.success) {
        setError(result.error);
      } else {
        handleResetForm();
        await loadVideos();
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this modular construction video showcase?")) return;
    
    setError(null);
    const result = await deleteVideo(id);
    if (!result.success) {
      setError(result.error);
    } else {
      if (editingId === id) handleResetForm();
      await loadVideos();
    }
  };

  // Preview generated thumbnail as the user types a valid YouTube link
  const currentVideoId = extractYoutubeId(youtubeUrl);
  const previewThumbnail = currentVideoId 
    ? `https://img.youtube.com/vi/${currentVideoId}/mqdefault.jpg`
    : null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="h-6 w-6 text-blue-600" />
            Video Centre Workspace
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Publish, edit, and curate dynamic video showcases highlighting your high-tech modular construction capabilities.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Editor Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              {editingId ? <Edit2 className="h-5 w-5 text-amber-500" /> : <Plus className="h-5 w-5 text-blue-500" />}
              {editingId ? "Edit Showcase Video" : "Publish Project Video"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modular Office Assembly Timelapse"
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  YouTube Link / URL *
                </label>
                <div className="relative">
                  <YoutubeIcon className="absolute right-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    required
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 pr-10"
                  />
                </div>
              </div>

              {/* Real-time Thumbnail Preview Widget */}
              {previewThumbnail && (
                <div className="rounded-xl border border-gray-200 p-2 bg-gray-50 flex items-center gap-3">
                  <img
                    src={previewThumbnail}
                    alt="YouTube Video Thumbnail Preview"
                    className="w-24 aspect-video object-cover rounded-lg border border-gray-300"
                  />
                  <div className="text-xs">
                    <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Video Identified
                    </span>
                    <span className="text-gray-400 font-medium mt-0.5 block">ID: {currentVideoId}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Video Explanation / Description (Short B2B Context)
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a professional explanation of the structural scale, project timeline, materials, or compliance parameters..."
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <ArrowUpDown className="h-3.5 w-3.5" /> Sort Weight
                  </label>
                  <input
                    type="number"
                    value={position}
                    onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="flex flex-col justify-end pb-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4.5 w-4.5 cursor-pointer"
                    />
                    Featured Spotlight
                  </label>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Parameters...
                    </>
                  ) : (
                    <>
                      {editingId ? "Update Showcase" : "Publish Video"}
                    </>
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="min-h-[44px] px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors border border-gray-300"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Inventory List Grid */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                Active Construction Showcases
              </h2>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                {videos.length} Videos
              </span>
            </div>

            {loading ? (
              <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-sm font-semibold text-gray-500">Loading dynamic showcase repository...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="p-24 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 mb-4 border border-gray-200 text-gray-400">
                  <Video className="h-6 w-6" />
                </div>
                <h3 className="text-md font-bold text-gray-900 mb-1">No Construction Videos Active</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Copy and paste standard YouTube links in the left manager to create an interactive video portfolio.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {videos.map((v) => {
                  const thumbnail = `https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`;
                  return (
                    <div key={v.id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row gap-6">
                      
                      {/* Image Thumbnail */}
                      <div className="w-full md:w-44 shrink-0 aspect-video rounded-xl overflow-hidden border border-gray-200 relative bg-gray-900">
                        <img
                          src={thumbnail}
                          alt={v.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <YoutubeIcon className="h-8 w-8 text-white drop-shadow-md" />
                        </div>
                        {v.is_featured && (
                          <span 
                            className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-purple-900 bg-gradient-to-br from-yellow-300 to-yellow-500 border border-yellow-400 shadow-md"
                          >
                            <Star className="h-2.5 w-2.5 fill-purple-900" />
                            Spotlight
                          </span>
                        )}
                      </div>

                      {/* Video Specifications Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-extrabold text-gray-950 truncate leading-tight text-base">{v.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
                              <span className="font-semibold text-gray-600 bg-gray-100 rounded px-1.5 py-0.5">Position Weight: {v.position}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="font-medium">Published: {new Date(v.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Control Actions */}
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleEditClick(v)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center border border-gray-300 hover:border-amber-500 hover:bg-amber-50 text-gray-500 hover:text-amber-600 transition-colors cursor-pointer"
                              title="Edit Video"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(v.id)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center border border-gray-300 hover:border-red-500 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Video"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {v.description ? (
                          <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-3">
                            {v.description}
                          </p>
                        ) : (
                          <p className="text-xs italic text-gray-400 mt-3">
                            No briefing description provided for this project.
                          </p>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
