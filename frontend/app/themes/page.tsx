'use client';

export default function ThemesPage() {
  return (
    <main className="container py-4">
      <h1 className="mb-3">Themes</h1>

      <p className="mb-4">
        This site supports <strong>Light</strong> and <strong>Dark</strong> themes. 
        Use the theme toggle in the header to switch modes. 
      </p>

      

      <p className="mt-4 text-muted">
        Theme selection improves accessibility: light mode for bright environments, 
        and dark mode to reduce eye strain in low light.
      </p>
    </main>
  );
}