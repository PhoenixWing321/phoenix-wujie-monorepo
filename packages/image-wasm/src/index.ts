import init, { convert_to_grayscale } from './pkg/image_wasm';

let wasmInitialized = false;

export async function initializeWasm() {
  if (!wasmInitialized) {
    await init();
    wasmInitialized = true;
  }
}

export async function convertImageToGrayscale(imageData: ImageData): Promise<ImageData> {
  await initializeWasm();
  return convert_to_grayscale(imageData);
} 