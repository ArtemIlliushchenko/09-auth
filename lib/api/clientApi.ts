"use client";

import { Note } from "@/types/note";
import { User } from "@/types/user";
import { RegisterRequest, LoginRequest } from "@/types/auth";
import { api } from "@/lib/api/api";

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

const DEFAULT_TAGS = ["Todo", "Personal", "Work", "Shopping", "Meeting"];

// ---------- AUTH ----------

export async function registerClient(
  data: RegisterRequest
): Promise<User> {
  const res = await api.post<User>("/auth/register", data);
  return res.data;
}

export async function loginClient(
  data: LoginRequest
): Promise<User> {
  const res = await api.post<User>("/auth/login", data);
  return res.data;
}

export async function logoutClient(): Promise<void> {
  await api.post("/auth/logout");
}

export async function checkSessionClient(): Promise<void> {
  await api.get("/auth/session");
}

// 🔥 alias ДЛЯ AuthProvider
export const checkSession = checkSessionClient;

// ---------- USER ----------

export async function getUserProfile(): Promise<User> {
  const res = await api.get<User>("/users/me");
  return res.data;
}

export async function updateUser(
  update: Partial<{ username: string }>
): Promise<User> {
  const res = await api.patch<User>("/users/me", update);
  return res.data;
}

// ---------- NOTES ----------

export async function fetchNotesClient(
  search = "",
  page = 1,
  perPage = 12,
  tag?: string
): Promise<FetchNotesResponse> {
  const params: Record<string, string> = {
    page: String(page),
    perPage: String(perPage),
  };

  if (search) params.search = search;
  if (tag && tag.toLowerCase() !== "all") params.tag = tag;

  const res = await api.get<FetchNotesResponse>("/notes", { params });
  return res.data;
}

export async function fetchNoteByIdClient(id: string): Promise<Note> {
  const res = await api.get<Note>(`/notes/${id}`);
  return res.data;
}

export async function createNoteClient(note: {
  title: string;
  content: string;
  tag: string;
}): Promise<Note> {
  const res = await api.post<Note>("/notes", note);
  return res.data;
}

export async function deleteNoteClient(id: string): Promise<Note> {
  const res = await api.delete<Note>(`/notes/${id}`);
  return res.data;
}

// 🔥 alias ДЛЯ компонентів
export const createNote = createNoteClient;
export const fetchNoteById = fetchNoteByIdClient;

// ---------- TAGS ----------

export async function getTagsClient(): Promise<string[]> {
  try {
    const res = await fetchNotesClient();
    const tagsFromNotes = Array.from(
      new Set(res.notes.map((note) => note.tag))
    );

    return Array.from(new Set([...DEFAULT_TAGS, ...tagsFromNotes]));
  } catch {
    return DEFAULT_TAGS;
  }
}
