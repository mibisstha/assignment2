import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET single command
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const command = await prisma.gitCommand.findUnique({
      where: { id: params.id }
    });

    if (!command) {
      return NextResponse.json(
        { error: 'Command not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(command);
  } catch (error) {
    console.error('[API] GET /api/gitcommands/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch command' },
      { status: 500 }
    );
  }
}

// PUT - Update command
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const command = await prisma.gitCommand.update({
      where: { id: params.id },
      data: body
    });

    console.log(`[API] Updated git command: ${command.id}`);
    return NextResponse.json(command);
  } catch (error) {
    console.error('[API] PUT /api/gitcommands/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update command' },
      { status: 500 }
    );
  }
}

// DELETE command
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.gitCommand.delete({
      where: { id: params.id }
    });

    console.log(`[API] Deleted git command: ${params.id}`);
    return NextResponse.json({ message: 'Command deleted successfully' });
  } catch (error) {
    console.error('[API] DELETE /api/gitcommands/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete command' },
      { status: 500 }
    );
  }
}