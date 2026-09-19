const API_BASE = import.meta.env.VITE_API_BASE ?? "";

const VISITOR_KEY = "lhs_visitor_id";

function getVisitorId(): string {
  const existing = localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(VISITOR_KEY, created);
  return created;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("X-Visitor-Id", getVisitorId());
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  const returnedVisitor = response.headers.get("X-Visitor-Id");
  if (returnedVisitor) {
    localStorage.setItem(VISITOR_KEY, returnedVisitor);
  }

  if (!response.ok) {
    let detail: unknown = "Something went wrong";
    try {
      const data = await response.json();
      detail = data.detail ?? detail;
      if (Array.isArray(detail)) {
        detail = detail
          .map((item: { msg?: string }) => item.msg)
          .filter(Boolean)
          .join(", ");
      }
    } catch {
      /* ignore */
    }
    throw new Error(typeof detail === "string" ? detail : "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getPosts: (params: URLSearchParams) =>
    request<import("./types").PostListResponse>(`/api/posts?${params.toString()}`),
  getPost: (id: string) => request<import("./types").PostDetail>(`/api/posts/${id}`),
  createPost: (body: {
    title?: string;
    content: string;
    author_name?: string;
    category: string;
  }) =>
    request<import("./types").PostDetail>("/api/posts", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  createComment: (postId: string, body: { content: string; author_name?: string }) =>
    request<import("./types").Comment>(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  toggleReaction: (postId: string, kind: "stand_with" | "this_helped") =>
    request<import("./types").ReactionResponse>(`/api/posts/${postId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ kind }),
    }),
  reportPost: (
    postId: string,
    body: {
      category?: "harassment" | "personal-info" | "harmful" | "spam" | "other";
      details?: string;
      reason?: string;
    },
  ) =>
    request<{ message: string; report_count: number; hidden: boolean; already_reported: boolean }>(
      `/api/posts/${postId}/report`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    ),
  getStats: () => request<import("./types").CommunityStats>("/api/stats"),
  getHealth: () => request<import("./types").HealthResponse>("/api/health"),
  getSafety: () => request<import("./types").SafetyResource[]>("/api/safety"),
};
