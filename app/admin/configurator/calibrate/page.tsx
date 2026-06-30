import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Plus, Home } from 'lucide-react';

export default async function CalibrationListPage() {
  const supabase = await createServerClient();

  // Fetch products that are 'houses' or potential houses
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, image_url:product_images(url)')
    .eq('status', 'active')
    .order('name');

  // Also fetch existing settings
  const { data: settings } = await supabase
    .from('house_configurator_settings')
    .select('product_id, id');

  const settingsMap = new Map(settings?.map(s => [s.product_id, s.id]));

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Configurator Calibration</h1>
          <p className="text-muted-foreground">Select a house model to define anchors and masks.</p>
        </div>
        <Link href="/admin/products">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New House
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => {
          const mainImage = (product.image_url as any)?.[0]?.url || '/placeholder.jpg';
          const hasSettings = settingsMap.has(product.id);
          const settingsId = settingsMap.get(product.id);

          return (
            <Card key={product.id} className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
              <div className="aspect-video relative bg-muted">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
                {hasSettings && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-sm flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                    Calibrated
                  </div>
                )}
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Home className="h-5 w-5 text-muted-foreground" />
                  {product.name}
                </CardTitle>
                <CardDescription>{product.slug}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Link href={`/admin/configurator/calibrate/${product.id}`}>
                  <Button className="w-full" variant={hasSettings ? "default" : "outline"}>
                    {hasSettings ? "Edit Calibration" : "Start Calibration"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
