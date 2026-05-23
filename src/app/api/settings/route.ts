import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const config = settings.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();
    if (!key) {
      return NextResponse.json({ error: 'La clave (key) es requerida.' }, { status: 400 });
    }
    
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
    
    return NextResponse.json(setting);
  } catch (error: any) {
    console.error('[API SETTINGS POST ERROR]:', error);
    return NextResponse.json(
      { error: `Error al guardar configuración: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}
