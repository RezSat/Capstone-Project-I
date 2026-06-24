export type FooterLink = {
  label: string
  href: string
}

export const shopLinks: FooterLink[] = [
  { label: "BADMINTON", href: "/category/badminton/racquets" },
  { label: "CRICKET", href: "/category/cricket/bats" },
  { label: "PICKLE BALL", href: "/category/pickleball/paddles" },
  { label: "NEW ARRIVALS", href: "#new-arrivals" },
]

export const categoryLinks: FooterLink[] = [
  { label: "GEAR", href: "/category/badminton/racquets" },
  { label: "EQUIPMENT", href: "/category/cricket/bats" },
  { label: "BAGS", href: "/category/pickleball/paddles" },
]

export const supportLinks: FooterLink[] = [
  { label: "CONTACT US", href: "#" },
]

export type ContactInfo = {
  address: string
  email: string
  phone: string
}

export const contactInfo: ContactInfo = {
  address: "123 Store Street, Colombo, Sri Lanka",
  email: "contact@yourstore.com",
  phone: "+00 000 0000",
}

export const deliveryInfo: string[] = [
  "COLOMBO & SUBURBS: SAME-DAY DELIVERY",
  "OTHER AREAS: 2-3 WORKING DAYS",
  "DISPATCH TIME: 4-7 DAYS",
]