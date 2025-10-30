import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Permissions
  console.log('Creating permissions...');
  const permissions = [
    // Places
    { name: 'places.create', resource: 'places', action: 'create', description: 'Create places' },
    { name: 'places.read', resource: 'places', action: 'read', description: 'Read places' },
    { name: 'places.update', resource: 'places', action: 'update', description: 'Update places' },
    { name: 'places.delete', resource: 'places', action: 'delete', description: 'Delete places' },

    // Blogs
    { name: 'blogs.create', resource: 'blogs', action: 'create', description: 'Create blogs' },
    { name: 'blogs.read', resource: 'blogs', action: 'read', description: 'Read blogs' },
    { name: 'blogs.update', resource: 'blogs', action: 'update', description: 'Update blogs' },
    { name: 'blogs.delete', resource: 'blogs', action: 'delete', description: 'Delete blogs' },

    // Media
    { name: 'media.upload', resource: 'media', action: 'create', description: 'Upload media' },
    { name: 'media.delete', resource: 'media', action: 'delete', description: 'Delete media' },

    // Comments
    { name: 'comments.approve', resource: 'comments', action: 'approve', description: 'Approve comments' },
    { name: 'comments.delete', resource: 'comments', action: 'delete', description: 'Delete any comment' },

    // Categories
    { name: 'categories.create', resource: 'categories', action: 'create', description: 'Create categories' },
    { name: 'categories.update', resource: 'categories', action: 'update', description: 'Update categories' },
    { name: 'categories.delete', resource: 'categories', action: 'delete', description: 'Delete categories' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  console.log(`✅ Created ${permissions.length} permissions`);

  // Create Roles
  console.log('Creating roles...');

  // Super Admin Role
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: {
      name: 'super_admin',
      description: 'Super administrator with full access',
    },
  });

  // Admin Role
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with most permissions',
    },
  });

  // Author Role
  const authorRole = await prisma.role.upsert({
    where: { name: 'author' },
    update: {},
    create: {
      name: 'author',
      description: 'Can create and manage blogs',
    },
  });

  // User Role
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user with limited permissions',
    },
  });

  console.log('✅ Created 4 roles');

  // Assign permissions to roles
  console.log('Assigning permissions to roles...');

  // Admin gets most permissions (not super admin)
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Author gets blog and media permissions
  const authorPermissionNames = [
    'blogs.create',
    'blogs.read',
    'blogs.update',
    'media.upload',
    'places.read',
  ];

  for (const permName of authorPermissionNames) {
    const permission = await prisma.permission.findUnique({
      where: { name: permName },
    });
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: authorRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: authorRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // User gets read permissions only
  const userPermissionNames = ['places.read', 'blogs.read'];

  for (const permName of userPermissionNames) {
    const permission = await prisma.permission.findUnique({
      where: { name: permName },
    });
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: userRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log('✅ Assigned permissions to roles');

  // Create super admin user (ID will be 1)
  console.log('Creating super admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@tourism.local' },
    update: {},
    create: {
      email: 'admin@tourism.local',
      password: hashedPassword,
      name: 'Super Admin',
      roleId: superAdminRole.id,
      isActive: true,
    },
  });

  console.log('✅ Created super admin user');
  console.log(`   Email: admin@tourism.local`);
  console.log(`   Password: admin123`);
  console.log(`   User ID: ${superAdmin.id} (has access to everything)`);

  // Create additional users with different roles
  console.log('Creating additional users...');

  // Create Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin.user@tourism.local' },
    update: {},
    create: {
      email: 'admin.user@tourism.local',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin User',
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log('✅ Created admin user');
  console.log(`   Email: admin.user@tourism.local`);
  console.log(`   Password: admin123`);
  console.log(`   Role: Admin (has all permissions)`);

  // Create Author user
  const authorUser = await prisma.user.upsert({
    where: { email: 'author@tourism.local' },
    update: {},
    create: {
      email: 'author@tourism.local',
      password: await bcrypt.hash('author123', 10),
      name: 'Travel Author',
      roleId: authorRole.id,
      isActive: true,
    },
  });

  console.log('✅ Created author user');
  console.log(`   Email: author@tourism.local`);
  console.log(`   Password: author123`);
  console.log(`   Role: Author (can create/update blogs, upload media)`);

  // Create regular User
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@tourism.local' },
    update: {},
    create: {
      email: 'user@tourism.local',
      password: await bcrypt.hash('user123', 10),
      name: 'Regular User',
      roleId: userRole.id,
      isActive: true,
    },
  });

  console.log('✅ Created regular user');
  console.log(`   Email: user@tourism.local`);
  console.log(`   Password: user123`);
  console.log(`   Role: User (can view content and comment)`);

  // Create another author for variety
  const authorUser2 = await prisma.user.upsert({
    where: { email: 'jane.writer@tourism.local' },
    update: {},
    create: {
      email: 'jane.writer@tourism.local',
      password: await bcrypt.hash('writer123', 10),
      name: 'Jane Writer',
      roleId: authorRole.id,
      isActive: true,
    },
  });

  console.log('✅ Created second author user');
  console.log(`   Email: jane.writer@tourism.local`);
  console.log(`   Password: writer123`);
  console.log(`   Role: Author`);

  // Create sample categories
  console.log('Creating sample categories...');
  const categories = [
    { name: 'Attractions', slug: 'attractions', icon: '🎡' },
    { name: 'Restaurants', slug: 'restaurants', icon: '🍴' },
    { name: 'Hotels', slug: 'hotels', icon: '🏨' },
    { name: 'Beaches', slug: 'beaches', icon: '🏖️' },
    { name: 'Museums', slug: 'museums', icon: '🏛️' },
    { name: 'Travel Guides', slug: 'travel-guides', icon: '📖' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('✅ Created 6 sample categories');

  // Create sample tags
  console.log('Creating sample tags...');
  const tags = [
    { name: 'Family Friendly', slug: 'family-friendly' },
    { name: 'Romantic', slug: 'romantic' },
    { name: 'Adventure', slug: 'adventure' },
    { name: 'Cultural', slug: 'cultural' },
    { name: 'Nature', slug: 'nature' },
    { name: 'Budget', slug: 'budget' },
    { name: 'Luxury', slug: 'luxury' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  console.log('✅ Created 7 sample tags');

  console.log('');
  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📝 Quick reference:');
  console.log('');
  console.log('👥 USER ACCOUNTS:');
  console.log('   ┌─────────────────────────────────────────────────────────┐');
  console.log('   │ Super Admin (ID 1) - Full Access to Everything         │');
  console.log('   │ Email: admin@tourism.local                              │');
  console.log('   │ Password: admin123                                      │');
  console.log('   └─────────────────────────────────────────────────────────┘');
  console.log('');
  console.log('   ┌─────────────────────────────────────────────────────────┐');
  console.log('   │ Admin User - All Permissions (except super admin)      │');
  console.log('   │ Email: admin.user@tourism.local                         │');
  console.log('   │ Password: admin123                                      │');
  console.log('   └─────────────────────────────────────────────────────────┘');
  console.log('');
  console.log('   ┌─────────────────────────────────────────────────────────┐');
  console.log('   │ Author #1 - Can create/update blogs, upload media      │');
  console.log('   │ Email: author@tourism.local                             │');
  console.log('   │ Password: author123                                     │');
  console.log('   └─────────────────────────────────────────────────────────┘');
  console.log('');
  console.log('   ┌─────────────────────────────────────────────────────────┐');
  console.log('   │ Author #2 - Can create/update blogs, upload media      │');
  console.log('   │ Email: jane.writer@tourism.local                        │');
  console.log('   │ Password: writer123                                     │');
  console.log('   └─────────────────────────────────────────────────────────┘');
  console.log('');
  console.log('   ┌─────────────────────────────────────────────────────────┐');
  console.log('   │ Regular User - Can view content and comment            │');
  console.log('   │ Email: user@tourism.local                               │');
  console.log('   │ Password: user123                                       │');
  console.log('   └─────────────────────────────────────────────────────────┘');
  console.log('');
  console.log('🔑 ROLES & PERMISSIONS:');
  console.log(`   - 4 roles created: super_admin, admin, author, user`);
  console.log(`   - ${permissions.length} permissions created`);
  console.log('   - 6 categories and 7 tags created');
  console.log('');
  console.log('🚀 Next Steps:');
  console.log('   - Run: npm run start:dev');
  console.log('   - Visit: http://localhost:3000/api/docs');
  console.log('   - Test login with any account above');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
