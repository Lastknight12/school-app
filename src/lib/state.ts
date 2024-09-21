import { CategoryItem } from '@prisma/client'
import { create } from 'zustand'

interface ProductsState {
    products: CategoryItem[] | [],
    addProduct: (product: CategoryItem) => void
    removeProduct: (id: string) => void
    productExist: (product: CategoryItem) => boolean
    reset: () => void
}

export const useProducts = create<ProductsState>((set, get) => ({
  products: [],
  addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
  removeProduct: (id) => set((state) => ({ products: state.products.filter((product) => product.id !== id) })),
  productExist: (product) => get().products.some((item) => item.id === product.id),
  reset: () => set({ products: [] }),
}))