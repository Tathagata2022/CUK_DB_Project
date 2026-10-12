const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  console.log('Seeding database for Central University of Kerala...');

  // 1. Academic Years
  const ay2026 = await prisma.academicYear.upsert({
    where: { year: '2026-27' },
    update: { isActive: true },
    create: {
      year: '2026-27',
      isActive: true,
    },
  });

  const ay2025 = await prisma.academicYear.upsert({
    where: { year: '2025-26' },
    update: { isActive: false },
    create: {
      year: '2025-26',
      isActive: false,
    },
  });

  // 2. Departments & Sections
  const deptCS = await prisma.department.upsert({
    where: { code: 'CS' },
    update: { school: 'School of Physical Sciences', type: 'DEPARTMENT' },
    create: {
      name: 'Computer Science',
      code: 'CS',
      school: 'School of Physical Sciences',
      type: 'DEPARTMENT',
    },
  });

  const deptEcon = await prisma.department.upsert({
    where: { code: 'ECON' },
    update: { school: 'School of Humanities', type: 'DEPARTMENT' },
    create: {
      name: 'Economics',
      code: 'ECON',
      school: 'School of Humanities',
      type: 'DEPARTMENT',
    },
  });

  const deptPhysics = await prisma.department.upsert({
    where: { code: 'PHY' },
    update: { school: 'School of Physical Sciences', type: 'DEPARTMENT' },
    create: {
      name: 'Physics',
      code: 'PHY',
      school: 'School of Physical Sciences',
      type: 'DEPARTMENT',
    },
  });

  const secExam = await prisma.department.upsert({
    where: { code: 'EXAM' },
    update: { school: 'Administration & Examination', type: 'SECTION' },
    create: {
      name: 'Examinations Section',
      code: 'EXAM',
      school: 'Administration & Examination',
      type: 'SECTION',
    },
  });

  // 3. Users for all 4 roles
  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@cukerala.ac.in' },
    update: { passwordHash, role: 'ADMIN' },
    create: {
      email: 'admin@cukerala.ac.in',
      name: 'Registrar / System Admin',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // Competent Authority
  await prisma.user.upsert({
    where: { email: 'authority@cukerala.ac.in' },
    update: {},
    create: {
      email: 'authority@cukerala.ac.in',
      name: 'Vice Chancellor Office / IQAC Dir.',
      passwordHash,
      role: 'COMPETENT_AUTHORITY',
    },
  });

  // CS Users (HoD and Dept User)
  const hodCS = await prisma.user.upsert({
    where: { email: 'hod_cs@cukerala.ac.in' },
    update: {},
    create: {
      email: 'hod_cs@cukerala.ac.in',
      name: 'Prof. K. Rajendran (HoD CS)',
      passwordHash,
      role: 'HOD',
      departmentId: deptCS.id,
    },
  });

  const userCS = await prisma.user.upsert({
    where: { email: 'user_cs@cukerala.ac.in' },
    update: {},
    create: {
      email: 'user_cs@cukerala.ac.in',
      name: 'Arun V. (CS Nodal Officer)',
      passwordHash,
      role: 'DEPARTMENT_USER',
      departmentId: deptCS.id,
    },
  });

  // Economics Users
  await prisma.user.upsert({
    where: { email: 'hod_econ@cukerala.ac.in' },
    update: {},
    create: {
      email: 'hod_econ@cukerala.ac.in',
      name: 'Dr. Meera Nair (HoD Econ)',
      passwordHash,
      role: 'HOD',
      departmentId: deptEcon.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user_econ@cukerala.ac.in' },
    update: {},
    create: {
      email: 'user_econ@cukerala.ac.in',
      name: 'Ramesh P. (Econ Data Assistant)',
      passwordHash,
      role: 'DEPARTMENT_USER',
      departmentId: deptEcon.id,
    },
  });

  // 4. Templates matching Document specifications
  // Template 1: Department Faculty Strength
  let tplFaculty = await prisma.template.findFirst({ where: { name: 'Department Faculty Strength' } });
  if (!tplFaculty) {
    tplFaculty = await prisma.template.create({
      data: {
        name: 'Department Faculty Strength',
        description: 'Annual sanctioned and in-position teaching faculty strength details (Professor, Associate, Assistant).',
        category: 'Faculty',
        fields: {
          create: [
            { name: 'Professor', type: 'number', required: true, order: 0 },
            { name: 'Associate Professor', type: 'number', required: true, order: 1 },
            { name: 'Assistant Professor', type: 'number', required: true, order: 2 },
            { name: 'Sanctioned Strength', type: 'number', required: true, order: 3 },
            { name: 'Supporting Sanction Order (PDF)', type: 'file', required: false, order: 4 },
          ],
        },
      },
    });
  }

  // Template 2: Student Strength
  let tplStudent = await prisma.template.findFirst({ where: { name: 'Student Strength' } });
  if (!tplStudent) {
    tplStudent = await prisma.template.create({
      data: {
        name: 'Student Strength',
        description: 'Total enrolled students across UG, PG and PhD programmes for NIRF & NAAC consolidation.',
        category: 'Students',
        fields: {
          create: [
            { name: 'UG Students', type: 'number', required: true, order: 0 },
            { name: 'PG Students', type: 'number', required: true, order: 1 },
            { name: 'PhD Scholars', type: 'number', required: true, order: 2 },
            { name: 'Total Enrolled', type: 'number', required: true, order: 3 },
            { name: 'Admission Register Excerpt (PDF)', type: 'file', required: false, order: 4 },
          ],
        },
      },
    });
  }

  // Template 3: Research Projects & Grants
  let tplResearch = await prisma.template.findFirst({ where: { name: 'Research Projects & Grants' } });
  if (!tplResearch) {
    tplResearch = await prisma.template.create({
      data: {
        name: 'Research Projects & Grants',
        description: 'Sponsored research projects funded by DST, SERB, UGC, ICSSR or industry partners.',
        category: 'Research',
        fields: {
          create: [
            { name: 'Project Title', type: 'text', required: true, order: 0 },
            { name: 'Principal Investigator', type: 'text', required: true, order: 1 },
            { name: 'Funding Agency', type: 'text', required: true, order: 2 },
            { name: 'Sanctioned Amount (Lakhs INR)', type: 'number', required: true, order: 3 },
            { name: 'Sanction Date', type: 'date', required: true, order: 4 },
            { name: 'Sanction Order Evidence (PDF)', type: 'file', required: false, order: 5 },
          ],
        },
      },
    });
  }

  // Template 4: Department Infrastructure & Labs
  let tplInfra = await prisma.template.findFirst({ where: { name: 'Department Infrastructure & Labs' } });
  if (!tplInfra) {
    tplInfra = await prisma.template.create({
      data: {
        name: 'Department Infrastructure & Labs',
        description: 'Laboratory facilities, smart classrooms, and computing infrastructure audit.',
        category: 'Infrastructure',
        fields: {
          create: [
            { name: 'Total Carpet Area (sq. m)', type: 'number', required: true, order: 0 },
            { name: 'Specialized Research Labs', type: 'number', required: true, order: 1 },
            { name: 'High Performance Computing Nodes', type: 'number', required: true, order: 2 },
            { name: 'Smart Classrooms', type: 'number', required: true, order: 3 },
            { name: 'Facility Audit Report (PDF)', type: 'file', required: false, order: 4 },
          ],
        },
      },
    });
  }

  // 5. Pre-seeded Submissions across different stages of the 5-step workflow:
  // CS - Faculty Strength: SUBMITTED (Ready for HoD to verify)
  const facultyFields = await prisma.templateField.findMany({ where: { templateId: tplFaculty.id } });
  const csFacultyData = {};
  facultyFields.forEach(f => {
    if (f.name === 'Professor') csFacultyData[f.id] = 5;
    if (f.name === 'Associate Professor') csFacultyData[f.id] = 7;
    if (f.name === 'Assistant Professor') csFacultyData[f.id] = 12;
    if (f.name === 'Sanctioned Strength') csFacultyData[f.id] = 24;
    if (f.name.includes('Sanction Order')) csFacultyData[f.id] = { name: 'CS_Faculty_Sanction_2026.pdf', base64: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...' };
  });

  await prisma.submission.upsert({
    where: {
      templateId_departmentId_academicYearId: {
        templateId: tplFaculty.id,
        departmentId: deptCS.id,
        academicYearId: ay2026.id,
      },
    },
    update: {},
    create: {
      templateId: tplFaculty.id,
      departmentId: deptCS.id,
      academicYearId: ay2026.id,
      status: 'SUBMITTED',
      data: JSON.stringify(csFacultyData),
      submittedAt: new Date(),
    },
  });

  // CS - Student Strength: DRAFT (Dept user can edit and submit)
  const studentFields = await prisma.templateField.findMany({ where: { templateId: tplStudent.id } });
  const csStudentData = {};
  studentFields.forEach(f => {
    if (f.name === 'UG Students') csStudentData[f.id] = 80;
    if (f.name === 'PG Students') csStudentData[f.id] = 120;
    if (f.name === 'PhD Scholars') csStudentData[f.id] = 35;
    if (f.name === 'Total Enrolled') csStudentData[f.id] = 235;
  });

  await prisma.submission.upsert({
    where: {
      templateId_departmentId_academicYearId: {
        templateId: tplStudent.id,
        departmentId: deptCS.id,
        academicYearId: ay2026.id,
      },
    },
    update: {},
    create: {
      templateId: tplStudent.id,
      departmentId: deptCS.id,
      academicYearId: ay2026.id,
      status: 'DRAFT',
      data: JSON.stringify(csStudentData),
    },
  });

  // Economics - Faculty Strength: UNDER_REVIEW (HoD verified, waiting for Competent Authority)
  const econFacultyData = {};
  facultyFields.forEach(f => {
    if (f.name === 'Professor') econFacultyData[f.id] = 4;
    if (f.name === 'Associate Professor') econFacultyData[f.id] = 6;
    if (f.name === 'Assistant Professor') econFacultyData[f.id] = 10;
    if (f.name === 'Sanctioned Strength') econFacultyData[f.id] = 20;
  });

  await prisma.submission.upsert({
    where: {
      templateId_departmentId_academicYearId: {
        templateId: tplFaculty.id,
        departmentId: deptEcon.id,
        academicYearId: ay2026.id,
      },
    },
    update: {},
    create: {
      templateId: tplFaculty.id,
      departmentId: deptEcon.id,
      academicYearId: ay2026.id,
      status: 'UNDER_REVIEW',
      data: JSON.stringify(econFacultyData),
      remarks: 'Verified by HoD Dr. Meera Nair on 10-Oct-2026',
      submittedAt: new Date(Date.now() - 86400000),
    },
  });

  // Physics - Student Strength: VERIFIED (Competent Authority endorsed, Admin can mark Completed)
  const phyStudentData = {};
  studentFields.forEach(f => {
    if (f.name === 'UG Students') phyStudentData[f.id] = 70;
    if (f.name === 'PG Students') phyStudentData[f.id] = 110;
    if (f.name === 'PhD Scholars') phyStudentData[f.id] = 30;
    if (f.name === 'Total Enrolled') phyStudentData[f.id] = 210;
  });

  await prisma.submission.upsert({
    where: {
      templateId_departmentId_academicYearId: {
        templateId: tplStudent.id,
        departmentId: deptPhysics.id,
        academicYearId: ay2026.id,
      },
    },
    update: {},
    create: {
      templateId: tplStudent.id,
      departmentId: deptPhysics.id,
      academicYearId: ay2026.id,
      status: 'VERIFIED',
      data: JSON.stringify(phyStudentData),
      remarks: 'Endorsed by IQAC Director. Compliant with NIRF reporting guidelines.',
      submittedAt: new Date(Date.now() - 172800000),
    },
  });

  // Physics - Infrastructure: COMPLETED
  const infraFields = await prisma.templateField.findMany({ where: { templateId: tplInfra.id } });
  const phyInfraData = {};
  infraFields.forEach(f => {
    if (f.name.includes('Carpet')) phyInfraData[f.id] = 4500;
    if (f.name.includes('Research Labs')) phyInfraData[f.id] = 6;
    if (f.name.includes('Computing')) phyInfraData[f.id] = 24;
    if (f.name.includes('Smart Classrooms')) phyInfraData[f.id] = 4;
  });

  await prisma.submission.upsert({
    where: {
      templateId_departmentId_academicYearId: {
        templateId: tplInfra.id,
        departmentId: deptPhysics.id,
        academicYearId: ay2026.id,
      },
    },
    update: {},
    create: {
      templateId: tplInfra.id,
      departmentId: deptPhysics.id,
      academicYearId: ay2026.id,
      status: 'COMPLETED',
      data: JSON.stringify(phyInfraData),
      remarks: 'Finalized and archived for Annual Report 2026-27.',
      submittedAt: new Date(Date.now() - 259200000),
    },
  });

  // Economics - Student Strength: RETURNED (needs correction by Dept User)
  const econStudentData = {};
  studentFields.forEach(f => {
    if (f.name === 'UG Students') econStudentData[f.id] = 60;
    if (f.name === 'PG Students') econStudentData[f.id] = 95;
    if (f.name === 'PhD Scholars') econStudentData[f.id] = 12; // incorrect
    if (f.name === 'Total Enrolled') econStudentData[f.id] = 167;
  });

  await prisma.submission.upsert({
    where: {
      templateId_departmentId_academicYearId: {
        templateId: tplStudent.id,
        departmentId: deptEcon.id,
        academicYearId: ay2026.id,
      },
    },
    update: {},
    create: {
      templateId: tplStudent.id,
      departmentId: deptEcon.id,
      academicYearId: ay2026.id,
      status: 'RETURNED',
      data: JSON.stringify(econStudentData),
      remarks: 'PhD scholars count does not include new autumn batch admissions. Please rectify to 28.',
      submittedAt: new Date(Date.now() - 86400000 * 2),
    },
  });

  // 6. Audit Trail initial logs
  await prisma.auditLog.create({
    data: {
      userId: userCS.id,
      action: 'SUBMITTED',
      record: 'Faculty Strength (CS)',
      newValue: 'Submitted with 24 total faculty members and sanction evidence order.',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: hodCS.id,
      action: 'REVIEW_OPENED',
      record: 'Faculty Strength (CS)',
      newValue: 'HoD opened submission for technical scrutiny.',
    },
  });

  console.log('Seed completed successfully!');
  console.log('Users ready:');
  console.log('  Admin: admin@cukerala.ac.in (password123)');
  console.log('  Authority: authority@cukerala.ac.in (password123)');
  console.log('  HoD (CS): hod_cs@cukerala.ac.in (password123)');
  console.log('  Dept (CS): user_cs@cukerala.ac.in (password123)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
