## Admin Panel Login Instructions

Your admin account has been created with the following credentials:

**Email:** `cametame001@gmail.com`  
**Password:** `password123`  
**Role:** `ADMIN`

### Steps to Access Admin Panel:

1. **Logout** from your current session (click "DISCONNECT" in the sidebar)
2. **Navigate to** `/login`
3. **Sign in** with the credentials above
4. You will be automatically redirected to `/dashboard/admin`

### Troubleshooting:

If you're still seeing the student dashboard after logging in:
- Clear your browser cookies
- Try in an incognito/private window
- Verify your role in the database by running: `npx tsx scripts/check-user.ts`

### Alternative: Manual Database Update

If the password script didn't work, you can manually update your role in the database:

```bash
npx tsx -e "const {prisma} = require('./lib/prisma'); prisma.user.update({where: {email: 'cametame001@gmail.com'}, data: {role: 'ADMIN'}}).then(u => console.log('Updated:', u.email, u.role)).finally(() => prisma.$disconnect())"
```
