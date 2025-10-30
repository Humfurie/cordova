# Role-Based Access Control (RBAC) System

This tourism backend implements a comprehensive RBAC system with roles, permissions, and a super admin.

## Overview

The system includes:
- **Roles**: Define user groups (super_admin, admin, author, user)
- **Permissions**: Granular access control (places.create, blogs.delete, etc.)
- **Role-Permission Pivot Table**: Maps which permissions each role has
- **Super Admin**: User ID 1 has access to EVERYTHING

## Database Structure

```
users
  ├── id (primary key)
  ├── email
  ├── password
  ├── name
  ├── roleId (foreign key to roles)
  └── ...

roles
  ├── id (primary key)
  ├── name (unique: super_admin, admin, author, user)
  └── description

permissions
  ├── id (primary key)
  ├── name (unique: places.create, blogs.delete, etc.)
  ├── resource (places, blogs, media, comments)
  └── action (create, read, update, delete, approve)

role_permissions (pivot table)
  ├── roleId (foreign key)
  └── permissionId (foreign key)
```

## Roles

### 1. Super Admin (super_admin)
- **User ID 1 is ALWAYS super admin**
- Has access to ALL resources regardless of permissions
- Cannot be restricted by permission checks
- Default credentials: `admin@tourism.local` / `admin123`

### 2. Admin (admin)
- Has all permissions in the system
- Can manage places, blogs, media, comments, categories
- Can approve/reject comments
- Can delete any content

### 3. Author (author)
- Can create and update blogs
- Can upload media
- Can read places
- Cannot delete blogs (admin only)

### 4. User (user)
- Can read places and blogs
- Can create comments (pending approval)
- Cannot create/update/delete content

## Permissions

### Places
- `places.create` - Create new places
- `places.read` - View places
- `places.update` - Update existing places
- `places.delete` - Delete places

### Blogs
- `blogs.create` - Create new blogs
- `blogs.read` - View blogs
- `blogs.update` - Update existing blogs
- `blogs.delete` - Delete blogs

### Media
- `media.upload` - Upload images
- `media.delete` - Delete images

### Comments
- `comments.approve` - Approve pending comments
- `comments.delete` - Delete any comment

### Categories
- `categories.create` - Create categories
- `categories.update` - Update categories
- `categories.delete` - Delete categories

## How It Works

### 1. User Login

When a user logs in, they receive a JWT token containing:
```json
{
  "sub": 1,
  "email": "admin@tourism.local",
  "roleId": 1,
  "roleName": "super_admin"
}
```

### 2. Permission Check

When accessing a protected route, the PermissionsGuard:

1. Checks if user is logged in
2. **If userId === 1**: ALLOW (super admin bypass)
3. Otherwise:
   - Fetches user's role and permissions from database
   - Checks if user has required permissions
   - ALLOW if yes, DENY if no

### 3. Using Guards in Controllers

#### Option A: Role-Based (Simple)

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'author')
@Post('blogs')
createBlog() {
  // Only admin and author can access
}
```

#### Option B: Permission-Based (Granular)

```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('blogs.create')
@Post('blogs')
createBlog() {
  // Only users with blogs.create permission can access
}
```

## Examples

### Creating a Blog (Protected)

```typescript
// blogs.controller.ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'author')
@Post()
create(@Body() createBlogDto: CreateBlogDto) {
  return this.blogsService.create(createBlogDto);
}
```

**Who can access?**
- ✅ Super admin (user ID 1) - ALWAYS
- ✅ Admin - has `blogs.create` permission
- ✅ Author - has `blogs.create` permission
- ❌ User - no permission

### Deleting a Blog (Admin Only)

```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('blogs.delete')
@Delete(':id')
remove(@Param('id') id: number) {
  return this.blogsService.remove(id);
}
```

**Who can access?**
- ✅ Super admin (user ID 1) - ALWAYS
- ✅ Admin - has `blogs.delete` permission
- ❌ Author - no permission
- ❌ User - no permission

### Commenting on a Blog (Any User)

```typescript
@Post('blog/:blogId')
create(@Param('blogId') blogId: number, @Body() dto: CreateCommentDto) {
  return this.commentsService.create(blogId, dto);
}
```

**Who can access?**
- ✅ Everyone (no guard)
- Comments are created with `status: 'pending'`
- Admin must approve before they appear

## Setup Instructions

### 1. Run Database Migrations

```bash
npm run prisma:migrate
```

This creates the roles, permissions, and role_permissions tables.

### 2. Seed the Database

```bash
npm run prisma:seed
```

This will:
- Create all permissions
- Create 4 roles (super_admin, admin, author, user)
- Assign permissions to roles
- Create super admin user (ID 1)
- Create sample categories and tags

**Super Admin Credentials:**
- Email: `admin@tourism.local`
- Password: `admin123`
- User ID: `1` (has access to everything)

### 3. Test Authentication

```bash
# Login as super admin
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tourism.local",
    "password": "admin123"
  }'

# Response includes access_token
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 1,
    "email": "admin@tourism.local",
    "name": "Super Admin",
    "role": "super_admin",
    "permissions": [...all permissions...]
  }
}
```

### 4. Use the Token

```bash
# Create a blog (requires authentication)
curl -X POST http://localhost:3000/api/v1/blogs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Best Places in Paris",
    "content": "Amazing travel guide...",
    "status": "published"
  }'
```

## Creating Users with Different Roles

### Create an Author

```typescript
const authorRole = await prisma.role.findUnique({ where: { name: 'author' } });
const hashedPassword = await bcrypt.hash('password123', 10);

await prisma.user.create({
  data: {
    email: 'author@tourism.local',
    password: hashedPassword,
    name: 'Travel Author',
    roleId: authorRole.id,
  },
});
```

### Register via API (Creates User Role)

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

## Permission Management

### Adding New Permissions

```typescript
await prisma.permission.create({
  data: {
    name: 'tours.create',
    resource: 'tours',
    action: 'create',
    description: 'Create tours',
  },
});
```

### Assigning Permissions to Role

```typescript
const role = await prisma.role.findUnique({ where: { name: 'author' } });
const permission = await prisma.permission.findUnique({ where: { name: 'tours.create' } });

await prisma.rolePermission.create({
  data: {
    roleId: role.id,
    permissionId: permission.id,
  },
});
```

### Checking User Permissions

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    role: {
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    },
  },
});

const permissions = user.role.rolePermissions.map((rp) => rp.permission.name);
console.log(permissions); // ['blogs.create', 'blogs.update', ...]
```

## Security Best Practices

### 1. Super Admin Protection

- User ID 1 is always super admin
- Never delete or deactivate user ID 1
- Keep super admin credentials secure
- Use super admin only when necessary

### 2. Password Security

- All passwords are hashed with bcrypt (10 rounds)
- Never store plain passwords
- Enforce strong password policy in production

### 3. JWT Security

- Change `JWT_SECRET` in production
- Set appropriate expiration time (default: 7 days)
- Implement refresh tokens for long sessions

### 4. Permission Checks

- Always use guards on sensitive routes
- Prefer permission-based over role-based when possible
- Check both authentication AND authorization

## Frontend Integration

### Login and Store Token

```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@tourism.local',
    password: 'admin123',
  }),
});

const { access_token, user } = await response.json();

// Store token
localStorage.setItem('token', access_token);
localStorage.setItem('user', JSON.stringify(user));
```

### Make Authenticated Requests

```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/v1/blogs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ title: 'My Blog', content: '...' }),
});
```

### Check User Permissions

```javascript
const user = JSON.parse(localStorage.getItem('user'));

if (user.permissions.includes('blogs.create')) {
  // Show create blog button
}

if (user.id === 1) {
  // Show admin panel
}
```

## Troubleshooting

### "Forbidden" Error

- Check if user has required permissions
- Verify JWT token is valid and not expired
- Ensure guards are properly configured

### Super Admin Not Working

- Verify user ID is exactly 1
- Check database: `SELECT * FROM users WHERE id = 1;`
- User ID 1 bypasses all permission checks

### Permissions Not Working

- Run seed script: `npm run prisma:seed`
- Check role_permissions table
- Verify user has a role assigned

## Summary

- **Super Admin (ID 1)**: Full access to everything
- **Roles**: Group users by responsibility
- **Permissions**: Granular access control
- **Guards**: Protect routes
- **Seed Script**: Creates initial data

This RBAC system provides:
- ✅ Flexible permission management
- ✅ Super admin with unrestricted access
- ✅ Easy to add new roles/permissions
- ✅ Scalable for large applications
- ✅ Secure by default

---

**Need Help?**
- Check Swagger docs: http://localhost:3000/api/docs
- View database: `npm run prisma:studio`
- Seed data: `npm run prisma:seed`
