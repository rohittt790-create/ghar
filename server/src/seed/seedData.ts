import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Owner } from '../models/Owner.js';
import { Property } from '../models/Property.js';
import { Task } from '../models/Task.js';
import { Reminder } from '../models/Reminder.js';
import { recalculatePropertyProgress } from '../controllers/propertyController.js';

import dns from 'dns';

dotenv.config();

const seed = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hometrack';
    if (uri.startsWith('mongodb+srv://')) {
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
      } catch (e) {}
    }
    await mongoose.connect(uri);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing collections
    await User.deleteMany({});
    await Owner.deleteMany({});
    await Property.deleteMany({});
    await Task.deleteMany({});
    await Reminder.deleteMany({});
    console.log('[Seed] Cleared existing data');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'Robert Vance (Chief PM)',
      email: 'admin@hometrack.com',
      password: 'password123',
      role: 'admin',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });

    const projectManager = await User.create({
      name: 'Elena Rostova',
      email: 'elena@hometrack.com',
      password: 'password123',
      role: 'project_manager',
      phone: '+1 (555) 345-6789',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    });

    await User.create({
      name: 'Marcus Brody (Lead Contractor)',
      email: 'marcus@hometrack.com',
      password: 'password123',
      role: 'contractor',
      phone: '+1 (555) 456-7890',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    });

    console.log('[Seed] Users created: admin@hometrack.com / password123');

    // 2. Create Owners
    const owner1 = await Owner.create({
      name: 'Rajesh & Priya Sharma',
      email: 'rajesh.sharma@example.com',
      phone: '+1 (512) 882-9011',
      address: '742 Evergreen Terrace',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      notes: 'Prefers weekly updates on Friday afternoons. Focus on eco-friendly materials.',
      emergencyContact: {
        name: 'Arun Sharma (Brother)',
        phone: '+1 (512) 993-2144',
        relationship: 'Brother',
      },
    });

    const owner2 = await Owner.create({
      name: 'Sophia Martinez',
      email: 'sophia.m@example.com',
      phone: '+1 (303) 745-1289',
      address: '1420 Pinecrest Heights',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      notes: 'Custom European kitchen cabinetry specified. High attention to soundproofing.',
      emergencyContact: {
        name: 'Carlos Martinez',
        phone: '+1 (303) 621-8844',
        relationship: 'Father',
      },
    });

    const owner3 = await Owner.create({
      name: 'David & Linda Miller',
      email: 'david.miller@example.com',
      phone: '+1 (206) 431-7722',
      address: '880 Timberline Blvd',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      notes: 'Smart home integration requested throughout the whole residence.',
      emergencyContact: {
        name: 'Karen Miller',
        phone: '+1 (206) 554-1290',
        relationship: 'Daughter',
      },
    });

    const owner4 = await Owner.create({
      name: 'Anita Patel',
      email: 'anita.patel@example.com',
      phone: '+1 (619) 321-9944',
      address: '320 Coronado Shore Road',
      city: 'San Diego',
      state: 'CA',
      zipCode: '92118',
      profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      notes: 'Modern minimalist design with expansive coastal view windows.',
      emergencyContact: {
        name: 'Sunil Patel',
        phone: '+1 (619) 441-2099',
        relationship: 'Spouse',
      },
    });

    console.log('[Seed] Owners created');

    // 3. Create Properties
    const prop1 = await Property.create({
      propertyId: 'PROP-101',
      name: 'Skyline Modern Villa',
      address: '450 Hillside Ridge Drive',
      city: 'Austin',
      state: 'TX',
      zipCode: '78746',
      owner: owner1._id,
      startDate: new Date('2026-08-01'),
      expectedCompletionDate: new Date('2027-04-15'),
      status: 'in_progress',
      coverPhoto: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      propertyPhotos: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      ],
      estimatedBudget: 420000,
      actualExpenses: 185000,
      squareFeet: 4200,
      propertyType: 'villa',
      notes: '4-bed luxury custom build with infinity pool and solar roof.',
      progressPercentage: 55,
    });

    const prop2 = await Property.create({
      propertyId: 'PROP-102',
      name: 'Highland Craftsman Residence',
      address: '812 Alpine Way',
      city: 'Denver',
      state: 'CO',
      zipCode: '80211',
      owner: owner2._id,
      startDate: new Date('2026-09-10'),
      expectedCompletionDate: new Date('2027-05-30'),
      status: 'in_progress',
      coverPhoto: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      propertyPhotos: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      ],
      estimatedBudget: 350000,
      actualExpenses: 140000,
      squareFeet: 3100,
      propertyType: 'residential',
      notes: 'Stone foundation and reclaimed cedar trim detailing.',
      progressPercentage: 40,
    });

    const prop3 = await Property.create({
      propertyId: 'PROP-103',
      name: 'Oakridge Luxury Townhome',
      address: '224 Mercer Street',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98109',
      owner: owner3._id,
      startDate: new Date('2026-06-15'),
      expectedCompletionDate: new Date('2026-11-20'),
      status: 'in_progress',
      coverPhoto: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      propertyPhotos: [
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80',
      ],
      estimatedBudget: 280000,
      actualExpenses: 245000,
      squareFeet: 2450,
      propertyType: 'renovation',
      notes: 'Full gut renovation including seismic retrofitting and rooftop deck.',
      progressPercentage: 82,
    });

    const prop4 = await Property.create({
      propertyId: 'PROP-104',
      name: 'Sunset Valley Estate',
      address: '1050 Coastal Highway',
      city: 'San Diego',
      state: 'CA',
      zipCode: '92037',
      owner: owner4._id,
      startDate: new Date('2026-10-01'),
      expectedCompletionDate: new Date('2027-08-15'),
      status: 'in_progress',
      coverPhoto: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      propertyPhotos: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      ],
      estimatedBudget: 550000,
      actualExpenses: 72000,
      squareFeet: 5100,
      propertyType: 'villa',
      notes: 'Excavation and foundation work underway.',
      progressPercentage: 18,
    });

    console.log('[Seed] Properties created');

    // 4. Create Detailed Construction Tasks with Before/After Photos & Work History
    const tasksData = [
      // PROPERTY 1 (Skyline Modern Villa)
      {
        property: prop1._id,
        taskName: 'Site Clearing & Soil Grading',
        description: 'Excavate lot, remove tree roots, test soil load-bearing capacity and grade surface.',
        category: 'Foundation',
        assignedWorker: 'Carlos Gutierrez (Excavation Lead)',
        workerPhone: '+1 (512) 332-1100',
        startDate: new Date('2026-08-03'),
        dueDate: new Date('2026-08-14'),
        completedDate: new Date('2026-08-12'),
        priority: 'high',
        estimatedCost: 14000,
        actualCost: 13500,
        notes: 'Passed initial soil compaction tests with 98% density.',
        status: 'completed',
        progressPhotos: [
          {
            url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=800&q=80',
            caption: 'Raw lot before grading began',
            stage: 'before',
            uploadedAt: new Date('2026-08-03'),
          },
          {
            url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
            caption: 'Excavators and leveling laser guided',
            stage: 'during',
            uploadedAt: new Date('2026-08-08'),
          },
          {
            url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
            caption: 'Grading completed ready for footings',
            stage: 'after',
            uploadedAt: new Date('2026-08-12'),
          },
        ],
        history: [
          {
            action: 'Task Created',
            changedBy: 'Robert Vance',
            timestamp: new Date('2026-08-01'),
            notes: 'Initial schedule created',
          },
          {
            action: 'Status Change',
            changedBy: 'Carlos Gutierrez',
            timestamp: new Date('2026-08-03'),
            previousStatus: 'not_started',
            newStatus: 'in_progress',
            notes: 'Heavy machinery arrived on site',
          },
          {
            action: 'Completed',
            changedBy: 'Robert Vance',
            timestamp: new Date('2026-08-12'),
            previousStatus: 'in_progress',
            newStatus: 'completed',
            notes: 'Signed off by city engineer',
          },
        ],
      },
      {
        property: prop1._id,
        taskName: 'Reinforced Concrete Foundation & Slab',
        description: 'Pour post-tension concrete slab with rebar reinforcement and vapor barrier.',
        category: 'Foundation',
        assignedWorker: 'Mateo Sanchez (Masonry Specialist)',
        workerPhone: '+1 (512) 441-9922',
        startDate: new Date('2026-08-15'),
        dueDate: new Date('2026-08-30'),
        completedDate: new Date('2026-08-29'),
        priority: 'urgent',
        estimatedCost: 38000,
        actualCost: 39500,
        notes: 'Slight delay due to concrete truck scheduling, but cured perfectly.',
        status: 'completed',
        progressPhotos: [
          {
            url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
            caption: 'Trenches and formwork setup',
            stage: 'before',
            uploadedAt: new Date('2026-08-16'),
          },
          {
            url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
            caption: 'Pouring and vibrating concrete slab',
            stage: 'during',
            uploadedAt: new Date('2026-08-22'),
          },
          {
            url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
            caption: 'Finished slab cured to 4000 PSI strength',
            stage: 'after',
            uploadedAt: new Date('2026-08-29'),
          },
        ],
        history: [
          {
            action: 'Status Change',
            changedBy: 'Mateo Sanchez',
            timestamp: new Date('2026-08-29'),
            previousStatus: 'in_progress',
            newStatus: 'completed',
            notes: 'Formwork stripped, 28-day break tests passed',
          },
        ],
      },
      {
        property: prop1._id,
        taskName: 'Structural Timber Framing & Sheathing',
        description: 'Erect exterior walls, interior load-bearing partitions, trusses, and OSB exterior sheathing.',
        category: 'Framing',
        assignedWorker: 'Marcus Brody (Lead Contractor)',
        workerPhone: '+1 (555) 456-7890',
        startDate: new Date('2026-09-02'),
        dueDate: new Date('2026-09-28'),
        completedDate: new Date('2026-09-27'),
        priority: 'high',
        estimatedCost: 52000,
        actualCost: 51200,
        notes: 'Framing completed ahead of schedule with premium Douglas fir studs.',
        status: 'completed',
        progressPhotos: [
          {
            url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
            caption: 'Framing floor layout chalked',
            stage: 'before',
            uploadedAt: new Date('2026-09-02'),
          },
          {
            url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
            caption: 'Wall frames being erected and braced',
            stage: 'during',
            uploadedAt: new Date('2026-09-14'),
          },
          {
            url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
            caption: 'Second story framing and roof trusses finished',
            stage: 'after',
            uploadedAt: new Date('2026-09-27'),
          },
        ],
        history: [
          {
            action: 'Completed',
            changedBy: 'Marcus Brody',
            timestamp: new Date('2026-09-27'),
            newStatus: 'completed',
            notes: 'Framing inspection passed by City of Austin',
          },
        ],
      },
      {
        property: prop1._id,
        taskName: 'Rough-in Electrical & Smart Wiring',
        description: 'Run conduit, 200A main panel, circuit wiring, recessed lighting cans, and Cat6 ethernet.',
        category: 'Electrical',
        assignedWorker: 'Derrick Hall (Master Electrician)',
        workerPhone: '+1 (512) 774-2201',
        startDate: new Date('2026-10-01'),
        dueDate: new Date('2026-10-18'),
        priority: 'high',
        estimatedCost: 24000,
        actualCost: 23000,
        notes: 'Rough-in 95% complete. Scheduled for municipal inspection tomorrow.',
        status: 'in_progress',
        progressPhotos: [
          {
            url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            caption: 'Stud bays before wire pulling',
            stage: 'before',
            uploadedAt: new Date('2026-10-01'),
          },
          {
            url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
            caption: 'Main distribution panels and wiring harnesses',
            stage: 'during',
            uploadedAt: new Date('2026-10-10'),
          },
        ],
        history: [
          {
            action: 'In Progress',
            changedBy: 'Derrick Hall',
            timestamp: new Date('2026-10-02'),
            newStatus: 'in_progress',
            notes: 'Conduits pulled through 1st and 2nd floor',
          },
        ],
      },
      {
        property: prop1._id,
        taskName: 'Plumbing Rough-in & Drain Waste Vent (DWV)',
        description: 'Install PEX-A water lines, PVC drain lines, toilet carrier frames, and tankless water heater lines.',
        category: 'Plumbing',
        assignedWorker: 'Antonio Russo (Licensed Plumber)',
        workerPhone: '+1 (512) 662-8819',
        startDate: new Date('2026-10-05'),
        dueDate: new Date('2026-10-22'),
        priority: 'medium',
        estimatedCost: 26000,
        actualCost: 18000,
        notes: 'Testing water lines with 80 PSI air pressure check.',
        status: 'in_progress',
        progressPhotos: [
          {
            url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
            caption: 'Rough-in plumbing in master bathroom',
            stage: 'during',
            uploadedAt: new Date('2026-10-12'),
          },
        ],
        history: [
          {
            action: 'Status Change',
            changedBy: 'Antonio Russo',
            timestamp: new Date('2026-10-05'),
            newStatus: 'in_progress',
            notes: 'PEX delivery received and installation underway',
          },
        ],
      },
      {
        property: prop1._id,
        taskName: 'HVAC Ductwork & Heat Pump Units',
        description: 'Install multi-zone ductwork, dampers, 5-ton high efficiency heat pump and ERV ventilation.',
        category: 'HVAC',
        assignedWorker: 'Jason Cole (Climate Systems)',
        workerPhone: '+1 (512) 991-3400',
        startDate: new Date('2026-10-15'),
        dueDate: new Date('2026-11-02'),
        priority: 'medium',
        estimatedCost: 32000,
        actualCost: 0,
        notes: 'Materials staged in garage area.',
        status: 'not_started',
        progressPhotos: [],
        history: [
          {
            action: 'Task Scheduled',
            changedBy: 'Elena Rostova',
            timestamp: new Date('2026-10-01'),
            notes: 'Awaiting completion of electrical rough-in',
          },
        ],
      },
      {
        property: prop1._id,
        taskName: 'Standing Seam Metal Roofing & Flashing',
        description: 'Install self-adhering underlayment, 24-gauge standing seam metal panels and ridge caps.',
        category: 'Roofing',
        assignedWorker: 'Viktor Romanov (Roofer Lead)',
        workerPhone: '+1 (512) 880-9912',
        startDate: new Date('2026-10-01'),
        dueDate: new Date('2026-10-14'), // OVERDUE TASK FOR REAL ALERT TESTING!
        priority: 'urgent',
        estimatedCost: 35000,
        actualCost: 28000,
        notes: 'Delayed due to custom metal panel shipment delay. Supplier confirmed arrival.',
        status: 'in_progress',
        progressPhotos: [
          {
            url: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=800&q=80',
            caption: 'Roof deck waterproof underlayment applied',
            stage: 'before',
            uploadedAt: new Date('2026-10-02'),
          },
        ],
        history: [
          {
            action: 'Overdue Warning',
            changedBy: 'System Watchdog',
            timestamp: new Date('2026-10-15'),
            notes: 'Task marked overdue. Priority escalated to urgent.',
          },
        ],
      },

      // PROPERTY 2 (Highland Craftsman Residence)
      {
        property: prop2._id,
        taskName: 'Excavation & Stepped Footings',
        description: 'Excavate hillside lot and form reinforced stepped concrete footers.',
        category: 'Foundation',
        assignedWorker: 'Tyler Vance',
        workerPhone: '+1 (303) 881-4433',
        startDate: new Date('2026-09-12'),
        dueDate: new Date('2026-09-25'),
        completedDate: new Date('2026-09-24'),
        priority: 'high',
        estimatedCost: 22000,
        actualCost: 21500,
        notes: 'Rocky subsoil handled with hydraulic breaker.',
        status: 'completed',
        progressPhotos: [
          {
            url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=800&q=80',
            caption: 'Hillside excavation slope profile',
            stage: 'during',
            uploadedAt: new Date('2026-09-16'),
          },
          {
            url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
            caption: 'Stepped concrete footers poured and backfilled',
            stage: 'after',
            uploadedAt: new Date('2026-09-24'),
          },
        ],
        history: [],
      },
      {
        property: prop2._id,
        taskName: 'Wood Framing & Subfloor System',
        description: 'Engineered I-joists subfloor system and exterior 2x6 timber wall construction.',
        category: 'Framing',
        assignedWorker: 'Marcus Brody',
        workerPhone: '+1 (555) 456-7890',
        startDate: new Date('2026-09-26'),
        dueDate: new Date('2026-10-16'), // OVERDUE
        priority: 'high',
        estimatedCost: 45000,
        actualCost: 42000,
        notes: 'Weather delay from Colorado mountain thunderstorm on Oct 10.',
        status: 'in_progress',
        progressPhotos: [
          {
            url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
            caption: 'Craftsman style rafters framing',
            stage: 'during',
            uploadedAt: new Date('2026-10-04'),
          },
        ],
        history: [],
      },
      {
        property: prop2._id,
        taskName: 'Exterior Stone Masonry & Cedar Siding',
        description: 'Natural Colorado flagstone wainscoting and horizontal cedar lap siding installation.',
        category: 'Exterior',
        assignedWorker: 'Mateo Sanchez',
        workerPhone: '+1 (512) 441-9922',
        startDate: new Date('2026-10-18'),
        dueDate: new Date('2026-11-10'),
        priority: 'medium',
        estimatedCost: 38000,
        actualCost: 0,
        notes: 'Stone quarry delivery scheduled for end of week.',
        status: 'not_started',
        progressPhotos: [],
        history: [],
      },
      {
        property: prop2._id,
        taskName: 'Energy Star Windows & Exterior Doors',
        description: 'Install triple-pane argon filled fiberglass casement windows and solid oak front door.',
        category: 'Carpentry',
        assignedWorker: 'Liam Gallagher',
        workerPhone: '+1 (303) 772-8819',
        startDate: new Date('2026-10-20'),
        dueDate: new Date('2026-11-05'),
        priority: 'medium',
        estimatedCost: 28000,
        actualCost: 0,
        notes: 'Windows delivered and inspected in clean warehouse.',
        status: 'not_started',
        progressPhotos: [],
        history: [],
      },

      // PROPERTY 3 (Oakridge Luxury Townhome - Near Completion)
      {
        property: prop3._id,
        taskName: 'Demolition & Structural Seismic Retrofit',
        description: 'Remove non-loadbearing walls, install steel moment frames and hold-down brackets.',
        category: 'Foundation',
        assignedWorker: 'Carlos Gutierrez',
        workerPhone: '+1 (512) 332-1100',
        startDate: new Date('2026-06-18'),
        dueDate: new Date('2026-07-10'),
        completedDate: new Date('2026-07-08'),
        priority: 'urgent',
        estimatedCost: 35000,
        actualCost: 34000,
        notes: 'Approved by structural engineering consultant.',
        status: 'completed',
        progressPhotos: [],
        history: [],
      },
      {
        property: prop3._id,
        taskName: 'Plumbing & Radiant Floor Heating Installation',
        description: 'PEX manifolds, uponor radiant tubing throughout 3 levels, condensing boiler.',
        category: 'Plumbing',
        assignedWorker: 'Antonio Russo',
        workerPhone: '+1 (512) 662-8819',
        startDate: new Date('2026-07-12'),
        dueDate: new Date('2026-08-05'),
        completedDate: new Date('2026-08-03'),
        priority: 'high',
        estimatedCost: 40000,
        actualCost: 41200,
        notes: 'Pressure test passed without any leaks.',
        status: 'completed',
        progressPhotos: [],
        history: [],
      },
      {
        property: prop3._id,
        taskName: 'Drywall Hanging, Taping & Level 5 Smooth Finish',
        description: 'Hang 5/8" fire-rated gypsum board, tape joints, skim coat to Level 5 mirror finish.',
        category: 'Drywall',
        assignedWorker: 'Miguel Santos',
        workerPhone: '+1 (206) 991-8844',
        startDate: new Date('2026-08-10'),
        dueDate: new Date('2026-09-02'),
        completedDate: new Date('2026-08-30'),
        priority: 'medium',
        estimatedCost: 28000,
        actualCost: 26500,
        notes: 'Level 5 skim coat accepted by designer.',
        status: 'completed',
        progressPhotos: [
          {
            url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            caption: 'Bare framing with insulation prior to drywall',
            stage: 'before',
            uploadedAt: new Date('2026-08-10'),
          },
          {
            url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
            caption: 'Sheetrock hung and first coat applied',
            stage: 'during',
            uploadedAt: new Date('2026-08-20'),
          },
          {
            url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
            caption: 'Flawless Level 5 primer coat applied',
            stage: 'after',
            uploadedAt: new Date('2026-08-30'),
          },
        ],
        history: [],
      },
      {
        property: prop3._id,
        taskName: 'Hardwood Flooring & Custom Tile Work',
        description: 'Install 7" wide European white oak plank flooring and terrazzo tiles in bathrooms.',
        category: 'Flooring',
        assignedWorker: 'Sergei Volkov',
        workerPhone: '+1 (206) 441-2299',
        startDate: new Date('2026-09-05'),
        dueDate: new Date('2026-09-26'),
        completedDate: new Date('2026-09-25'),
        priority: 'high',
        estimatedCost: 36000,
        actualCost: 37500,
        notes: 'Matte polyurethane protective coats applied.',
        status: 'completed',
        progressPhotos: [],
        history: [],
      },
      {
        property: prop3._id,
        taskName: 'Interior Paint & Designer Wallpaper Accents',
        description: 'Prime and apply two coats Benjamin Moore Regal Select matte finish.',
        category: 'Painting',
        assignedWorker: 'Clara Oswald',
        workerPhone: '+1 (206) 883-1199',
        startDate: new Date('2026-09-28'),
        dueDate: new Date('2026-10-15'),
        completedDate: new Date('2026-10-14'),
        priority: 'medium',
        estimatedCost: 19000,
        actualCost: 18400,
        notes: 'Master suite accent wall completed in textured charcoal linen.',
        status: 'completed',
        progressPhotos: [
          {
            url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
            caption: 'Tape and mask before spray application',
            stage: 'during',
            uploadedAt: new Date('2026-10-02'),
          },
          {
            url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
            caption: 'Finished paint coat in warm off-white tones',
            stage: 'after',
            uploadedAt: new Date('2026-10-14'),
          },
        ],
        history: [],
      },
      {
        property: prop3._id,
        taskName: 'Kitchen Cabinetry & Quartz Countertops',
        description: 'Install custom flat-panel walnut cabinets, quartz waterfall island, and built-in appliances.',
        category: 'Interior Finish',
        assignedWorker: 'Liam Gallagher',
        workerPhone: '+1 (303) 772-8819',
        startDate: new Date('2026-10-12'),
        dueDate: new Date('2026-10-28'),
        priority: 'urgent',
        estimatedCost: 48000,
        actualCost: 45000,
        notes: 'Island quartz slab installed. Mounting induction cooktop and downdraft hood.',
        status: 'in_progress',
        progressPhotos: [
          {
            url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
            caption: 'Kitchen space ready for cabinet boxes',
            stage: 'before',
            uploadedAt: new Date('2026-10-12'),
          },
          {
            url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
            caption: 'Walnut cabinets installed with quartz countertop template',
            stage: 'during',
            uploadedAt: new Date('2026-10-16'),
          },
        ],
        history: [],
      },
      {
        property: prop3._id,
        taskName: 'Final Electrical Trim & Architectural Fixtures',
        description: 'Mount designer chandeliers, Lutron smart dimmers, and LED toe-kick ambient lighting.',
        category: 'Electrical',
        assignedWorker: 'Derrick Hall',
        workerPhone: '+1 (512) 774-2201',
        startDate: new Date('2026-10-25'),
        dueDate: new Date('2026-11-05'),
        priority: 'medium',
        estimatedCost: 15000,
        actualCost: 0,
        notes: 'Pendant lights arrived from Italy.',
        status: 'not_started',
        progressPhotos: [],
        history: [],
      },
      {
        property: prop3._id,
        taskName: 'Final Building & Fire Safety Inspection',
        description: 'Final walkthrough with Seattle Department of Construction & Inspections (SDCI).',
        category: 'Inspection',
        assignedWorker: 'Elena Rostova (PM)',
        workerPhone: '+1 (555) 345-6789',
        startDate: new Date('2026-11-10'),
        dueDate: new Date('2026-11-15'),
        priority: 'urgent',
        estimatedCost: 2500,
        actualCost: 0,
        notes: 'Booking appointment on SDCI portal.',
        status: 'not_started',
        progressPhotos: [],
        history: [],
      },

      // PROPERTY 4 (Sunset Valley Estate - Foundation Stage)
      {
        property: prop4._id,
        taskName: 'Boundary Survey & Civil Permitting',
        description: 'Obtain coastal zone development permits and boundary staking.',
        category: 'Inspection',
        assignedWorker: 'Elena Rostova',
        workerPhone: '+1 (555) 345-6789',
        startDate: new Date('2026-10-02'),
        dueDate: new Date('2026-10-12'),
        completedDate: new Date('2026-10-11'),
        priority: 'urgent',
        estimatedCost: 8000,
        actualCost: 7500,
        notes: 'All city permits stamped and posted on site signboard.',
        status: 'completed',
        progressPhotos: [],
        history: [],
      },
      {
        property: prop4._id,
        taskName: 'Heavy Excavation & Retaining Caissons',
        description: 'Drill 30-foot deep concrete caissons into bedrock for coastal stability.',
        category: 'Foundation',
        assignedWorker: 'Carlos Gutierrez',
        workerPhone: '+1 (512) 332-1100',
        startDate: new Date('2026-10-12'),
        dueDate: new Date('2026-10-31'),
        priority: 'urgent',
        estimatedCost: 65000,
        actualCost: 42000,
        notes: '12 out of 18 caissons drilled and poured.',
        status: 'in_progress',
        progressPhotos: [
          {
            url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=800&q=80',
            caption: 'Drilling rig on hillside position',
            stage: 'during',
            uploadedAt: new Date('2026-10-14'),
          },
        ],
        history: [],
      },
    ];

    await Task.insertMany(tasksData);
    console.log(`[Seed] Created ${tasksData.length} tasks`);

    // Recalculate progress for all properties
    await recalculatePropertyProgress(prop1._id.toString());
    await recalculatePropertyProgress(prop2._id.toString());
    await recalculatePropertyProgress(prop3._id.toString());
    await recalculatePropertyProgress(prop4._id.toString());
    console.log('[Seed] Calculated live property progress percentages');

    // 5. Create Reminders for upcoming deadlines, overdue tasks, inspections
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const threeDaysStr = threeDaysLater.toISOString().split('T')[0];

    const remindersData = [
      {
        title: 'Municipal Electrical Rough-in Inspection',
        description: 'City inspector arriving at Skyline Modern Villa at 10:00 AM. Electrician Derrick Hall must be on site with plans.',
        property: prop1._id,
        reminderDate: tomorrowStr,
        reminderTime: '09:00',
        type: 'inspection',
        priority: 'urgent',
        status: 'pending',
        channels: ['browser', 'in_app', 'email'],
        notificationKey: `prop1-inspect-${tomorrowStr}`,
      },
      {
        title: 'Roofing Overdue Resolution Meeting',
        description: 'Follow-up with metal roofing supplier regarding delayed flashing panels delivery for Skyline Villa.',
        property: prop1._id,
        reminderDate: todayStr,
        reminderTime: '14:30',
        type: 'deadline',
        priority: 'high',
        status: 'pending',
        channels: ['browser', 'in_app'],
        notificationKey: `prop1-roof-delay-${todayStr}`,
      },
      {
        title: 'Weekly Progress Photo Walkthrough with Rajesh Sharma',
        description: 'Bi-weekly owner sync to review drywall and rough plumbing progress.',
        property: prop1._id,
        reminderDate: threeDaysStr,
        reminderTime: '16:00',
        type: 'general',
        priority: 'medium',
        status: 'pending',
        channels: ['browser', 'in_app', 'whatsapp'],
        notificationKey: `prop1-owner-sync-${threeDaysStr}`,
      },
      {
        title: 'Review Highland Craftsman Framing Weather Recovery',
        description: 'Inspect joist alignment after mountain thunderstorm rain delay.',
        property: prop2._id,
        reminderDate: todayStr,
        reminderTime: '11:00',
        type: 'task_due',
        priority: 'medium',
        status: 'pending',
        channels: ['browser', 'in_app'],
        notificationKey: `prop2-frame-check-${todayStr}`,
      },
      {
        title: 'Kitchen Countertop Waterfall Seam Approval',
        description: 'Owner Linda Miller visiting site to approve bookmatched quartz veining layout.',
        property: prop3._id,
        reminderDate: tomorrowStr,
        reminderTime: '13:00',
        type: 'general',
        priority: 'high',
        status: 'pending',
        channels: ['browser', 'in_app'],
        notificationKey: `prop3-counter-check-${tomorrowStr}`,
      },
    ];

    await Reminder.insertMany(remindersData);
    console.log(`[Seed] Created ${remindersData.length} active reminders`);

    console.log('[Seed] Database successfully populated!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seed();
