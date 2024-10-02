import { type CategoryItem } from "@prisma/client";
import { create } from "zustand";

interface ProductsState {
  products: CategoryItem[] | [];
  addProduct: (product: CategoryItem) => void;
  removeProduct: (id: string) => void;
  productExist: (product: CategoryItem) => boolean;
  reset: () => void;
}

interface UpdateProductState {
  product: {
    newTitle: string;
    newCount: number;
    newImageSrc: string;
    newPrice: number;
  };
  init: (item: CategoryItem) => void;
  updateTitle: (newTitle: string) => void;
  updateCount: (newCount: number) => void;
  updateImageSrc: (newImageSrc: string) => void;
  updatePrice: (newPrice: number) => void;
  reset: () => void;
}

export const useProducts = create<ProductsState>((set, get) => ({
  products: [],
  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    })),
  productExist: (product) =>
    get().products.some((item) => item.id === product.id),
  reset: () => set({ products: [] }),
}));

export const useUpdateProduct = create<UpdateProductState>((set) => ({
  product: {
    newTitle: "",
    newCount: 0,
    newPrice: 0,
    newImageSrc: "",
  },
  init: (item: CategoryItem) =>
    set({
      product: {
        newTitle: item.title,
        newCount: item.count,
        newPrice: item.pricePerOne,
        newImageSrc: item.image,
      },
    }),
  updateTitle: (newTitle: string) =>
    set((state) => ({ product: { ...state.product, newTitle } })),
  updateCount: (newCount: number) =>
    set((state) => ({ product: { ...state.product, newCount } })),
  updateImageSrc: (newImageSrc: string) =>
    set((state) => ({ product: { ...state.product, newImageSrc } })),
  updatePrice: (newPrice: number) => set((state) => ({ product: { ...state.product, newPrice } })),
  reset: () => set({ product: { newTitle: "", newCount: 0, newImageSrc: "", newPrice: 0 } }),
}));
