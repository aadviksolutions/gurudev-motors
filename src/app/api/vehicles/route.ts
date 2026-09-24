import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const fuel = searchParams.get('fuel');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const includeUnpublished = searchParams.get('all') === 'true';

    const where: any = {};
    if (!includeUnpublished) {
      where.published = true;
    }
    if (category && category !== 'ALL') {
      where.category = category.toUpperCase();
    }
    if (brand && brand !== 'ALL') {
      where.brand = brand;
    }
    if (fuel && fuel !== 'ALL') {
      where.fuel = fuel;
    }
    if (featured === 'true') {
      where.featured = true;
    }
    if (search) {
      where.OR = [
        { brand: { contains: search } },
        { model: { contains: search } },
        { variant: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ success: true, vehicles });
  } catch (error: any) {
    console.error('Fetch vehicles error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canCreate = await hasPermission('vehicles', 'create', user);
    if (!canCreate) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const {
      brand,
      model,
      variant,
      category,
      year,
      fuel,
      transmission,
      km,
      colour,
      price,
      offerPrice,
      emi,
      description,
      features,
      stockStatus,
      featured,
      published,
      imageUrl,
    } = body;

    if (!brand || !model || !price) {
      return NextResponse.json({ error: 'Brand, model and price are required' }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        brand,
        model,
        variant: variant || null,
        category: category || 'NEW',
        year: Number(year) || new Date().getFullYear(),
        fuel: fuel || 'Petrol',
        transmission: transmission || 'Manual',
        km: Number(km) || 0,
        colour: colour || 'Standard',
        price: Number(price),
        offerPrice: offerPrice ? Number(offerPrice) : null,
        emi: emi ? Number(emi) : Math.round(Number(price) / 36),
        description: description || null,
        features: features || null,
        stockStatus: stockStatus || 'IN_STOCK',
        featured: Boolean(featured),
        published: published !== undefined ? Boolean(published) : true,
        imageUrl: imageUrl || '/images/hero.jpeg',
      },
    });

    await logAudit({
      user,
      action: 'CREATE',
      module: 'VEHICLES',
      recordId: vehicle.id,
      newValue: `Created vehicle ${vehicle.brand} ${vehicle.model} (₹${vehicle.price})`,
    });

    return NextResponse.json({ success: true, vehicle });
  } catch (error: any) {
    console.error('Create vehicle error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission('vehicles', 'edit', user);
    if (!canEdit) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });

    const updatePayload: any = {};
    if (data.brand !== undefined) updatePayload.brand = data.brand;
    if (data.model !== undefined) updatePayload.model = data.model;
    if (data.variant !== undefined) updatePayload.variant = data.variant;
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.year !== undefined) updatePayload.year = Number(data.year);
    if (data.fuel !== undefined) updatePayload.fuel = data.fuel;
    if (data.transmission !== undefined) updatePayload.transmission = data.transmission;
    if (data.km !== undefined) updatePayload.km = Number(data.km);
    if (data.colour !== undefined) updatePayload.colour = data.colour;
    if (data.price !== undefined) updatePayload.price = Number(data.price);
    if (data.offerPrice !== undefined) updatePayload.offerPrice = data.offerPrice ? Number(data.offerPrice) : null;
    if (data.emi !== undefined) updatePayload.emi = data.emi ? Number(data.emi) : null;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.features !== undefined) updatePayload.features = data.features;
    if (data.stockStatus !== undefined) updatePayload.stockStatus = data.stockStatus;
    if (data.featured !== undefined) updatePayload.featured = Boolean(data.featured);
    if (data.published !== undefined) updatePayload.published = Boolean(data.published);
    if (data.imageUrl !== undefined) updatePayload.imageUrl = data.imageUrl;

    const updated = await prisma.vehicle.update({
      where: { id },
      data: updatePayload,
    });

    await logAudit({
      user,
      action: 'UPDATE',
      module: 'VEHICLES',
      recordId: id,
      oldValue: `Price: ${existing.price}, Stock: ${existing.stockStatus}`,
      newValue: `Price: ${updated.price}, Stock: ${updated.stockStatus}`,
    });

    return NextResponse.json({ success: true, vehicle: updated });
  } catch (error: any) {
    console.error('Update vehicle error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canDelete = await hasPermission('vehicles', 'delete', user);
    if (!canDelete) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });

    await prisma.vehicle.delete({ where: { id } });

    await logAudit({
      user,
      action: 'DELETE',
      module: 'VEHICLES',
      recordId: id,
      oldValue: `${existing.brand} ${existing.model}`,
      newValue: 'Deleted vehicle record',
    });

    return NextResponse.json({ success: true, message: 'Vehicle deleted' });
  } catch (error: any) {
    console.error('Delete vehicle error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
