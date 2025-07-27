export const imageFilters = {
  'none': 'none',
  'grayscale': 'grayscale(100%)',
  'sepia': 'sepia(100%)',
  'blur': 'blur(5px)',
};

export const getImageFilter = (filterType: string): string => {
  return imageFilters[filterType as keyof typeof imageFilters] || imageFilters['none'];
};