import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getSession } from "@auth0/nextjs-auth0";
 
const f = createUploadthing();

const auth = async () => {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  return { userId: session.user.sub };
};

export const ourFileRouter = {
  documentUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const user = await auth();
      return user;
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;