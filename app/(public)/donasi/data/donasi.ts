import { DonasiCategory, Product } from "../../../../types/donasi";

export const categories: DonasiCategory[] = [
  {
    id: '1',
    slug: 'wakaf-quran',
    title: "Wakaf Al-Qur'an",
    description: "Wakaf akan di belikan Al-Qur'an untuk santri dan pelosok.",
    image: "https://images.unsplash.com/photo-1584281723358-466f28688439?q=80&w=500"
  },
  {
    id: '2',
    slug: 'sodaqoh',
    title: "Sodaqoh",
    description: "Sodaqoh yang akan dikelola untuk umat.",
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=500"
  },
  {
    id: '3',
    slug: 'infaq-asatidz',
    title: "Infaq Asatidz",
    description: "Diberikan Kepada Ustadz-ustadz pengajar.",
    image: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?q=80&w=500"
  },
  {
    id: '4',
    slug: 'katalog-produk',
    title: "Katalog Produk",
    description: "Produk dari hasil sodaqoh produktif.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500"
  }
];

export const products: Product[] = Array(8).fill({
  id: 'p1',
  name: 'Sajadah Kain Batik',
  price: 7000,
  image: 'https://images.unsplash.com/photo-1606761036441-283807210b42?q=80&w=400'
});