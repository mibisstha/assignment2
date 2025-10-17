import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

//  Add this right after your imports
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

//  Helper function for setting CORS headers in responses
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

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