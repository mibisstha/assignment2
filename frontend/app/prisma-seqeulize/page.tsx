'use client';

import { useState } from 'react';

type ORM = 'prisma' | 'sequelize';

interface Field {
  name: string;
  type: string;
  required: boolean;
}

interface Table {
  name: string;
  fields: Field[];
}

export default function PrismaSequelizePage() {
  const [orm, setOrm] = useState<ORM>('prisma');
  const [formData, setFormData] = useState({
    owner: '',
    repo: '',
    token: ''
  });
  
  const [tables, setTables] = useState<Table[]>([
    {
      name: 'User',
      fields: [
        { name: 'name', type: 'String', required: true },
        { name: 'email', type: 'String', required: true }
      ]
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const addTable = () => {
    setTables([...tables, {
      name: 'NewTable',
      fields: [{ name: 'id', type: 'Int', required: true }]
    }]);
  };

  const removeTable = (index: number) => {
    setTables(tables.filter((_, i) => i !== index));
  };

  const updateTableName = (index: number, name: string) => {
    const newTables = [...tables];
    newTables[index].name = name;
    setTables(newTables);
  };

  const addField = (tableIndex: number) => {
    const newTables = [...tables];
    newTables[tableIndex].fields.push({
      name: 'newField',
      type: orm === 'prisma' ? 'String' : 'STRING',
      required: false
    });
    setTables(newTables);
  };

  const removeField = (tableIndex: number, fieldIndex: number) => {
    const newTables = [...tables];
    newTables[tableIndex].fields = newTables[tableIndex].fields.filter((_, i) => i !== fieldIndex);
    setTables(newTables);
  };

  const updateField = (tableIndex: number, fieldIndex: number, field: Partial<Field>) => {
    const newTables = [...tables];
    newTables[tableIndex].fields[fieldIndex] = {
      ...newTables[tableIndex].fields[fieldIndex],
      ...field
    };
    setTables(newTables);
  };

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
          options: { tables }
        })
      });

      const data = await response.json();
      
      // Also save to database
      if (data.success) {
        await fetch(`${apiUrl}/api/gitcommands`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'system',
            token: formData.token,
            owner: formData.owner,
            repo: formData.repo,
            command: `generate ${orm} schema`,
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

  const prismaTypes = ['String', 'Int', 'Float', 'Boolean', 'DateTime'];
  const sequelizeTypes = ['STRING', 'INTEGER', 'FLOAT', 'BOOLEAN', 'DATE', 'TEXT'];
  const typeOptions = orm === 'prisma' ? prismaTypes : sequelizeTypes;

  return (
    <div className="container mx-auto p-4">
      <h1 className="h2 mb-4">Generate ORM Schema & CRUD</h1>

      {/* ORM Toggle */}
      <div className="mb-4 p-3 bg-light rounded">
        <label className="fw-bold me-3">Select ORM:</label>
        <div className="form-check form-check-inline">
          <input
            type="radio"
            id="prisma"
            value="prisma"
            checked={orm === 'prisma'}
            onChange={() => setOrm('prisma')}
            className="form-check-input"
          />
          <label htmlFor="prisma" className="form-check-label">Prisma</label>
        </div>
        <div className="form-check form-check-inline">
          <input
            type="radio"
            id="sequelize"
            value="sequelize"
            checked={orm === 'sequelize'}
            onChange={() => setOrm('sequelize')}
            className="form-check-input"
          />
          <label htmlFor="sequelize" className="form-check-label">Sequelize</label>
        </div>
      </div>

      {/* GitHub Info */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <input
              type="text"
              placeholder="GitHub Owner"
              value={formData.owner}
              onChange={(e) => setFormData({...formData, owner: e.target.value})}
              required
              className="form-control"
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              placeholder="Repository Name"
              value={formData.repo}
              onChange={(e) => setFormData({...formData, repo: e.target.value})}
              required
              className="form-control"
            />
          </div>
          <div className="col-md-4">
            <input
              type="password"
              placeholder="GitHub Token"
              value={formData.token}
              onChange={(e) => setFormData({...formData, token: e.target.value})}
              className="form-control"
            />
          </div>
        </div>

        {/* Tables/Models */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0">
              {orm === 'prisma' ? 'Models' : 'Tables'}
            </h2>
            <button
              type="button"
              onClick={addTable}
              className="btn btn-success btn-sm"
            >
              + Add {orm === 'prisma' ? 'Model' : 'Table'}
            </button>
          </div>

          {tables.map((table, tableIndex) => (
            <div key={tableIndex} className="card mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <input
                    type="text"
                    value={table.name}
                    onChange={(e) => updateTableName(tableIndex, e.target.value)}
                    className="form-control form-control-lg fw-bold w-50"
                    placeholder="Table/Model Name"
                  />
                  <button
                    type="button"
                    onClick={() => removeTable(tableIndex)}
                    className="btn btn-danger btn-sm"
                  >
                    Remove
                  </button>
                </div>

                {/* Fields */}
                <div className="mb-3">
                  {table.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="row g-2 mb-2 align-items-center">
                      <div className="col-md-4">
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(tableIndex, fieldIndex, { name: e.target.value })}
                          placeholder="Field name"
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-3">
                        <select
                          value={field.type}
                          onChange={(e) => updateField(tableIndex, fieldIndex, { type: e.target.value })}
                          className="form-select"
                        >
                          {typeOptions.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(tableIndex, fieldIndex, { required: e.target.checked })}
                            className="form-check-input"
                            id={`required-${tableIndex}-${fieldIndex}`}
                          />
                          <label className="form-check-label" htmlFor={`required-${tableIndex}-${fieldIndex}`}>
                            Required
                          </label>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <button
                          type="button"
                          onClick={() => removeField(tableIndex, fieldIndex)}
                          className="btn btn-danger btn-sm w-100"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addField(tableIndex)}
                    className="btn btn-outline-primary btn-sm mt-2"
                  >
                    + Add Field
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg w-100"
        >
          {loading ? 'Generating & Committing...' : `Generate ${orm.toUpperCase()} Schema + CRUD & Commit to GitHub`}
        </button>
      </form>

      {/* Result */}
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