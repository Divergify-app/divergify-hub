import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RoomId =
  | "general"
  | "brain-dump"
  | "gentle-support"
  | "high-support"
  | "shades-low-stim"
  | "tinfoil-hat";

type Post = {
  id: string;
  name: string;
  room: RoomId;
  message: string;
  createdAt: string;
};

const validRooms = new Set<RoomId>([
  "general",
  "brain-dump",
  "gentle-support",
  "high-support",
  "shades-low-stim",
  "tinfoil-hat",
]);

const dataPath = path.join(process.cwd(), "data", "community-posts.json");

async function readPosts() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Post[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writePosts(posts: Post[]) {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(posts, null, 2));
}

export async function GET(request: NextRequest) {
  const room = request.nextUrl.searchParams.get("room");
  const posts = await readPosts();
  const filtered = room && validRooms.has(room as RoomId) ? posts.filter((post) => post.room === room) : posts;
  return NextResponse.json({ posts: filtered.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 80) });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<Post>;
  const room = typeof body.room === "string" ? (body.room as RoomId) : null;
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 40) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 600) : "";

  if (!room || !validRooms.has(room) || !name || !message) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  const posts = await readPosts();
  const nextPost: Post = {
    id: crypto.randomUUID(),
    name,
    room,
    message,
    createdAt: new Date().toISOString(),
  };

  await writePosts([nextPost, ...posts].slice(0, 200));
  return NextResponse.json({ post: nextPost }, { status: 201 });
}
