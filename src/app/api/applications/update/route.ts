import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    const application = await prisma.application.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(application);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}
