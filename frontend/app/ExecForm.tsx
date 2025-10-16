'use client';

import { useMemo, useState } from 'react';

type Result = { ok: true; output: string } | { ok: false; error: string };
type Props = {
  action: (prevState: Result | null, formData: FormData) => Promise<Result>;
};

export default function ExecForm({ action }: Props) {
  const [username, setUsername] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [token, setToken] = useState('');
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<Result | null>(null);

  const preview = useMemo(() => {
    const u = username || '<username>';
    const o = owner || '<owner>';
    const r = repo || '<repo>';
    const tokenPart = token ? `${o}:${token}@` : '';
    return [
      `git config --global user.name "${u}"`,
      `git clone https://${tokenPart}github.com/${o}/${r}.git`,
      `cd ${r}`,
      `git checkout -b update-readme`,
      `echo "##This is the System" >> README.md`,
      `echo "Successfully connected!" >> README.md`,
      `git add README.md`,
      `git commit -m "Update README.md: Add new section"`,
      `git push origin update-readme`
    ].join('\n');
  }, [username, owner, repo, token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setState(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await action(null, formData);
      setState(result);
    } catch (error: any) {
      setState({ ok: false, error: error.message || 'Unknown error' });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="row g-4">
      {/* LEFT: form */}
      <div className="col-md-6">
        <h4 className="mb-3">Inputs</h4>
        <form onSubmit={handleSubmit} className="d-grid gap-3">
          <div className="d-flex align-items-center">
            <label htmlFor="username" className="form-label me-3" style={{ minWidth: 110 }}>
              Username:
            </label>
            <input 
              id="username" 
              name="username" 
              className="form-control"
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., mibisstha" 
            />
          </div>

          <div className="d-flex align-items-center">
            <label htmlFor="owner" className="form-label me-3" style={{ minWidth: 110 }}>
              Owner:
            </label>
            <input 
              id="owner" 
              name="owner" 
              className="form-control"
              value={owner} 
              onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g., mibisstha" 
            />
          </div>

          <div className="d-flex align-items-center">
            <label htmlFor="repo" className="form-label me-3" style={{ minWidth: 110 }}>
              Repository:
            </label>
            <input 
              id="repo" 
              name="repo" 
              className="form-control"
              value={repo} 
              onChange={(e) => setRepo(e.target.value)}
              placeholder="e.g., assignment1" 
            />
          </div>

          <div className="d-flex align-items-center">
            <label htmlFor="token" className="form-label me-3" style={{ minWidth: 110 }}>
              Token:
            </label>
            <input 
              type="password" 
              id="token" 
              name="token" 
              className="form-control"
              value={token} 
              onChange={(e) => setToken(e.target.value)}
              placeholder="(enter your token here)" 
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? 'Executing...' : 'Execute'}
          </button>

          {/* Spinner under the button */}
          <div className="mt-2" style={{ minHeight: 28 }} aria-live="polite">
            {pending && (
              <div className="d-flex align-items-center gap-2">
                <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                <span>Running on server...</span>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* RIGHT: preview + execution output */}
      <div className="col-md-6">
        <h4 className="mb-3 text-center">Execute</h4>

        {/* Live preview */}
        <pre className="code-block" style={{ minHeight: 220 }}>
          <code>{preview}</code>
        </pre>

        {/* Result after server execution */}
        {state && (
          <>
            <h6 className="mt-3">Run Result</h6>
            <pre className="code-block" aria-live="polite">
              <code>
                {state.ok ? state.output : `ERROR: ${state.error}`}
              </code>
            </pre>
          </>
        )}
      </div>
    </div>
  );
}