export const routes = {
  home: "/",
  browse: "/requests",
  request: (id: string) => `/requests/${encodeURIComponent(id)}`,
  submit: "/submit",
  roadmap: "/roadmap",
  auth: {
    login: "/login",
    signup: "/signup",
  },
  admin: {
    board: "/admin/board",
    history: (id: string) => `/admin/requests/${encodeURIComponent(id)}/history`,
  },
} as const
