// app/about/page.tsx
'use client';

export default function AboutPage() {
  return (
    <main className="container py-4">
      <h1 className="mb-3">About</h1>

      <div className="mb-2">
        <strong>Name:</strong> Mibis Shrestha
      </div>
      <div className="mb-4">
        <strong>Student Number:</strong> 21934327
      </div>

      <h5 className="mb-3">How to use this website (video)</h5>

      {/* HTML5 video */}
      <div className="ratio ratio-16x9 mb-3">
        <video
          className="w-100 h-100"
          controls
          preload="metadata"
          
        >
          <source src="/how-to-use.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <p className="text-muted">
        This video demonstrates: the header & navigation, dark mode toggle, the homepage form (username,
        token, owner, repository), the Execute button, and the output panel showing the generated Git commands.
      </p>
    </main>
  );
}