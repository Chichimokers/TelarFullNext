import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fabric = queries.getFabricById.get(parseInt(params.id));
    
    if (!fabric) {
      return NextResponse.json({ error: 'Fabric not found' }, { status: 404 });
    }

    return NextResponse.json(fabric);
  } catch (error) {
    console.error('Error fetching fabric:', error);
    return NextResponse.json({ error: 'Failed to fetch fabric' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const result = queries.updateFabric.run(
      name,
      description || '',
      pricePerMeter,
      category,
      color || '',
      material || '',
      width || 150,
      imageUrl || '',
      stock || 0,
      featured ? 1 : 0,
      parseInt(params.id)
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Fabric not found' }, { status: 404 });
    }

    const updatedFabric = queries.getFabricById.get(parseInt(params.id));
    return NextResponse.json(updatedFabric);
  } catch (error) {
    console.error('Error updating fabric:', error);
    return NextResponse.json({ error: 'Failed to update fabric' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = queries.deleteFabric.run(parseInt(params.id));

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Fabric not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Fabric deleted successfully' });
  } catch (error) {
    console.error('Error deleting fabric:', error);
    return NextResponse.json({ error: 'Failed to delete fabric' }, { status: 500 });
  }
}