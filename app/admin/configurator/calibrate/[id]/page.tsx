import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CalibrationTool from '@/components/admin/configurator/CalibrationTool';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CalibrateProductPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerClient();

  // Fetch product and its main image
  const { data: product } = await supabase
    .from('products')
    .select('id, name, product_images(url)')
    .eq('id', id)
    .single();

  if (!product) {
    notFound();
  }

  // Fetch existing settings and anchors
  const { data: settings } = await supabase
    .from('house_configurator_settings')
    .select(`
      *,
      anchors:house_anchors(*)
    `)
    .eq('product_id', id)
    .single();

  const mainImage = (product.product_images as any)?.[0]?.url || '';

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <CalibrationTool 
        product={{ id: product.id, name: product.name }}
        initialSettings={settings}
        mainImage={mainImage}
      />
    </div>
  );
}
