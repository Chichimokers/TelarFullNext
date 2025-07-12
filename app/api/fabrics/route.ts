import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/database';

export async function GET() {
  try {
    const fabrics = queries.getAllFabrics.all();
    return NextResponse.json(fabrics);
  } catch (error) {
    console.error('Error fetching fabrics:', error);
    return NextResponse.json({ error: 'Failed to fetch fabrics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      pricePerMeter,
      category,
      color,
      material,
      width,
      imageUrl,
      stock,
      featured
    } = body;

    if (!name || !pricePerMeter || !category) {
      return NextResponse.json(
        { error: 'Name, price per meter, and category are required' },
        { status: 400 }
      );
    }

    const result = queries.insertFabric.run(
      name,
      description || '',
      pricePerMeter,
      category,
      color || '',
      material || '',
      width || 150,
      imageUrl || '',
      stock || 0,
      featured ? 1 : 0
    );

    const newFabric = queries.getFabricById.get(result.lastInsertRowid);
    return NextResponse.json(newFabric, { status: 201 });
  } catch (error) {
    console.error('Error creating fabric:', error);
    return NextResponse.json({ error: 'Failed to create fabric' }, { status: 500 });
  }
}