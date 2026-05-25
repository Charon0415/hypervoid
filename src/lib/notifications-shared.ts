export type Notification = {
  id: string;
  type:
    | "announcement"
    | "new-post"
    | "like"
    | "view"
    | "comment-link"
    | "guestbook"
    | "subscriber";
  title: string;
  body?: string;
  href?: string;
  /** ISO timestamp for sorting / display */
  at: string;
  /** Counter pill on the right (e.g. like count) */
  metric?: string;
};
