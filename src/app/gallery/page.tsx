import CloudinaryImage from "@/components/CloudinaryImage";

export default function GalleryPage() {
  return (
    <main style={{ padding: "40px" }}>
      <h1>Gallery</h1>

      <CloudinaryImage
        src="sample"
        alt="Cloudinary Test Image"
      />

    </main>
  );
}
