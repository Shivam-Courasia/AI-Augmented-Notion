# AI-Augmented Notion Clone

This project is a personal knowledge management system with AI-powered features, built with React, Vite, and Supabase.

## Features

This application includes the following features and updates:

1.  **Document Deletion**: Users can now delete documents directly from the sidebar.
2.  **Tiptap Editor Integration**: The document creation and editing experience is enhanced using the Tiptap rich text editor, providing more formatting options.
3.  **AI Suggested Links**: The application suggests related links from the internet or other documents based on the content of the current document, leveraging AI for better relevance.
4.  **Knowledge Graph Visualizer**: A live, zoomable, and interactive graph visually represents how pages and tags are connected, with color-coded node types.
5.  **Smart Tags**: Placeholder for  AI to generate relevant tags for your pages.
6.  **Notion-like Dark Theme**: The application's theme has been updated to a Notion-like dark mode for improved aesthetics and user experience.
7.  **Notion-like Slash Commands**: The Tiptap editor now supports Notion-like "/" shortcuts for quickly inserting various content blocks (e.g., headings, lists, code blocks).
8.  **Document Title as H1**: The document title is now rendered as an `<h1>` element for better semantic structure.

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn
*   A Supabase project (for database and authentication)
*   A Google Cloud Project with the Gemini API enabled (for AI features)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hyperflow-knowledge
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env` file in the root directory of the project and add the following environment variables:

```
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
VITE_HF_API_TOKEN=""
```

*   **`VITE_SUPABASE_URL`** and **`VITE_SUPABASE_ANON_KEY`**: You can find these in your Supabase project settings under "API".
*   **`VITE_GEMINI_API_KEY`**: Obtain this from your Google Cloud Project after enabling the Gemini API.

### 4. Supabase Setup

*   **Database Schema**: You'll need to set up your Supabase database. Ensure you have a `pages` table with columns like `id`, `user_id`, `title`, `content`, `parent_id`, `created_at`, `updated_at`, `tags`, and `url`. You might also need RLS (Row Level Security) policies configured for `pages` table to allow users to insert, update, and delete their own pages.

    Here's a basic SQL schema for the `pages` table:

    ```sql
    create table public.pages (
      id uuid not null default gen_random_uuid(),
      user_id uuid not null,
      title text null,
      content text null,
      parent_id uuid null,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now(),
      tags text[] null,
      url text null,
      constraint pages_pkey primary key (id),
      constraint pages_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
    );
    alter table public.pages enable row security;
    create policy "Allow all for authenticated users"
    on public.pages
    for all
    to authenticated
    using (true);
    ```

*   **Authentication**: Supabase handles user authentication. You can configure email/password login, social logins, etc., within your Supabase project.

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The application should now be running at `http://localhost:8080` (or another port if 8080 is in use).

## Troubleshooting

*   **`net::ERR_NAME_NOT_RESOLVED`**: This error indicates that your application cannot resolve the Supabase URL. Double-check `VITE_SUPABASE_URL` in your `.env` file.
*   **Features not working**: Ensure all `npm install` commands were successful and there are no build errors in your terminal. Check the browser console for JavaScript errors.
*   **AI Features**: If AI features are not working, verify `VITE_GEMINI_API_KEY` in your `.env` file and ensure the Gemini API is enabled in your Google Cloud Project.
