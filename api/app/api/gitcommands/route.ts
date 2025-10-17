import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const commands = await prisma.gitCommand.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return NextResponse.json(commands);
  } catch (error) {
    console.error('[API] GET /api/gitcommands error:', error);
    return NextResponse.json({ error: 'Failed to fetch commands' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, token, owner, repo, command, output, status } = body;

    const gitCommand = await prisma.gitCommand.create({
      data: { username, token, owner, repo, command, output, status }
    });

    return NextResponse.json(gitCommand, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/gitcommands error:', error);
    return NextResponse.json({ error: 'Failed to create command' }, { status: 500 });
  }
}