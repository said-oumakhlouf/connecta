export type GalleryImage = {
  id: string;
  /** Base path without size suffix; WebP variants live at `${base}-800.webp` and `${base}-1600.webp`. */
  base: string;
  /** Intrinsic width of the largest variant (the source may be narrower than 1600 px). */
  largeWidth: number;
  width: number;
  height: number;
  alt: string;
  caption: string;
  fit: 'contain' | 'cover';
  position?: string;
};

export const PRODUCT_GALLERY: readonly GalleryImage[] = [
  {
    id: 'features',
    base: '/images/hoco-ew75-features',
    largeWidth: 1448,
    width: 1448,
    height: 1086,
    alt: 'Hoco EW75 avec ses caractéristiques : Bluetooth 5.4, jusqu’à 4 h d’écoute, portée jusqu’à 10 m et commandes tactiles.',
    caption: 'Caractéristiques',
    fit: 'contain',
  },
  {
    id: 'studio',
    base: '/images/hoco_black',
    largeWidth: 1600,
    width: 1600,
    height: 1066,
    alt: 'Photo d’ambiance : écouteurs blancs et leur boîtier sur fond noir.',
    caption: 'Ambiance studio',
    fit: 'cover',
  },
  {
    id: 'work',
    base: '/images/hoco_work',
    largeWidth: 1600,
    width: 1600,
    height: 1067,
    alt: 'Photo d’ambiance : une personne travaille à son bureau en portant des écouteurs.',
    caption: 'Au travail',
    fit: 'cover',
    position: '70% center',
  },
  {
    id: 'style',
    base: '/images/hoco_style',
    largeWidth: 1600,
    width: 1600,
    height: 1069,
    alt: 'Photo d’ambiance : écouteurs blancs posés à côté d’un smartphone et d’un ordinateur.',
    caption: 'Au quotidien',
    fit: 'cover',
  },
  {
    id: 'sport',
    base: '/images/hoco_sport',
    largeWidth: 1600,
    width: 1600,
    height: 2400,
    alt: 'Photo d’ambiance : une personne court en extérieur avec des écouteurs.',
    caption: 'En mouvement',
    fit: 'cover',
    position: 'center 22%',
  },
];

export const galleryImageSrc = (image: GalleryImage, size: 800 | 1600 = 800) =>
  `${image.base}-${size}.webp`;

export const galleryImageSrcSet = (image: GalleryImage) =>
  `${galleryImageSrc(image, 800)} 800w, ${galleryImageSrc(image, 1600)} ${image.largeWidth}w`;
