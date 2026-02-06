## Admin Panel Access

### Creating an Admin Account

Run the following script to create or promote a user to admin:

```bash
npx tsx scripts/create-admin.ts your-email@example.com your-secure-password
```

Or manually update an existing user's role:

```bash
npx tsx -e "const {prisma} = require('./lib/prisma'); prisma.user.update({where: {email: 'YOUR_EMAIL'}, data: {role: 'ADMIN'}}).then(u => console.log('Updated:', u.email, u.role)).finally(() => prisma.\$disconnect())"
```

### Accessing the Admin Panel

1. **Logout** from your current session (click "DISCONNECT" in the sidebar)
2. **Navigate to** `/login`
3. **Sign in** with your admin credentials
4. You will be automatically redirected to `/dashboard/admin`

### Troubleshooting

If you're still seeing the student dashboard after logging in:
- Clear your browser cookies
- Try in an incognito/private window
- Verify your role: `npx tsx scripts/check-user.ts`

> **Note:** Never commit credentials to version control. Store sensitive data in `.env` (which is gitignored).
