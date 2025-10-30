# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 frontend application built with React 19, TypeScript, and Tailwind CSS v4. The project uses the Next.js App Router architecture with support for server and client components.

## Development Commands

### Core Commands
- `npm run dev` - Start the development server at http://localhost:3000 with hot reload
- `npm run build` - Create production build
- `npm start` - Run production build locally
- `npm run lint` - Run ESLint to check code quality

### Package Management
- Use `npm install` to install dependencies (package-lock.json is committed)

## Tech Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **React**: 19.2.0 (latest with compiler runtime)
- **TypeScript**: v5 with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono (auto-optimized via next/font)
- **Linting**: ESLint 9 with next/core-web-vitals and TypeScript configs

## Architecture

### File Structure
- `src/app/` - App Router pages and layouts
  - `layout.tsx` - Root layout with font configuration and metadata
  - `page.tsx` - Home page component
  - `globals.css` - Global styles and Tailwind directives
- `next.config.ts` - Next.js configuration (TypeScript)
- Path alias: `@/*` maps to `./src/*`

### TypeScript Configuration
- Target: ES2017
- Module resolution: bundler
- JSX: react-jsx (using React 19's automatic JSX transform)
- Strict mode enabled
- Path aliases configured for `@/*` imports

### Styling Architecture
- Tailwind CSS v4 with PostCSS plugin
- Dark mode support via `dark:` class variants
- Uses CSS variables for theming (--font-geist-sans, --font-geist-mono)

### ESLint Configuration
- Uses flat config format (eslint.config.mjs)
- Next.js core-web-vitals and TypeScript configs
- Ignores: .next/, out/, build/, next-env.d.ts

## Key Conventions

- Components use TypeScript with explicit typing
- Server components by default (use "use client" directive when needed)
- Image optimization via next/image component
- Font optimization via next/font/google
- Metadata defined in layout.tsx using Next.js Metadata API
