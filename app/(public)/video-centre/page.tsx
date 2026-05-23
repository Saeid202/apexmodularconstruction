import { Metadata } from "next";
import { getVideos } from "@/app/actions/video-centre";
import { VideoCentreClient } from "./VideoCentreClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Video Centre - Modular Construction Showcase",
  description: "Explore our dynamic portfolio of prefabricated buildings, crane assembly timelapses, and high-performance custom steel modular solutions.",
};

export default async function PublicVideoCentrePage() {
  const { data: videos } = await getVideos();

  return <VideoCentreClient initialVideos={videos ?? []} />;
}
