import { getActiveProduct } from '@/lib/product-registry';
import ProductPage from './ProductPage';

export default async function Home() {
  const product = await getActiveProduct();

  return <ProductPage product={product} initialVariant="youthful-radiance" />;
}
