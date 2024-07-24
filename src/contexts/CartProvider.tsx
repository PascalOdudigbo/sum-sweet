'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { CartType, ProductType, ProductVariationType } from '@/utils/allModelTypes'
import { getCart, addToCart, removeFromCart, updateCartItemQuantity } from '@/utils/cartManagement'
import { useAuth } from './AuthProvider'

interface CartContextType {
  cart: CartType | null
  addItem: (product: ProductType, variation: ProductVariationType | null, quantity: number, customText: string) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  updateItemQuantity: (itemId: number, newQuantity: number) => Promise<void>
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartType | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchCart()
    }
  }, [user])

  const fetchCart = async () => {
    if (user) {
      const userCart = await getCart(user.id)
      setCart(userCart)
    }
  }

  const addItem = async (product: ProductType, variation: ProductVariationType | null, quantity: number, customText: string) => {
    if (user) {
      const updatedCart = await addToCart(product, variation, quantity, customText, user.id)
      setCart(updatedCart)
    }
  }

  const removeItem = async (itemId: number) => {
    if (user && cart) {
      const updatedCart = await removeFromCart(user.id, itemId)
      setCart(updatedCart)
    }
  }

  const updateItemQuantity = async (itemId: number, newQuantity: number) => {
    if (user && cart) {
      const updatedCart = await updateCartItemQuantity(user.id, itemId, newQuantity)
      setCart(updatedCart)
    }
  }

  const clearCart = () => {
    setCart(null)
  }

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateItemQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}