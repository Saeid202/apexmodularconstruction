'use server'

import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Sync role from database profile to auth metadata for a specific user
 * This is useful for existing users who don't have role in auth metadata
 */
export async function syncUserRole(userId: string) {
  try {
    const supabase = await createServerClient()
    const adminSupabase = createAdminClient()

    // Get role from database profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Update auth metadata with role from database
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      { 
        user_metadata: { 
          role: profile.role 
        } 
      }
    )

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return { success: true, role: profile.role }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
