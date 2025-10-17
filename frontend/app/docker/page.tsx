'use client';

import { useState } from 'react';

export default function DockerPage() {
  const [formData, setFormData] = useState({
    owner: '',
    repo: '',
    token: '',
    nodeVersion: '22',
    port: '3000'
  });
  const [fileType, setFileType] = useState<'dockerfile' | 'docker-compose'>('dockerfile');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4080';
      
      const response = await fetch(`${apiUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: fileType,
          owner: formData.owner,
          repo: formData.repo,
          token: formData.token,
          options: {
            nodeVersion: formData.nodeVersion,
            port: formData.port
          }
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="mb-4">Generate Docker Files</h1>

      <div className="mb-3">
        <label className="me-3">
          <input
            type="radio"
            value="dockerfile"
            checked={fileType === 'dockerfile'}
            onChange={() => setFileType('dockerfile')}
            className="me-1"
          />
          Dockerfile
        </label>
        <label>
          <input
            type="radio"
            value="docker-compose"
            checked={fileType === 'docker-compose'}
            onChange={() => setFileType('docker-compose')}
            className="me-1"
          />
          docker-compose.yml
        </label>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Owner"
          value={formData.owner}
          onChange={(e) => setFormData({...formData, owner: e.target.value})}
          required
          className="form-control mb-2"
        />
        <input
          type="text"
          placeholder="Repository"
          value={formData.repo}
          onChange={(e) => setFormData({...formData, repo: e.target.value})}
          required
          className="form-control mb-2"
        />
        <input
          type="password"
          placeholder="Token (optional)"
          value={formData.token}
          onChange={(e) => setFormData({...formData, token: e.target.value})}
          className="form-control mb-2"
        />

        <button type="submit" disabled={loading} className="btn btn-primary w-100">
          {loading ? 'Generating...' : 'Generate and Commit'}
        </button>
      </form>

      {result && (
        <div className={`alert ${result.error ? 'alert-danger' : 'alert-success'}`}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}