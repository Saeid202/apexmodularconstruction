'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function createRoomScanSession() {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('room_scans')
    .insert({})
    .select()
    .single()
    
  if (error) {
    console.error('Error creating room scan session:', error)
    return { error: error.message }
  }
  
  return { session: data }
}

export async function getRoomScanSession(sessionId: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('room_scans')
    .select('*')
    .eq('session_id', sessionId)
    .single()
    
  if (error) {
    console.error('Error getting room scan session:', error)
    return { error: error.message }
  }
  
  return { session: data }
}
