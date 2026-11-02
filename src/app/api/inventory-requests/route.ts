import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission, getRoleScope } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canViewVehicles = await hasPermission('vehicles', 'view', user);
    if (!canViewVehicles) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const scope = getRoleScope(user);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';

    const where: any = {};
    if (status !== 'ALL') {
      where.status = status;
    }

    // Non-admin users only see requests submitted by themselves
    if (!scope.isGlobalAdmin) {
      where.requestedById = user.id;
    }

    const [requests, pendingCount] = await Promise.all([
      prisma.inventoryRequest.findMany({
        where,
        include: {
          requestedBy: {
            select: { id: true, name: true, email: true, role: { select: { name: true, code: true } } },
          },
          reviewedBy: {
            select: { id: true, name: true, email: true },
          },
          targetVehicle: {
            select: { id: true, brand: true, model: true, category: true, price: true, imageUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inventoryRequest.count({
        where: scope.isGlobalAdmin ? { status: 'PENDING' } : { status: 'PENDING', requestedById: user.id },
      }),
    ]);

    return NextResponse.json({ success: true, requests, pendingCount, isGlobalAdmin: scope.isGlobalAdmin });
  } catch (error: any) {
    console.error('Fetch inventory requests error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const scope = getRoleScope(user);
    const canApprove = scope.isGlobalAdmin || await hasPermission('vehicles', 'approve', user);
    if (!canApprove) {
      return NextResponse.json({ error: 'Permission denied: Admin approval rights required' }, { status: 403 });
    }

    const body = await req.json();
    const { requestId, action, rejectionReason } = body;

    if (!requestId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Request ID and valid action (APPROVE or REJECT) are required' }, { status: 400 });
    }

    const request = await prisma.inventoryRequest.findUnique({
      where: { id: requestId },
      include: {
        requestedBy: true,
        targetVehicle: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: 'Inventory request not found' }, { status: 404 });
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json({ error: `Request has already been ${request.status.toLowerCase()}` }, { status: 400 });
    }

    const now = new Date();

    if (action === 'REJECT') {
      const reason = rejectionReason?.trim() || 'Rejected by Administrator';
      await prisma.inventoryRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          reviewedById: user.id,
          rejectionReason: reason,
          reviewedAt: now,
        },
      });

      // Send in-app notification to requester
      await prisma.notification.create({
        data: {
          userId: request.requestedById,
          title: 'Inventory Request Rejected',
          message: `Your request (${request.summary}) was rejected by ${user.name}. Reason: ${reason}`,
          type: 'SYSTEM',
        },
      });

      await logAudit({
        user,
        action: 'APPROVE',
        module: 'VEHICLES',
        recordId: request.id,
        newValue: `Rejected inventory request: ${request.summary}. Reason: ${reason}`,
      });

      return NextResponse.json({ success: true, message: 'Request has been rejected.' });
    }

    // ACTION === 'APPROVE'
    let payloadData: any = {};
    try {
      payloadData = request.payload ? JSON.parse(request.payload) : {};
    } catch {
      payloadData = {};
    }

    if (request.requestType === 'ADD') {
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
      } = payloadData;

      const numPrice = Number(price) || 0;
      const numOfferPrice = offerPrice ? Number(offerPrice) : null;
      const computedEmi = emi ? Number(emi) : Math.round((numOfferPrice || numPrice) / 36);

      const createdVehicle = await prisma.vehicle.create({
        data: {
          brand: brand ? String(brand).trim() : 'Generic',
          model: model ? String(model).trim() : 'Model',
          variant: variant ? String(variant).trim() : null,
          category: category || 'NEW',
          vehicleType: vehicleType || 'Motorcycle',
          year: Number(year) || new Date().getFullYear(),
          fuel: fuel || 'Petrol',
          transmission: transmission || 'Manual',
          km: Number(km) || 0,
          colour: colour ? String(colour).trim() : 'Standard',
          price: numPrice,
          exShowroomPrice: exShowroomPrice ? Number(exShowroomPrice) : numPrice,
          onRoadPrice: onRoadPrice ? Number(onRoadPrice) : Math.round(numPrice * 1.15),
          offerPrice: numOfferPrice,
          emi: computedEmi,
          engineCC: engineCC ? Number(engineCC) : null,
          mileage: mileage ? String(mileage).trim() : null,
          regYear: regYear ? Number(regYear) : Number(year) || new Date().getFullYear(),
          description: description ? String(description).trim() : null,
          features: features ? String(features).trim() : null,
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
      });

      await prisma.inventoryRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          targetVehicleId: createdVehicle.id,
          reviewedById: user.id,
          reviewedAt: now,
        },
      });

      await prisma.notification.create({
        data: {
          userId: request.requestedById,
          title: 'Inventory Addition Approved',
          message: `Your request to add ${createdVehicle.brand} ${createdVehicle.model} has been APPROVED and added to live inventory!`,
          type: 'SYSTEM',
        },
      });

      await logAudit({
        user,
        action: 'APPROVE',
        module: 'VEHICLES',
        recordId: createdVehicle.id,
        newValue: `Approved ADD request from ${request.requestedBy.name} for ${createdVehicle.brand} ${createdVehicle.model}`,
      });

      return NextResponse.json({ success: true, message: 'Vehicle addition approved and added to inventory!' });
    }

    if (request.requestType === 'EDIT') {
      const targetId = request.targetVehicleId || payloadData.id;
      if (!targetId) {
        return NextResponse.json({ error: 'Target vehicle ID missing in request' }, { status: 400 });
      }

      const existingVehicle = await prisma.vehicle.findUnique({ where: { id: targetId } });
      if (!existingVehicle) {
        return NextResponse.json({ error: 'Target vehicle no longer exists' }, { status: 404 });
      }

      const { id, images, ...data } = payloadData;
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

      if (Array.isArray(images)) {
        await prisma.vehicleImage.deleteMany({ where: { vehicleId: targetId } });
        updatePayload.images = {
          create: images.map((img: any, idx: number) => ({
            url: typeof img === 'string' ? img : img.url,
            isPrimary: idx === 0,
            order: idx,
          })),
        };
      }

      const updated = await prisma.vehicle.update({
        where: { id: targetId },
        data: updatePayload,
      });

      await prisma.inventoryRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewedById: user.id,
          reviewedAt: now,
        },
      });

      await prisma.notification.create({
        data: {
          userId: request.requestedById,
          title: 'Inventory Edit Approved',
          message: `Your changes to ${updated.brand} ${updated.model} were APPROVED by ${user.name} and applied to inventory!`,
          type: 'SYSTEM',
        },
      });

      await logAudit({
        user,
        action: 'APPROVE',
        module: 'VEHICLES',
        recordId: targetId,
        newValue: `Approved EDIT request from ${request.requestedBy.name} for ${updated.brand} ${updated.model}`,
      });

      return NextResponse.json({ success: true, message: 'Vehicle changes approved and applied!' });
    }

    if (request.requestType === 'DELETE') {
      const targetId = request.targetVehicleId || payloadData.id;
      if (!targetId) {
        return NextResponse.json({ error: 'Target vehicle ID missing in delete request' }, { status: 400 });
      }

      const existingVehicle = await prisma.vehicle.findUnique({ where: { id: targetId } });
      if (existingVehicle) {
        await prisma.vehicleImage.deleteMany({ where: { vehicleId: targetId } });
        await prisma.vehicle.delete({ where: { id: targetId } });
      }

      await prisma.inventoryRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewedById: user.id,
          reviewedAt: now,
        },
      });

      await prisma.notification.create({
        data: {
          userId: request.requestedById,
          title: 'Inventory Removal Approved',
          message: `Your request to remove ${request.summary} was APPROVED by ${user.name} and the vehicle was deleted.`,
          type: 'SYSTEM',
        },
      });

      await logAudit({
        user,
        action: 'APPROVE',
        module: 'VEHICLES',
        recordId: targetId,
        newValue: `Approved DELETE request from ${request.requestedBy.name} for ${request.summary}`,
      });

      return NextResponse.json({ success: true, message: 'Vehicle removal approved and deleted from inventory.' });
    }

    return NextResponse.json({ error: 'Unknown request type' }, { status: 400 });
  } catch (error: any) {
    console.error('Process inventory request error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

