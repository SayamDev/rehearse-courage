import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isRoomId, ROOM_LABEL } from "@/lib/rooms";
import { ROOM_IDS } from "@/lib/types";
import { RoomView } from "@/components/views/room-view";

// Only the three rooms exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return ROOM_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: isRoomId(id) ? `${ROOM_LABEL[id]} - Rehearse Courage` : "Rehearse Courage" };
}

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isRoomId(id)) notFound();
  return <RoomView room={id} />;
}
