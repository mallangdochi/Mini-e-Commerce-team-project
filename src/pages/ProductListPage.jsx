import ProductList from '@/components/product/ProductList';

const mockProducts = [
  {
    id: 1,
    name: 'ARC Motion Jacket',
    price: 129000,
    imageUrl: 'https://i.ibb.co/xKQyZ7gs/08-side-right-pocket.png',
  },
  {
    id: 2,
    name: 'ARC Track Shorts',
    price: 69000,
    imageUrl: 'https://i.ibb.co/CKTYwW2p/Gemini-Generated-Image-eaztq9eaztq9eazt.png',
  },
  {
    id: 3,
    name: 'ARC Performance Tee',
    price: 49000,
    imageUrl: 'https://i.ibb.co/8LVR6Xyy/01-TOP-1638x2049-300-DPI.png',
  },
  {
    id: 4,
    name: 'ARC Running Shoes',
    price: 159000,
    imageUrl:
      'https://i.ibb.co/1JhQyFT9/1787792486078-Gemini-Generated-Image-cet5jacet5jacet5-300dpi-2.png',
  },
];

function ProductListPage() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">PRODUCTS</h1>

      <ProductList products={mockProducts} />
    </section>
  );
}

export default ProductListPage;
