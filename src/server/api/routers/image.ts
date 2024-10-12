import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const imageRouter = createTRPCRouter({
  uploadImage: protectedProcedure
    .input(z.object({ file: z.instanceof(File) }))
    .mutation(async ({ ctx, input }) => {
      const fileBuffer = await input.file.arrayBuffer();
      const mimeType = input.file.type;
      const encoding = "base64";
      const base64Data = Buffer.from(fileBuffer).toString("base64");

      // this will be used to upload the file
      const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;

      const image = await ctx.cloudinary.uploader.upload(fileUri, {
        overwrite: false,
      });

      console.log(image);

      return image.url;
    }),
});
