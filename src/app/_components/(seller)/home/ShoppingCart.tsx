"use client";

import { FaShoppingCart } from "react-icons/fa";
import GenerateQRModal from "./GenerateQRModal";
import { useProducts } from "~/lib/state";

export default function ShoppingCart() {
  const products = useProducts((state) => state.products);
  return (
    <div className="w-full px-2">
      <GenerateQRModal>
        <div className="flex gap-2">
          <FaShoppingCart size={24} className="cursor-pointer" />
          <div className="text-base text-red-600">{products.length}</div>
        </div>
      </GenerateQRModal>
      
    </div>
  );
}
