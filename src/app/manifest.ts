
import { MetadataRoute } from 'next'
import placeholderImages from './lib/placeholder-images.json';

const findImage = (id: string) => placeholderImages.placeholderImages.find(img => img.id === id)?.imageUrl || '';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StaffLink Employee ID App',
    short_name: 'StaffLink',
    description: 'Offline-first Employee ID Management App',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [
      {
        src: findImage('app-icon-192'),
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: findImage('app-icon-512'),
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
