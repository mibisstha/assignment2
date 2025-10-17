'use client';

import { useState } from 'react';

type ORM = 'prisma' | 'sequelize';

export default function PrismaSequelizePage() {
  const [orm, setOrm] = useState<ORM>('prisma');
  const [formData, setFormData] = useState({
    owner: '',
    repo: '',
    token: ''
  });
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
          type: orm,
          owner: formData.owner,
          repo: formData.repo,
          token: formData.token,
          options: {
            tables: [{
              name: 'User',
              fields: [
                { name: 'name', type: 'String' },
                { name: 'email', type: 'String' }
              ]
            }]
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
      <h1 className="mb-4">Generate ORM Schema</h1>

      <div className="mb-3">
        <label className="me-3">
          <input
            type="radio"
            value="prisma"
            checked={orm === 'prisma'}
            onChange={() => setOrm('prisma')}
            className="me-1"
          />
          Prisma
        </label>
        <label>
          <input
            type="radio"
            value="sequelize"
            checked={orm === 'sequelize'}
            onChange={() => setOrm('sequelize')}
            className="me-1"
          />
          Sequelize
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
          {loading ? 'Generating...' : 'Generate Schema'}
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