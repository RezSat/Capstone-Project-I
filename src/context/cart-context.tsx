"use client"

import { createContext, useContext, useReducer, type ReactNode } from "react"

export interface CartLineItem {
  variantId: string
  productId: string
  name: string
  optionSignature: string
  priceMinor: number
  quantity: number
  imageUrl: string
  stockAvailable: number
}

interface CartState {
  items: CartLineItem[]
  isOpen: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartLineItem }
  | { type: "REMOVE_ITEM"; variantId: string }
  | { type: "UPDATE_QUANTITY"; variantId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.variantId === action.payload.variantId)
      if (existing) {
        const combinedQty = existing.quantity + action.payload.quantity
        const cappedQty = Math.min(combinedQty, action.payload.stockAvailable)
        return {
          ...state,
          items: state.items.map((i) =>
            i.variantId === action.payload.variantId
              ? { ...i, quantity: cappedQty }
              : i
          ),
        }
      }
      const cappedQty = Math.min(action.payload.quantity, action.payload.stockAvailable)
      return { ...state, items: [...state.items, { ...action.payload, quantity: cappedQty }] }
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.variantId !== action.variantId) }
    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.variantId !== action.variantId) }
      }
      return {
        ...state,
        items: state.items.map((i) => {
          if (i.variantId !== action.variantId) return i
          const safeQty = Math.max(1, Math.min(action.quantity, i.stockAvailable))
          return { ...i, quantity: safeQty }
        }),
      }
    case "CLEAR_CART":
      return { ...state, items: [] }
    case "OPEN_CART":
      return { ...state, isOpen: true }
    case "CLOSE_CART":
      return { ...state, isOpen: false }
    default:
      return state
  }
}

interface CartContextValue {
  items: CartLineItem[]
  isOpen: boolean
  totalMinor: number
  addItem: (item: CartLineItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false })

  const totalMinor = state.items.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        totalMinor,
        addItem: (item) => dispatch({ type: "ADD_ITEM", payload: item }),
        removeItem: (variantId) => dispatch({ type: "REMOVE_ITEM", variantId }),
        updateQuantity: (variantId, quantity) => dispatch({ type: "UPDATE_QUANTITY", variantId, quantity }),
        clearCart: () => dispatch({ type: "CLEAR_CART" }),
        openCart: () => dispatch({ type: "OPEN_CART" }),
        closeCart: () => dispatch({ type: "CLOSE_CART" }),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}