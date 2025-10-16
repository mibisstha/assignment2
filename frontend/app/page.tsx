
import ExecForm from './ExecForm';
import { runGit } from './actions';

export default function Page() {
  return (
    <>
      
      <main className="container py-4">
        <ExecForm action={runGit} />
      </main>
     
    </>
  );
}