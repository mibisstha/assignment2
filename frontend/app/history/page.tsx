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

  useEffect(() => {
    fetchCommands();
  }, []);

  const fetchCommands = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4080';
      const response = await fetch(`${apiUrl}/api/gitcommands`);
      const data = await response.json();
      setCommands(data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCommand = async (id: string) => {
    if (!confirm('Delete this command?')) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4080';
      await fetch(`${apiUrl}/api/gitcommands/${id}`, { method: 'DELETE' });
      setCommands(commands.filter(cmd => cmd.id !== id));
    } catch (error) {
      alert('Failed to delete');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1 className="mb-4">Command History</h1>
      
      {commands.length === 0 ? (
        <p>No commands yet.</p>
      ) : (
        <div>
          {commands.map(cmd => (
            <div key={cmd.id} className="card mb-3">
              <div className="card-body">
                <h5>{cmd.owner}/{cmd.repo}</h5>
                <p><strong>Command:</strong> {cmd.command}</p>
                <p><strong>Status:</strong> <span className={`badge bg-${cmd.status === 'success' ? 'success' : 'danger'}`}>{cmd.status}</span></p>
                <button onClick={() => deleteCommand(cmd.id)} className="btn btn-sm btn-danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}