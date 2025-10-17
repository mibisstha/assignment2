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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate`, {
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
        await fetch('http://localhost:4000/api/gitcommands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'system',
            token: formData.token,
            owner: formData.owner,
            repo: formData.repo,
            command: `generate ${orm} schema`,
            output: JSON.stringify(tables),
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
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Generate ORM Schema & CRUD</h1>

      {/* ORM Toggle */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <label className="font-semibold mr-4">Select ORM:</label>
        <label className="mr-6 cursor-pointer">
          <input
            type="radio"
            value="prisma"
            checked={orm === 'prisma'}
            onChange={() => setOrm('prisma')}
            className="mr-2"
          />
          Prisma
        </label>
        <label className="cursor-pointer">
          <input
            type="radio"
            value="sequelize"
            checked={orm === 'sequelize'}
            onChange={() => setOrm('sequelize')}
            className="mr-2"
          />
          Sequelize
        </label>
      </div>

      {/* GitHub Info */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="GitHub Owner"
            value={formData.owner}
            onChange={(e) => setFormData({...formData, owner: e.target.value})}
            required
            className="w-full p-3 border rounded"
          />
          
          <input
            type="text"
            placeholder="Repository Name"
            value={formData.repo}
            onChange={(e) => setFormData({...formData, repo: e.target.value})}
            required
            className="w-full p-3 border rounded"
          />
        </div>

        <input
          type="password"
          placeholder="GitHub Token (optional for public repos)"
          value={formData.token}
          onChange={(e) => setFormData({...formData, token: e.target.value})}
          className="w-full p-3 border rounded"
        />

        {/* Tables/Models */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">
              {orm === 'prisma' ? 'Models' : 'Tables'}
            </h2>
            <button
              type="button"
              onClick={addTable}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + Add {orm === 'prisma' ? 'Model' : 'Table'}
            </button>
          </div>

          {tables.map((table, tableIndex) => (
            <div key={tableIndex} className="border rounded-lg p-6 bg-white shadow">
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  value={table.name}
                  onChange={(e) => updateTableName(tableIndex, e.target.value)}
                  className="text-xl font-bold p-2 border rounded"
                  placeholder="Table/Model Name"
                />
                <button
                  type="button"
                  onClick={() => removeTable(tableIndex)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>

              {/* Fields */}
              <div className="space-y-3">
                {table.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(tableIndex, fieldIndex, { name: e.target.value })}
                      placeholder="Field name"
                      className="flex-1 p-2 border rounded"
                    />
                    
                    <select
                      value={field.type}
                      onChange={(e) => updateField(tableIndex, fieldIndex, { type: e.target.value })}
                      className="p-2 border rounded"
                    >
                      {typeOptions.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(tableIndex, fieldIndex, { required: e.target.checked })}
                        className="mr-2"
                      />
                      Required
                    </label>

                    <button
                      type="button"
                      onClick={() => removeField(tableIndex, fieldIndex)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addField(tableIndex)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  + Add Field
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-4 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Generating & Committing...' : `Generate ${orm.toUpperCase()} Schema + CRUD & Commit to GitHub`}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className={`mt-6 p-6 rounded-lg ${result.error ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-400'} border-2`}>
          <h3 className="font-bold text-lg mb-2">
            {result.error ? 'Error' : 'Success!'}
          </h3>
          <pre className="whitespace-pre-wrap overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Preview */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Schema Preview:</h3>
        <pre className="bg-white p-4 rounded border overflow-auto">
          {orm === 'prisma' 
            ? generatePrismaPreview(tables)
            : generateSequelizePreview(tables)
          }
        </pre>
      </div>
    </div>
  );
}

function generatePrismaPreview(tables: Table[]) {
  return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

${tables.map(table => `model ${table.name} {
  id Int @id @default(autoincrement())
${table.fields.map(f => `  ${f.name} ${f.type}${f.required ? '' : '?'}`).join('\n')}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`).join('\n\n')}`;
}

function generateSequelizePreview(tables: Table[]) {
  return tables.map(table => `// models/${table.name}.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ${table.name} = sequelize.define('${table.name}', {
${table.fields.map(f => `    ${f.name}: {
      type: DataTypes.${f.type},
      allowNull: ${!f.required}
    }`).join(',\n')}
  });

  return ${table.name};
};`).join('\n\n');
}