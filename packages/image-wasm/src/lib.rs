use wasm_bindgen::prelude::*;
use web_sys::ImageData;
use image::{DynamicImage, ImageBuffer, Rgba};

#[wasm_bindgen]
pub fn convert_to_grayscale(image_data: ImageData) -> ImageData {
    let width = image_data.width() as u32;
    let height = image_data.height() as u32;
    let data = image_data.data();

    // 创建图像缓冲区
    let mut img = ImageBuffer::new(width, height);

    // 处理每个像素
    for y in 0..height {
        for x in 0..width {
            let idx = ((y * width + x) * 4) as usize;
            let r = data[idx];
            let g = data[idx + 1];
            let b = data[idx + 2];
            let a = data[idx + 3];

            // 计算灰度值
            let gray = (0.299 * r as f32 + 0.587 * g as f32 + 0.114 * b as f32) as u8;

            // 设置像素
            img.put_pixel(x, y, Rgba([gray, gray, gray, a]));
        }
    }

    // 转换回 ImageData
    let new_data = img.as_raw();
    ImageData::new_with_u8_clamped_array_and_sh(
        wasm_bindgen::JsValue::from_serde(new_data).unwrap(),
        width,
        height,
    ).unwrap()
} 