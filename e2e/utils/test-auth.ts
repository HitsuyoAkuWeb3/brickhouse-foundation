import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export function generateTestEmail(prefix = 'testuser') {
  return `${prefix}+${Date.now()}@example.com`;
}

export async function deleteTestUser(email: string) {
  // Find the user by email
  const { data: users, error: listError } = await adminAuthClient.auth.admin.listUsers();
  
  if (listError) {
    console.error('Failed to list users:', listError);
    return;
  }
  
  const user = users.users.find((u) => u.email === email);
  if (!user) {
    console.warn(`User ${email} not found for deletion.`);
    return;
  }

  const { error: deleteError } = await adminAuthClient.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error(`Failed to delete user ${email}:`, deleteError);
  } else {
    console.log(`Successfully deleted test user: ${email}`);
  }
}

export async function confirmTestUser(email: string) {
  // Find the user by email
  const { data: users, error: listError } = await adminAuthClient.auth.admin.listUsers();
  
  if (listError) {
    throw new Error(`Failed to list users to confirm ${email}: ${listError.message}`);
  }
  
  const user = users.users.find((u) => u.email === email);
  if (!user) {
    throw new Error(`User ${email} not found for confirmation.`);
  }

  const { error: updateError } = await adminAuthClient.auth.admin.updateUserById(user.id, {
    email_confirm: true
  });
  
  if (updateError) {
    throw new Error(`Failed to confirm user ${email}: ${updateError.message}`);
  }
  
  console.log(`Successfully auto-confirmed test user: ${email}`);
}
