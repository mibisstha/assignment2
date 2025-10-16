'use client';

import { useEffect, useState } from 'react';

interface GitCommand {
  id: string;
  username: string;
  owner: string;
  repo: string;
  command: string;
  output: string | null;
  status: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [commands, setCommands] = useState<GitCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCommands();
  }, []);

  const fetchCommands = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/gitcommands');
      const data = await response.json();
      setCommands(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCommand = async (id: string) => {
    if (!confirm('Are you sure you want to delete this command?')) return;

    try {
      await fetch(`http://localhost:4000/api/gitcommands/${id}`, {
        method: 'DELETE'
      });
      setCommands(commands.filter(cmd => cmd.id !== id));
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Git Command History</h1>
      
      <div className="space-y-4">
        {commands.length === 0 ? (
          <p className="text-gray-500">No commands executed yet.</p>
        ) : (
          commands.map(cmd => (
            <div key={cmd.id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${
                      cmd.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cmd.status}
                    </span>
                    <span className="text-gray-600">
                      {new Date(cmd.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="font-semibold">Repository:</span>{' '}
                    <a 
                      href={`https://github.com/${cmd.owner}/${cmd.repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {cmd.owner}/{cmd.repo}
                    </a>
                  </div>
                  
                  <div className="mb-2">
                    <span className="font-semibold">Command:</span>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {cmd.command}
                    </code>
                  </div>
                  
                  {cmd.output && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-blue-600">
                        View Output
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-50 rounded text-sm overflow-auto">
                        {cmd.output}
                      </pre>
                    </details>
                  )}
                </div>
                
                <button
                  onClick={() => deleteCommand(cmd.id)}
                  className="ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}