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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate`, {
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
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Generate Docker Files</h1>

      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            value="dockerfile"
            checked={fileType === 'dockerfile'}
            onChange={() => setFileType('dockerfile')}
          />
          {' '}Dockerfile
        </label>
        <label>
          <input
            type="radio"
            value="docker-compose"
            checked={fileType === 'docker-compose'}
            onChange={() => setFileType('docker-compose')}
          />
          {' '}docker-compose.yml
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="GitHub Owner"
          value={formData.owner}
          onChange={(e) => setFormData({...formData, owner: e.target.value})}
          required
          className="w-full p-2 border rounded"
        />
        
        <input
          type="text"
          placeholder="Repository Name"
          value={formData.repo}
          onChange={(e) => setFormData({...formData, repo: e.target.value})}
          required
          className="w-full p-2 border rounded"
        />
        
        <input
          type="password"
          placeholder="GitHub Token (optional)"
          value={formData.token}
          onChange={(e) => setFormData({...formData, token: e.target.value})}
          className="w-full p-2 border rounded"
        />

        {fileType === 'dockerfile' ? (
          <>
            <input
              type="text"
              placeholder="Node Version (e.g., 22)"
              value={formData.nodeVersion}
              onChange={(e) => setFormData({...formData, nodeVersion: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Port (e.g., 3000)"
              value={formData.port}
              onChange={(e) => setFormData({...formData, port: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Database Type (postgres/mysql)"
              value={formData.dbType}
              onChange={(e) => setFormData({...formData, dbType: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Database Name"
              value={formData.dbName}
              onChange={(e) => setFormData({...formData, dbName: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Database User"
              value={formData.dbUser}
              onChange={(e) => setFormData({...formData, dbUser: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Database Password"
              value={formData.dbPassword}
              onChange={(e) => setFormData({...formData, dbPassword: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Generating...' : 'Generate and Commit'}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded ${result.error ? 'bg-red-100' : 'bg-green-100'}`}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}