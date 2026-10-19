const BASE_URL = 'http://localhost:5001/api';

const api = async (endpoint: string, options: any = {}) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
};

const runTest = async () => {
  console.log('=== [TEST] Starting Account Isolation & Zero Default Data Verification ===\n');

  // 1. Sign in as Rohit Kumar
  console.log('[Test 1] Logging in as Rohit Kumar (rohit@example.com)...');
  const rohitLogin = await api('/auth/login', {
    method: 'POST',
    body: {
      email: 'rohit@example.com',
      password: 'mypassword123',
    },
  });
  const rohitToken = rohitLogin.token;
  const rohitHeaders = { headers: { Authorization: `Bearer ${rohitToken}` } };
  console.log(' -> Logged in successfully. User:', rohitLogin.user.name);

  // 2. Fetch Rohit's dashboard summary
  console.log('[Test 2] Checking Rohit\'s initial Dashboard counts (must be 0 default data)...');
  const rohitDash1 = await api('/dashboard/summary', rohitHeaders);
  console.log(' -> Rohit Initial Counts:', rohitDash1.counts);
  if (rohitDash1.counts.totalOwners !== 0 || rohitDash1.counts.totalProperties !== 0) {
    throw new Error('Default data still present on Rohit account!');
  }
  console.log(' -> PASS: Zero default data found.\n');

  // 3. Rohit adds a House Owner
  console.log('[Test 3] Rohit creating a new Owner record...');
  const ownerRes = await api('/owners', {
    method: 'POST',
    ...rohitHeaders,
    body: {
      name: 'Mr. Rajesh Sharma',
      email: 'rajesh.sharma@example.com',
      phone: '+91 98765 43210',
      address: 'Plot 42, Green Park Avenue',
      city: 'Gurugram',
      state: 'Haryana',
    },
  });
  const rohitOwnerId = ownerRes.owner._id;
  console.log(' -> Created Owner ID:', rohitOwnerId, 'Name:', ownerRes.owner.name);

  // 4. Rohit adds a Property
  console.log('[Test 4] Rohit creating a new Property for this Owner...');
  const propRes = await api('/properties', {
    method: 'POST',
    ...rohitHeaders,
    body: {
      propertyId: 'PROP-DEL-101',
      name: 'Sharma Villa Construction',
      address: 'Plot 42, Green Park Avenue',
      city: 'Gurugram',
      state: 'Haryana',
      owner: rohitOwnerId,
      startDate: '2026-10-01',
      expectedCompletionDate: '2027-04-30',
      estimatedBudget: 7500000,
    },
  });
  const rohitPropId = propRes.property._id;
  console.log(' -> Created Property ID:', rohitPropId, 'Name:', propRes.property.name);

  // 5. Rohit adds a Task
  console.log('[Test 5] Rohit creating a Task for this Property...');
  const taskRes = await api('/tasks', {
    method: 'POST',
    ...rohitHeaders,
    body: {
      property: rohitPropId,
      taskName: 'Foundation & RCC Pillars',
      category: 'Foundation',
      assignedWorker: 'Suresh Kumar Contractors',
      workerPhone: '+91 91234 56789',
      startDate: '2026-10-05',
      dueDate: '2026-10-30',
      priority: 'high',
      estimatedCost: 850000,
      actualCost: 800000,
      status: 'in_progress',
    },
  });
  console.log(' -> Created Task ID:', taskRes.task._id, 'Name:', taskRes.task.taskName);

  // 6. Check Rohit's updated Dashboard summary
  console.log('[Test 6] Verifying Rohit\'s updated Dashboard counts...');
  const rohitDash2 = await api('/dashboard/summary', rohitHeaders);
  console.log(' -> Rohit Updated Counts:', rohitDash2.counts);
  if (
    rohitDash2.counts.totalOwners !== 1 ||
    rohitDash2.counts.totalProperties !== 1 ||
    rohitDash2.counts.totalTasks !== 1
  ) {
    throw new Error('Counts did not match Rohit\'s added items!');
  }
  console.log(' -> PASS: Rohit\'s data is accurately saved.\n');

  // 7. Register a completely new user account: Alice
  const aliceEmail = `alice.${Date.now()}@example.com`;
  console.log(`[Test 7] Registering a new separate user account: ${aliceEmail}...`);
  const aliceReg = await api('/auth/register', {
    method: 'POST',
    body: {
      name: 'Alice Smith',
      email: aliceEmail,
      password: 'securepassword123',
      role: 'project_manager',
    },
  });
  const aliceToken = aliceReg.token;
  const aliceHeaders = { headers: { Authorization: `Bearer ${aliceToken}` } };
  console.log(' -> Alice registered successfully.');

  // 8. Check Alice's Dashboard summary (must be 0 - CANNOT see Rohit's data!)
  console.log('[Test 8] Checking Alice\'s Dashboard (Account Isolation test)...');
  const aliceDash = await api('/dashboard/summary', aliceHeaders);
  console.log(' -> Alice Counts:', aliceDash.counts);
  if (
    aliceDash.counts.totalOwners !== 0 ||
    aliceDash.counts.totalProperties !== 0 ||
    aliceDash.counts.totalTasks !== 0
  ) {
    throw new Error('LEAK DETECTED! Alice is seeing records from another account!');
  }
  console.log(' -> PASS: Complete data isolation confirmed. Alice sees 0 records.');

  // 9. Alice fetches Owners list (must be empty array)
  const aliceOwners = await api('/owners', aliceHeaders);
  if (aliceOwners.owners.length !== 0) {
    throw new Error('Alice received owners from another account!');
  }
  console.log(' -> PASS: Alice owners list is completely empty.');

  // 10. Verify Rohit's data is still intact
  console.log('[Test 10] Confirming Rohit\'s data remains permanently saved...');
  const rohitOwnersCheck = await api('/owners', rohitHeaders);
  console.log(` -> Rohit has ${rohitOwnersCheck.owners.length} owner(s): ${rohitOwnersCheck.owners[0].name}`);
  console.log(' -> PASS: All data is permanently preserved under Rohit\'s account.\n');

  console.log('🎉 ALL 10 TESTS PASSED SUCCESSFULLY! Real-time user account scoping verified.');
};

runTest().catch((err) => {
  console.error('❌ Test Failed:', err.message);
  process.exit(1);
});
