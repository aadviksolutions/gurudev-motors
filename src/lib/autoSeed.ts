import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export async function seedDefaultVehicles() {
  const vCount = await prisma.vehicle.count();
  if (vCount > 0) return;

  console.log('Auto-seeding default showroom vehicles and content...');

  // 1. Roles & Permissions if empty
  const roleCount = await prisma.role.count();
  let adminRole = await prisma.role.findFirst({ where: { code: 'MAIN_ADMIN' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'Main Admin',
        code: 'MAIN_ADMIN',
        description: 'Super administrator with full rights',
        isSystem: true,
      },
    });
  }

  // 2. Default User if empty
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    await prisma.user.create({
      data: {
        name: 'Rajesh Sharma (Director)',
        email: 'admin@gurudevmotors.com',
        passwordHash,
        phone: '+919300670006',
        roleId: adminRole.id,
      },
    });
  }

  // 3. Vehicles
  const defaultVehicles = [
    {
      brand: 'Hero',
      model: 'Splendor Plus XTEC',
      variant: 'Self Start Drum Alloy',
      category: 'NEW',
      vehicleType: 'Motorcycle',
      year: 2026,
      fuel: 'Petrol',
      transmission: 'Manual',
      km: 0,
      colour: 'Black with Silver Graphics',
      price: 79800,
      exShowroomPrice: 79800,
      onRoadPrice: 91500,
      offerPrice: 77500,
      emi: 2200,
      engineCC: 97,
      mileage: '68 kmpl',
      description: "India's highest selling commuter motorcycle with legendary mileage, i3S technology, Bluetooth digital console, and unmatched durability.",
      features: 'i3S Technology, Digital Meter with Bluetooth, USB Mobile Charger, Tubeless Tyres, 65+ kmpl Mileage',
      specifications: JSON.stringify({
        engine: '97.2 cc Single Cylinder, Air-Cooled, 4-Stroke',
        maxPower: '8.02 PS @ 8000 rpm',
        maxTorque: '8.05 Nm @ 6000 rpm',
        brakes: '130 mm Drum Front & Rear (IBS)',
        fuelTank: '9.8 Litres',
        kerbWeight: '112 kg',
      }),
      stockStatus: 'IN_STOCK',
      featured: true,
      published: true,
      imageUrl: '/images/bikes-1.jpeg',
    },
    {
      brand: 'Honda',
      model: 'Activa 6G',
      variant: 'Deluxe Alloy Smart Key',
      category: 'NEW',
      vehicleType: 'Scooter',
      year: 2026,
      fuel: 'Petrol',
      transmission: 'Automatic',
      km: 0,
      colour: 'Pearl Siren Blue',
      price: 82500,
      exShowroomPrice: 82500,
      onRoadPrice: 94800,
      offerPrice: 80900,
      emi: 2350,
      engineCC: 110,
      mileage: '55 kmpl',
      description: "Raipur's favorite unisex city scooter. Enhanced Smart Power (eSP) technology, silent start with ACG, external fuel filling and metal body durability.",
      features: 'eSP Engine, Silent Start ACG, Telescopic Suspension, External Fuel Lid, Combi Brake System (CBS)',
      specifications: JSON.stringify({
        engine: '109.51 cc 4-Stroke, SI Engine',
        maxPower: '7.84 PS @ 8000 rpm',
        maxTorque: '8.90 Nm @ 5500 rpm',
        brakes: 'Drum with CBS',
        fuelTank: '5.3 Litres',
        bootSpace: '18 Litres Underseat',
      }),
      stockStatus: 'IN_STOCK',
      featured: true,
      published: true,
      imageUrl: '/images/scooters-1.jpeg',
    },
    {
      brand: 'Suzuki',
      model: 'Access 125',
      variant: 'Special Edition Ride Connect Disc',
      category: 'NEW',
      vehicleType: 'Scooter',
      year: 2026,
      fuel: 'Petrol',
      transmission: 'Automatic',
      km: 0,
      colour: 'Matte Blue with Beige Seat',
      price: 88900,
      exShowroomPrice: 88900,
      onRoadPrice: 101800,
      offerPrice: 86500,
      emi: 2500,
      engineCC: 124,
      mileage: '52 kmpl',
      description: 'Sophisticated 125cc scooter with retro-modern chrome mirrors, Bluetooth digital cluster, easy start system and cavernous 21.8L underseat storage.',
      features: 'Bluetooth Turn-by-Turn Navigation, Chrome Headlamp, Side Stand Interlock, Front Pocket with USB, 125cc SEP Engine',
      stockStatus: 'IN_STOCK',
      featured: true,
      published: true,
      imageUrl: '/images/scooters-1.jpeg',
    },
    {
      brand: 'Bajaj',
      model: 'Pulsar 150',
      variant: 'Twin Disc ABS',
      category: 'NEW',
      vehicleType: 'Motorcycle',
      year: 2026,
      fuel: 'Petrol',
      transmission: 'Manual',
      km: 0,
      colour: 'Sparkle Black Red',
      price: 114500,
      exShowroomPrice: 114500,
      onRoadPrice: 131200,
      offerPrice: 111900,
      emi: 3200,
      engineCC: 150,
      mileage: '48 kmpl',
      description: 'The definitive Indian sports commuter. DTS-i twin spark engine, wolf-eyed headlamp, clip-on handlebars and legendary exhaust note.',
      features: '150cc DTS-i Engine, Twin Disc ABS, Nitrox Rear Suspension, Tubeless Tyres, Backlit Switches',
      stockStatus: 'IN_STOCK',
      featured: true,
      published: true,
      imageUrl: '/images/bikes-1.jpeg',
    },
    {
      brand: 'Kinetic Green',
      model: 'E-Luna Prime',
      variant: 'Dual Battery High Speed',
      category: 'ELECTRIC',
      vehicleType: 'Electric Scooter',
      year: 2026,
      fuel: 'Electric',
      transmission: 'EV Direct',
      km: 0,
      colour: 'Ocean Blue',
      price: 76990,
      exShowroomPrice: 76990,
      onRoadPrice: 82000,
      offerPrice: 74490,
      emi: 2100,
      mileage: '110 km/charge',
      description: 'The electric revolution of an Indian legend. 110 km range per charge, heavy 150 kg payload capacity, removable battery and steel chassis for rugged city hauling.',
      features: '110 km Certified Range, Portable Fast Charging, 150 kg Payload, Digital Meter, USB Port, Zero Fuel Cost',
      specifications: JSON.stringify({
        battery: '2.0 kWh Lithium-ion Portable',
        motor: '1.2 kW BLDC Hub Motor',
        topSpeed: '50 km/h',
        chargingTime: '4 Hours (0-100%)',
        payloadCapacity: '150 kg',
      }),
      stockStatus: 'IN_STOCK',
      featured: true,
      published: true,
      imageUrl: '/images/scooters-1.jpeg',
    },
    {
      brand: 'Kinetic Green',
      model: 'Zulu',
      variant: 'Smart Disc Edition',
      category: 'ELECTRIC',
      vehicleType: 'Electric Scooter',
      year: 2026,
      fuel: 'Electric',
      transmission: 'EV Direct',
      km: 0,
      colour: 'Crimson Red Matte',
      price: 94990,
      exShowroomPrice: 94990,
      onRoadPrice: 99800,
      offerPrice: 91990,
      emi: 2650,
      mileage: '105 km/charge',
      description: 'Ultra-modern high-speed electric scooter with instantaneous torque, CBS braking, anti-theft tracking, keyless entry and water-resistant IP67 motor.',
      features: '105 km Range, Fast Charge 0-80% in 30 mins, Smart App Connectivity, IP67 Waterproofing, Regenerative Braking',
      stockStatus: 'IN_STOCK',
      featured: true,
      published: true,
      imageUrl: '/images/hero.jpeg',
    },
    {
      brand: 'Hero',
      model: 'Glamour 125',
      variant: 'Drum Alloy (Certified Pre-Owned)',
      category: 'PRE_OWNED',
      vehicleType: 'Motorcycle',
      year: 2023,
      regYear: 2023,
      fuel: 'Petrol',
      transmission: 'Manual',
      km: 14850,
      colour: 'Tornado Grey',
      price: 48500,
      offerPrice: 46000,
      emi: 1550,
      engineCC: 125,
      mileage: '58 kmpl',
      description: 'Single owner, pristine showroom condition, certified 40-point vehicle inspection with 6 months Gurudev Motors dealer warranty and clean RTO Raipur paperwork.',
      features: 'Single Owner, 40-Point Inspection Passed, 6-Month Engine Warranty, Valid Insurance, Spot RTO Transfer',
      ownerCount: 1,
      condition: 'EXCELLENT',
      rcStatus: 'ORIGINAL_RC_AVAILABLE',
      warrantyDetails: '6 Months Engine Warranty',
      inspectionStatus: '40_POINT_PASSED',
      documentsStatus: 'VERIFIED',
      stockStatus: 'IN_STOCK',
      featured: true,
      published: true,
      imageUrl: '/images/bikes-1.jpeg',
    },
    {
      brand: 'Honda',
      model: 'Activa 5G',
      variant: 'Deluxe (Certified Pre-Owned)',
      category: 'PRE_OWNED',
      vehicleType: 'Scooter',
      year: 2022,
      regYear: 2022,
      fuel: 'Petrol',
      transmission: 'Automatic',
      km: 21300,
      colour: 'Matte Axis Grey',
      price: 43500,
      offerPrice: 41500,
      emi: 1400,
      engineCC: 110,
      mileage: '50 kmpl',
      description: 'Regularly serviced at authorized workshop. Complete service record available, brand new CEAT tyres, tested battery and smooth vibration-free engine.',
      features: 'New CEAT Tyres, Fresh Engine Oil Service, Tested Exide Battery, Clean Raipur Registration CG-04',
      ownerCount: 1,
      condition: 'GOOD',
      rcStatus: 'ORIGINAL_RC_AVAILABLE',
      warrantyDetails: '3 Months Dealer Warranty',
      inspectionStatus: '40_POINT_PASSED',
      documentsStatus: 'VERIFIED',
      stockStatus: 'IN_STOCK',
      featured: false,
      published: true,
      imageUrl: '/images/scooters-1.jpeg',
    },
    {
      brand: 'Bajaj',
      model: 'Pulsar 125 Carbon Edition',
      variant: 'Split Seat (Certified Pre-Owned)',
      category: 'PRE_OWNED',
      vehicleType: 'Motorcycle',
      year: 2023,
      regYear: 2023,
      fuel: 'Petrol',
      transmission: 'Manual',
      km: 9200,
      colour: 'Solar Red Carbon',
      price: 64000,
      offerPrice: 61500,
      emi: 1900,
      engineCC: 125,
      mileage: '52 kmpl',
      description: 'Almost like-new commuter sports bike with zero scratches. Showroom maintained with 1 year free service vouchers at Gurudev Motors workshop.',
      features: 'Only 9,200 KM Run, First Owner Doctor Driven, Free 1 Year Gurudev Service Vouchers, Zero Dep Insurance',
      ownerCount: 1,
      condition: 'EXCELLENT',
      rcStatus: 'ORIGINAL_RC_AVAILABLE',
      warrantyDetails: '6 Months Engine Warranty',
      inspectionStatus: '40_POINT_PASSED',
      documentsStatus: 'VERIFIED',
      stockStatus: 'IN_STOCK',
      featured: true,
      published: true,
      imageUrl: '/images/bikes-1.jpeg',
    },
  ];

  for (const vData of defaultVehicles) {
    await prisma.vehicle.create({
      data: {
        ...vData,
        images: {
          create: [
            { url: vData.imageUrl, isPrimary: true, order: 0 },
            { url: '/images/bikes-1.jpeg', isPrimary: false, order: 1 },
            { url: '/images/showroom-1.jpeg', isPrimary: false, order: 2 },
          ],
        },
      },
    });
  }

  // 4. Offers if empty
  const offerCount = await prisma.offer.count();
  if (offerCount === 0) {
    await prisma.offer.create({
      data: {
        title: 'Festive Mobility Dhamaka',
        badge: 'LIMITED TIME',
        discountText: 'Save up to ₹5,500 + Free Helmet',
        exchangeBonus: 2500,
        financeOffer: 'Low Down Payment ₹1,999/-',
        description: 'Zero down payment schemes and exchange bonus on your old two-wheeler across Hero & Honda models.',
        validTill: new Date(Date.now() + 60 * 24 * 3600 * 1000),
        terms: 'Subject to bank approval. Offer valid on select models till stocks last at Raipur showroom.',
        active: true,
      },
    });

    await prisma.offer.create({
      data: {
        title: 'Kinetic Green EV Switch Bonus',
        badge: 'GO GREEN',
        discountText: '₹3,000 Direct Subsidy + 3 Free Services',
        exchangeBonus: 3000,
        financeOffer: 'EMI starting from ₹2,100/mo',
        description: 'Switch to zero fuel bills with E-Luna or Zulu. Low EMI starting from just ₹2,100 per month.',
        validTill: new Date(Date.now() + 60 * 24 * 3600 * 1000),
        terms: 'Valid on on-road purchases at Gurudev Motors Raipura showroom.',
        active: true,
      },
    });
  }

  // 5. Gallery if empty
  const galCount = await prisma.gallery.count();
  if (galCount === 0) {
    const galleryItems = [
      { title: 'Gurudev Motors Main Showroom', category: 'SHOWROOM', imageUrl: '/images/showroom-1.jpeg', description: 'Multi-brand showroom at Mahadev Ghat Chowk, Raipur' },
      { title: 'Motorcycles Display Section', category: 'VEHICLES', imageUrl: '/images/bikes-1.jpeg', description: 'Hero, Honda, Bajaj 100cc to 200cc motorcycles line-up' },
      { title: 'Scooters & Electric Pavilion', category: 'VEHICLES', imageUrl: '/images/scooters-1.jpeg', description: 'Activa, Access and Kinetic Green electric scooters' },
      { title: 'Customer Consultation Desk', category: 'SHOWROOM', imageUrl: '/images/desk.jpeg', description: 'Comfortable documentation and loan assistance counter' },
      { title: 'Modern Two-Wheeler Workshop', category: 'WORKSHOP', imageUrl: '/images/workshop.jpeg', description: 'Skilled technicians, pneumatic lifts, and genuine spare parts' },
    ];
    for (let i = 0; i < galleryItems.length; i++) {
      await prisma.gallery.create({ data: { ...galleryItems[i], order: i + 1 } });
    }
  }

  console.log('Auto-seed completed successfully.');
}
