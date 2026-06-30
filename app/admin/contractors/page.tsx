import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ContractorManagementClient from './ContractorManagementClient'

export const metadata: Metadata = {
  title: 'Contractor Management - Admin',
  description: 'Manage contractors and installers',
}

export default async function ContractorManagementPage() {
  const supabase = await createServerClient()

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/admin/login')
  }

  // Verify admin role (you may need to adjust based on your auth structure)
  // This is a basic check - implement your role-based access control here
  const { data: adminUser } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!adminUser || adminUser.role !== 'admin') {
    redirect('/forbidden')
  }

  return <ContractorManagementClient />
}
