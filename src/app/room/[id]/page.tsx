import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isRoomId, ROOM_LABEL } from "@/lib/rooms";
import { RoomView } from "@/components/views/room-view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: isRoomId(id) ? `${ROOM_LABEL[id]} - Rehearse Courage` : "Rehearse Courage" };
}

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isRoomId(id)) notFound();
  return <RoomView room={id} />;
}
