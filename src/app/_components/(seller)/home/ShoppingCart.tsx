"use client";

import { FaShoppingCart } from "react-icons/fa";
import GenerateQRModal from "./GenerateQRModal";
import { useProducts } from "~/lib/state";

export default function ShoppingCart() {
  const products = useProducts((state) => state.products);
  return (
    <div className=" w-full px-2">
      <div className="relative">
        <GenerateQRModal products={products}>
          <FaShoppingCart size={24} />
        </GenerateQRModal>
        <div className="absolute -right-3 -top-3 z-10 flex items-center justify-center text-red-600">
          {products.length}
        </div>
      </div>
    </div>
  );
}
