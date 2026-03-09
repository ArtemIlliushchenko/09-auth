import { User } from "@/types/user";
import { Note } from "@/types/note";
import { RegisterRequest, LoginRequest, SessionResponse } from "@/types/auth";
import { cookies } from "next/headers";
import { api } from "./api";
import { isAxiosError, AxiosResponse } from "axios";



const DEFAULT_TAGS = ["Todo", "Personal", "Work", "Shopping", "Meeting"];

// -------- helpers --------

export async function getAuthHeaders(): Promise<{
  headers: { Cookie: string };
}> {
  const cookieStore = await cookies();
  const cookieString = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return {
    headers: { Cookie: cookieString },
  };
}

// -------- AUTH --------

export async function registerServer(
  data: RegisterRequest
): Promise<User> {
  try {
    const config = await getAuthHeaders();
    const res = await api.post<User>("/auth/register", data, config);
    return res.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
    throw new Error("Registration failed");
  }
}

export async function loginServer(
  data: LoginRequest
): Promise<User> {
  try {
    const config = await getAuthHeaders();
    const res = await api.post<User>("/auth/login", data, config);
    return res.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
    throw new Error("Login failed");
  }
}

export async function logoutServer(): Promise<void> {
  try {
    const config = await getAuthHeaders();
    await api.post("/auth/logout", {}, config);
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Logout failed");
    }
    throw new Error("Logout failed");
  }
}


export async function checkSession(): Promise<
  AxiosResponse<SessionResponse>
> {
  try {
    const cookieStore = await cookies();

    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    return await api.get<SessionResponse>("/auth/session", {
      headers: {
        Cookie: cookieHeader,
      },
    });
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Session check failed"
      );
    }
    throw new Error("Session check failed");
  }
}



// -------- USER --------

export async function getUserProfile(): Promise<User> {
  try {
    const config = await getAuthHeaders();
    const res = await api.get<User>("/users/me", config);
    return res.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Unauthorized");
    }
    throw new Error("Unauthorized");
  }
}

export async function updateUser(
  update: Partial<{ username: string }>
): Promise<User> {
  try {
    const config = await getAuthHeaders();
    const res = await api.patch<User>("/users/me", update, config);
    return res.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Update failed");
    }
    throw new Error("Update failed");
  }
}

// -------- NOTES --------

export async function fetchNotes(
  search = "",
  page = 1,
  perPage = 12,
  tag?: string
): Promise<{ notes: Note[]; totalPages: number }> {
  try {
    const config = await getAuthHeaders();

    const params: Record<string, string> = {
      page: String(page),
      perPage: String(perPage),
    };

    if (search) params.search = search;
    if (tag && tag.toLowerCase() !== "all") params.tag = tag;

    const res = await api.get<{
      notes: Note[];
      totalPages: number;
    }>("/notes", {
      ...config,
      params,
    });

    return res.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Fetching notes failed");
    }
    throw new Error("Fetching notes failed");
  }
}

export async function fetchNoteById(id: string): Promise<Note> {
  try {
    const config = await getAuthHeaders();
    const res = await api.get<Note>(`/notes/${id}`, config);
    return res.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Fetching note failed");
    }
    throw new Error("Fetching note failed");
  }
}

export async function deleteNote(id: string): Promise<Note> {
  try {
    const config = await getAuthHeaders();
    const res = await api.delete<Note>(`/notes/${id}`, config);
    return res.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Deleting note failed");
    }
    throw new Error("Deleting note failed");
  }
}

// -------- TAGS --------

export async function getTags(): Promise<string[]> {
  try {
    const res = await fetchNotes();
    const tagsFromNotes = Array.from(
      new Set(res.notes.map((note) => note.tag))
    );

    return Array.from(new Set([...DEFAULT_TAGS, ...tagsFromNotes]));
  } catch {
    return DEFAULT_TAGS;
  }
}
