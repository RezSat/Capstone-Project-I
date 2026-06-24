export type RelatedCategoryTile = {
  id: string
  title: string
  imageSrc: string
  imageAlt: string
  href: string
  group: string
  categorySlug: string

}

export type RelatedCategoryTileGroup = {
  group: string
  tiles: RelatedCategoryTile[]
  path: string
}

const relatedCategoryTileGroups: RelatedCategoryTileGroup[] = [
  {
    group: 'badminton',
    path: "/category/badminton/racquets",
    tiles: [
      {
        id: 'badminton-strings',
        title: 'STRINGS',
        imageSrc: '/images/productpage/strings.png',
        imageAlt: 'Badminton strings category',
        href: '/category/badminton/strings',
        group: 'badminton',
        categorySlug: 'strings',
      },
      {
        id: 'badminton-shuttlecocks',
        title: 'SHUTTLECOCKS',
        imageSrc: '/images/productpage/shuttlecocks.jpg',
        imageAlt: 'Badminton shuttlecocks category',
        href: '/category/badminton/shuttlecocks',
        group: 'badminton',
        categorySlug: 'shuttlecocks',
      },
      {
        id: 'badminton-grips',
        title: 'GRIPS',
        imageSrc: '/images/productpage/grips.png',
        imageAlt: 'Badminton grips category',
        href: '/category/badminton/grips',
        group: 'badminton',
        categorySlug: 'grips',
      },
      {
        id: 'badminton-nets',
        title: 'NETS',
        imageSrc: '/images/productpage/nets.jpg',
        imageAlt: 'Badminton nets category',
        href: '/category/badminton/nets',
        group: 'badminton',
        categorySlug: 'nets',
      },
    ],
  },
]

type RelatedTileArgs = {
  group?: string
  categorySlug?: string
  limit?: number
}

export function getRelatedCategoryTiles({ group, categorySlug, limit = 4 }: RelatedTileArgs): RelatedCategoryTile[] {
  if (!group) return []

  const tileGroup = relatedCategoryTileGroups.find((item) => item.group === group)
  if (!tileGroup) return []

  const max = Math.max(0, limit)
  const withoutCurrent = categorySlug
    ? tileGroup.tiles.filter((tile) => tile.categorySlug !== categorySlug)
    : tileGroup.tiles

  return withoutCurrent.slice(0, max)
}

export function getRelatedCategoryTilesByPath(currentPath: string): RelatedCategoryTile[] {
  const match = relatedCategoryTileGroups.find(
    (group) => group.path.toLowerCase() === currentPath.toLowerCase(),
  )
  return match ? match.tiles : []
}
