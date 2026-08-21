import webpush from 'web-push';
import { createAdminClient } from '@/lib/supabase/admin';

webpush.setVapidDetails(
  'mailto:info@apexmodularconstruction.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushPayload {
  title: string;
  body: string;
  data: { url: string };
}

export async function sendPushNotification(userId: string, payload: PushPayload): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: subs } = await admin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', userId);

    if (!subs?.length) return;

    const results = await Promise.allSettled(
      subs.map((sub: any) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ ...payload, icon: '/icons/icon-192.png' })
        )
      )
    );

    // Remove stale subscriptions (410 Gone or 404 Not Found)
    const staleIds: string[] = [];
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        const status = (result.reason as any)?.statusCode;
        if (status === 410 || status === 404) staleIds.push((subs as any[])[i].id);
      }
    });

    if (staleIds.length) {
      await admin.from('push_subscriptions').delete().in('id', staleIds);
    }
  } catch (err) {
    console.error('sendPushNotification error:', err);
  }
}
