'use server';

import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

type Result = { ok: true; output: string } | { ok: false; error: string };

export async function runGit(prevState: Result | null, formData: FormData): Promise<Result> {
  try {
    const username = String(formData.get('username') || '').trim();
    const owner    = String(formData.get('owner') || '').trim();
    const repo     = String(formData.get('repo') || '').trim();
    const token    = String(formData.get('token') || '').trim();

    if (!username || !owner || !repo) {
      return { ok: false, error: 'username, owner, and repo are required' };
    }

    const cloneUrl = token
      ? `https://${owner}:${token}@github.com/${owner}/${repo}.git`
      : `https://github.com/${owner}/${repo}.git`;

    const homeDir = os.homedir();
      const repoDir = path.join(homeDir, `${repo}`);
    if (fs.existsSync(repoDir)) {
      fs.rmSync(repoDir, { recursive: true, force: true });
    }

    const logs: string[] = [];
    const sh = (cmd: string, cwd?: string) => {
      logs.push(`$ ${cmd}`);
      const out = execSync(cmd, { cwd, encoding: 'utf8' });
      if (out?.trim()) logs.push(out.trim());
    };

    // 1) Set git username 
    sh(`git config --global user.name "${username.replace(/"/g, '\\"')}"`);

    // 2) Clone
    sh(`git clone ${cloneUrl} "${repoDir}"`);

    // 3) New branch
    sh(`git checkout -b update-readme`, repoDir);

    // 4) Update README.md (proves "executes an update to README")
    const stamp = new Date().toLocaleString();
    const addition = `\n## This is the System\nSuccessfully connected! — ${stamp}\n`;
    fs.appendFileSync(path.join(repoDir, 'README.md'), addition);
    logs.push(`(appended to README.md)\n${addition.trim()}`);

    // 5) Commit & push
    sh(`git add README.md`, repoDir);
    sh(`git commit -m "Update README.md: Add new section"`, repoDir);
    sh(`git push origin update-readme`, repoDir);

    

    return { ok: true, output: logs.join('\n') };
  } catch (err: any) {
    return { ok: false, error: String(err?.message || err) };
  }
}
