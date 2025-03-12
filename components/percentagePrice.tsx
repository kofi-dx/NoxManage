import { Product } from "@/types-db";

interface PercentagePriceProps {
  products: Product[];
  discountPercentage: number;
}

export const PercentagePrice: React.FC<PercentagePriceProps> = ({
  products,
  discountPercentage,
}) => {
  const calculateDiscountedPrice = (price: number, discountPercentage: number): number => {
    return price - (price * discountPercentage) / 100;
  };

  const discountedProducts = products.map((product) => ({
    ...product,
    discountedPrice: calculateDiscountedPrice(product.price, discountPercentage),
  }));

  return (
    <div className="mt-4">
      <h3>Discounted Products:</h3>
      {discountedProducts.map((product) => (
        <div key={product.id} className="flex justify-between items-center">
          <p>{product.name}</p>
          <p>
            Original: ${product.price.toFixed(2)} | Discounted: $
            {product.discountedPrice.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
};
