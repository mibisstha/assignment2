import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

export async function POST(request: Request) {
  const tempDir = path.join('/tmp', `git-${Date.now()}`);
  
  try {
    const body = await request.json();
    const { type, owner, repo, token, options } = body;

    if (!type || !owner || !repo) {
      return NextResponse.json(
        { error: 'Missing required fields: type, owner, repo' },
        { status: 400 }
      );
    }

    // Generate file content
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
      const dbType = options?.dbType || 'postgres';
      const dbName = options?.dbName || 'mydb';
      const dbUser = options?.dbUser || 'user';
      const dbPassword = options?.dbPassword || 'password';
      
      content = `version: '3.8'
services:
  ${dbType}:
    image: ${dbType}:16-alpine
    environment:
      POSTGRES_DB: ${dbName}
      POSTGRES_USER: ${dbUser}
      POSTGRES_PASSWORD: ${dbPassword}
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://${dbUser}:${dbPassword}@${dbType}:5432/${dbName}
    depends_on:
      - ${dbType}

volumes:
  db_data:`;
    }
    else if (type === 'prisma') {
      fileName = 'prisma/schema.prisma';
      const tables = options?.tables || [];
      
      const models = tables.map((table: any) => `
model ${table.name} {
  id Int @id @default(autoincrement())
${table.fields.map((f: any) => `  ${f.name} ${f.type}${f.required ? '' : '?'}`).join('\n')}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`).join('\n');

      content = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
}
${models}`;
    }
    else if (type === 'sequelize') {
      const tables = options?.tables || [];
      fileName = 'models/index.js';
      
      const modelDefs = tables.map((table: any) => `
const ${table.name} = sequelize.define('${table.name}', {
${table.fields.map((f: any) => `  ${f.name}: {
    type: DataTypes.${f.type.toUpperCase()},
    allowNull: ${!f.required}
  }`).join(',\n')}
});`).join('\n');

      content = `const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);

${modelDefs}

module.exports = { sequelize };`;
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

    // Commit to GitHub
    try {
      await fs.mkdir(tempDir, { recursive: true });
      
      const repoUrl = token
        ? `https://${token}@github.com/${owner}/${repo}.git`
        : `https://github.com/${owner}/${repo}.git`;

      // Clone repo
      execSync(`git clone ${repoUrl} ${tempDir}/repo`, { stdio: 'pipe' });
      
      // Create directory if needed
      const filePath = path.join(tempDir, 'repo', fileName);
      const fileDir = path.dirname(filePath);
      await fs.mkdir(fileDir, { recursive: true });
      
      // Write file
      await fs.writeFile(filePath, content);
      
      // Commit and push
      execSync(`cd ${tempDir}/repo && git add ${fileName}`, { stdio: 'pipe' });
      execSync(`cd ${tempDir}/repo && git config user.name "Assignment2Bot"`, { stdio: 'pipe' });
      execSync(`cd ${tempDir}/repo && git config user.email "bot@assignment2.com"`, { stdio: 'pipe' });
      execSync(`cd ${tempDir}/repo && git commit -m "Add ${fileName} via Assignment 2 App"`, { stdio: 'pipe' });
      execSync(`cd ${tempDir}/repo && git push origin main`, { stdio: 'pipe' });

      // Update database
      await prisma.generatedFile.update({
        where: { id: generatedFile.id },
        data: {
          committed: true,
          commitHash: 'committed'
        }
      });

      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });

      console.log(`[API] Successfully committed ${fileName} to GitHub`);
      
      return NextResponse.json({
        success: true,
        message: `${fileName} generated and committed to GitHub successfully!`,
        file: generatedFile,
        githubUrl: `https://github.com/${owner}/${repo}/blob/main/${fileName}`
      });

    } catch (gitError: any) {
      console.error('[API] Git error:', gitError);
      
      // Cleanup on error
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch {}

      return NextResponse.json({
        success: false,
        error: `Failed to commit to GitHub: ${gitError.message}`,
        file: generatedFile
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[API] Generate error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate file' },
      { status: 500 }
    );
  }
}