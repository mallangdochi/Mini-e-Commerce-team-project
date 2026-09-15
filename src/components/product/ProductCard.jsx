function ProductCard({ product }) {
  return (
    <article>
      <img src={product.imageUrl} alt={product.name} />

      <h3>{product.name}</h3>

      <p>{product.price.toLocaleString()}원</p>
    </article>
  );
}

export default ProductCard;
