'use client';

import { useState } from 'react';

export default function DockerPage() {
  const [formData, setFormData] = useState({
    owner: '',
    repo: '',
    token: '',
    nodeVersion: '22',
    port: '3000',
    dbType: 'postgres',
    dbName: 'mydb',
    dbUser: 'user',
    dbPassword: 'password',
    dbPort: '5432'
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
          options: fileType === 'dockerfile' 
            ? { nodeVersion: formData.nodeVersion, port: formData.port }
            : {
                dbType: formData.dbType,
                dbName: formData.dbName,
                dbUser: formData.dbUser,
                dbPassword: formData.dbPassword,
                dbPort: formData.dbPort
              }
        })
      });

      const data = await response.json();
      
      // Save to database
      if (data.success) {
        await fetch(`${apiUrl}/api/gitcommands`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'system',
            token: formData.token,
            owner: formData.owner,
            repo: formData.repo,
            command: `generate ${fileType}`,
            output: JSON.stringify(data),
            status: 'success'
          })
        });
      }
      
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-4">
      <h1 className="h2 mb-4">Generate Docker Files</h1>

      <div className="mb-4 p-3 bg-light rounded">
        <label className="fw-bold me-3">Select File Type:</label>
        <div className="form-check form-check-inline">
          <input
            type="radio"
            id="dockerfile"
            value="dockerfile"
            checked={fileType === 'dockerfile'}
            onChange={() => setFileType('dockerfile')}
            className="form-check-input"
          />
          <label htmlFor="dockerfile" className="form-check-label">Dockerfile</label>
        </div>
        <div className="form-check form-check-inline">
          <input
            type="radio"
            id="docker-compose"
            value="docker-compose"
            checked={fileType === 'docker-compose'}
            onChange={() => setFileType('docker-compose')}
            className="form-check-input"
          />
          <label htmlFor="docker-compose" className="form-check-label">docker-compose.yml</label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="form-label">GitHub Owner</label>
            <input
              type="text"
              placeholder="e.g., mibisstha"
              value={formData.owner}
              onChange={(e) => setFormData({...formData, owner: e.target.value})}
              required
              className="form-control"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Repository</label>
            <input
              type="text"
              placeholder="e.g., my-repo"
              value={formData.repo}
              onChange={(e) => setFormData({...formData, repo: e.target.value})}
              required
              className="form-control"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">GitHub Token</label>
            <input
              type="password"
              placeholder="ghp_..."
              value={formData.token}
              onChange={(e) => setFormData({...formData, token: e.target.value})}
              className="form-control"
            />
          </div>
        </div>

        {fileType === 'dockerfile' ? (
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Node Version</label>
              <input
                type="text"
                placeholder="e.g., 22"
                value={formData.nodeVersion}
                onChange={(e) => setFormData({...formData, nodeVersion: e.target.value})}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Port</label>
              <input
                type="text"
                placeholder="e.g., 3000"
                value={formData.port}
                onChange={(e) => setFormData({...formData, port: e.target.value})}
                className="form-control"
              />
            </div>
          </div>
        ) : (
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Database Type</label>
              <select
                value={formData.dbType}
                onChange={(e) => setFormData({...formData, dbType: e.target.value})}
                className="form-select"
              >
                <option value="postgres">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="mongodb">MongoDB</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Database Name</label>
              <input
                type="text"
                value={formData.dbName}
                onChange={(e) => setFormData({...formData, dbName: e.target.value})}
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Database User</label>
              <input
                type="text"
                value={formData.dbUser}
                onChange={(e) => setFormData({...formData, dbUser: e.target.value})}
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Database Password</label>
              <input
                type="password"
                value={formData.dbPassword}
                onChange={(e) => setFormData({...formData, dbPassword: e.target.value})}
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Database Port</label>
              <input
                type="text"
                value={formData.dbPort}
                onChange={(e) => setFormData({...formData, dbPort: e.target.value})}
                className="form-control"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg w-100"
        >
          {loading ? 'Generating & Committing...' : 'Generate and Commit to GitHub'}
        </button>
      </form>

      {result && (
        <div className={`alert ${result.error ? 'alert-danger' : 'alert-success'}`}>
          {result.success ? (
            <>
              <h5 className="alert-heading">Success!</h5>
              <p>{result.message}</p>
              {result.githubUrl && (
                <a href={result.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-success">
                  View on GitHub
                </a>
              )}
            </>
          ) : (
            <>
              <h5 className="alert-heading">Error</h5>
              <p>{result.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}