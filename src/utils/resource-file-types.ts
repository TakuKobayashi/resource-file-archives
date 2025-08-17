export type FileCategorys = 'threedmodels' | 'images' | 'pdfs' | 'audios';

const threedFileExtensions: string[] = ['glb', 'fbx', 'obj'];

const imageFileExtensions: string[] = [
  'avif',
  'dz',
  'fits',
  'gif',
  'heif',
  'jpeg',
  'jpg',
  'jp2',
  'jxl',
  'magick',
  'openslide',
  'png',
  'ppm',
  'raw',
  'svg',
  'tiff',
  'tif',
  'v',
  'webp',
];

const pdfFileExtensions: string[] = ['pdf'];

export interface ResourceFileInfo {
  fileCategory: FileCategorys;
  fileExtensions: typeof threedFileExtensions & typeof imageFileExtensions & typeof pdfFileExtensions;
}

export const ThreedModelFileInfo: ResourceFileInfo = {
  fileCategory: 'threedmodels',
  fileExtensions: threedFileExtensions,
};

export const ImageFileInfo: ResourceFileInfo = {
  fileCategory: 'images',
  fileExtensions: imageFileExtensions,
};

export const PdfFileInfo: ResourceFileInfo = {
  fileCategory: 'pdfs',
  fileExtensions: pdfFileExtensions,
};
