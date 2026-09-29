'use client';

import Cropper, { type CropperProps } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

// Re-exporting the component to be used with next/dynamic
// This can help isolate dependencies and resolve chunk loading issues.
export default function ImageCropper(props: CropperProps) {
  return <Cropper {...props} />;
}
