import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: "/",
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "/3d",
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
