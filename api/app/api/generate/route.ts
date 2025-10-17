import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, owner, repo, token, options } = body;

    if (!type || !owner || !repo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let fileName = '';
    let content = '';

    if (type === 'dockerfile') {
      fileName = 'Dockerfile';
      const nodeVersion = options?.nodeVersion || '22';
      const port = options?.port || 3000;
      
      content = `FROM node:${nodeVersion}-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE ${port}
CMD ["npm", "start"]`;
    } 
    else if (type === 'docker-compose') {
      fileName = 'docker-compose.yml';
      const dbName = options?.dbName || 'mydb';
      
      content = `version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${dbName}
    ports:
      - "5432:5432"`;
    }
    else if (type === 'prisma') {
      fileName = 'schema.prisma';
      const tables = options?.tables || [];
      
      const models = tables.map((table: any) => `
model ${table.name} {
  id Int @id @default(autoincrement())
${table.fields.map((f: any) => `  ${f.name} ${f.type}`).join('\n')}
}`).join('\n');

      content = `datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
${models}`;
    }
    else if (type === 'sequelize') {
      fileName = 'models/User.js';
      content = `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING
  });
};`;
    }

    // Save to database
    const generatedFile = await prisma.generatedFile.create({
      data: {
        fileType: type,
        fileName,
        content,
        repo,
        owner,
        committed: false
      }
    });

    return NextResponse.json({
      success: true,
      message: `${fileName} generated successfully`,
      file: generatedFile
    });

  } catch (error: any) {
    console.error('[API] Generate error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}