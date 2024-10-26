import { type NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { env } from "~/env";

export type uploadImageRes = {
  error?: string;
  imageUrl: string;
};

async function handler(req: NextRequest) {
  const formData = await req.formData();

  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return new NextResponse(
      JSON.stringify({ error: "Відсутній файл", imageUrl: "" }),
      { status: 500 }
    );
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });

  const fileBuffer = await file.arrayBuffer();
  const mimeType = file.type;
  const encoding = "base64";
  const base64Data = Buffer.from(fileBuffer).toString("base64");

  // this will be used to upload the file
  const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;

  const image = await cloudinary.uploader
    .upload(fileUri, {
      overwrite: false,
    })
    .catch(() => {
      return new NextResponse(
        JSON.stringify({
          error: "Помилка завантаження зображення на сервер",
          imageUrl: "",
        }),
        { status: 500 }
      );
    });

  return new NextResponse(
    JSON.stringify({ error: null, imageUrl: image.url }),
    { status: 200 }
  );
}

export { handler as POST };
