import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET - Read all commands
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const commands = await prisma.gitCommand.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    console.log(`[API] Fetched ${commands.length} git commands`);
    return NextResponse.json(commands);
  } catch (error) {
    console.error('[API] GET /api/gitcommands error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commands' },
      { status: 500 }
    );
  }
}

// POST - Create new command
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, token, owner, repo, command, output, status } = body;

    if (!username || !owner || !repo || !command) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const gitCommand = await prisma.gitCommand.create({
      data: {
        username,
        token: token || '',
        owner,
        repo,
        command,
        output: output || null,
        status: status || 'pending'
      }
    });

    console.log(`[API] Created git command: ${gitCommand.id}`);
    return NextResponse.json(gitCommand, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/gitcommands error:', error);
    return NextResponse.json(
      { error: 'Failed to create command' },
      { status: 500 }
    );
  }
}