import { type BrandButtonProps } from './brand-button/types'
import BrandButtonPrimary from './brand-button/BrandButtonPrimary'
import BrandButtonWhite from './brand-button/BrandButtonWhite'
import BrandButtonLight from './brand-button/BrandButtonLight'
import BrandButtonOutlined from './brand-button/BrandButtonOutlined'

export default function BrandButton(props: BrandButtonProps) {
  const { variant = 'primary' } = props

  if (variant === 'outlined') {
    return <BrandButtonOutlined {...props} />
  }

  if (variant === 'light') {
    return <BrandButtonLight {...props} />
  }

  if (variant === 'white') {
    return <BrandButtonWhite {...props} />
  }

  return <BrandButtonPrimary {...props} />
}