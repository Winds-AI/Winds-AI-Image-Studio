<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1LRFgZe2VgWmZp_jNJuW7h0Tkgu1KaQfs

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Examples

Below is a single end-to-end example demonstrating different parts of the project in the order listed.

1) Initial glasses product image

![Initial glasses product image](public/examples/initial_image.jpg)

2) Generated style sheet using the Glasses 3D View Generator

![Generated style sheet](public/examples/generated_style_sheet.png)

3) Initial model picture

![Initial model picture](public/examples/model_picture.jpg)

4) Photo of model with glasses on (different views)

![Model with glasses on](public/examples/final_picture.png)

> Note: Ensure the image files exist at the above paths. If you haven't added them yet, place your four example images in `public/examples/` with these filenames: `initial_image.jpg`, `generated_style_sheet.png`, `model_picture.jpg`, `final_picture.png`.
