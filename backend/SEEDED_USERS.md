# Seeded Users Reference

After running `npm run prisma:seed`, the following users are created with their respective roles and permissions.

## Test Accounts

### 1. Super Admin (User ID: 1)

```
Email: admin@tourism.local
Password: admin123
Role: super_admin
```

**Access Level:** 🔓 **UNLIMITED**
- Has access to EVERYTHING
- Bypasses all permission checks
- Can perform any action in the system
- Cannot be restricted by permissions

**Use Case:** Emergency access, system maintenance, initial setup

---

### 2. Admin User

```
Email: admin.user@tourism.local
Password: admin123
Role: admin
```

**Permissions:**
- ✅ All permissions in the system
- ✅ places.create, places.read, places.update, places.delete
- ✅ blogs.create, blogs.read, blogs.update, blogs.delete
- ✅ media.upload, media.delete
- ✅ comments.approve, comments.delete
- ✅ categories.create, categories.update, categories.delete

**Use Case:** Day-to-day administration, content management, user moderation

---

### 3. Author #1

```
Email: author@tourism.local
Password: author123
Role: author
```

**Permissions:**
- ✅ blogs.create - Create new blog posts
- ✅ blogs.read - View all blogs
- ✅ blogs.update - Update blogs
- ✅ media.upload - Upload images for blogs
- ✅ places.read - View places to reference in blogs
- ❌ blogs.delete - Cannot delete blogs (admin only)
- ❌ places.create/update/delete - Cannot manage places

**Use Case:** Content creators, travel writers, blog contributors

---

### 4. Author #2

```
Email: jane.writer@tourism.local
Password: writer123
Role: author
```

**Permissions:** Same as Author #1
- ✅ blogs.create, blogs.read, blogs.update
- ✅ media.upload
- ✅ places.read

**Use Case:** Another content creator for testing multi-author scenarios

---

### 5. Regular User

```
Email: user@tourism.local
Password: user123
Role: user
```

**Permissions:**
- ✅ places.read - View places
- ✅ blogs.read - View blogs
- ✅ Can add comments (pending approval)
- ❌ Cannot create, update, or delete content
- ❌ Cannot upload media
- ❌ Cannot approve comments

**Use Case:** Regular website visitors, tourists browsing content

---

## Permission Matrix

| Action | Super Admin | Admin | Author | User |
|--------|-------------|-------|--------|------|
| **Places** |
| View Places | ✅ | ✅ | ✅ | ✅ |
| Create Places | ✅ | ✅ | ❌ | ❌ |
| Update Places | ✅ | ✅ | ❌ | ❌ |
| Delete Places | ✅ | ✅ | ❌ | ❌ |
| **Blogs** |
| View Blogs | ✅ | ✅ | ✅ | ✅ |
| Create Blogs | ✅ | ✅ | ✅ | ❌ |
| Update Blogs | ✅ | ✅ | ✅ | ❌ |
| Delete Blogs | ✅ | ✅ | ❌ | ❌ |
| **Media** |
| Upload Images | ✅ | ✅ | ✅ | ❌ |
| Delete Images | ✅ | ✅ | ❌ | ❌ |
| **Comments** |
| Add Comment | ✅ | ✅ | ✅ | ✅ |
| Approve Comment | ✅ | ✅ | ❌ | ❌ |
| Delete Any Comment | ✅ | ✅ | ❌ | ❌ |
| **Categories** |
| Create Categories | ✅ | ✅ | ❌ | ❌ |
| Update Categories | ✅ | ✅ | ❌ | ❌ |
| Delete Categories | ✅ | ✅ | ❌ | ❌ |

---

## Testing Login

### Using cURL

```bash
# Login as Super Admin
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tourism.local",
    "password": "admin123"
  }'

# Login as Author
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@tourism.local",
    "password": "author123"
  }'

# Login as Regular User
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@tourism.local",
    "password": "user123"
  }'
```

### Using JavaScript

```javascript
async function login(email, password) {
  const response = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const { access_token, user } = await response.json();

  console.log('Logged in as:', user.name);
  console.log('Role:', user.role);
  console.log('Permissions:', user.permissions);

  return { access_token, user };
}

// Test different accounts
await login('admin@tourism.local', 'admin123');
await login('author@tourism.local', 'author123');
await login('user@tourism.local', 'user123');
```

---

## What Gets Seeded

### 1. Roles (4 total)
- `super_admin` - Super administrator
- `admin` - Administrator
- `author` - Content author
- `user` - Regular user

### 2. Permissions (15 total)
**Places:**
- places.create
- places.read
- places.update
- places.delete

**Blogs:**
- blogs.create
- blogs.read
- blogs.update
- blogs.delete

**Media:**
- media.upload
- media.delete

**Comments:**
- comments.approve
- comments.delete

**Categories:**
- categories.create
- categories.update
- categories.delete

### 3. Role-Permission Mappings
- Admin gets ALL permissions
- Author gets: blogs.create, blogs.read, blogs.update, media.upload, places.read
- User gets: places.read, blogs.read

### 4. Users (5 total)
- 1 Super Admin
- 1 Admin
- 2 Authors
- 1 Regular User

### 5. Sample Data
- 6 Categories (Attractions, Restaurants, Hotels, Beaches, Museums, Travel Guides)
- 7 Tags (Family Friendly, Romantic, Adventure, Cultural, Nature, Budget, Luxury)

---

## Running the Seeder

```bash
# First time setup
cd ~/Desktop/Projects/Cordova/backend
npm run prisma:migrate
npm run prisma:seed

# Re-seed (clears and re-seeds)
npx prisma migrate reset  # WARNING: Deletes all data
npm run prisma:seed

# Or just run seed without reset
npm run prisma:seed
```

---

## Frontend Integration Examples

### Login Form with Multiple Accounts

```jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Quick login buttons for testing
  const quickLogin = (role) => {
    const accounts = {
      superAdmin: { email: 'admin@tourism.local', password: 'admin123' },
      admin: { email: 'admin.user@tourism.local', password: 'admin123' },
      author: { email: 'author@tourism.local', password: 'author123' },
      user: { email: 'user@tourism.local', password: 'user123' },
    };

    const account = accounts[role];
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>

      {/* Quick login buttons for testing */}
      <div className="test-accounts">
        <button onClick={() => quickLogin('superAdmin')}>Super Admin</button>
        <button onClick={() => quickLogin('admin')}>Admin</button>
        <button onClick={() => quickLogin('author')}>Author</button>
        <button onClick={() => quickLogin('user')}>User</button>
      </div>
    </div>
  );
}
```

### Permission-Based UI

```jsx
function App() {
  const user = getCurrentUser();

  return (
    <div>
      {/* Everyone can see */}
      <PlacesList />

      {/* Only authors and admins */}
      {user.permissions.includes('blogs.create') && (
        <CreateBlogButton />
      )}

      {/* Only admins */}
      {user.permissions.includes('comments.approve') && (
        <AdminPanel />
      )}

      {/* Only super admin */}
      {user.id === 1 && (
        <SuperAdminSettings />
      )}
    </div>
  );
}
```

---

## Security Notes

⚠️ **Important:**
- These are **test credentials** for development
- Change all passwords in production
- Never commit real credentials to git
- User ID 1 should be protected in production
- Enforce strong password policies for production users

✅ **Best Practices:**
- Users are created with `isActive: true` - you can deactivate users without deleting them
- Passwords are hashed with bcrypt (10 rounds)
- Roles and permissions are in separate tables for flexibility
- Super admin bypass is checked at User ID level, not role level

---

## Troubleshooting

**Seeder fails:**
```bash
# Make sure database is running
docker-compose ps postgres

# Make sure migrations are run
npm run prisma:migrate

# Try resetting
npx prisma migrate reset
npm run prisma:seed
```

**Can't login:**
- Check credentials match exactly (case-sensitive)
- Verify user exists: `npm run prisma:studio` → check users table
- Check backend is running: http://localhost:3000/api/docs

**Permission errors:**
- Super admin (ID 1) should always work
- Check user's role has the required permission
- View permissions in Prisma Studio

---

**Created:** Database seeding script
**Location:** `/backend/prisma/seed.ts`
**Run with:** `npm run prisma:seed`
