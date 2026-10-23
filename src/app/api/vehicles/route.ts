import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

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

    let vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // If database is completely empty (e.g. fresh Vercel deployment), ensure auto-seeding
    if (vehicles.length === 0 && !search && (!category || category === 'ALL') && (!brand || brand === 'ALL')) {
      const totalCount = await prisma.vehicle.count();
      if (totalCount === 0) {
        try {
          const { seedDefaultVehicles } = await import('@/lib/autoSeed');
          await seedDefaultVehicles();
          vehicles = await prisma.vehicle.findMany({
            where,
            include: { images: { orderBy: { order: 'asc' } } },
            orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
          });
        } catch (seedErr) {
          console.warn('Auto-seed error:', seedErr);
        }
      }
    }

    return NextResponse.json({ success: true, vehicles });
  } catch (error: any) {
    console.error('Fetch vehicles error:', error);
    return NextResponse.json(
      { success: false, message: 'Vehicle inventory is temporarily unavailable.' },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canCreate = await hasPermission('vehicles', 'create', user);
    if (!canCreate) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();

    // Check for Duplicate Vehicle Action
    if (body.action === 'duplicate' && body.sourceId) {
      const source = await prisma.vehicle.findUnique({
        where: { id: body.sourceId },
        include: { images: true },
      });
      if (!source) return NextResponse.json({ error: 'Source vehicle not found' }, { status: 404 });

      const newVehicle = await prisma.vehicle.create({
        data: {
          brand: source.brand,
          model: `${source.model} (Copy)`,
          variant: source.variant,
          category: source.category,
          vehicleType: source.vehicleType,
          year: source.year,
          fuel: source.fuel,
          transmission: source.transmission,
          km: source.km,
          colour: source.colour,
          price: source.price,
          exShowroomPrice: source.exShowroomPrice,
          onRoadPrice: source.onRoadPrice,
          offerPrice: source.offerPrice,
          emi: source.emi,
          engineCC: source.engineCC,
          mileage: source.mileage,
          regYear: source.regYear,
          description: source.description,
          features: source.features,
          specifications: source.specifications,
          stockStatus: 'IN_STOCK',
          featured: false,
          published: false,
          exchangeAvailable: source.exchangeAvailable,
          financeAvailable: source.financeAvailable,
          imageUrl: source.imageUrl,
          ownerCount: source.ownerCount,
          condition: source.condition,
          expectedPrice: source.expectedPrice,
          rcStatus: source.rcStatus,
          warrantyDetails: source.warrantyDetails,
          inspectionStatus: source.inspectionStatus,
          documentsStatus: source.documentsStatus,
          images: {
            create: source.images.map((img) => ({
              url: img.url,
              isPrimary: img.isPrimary,
              order: img.order,
            })),
          },
        },
        include: { images: true },
      });

      await logAudit({
        user,
        action: 'CREATE',
        module: 'VEHICLES',
        recordId: newVehicle.id,
        newValue: `Duplicated from ${source.brand} ${source.model} -> ${newVehicle.brand} ${newVehicle.model}`,
      });

      return NextResponse.json({ success: true, vehicle: newVehicle, message: 'Vehicle duplicated successfully' });
    }

    const {
      brand,
      model,
      variant,
      category = 'NEW',
      vehicleType = 'Motorcycle',
      year,
      fuel = 'Petrol',
      transmission = 'Manual',
      km = 0,
      colour = 'Standard',
      price,
      exShowroomPrice,
      onRoadPrice,
      offerPrice,
      emi,
      engineCC,
      mileage,
      regYear,
      description,
      features,
      specifications,
      stockStatus = 'IN_STOCK',
      featured = false,
      published = true,
      exchangeAvailable = true,
      financeAvailable = true,
      imageUrl,
      images = [],
      ownerCount = 1,
      condition = 'EXCELLENT',
      expectedPrice,
      rcStatus = 'ORIGINAL_RC_AVAILABLE',
      warrantyDetails = '6 Months Engine Warranty',
      inspectionStatus = '40_POINT_PASSED',
      documentsStatus = 'VERIFIED',
    } = body;

    if (!brand || !model || !price) {
      return NextResponse.json({ error: 'Brand, model and price are required' }, { status: 400 });
    }

    const numPrice = Number(price);
    const numOfferPrice = offerPrice ? Number(offerPrice) : null;
    const computedEmi = emi ? Number(emi) : Math.round((numOfferPrice || numPrice) / 36);

    const vehicle = await prisma.vehicle.create({
      data: {
        brand: brand.trim(),
        model: model.trim(),
        variant: variant?.trim() || null,
        category: category || 'NEW',
        vehicleType: vehicleType || 'Motorcycle',
        year: Number(year) || new Date().getFullYear(),
        fuel: fuel || 'Petrol',
        transmission: transmission || 'Manual',
        km: Number(km) || 0,
        colour: colour?.trim() || 'Standard',
        price: numPrice,
        exShowroomPrice: exShowroomPrice ? Number(exShowroomPrice) : numPrice,
        onRoadPrice: onRoadPrice ? Number(onRoadPrice) : Math.round(numPrice * 1.15),
        offerPrice: numOfferPrice,
        emi: computedEmi,
        engineCC: engineCC ? Number(engineCC) : null,
        mileage: mileage?.trim() || null,
        regYear: regYear ? Number(regYear) : Number(year) || new Date().getFullYear(),
        description: description?.trim() || null,
        features: features?.trim() || null,
        specifications: typeof specifications === 'string' ? specifications : JSON.stringify(specifications || {}),
        stockStatus: stockStatus || 'IN_STOCK',
        featured: Boolean(featured),
        published: published !== undefined ? Boolean(published) : true,
        exchangeAvailable: Boolean(exchangeAvailable),
        financeAvailable: Boolean(financeAvailable),
        imageUrl: imageUrl || (category === 'ELECTRIC' ? '/images/scooters-1.jpeg' : '/images/bikes-1.jpeg'),
        ownerCount: Number(ownerCount) || 1,
        condition: condition || 'EXCELLENT',
        expectedPrice: expectedPrice ? Number(expectedPrice) : null,
        rcStatus: rcStatus || 'ORIGINAL_RC_AVAILABLE',
        warrantyDetails: warrantyDetails || '6 Months Engine Warranty',
        inspectionStatus: inspectionStatus || '40_POINT_PASSED',
        documentsStatus: documentsStatus || 'VERIFIED',
        images: {
          create: Array.isArray(images) && images.length > 0
            ? images.map((img: any, idx: number) => ({
                url: typeof img === 'string' ? img : img.url,
                isPrimary: idx === 0,
                order: idx,
              }))
            : [{ url: imageUrl || '/images/bikes-1.jpeg', isPrimary: true, order: 0 }],
        },
      },
      include: { images: true },
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
    return NextResponse.json({ success: false, message: 'Unable to save vehicle right now.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission('vehicles', 'edit', user);
    if (!canEdit) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const { id, images, ...data } = body;

    if (!id) return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });

    const existing = await prisma.vehicle.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!existing) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });

    const updatePayload: any = {};
    if (data.brand !== undefined) updatePayload.brand = data.brand;
    if (data.model !== undefined) updatePayload.model = data.model;
    if (data.variant !== undefined) updatePayload.variant = data.variant;
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.vehicleType !== undefined) updatePayload.vehicleType = data.vehicleType;
    if (data.year !== undefined) updatePayload.year = Number(data.year);
    if (data.fuel !== undefined) updatePayload.fuel = data.fuel;
    if (data.transmission !== undefined) updatePayload.transmission = data.transmission;
    if (data.km !== undefined) updatePayload.km = Number(data.km);
    if (data.colour !== undefined) updatePayload.colour = data.colour;
    if (data.price !== undefined) updatePayload.price = Number(data.price);
    if (data.exShowroomPrice !== undefined) updatePayload.exShowroomPrice = Number(data.exShowroomPrice);
    if (data.onRoadPrice !== undefined) updatePayload.onRoadPrice = Number(data.onRoadPrice);
    if (data.offerPrice !== undefined) updatePayload.offerPrice = data.offerPrice ? Number(data.offerPrice) : null;
    if (data.emi !== undefined) updatePayload.emi = data.emi ? Number(data.emi) : null;
    if (data.engineCC !== undefined) updatePayload.engineCC = data.engineCC ? Number(data.engineCC) : null;
    if (data.mileage !== undefined) updatePayload.mileage = data.mileage;
    if (data.regYear !== undefined) updatePayload.regYear = data.regYear ? Number(data.regYear) : null;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.features !== undefined) updatePayload.features = data.features;
    if (data.specifications !== undefined) {
      updatePayload.specifications = typeof data.specifications === 'string' ? data.specifications : JSON.stringify(data.specifications);
    }
    if (data.stockStatus !== undefined) updatePayload.stockStatus = data.stockStatus;
    if (data.featured !== undefined) updatePayload.featured = Boolean(data.featured);
    if (data.published !== undefined) updatePayload.published = Boolean(data.published);
    if (data.exchangeAvailable !== undefined) updatePayload.exchangeAvailable = Boolean(data.exchangeAvailable);
    if (data.financeAvailable !== undefined) updatePayload.financeAvailable = Boolean(data.financeAvailable);
    if (data.imageUrl !== undefined) updatePayload.imageUrl = data.imageUrl;
    if (data.ownerCount !== undefined) updatePayload.ownerCount = Number(data.ownerCount);
    if (data.condition !== undefined) updatePayload.condition = data.condition;
    if (data.expectedPrice !== undefined) updatePayload.expectedPrice = data.expectedPrice ? Number(data.expectedPrice) : null;
    if (data.rcStatus !== undefined) updatePayload.rcStatus = data.rcStatus;
    if (data.warrantyDetails !== undefined) updatePayload.warrantyDetails = data.warrantyDetails;
    if (data.inspectionStatus !== undefined) updatePayload.inspectionStatus = data.inspectionStatus;
    if (data.documentsStatus !== undefined) updatePayload.documentsStatus = data.documentsStatus;

    // Handle images if provided
    if (Array.isArray(images)) {
      await prisma.vehicleImage.deleteMany({ where: { vehicleId: id } });
      updatePayload.images = {
        create: images.map((img: any, idx: number) => ({
          url: typeof img === 'string' ? img : img.url,
          isPrimary: idx === 0,
          order: idx,
        })),
      };
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: updatePayload,
      include: { images: true },
    });

    await logAudit({
      user,
      action: 'UPDATE',
      module: 'VEHICLES',
      recordId: id,
      oldValue: `Price: ₹${existing.price}, Status: ${existing.stockStatus}`,
      newValue: `Price: ₹${updated.price}, Status: ${updated.stockStatus}`,
    });

    return NextResponse.json({ success: true, vehicle: updated });
  } catch (error: any) {
    console.error('Update vehicle error:', error);
    return NextResponse.json({ success: false, message: 'Unable to update vehicle right now.' }, { status: 500 });
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

    // Clean up dependent child records if needed
    await prisma.vehicleImage.deleteMany({ where: { vehicleId: id } });
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
    return NextResponse.json({ success: false, message: 'Unable to delete vehicle right now.' }, { status: 500 });
  }
}
