import { getHeroSlides } from '../app/actions/hero-slides';
import { getProducts } from '../app/actions/products';

async function test() {
  console.log('Calling getHeroSlides()...');
  try {
    const res = await getHeroSlides();
    console.log('getHeroSlides result:', res);
  } catch (err) {
    console.error('getHeroSlides threw:', err);
  }

  console.log('Calling getProducts()...');
  try {
    const res = await getProducts();
    console.log('getProducts result:', res);
  } catch (err) {
    console.error('getProducts threw:', err);
  }
}

test();
