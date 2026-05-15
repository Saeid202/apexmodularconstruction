import { getProductBySlug } from '@/app/actions/products';
import { getHouseConfigurator } from '@/app/actions/configurator';
import { notFound } from 'next/navigation';
import ConfiguratorWorkspace from '@/components/products/configurator/ConfiguratorWorkspace';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ConfigureProductPage({ params }: PageProps) {
  const { slug } = await params;
  
  // 1. Get the base product
  const { data: product, error: pError } = await getProductBySlug(slug);
  
  if (!product || pError) {
    notFound();
  }

  // 2. Get configurator settings for this product
  const { data: configurator, error: cError } = await getHouseConfigurator(product.id);

  if (!configurator || cError) {
    // If no configurator is set up, we can't show this page
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Configurator Not Available</h1>
        <p className="text-muted-foreground">This product has not been configured for interactive customization yet.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <ConfiguratorWorkspace 
        product={product} 
        configurator={configurator} 
      />
    </div>
  );
}
