# CRM Client Management Backend

A NestJS backend for client and company management, featuring email OTP verification, JWT authentication, role-based access control, and Prisma-managed PostgreSQL persistence.

## Overview

This project is a modular NestJS application built with Fastify and Prisma. It includes:

- secure user registration and login
- email OTP verification for account validation
- JWT access and refresh token flow
- role-based authorization for protected client operations
- Prisma models for `User`, `Client`, and `Company`
- Fastify security middleware, cookies, CSRF, and Swagger documentation

## Tech Stack

- NestJS
- Fastify
- Prisma
- PostgreSQL
- JWT
- Nodemailer
- CSRF
- Helmet

## Architecture

The application is structured around NestJS modules:

- `AppModule`
  - loads global configuration and modules
  - applies the `ValidationPipe` globally
- `PrismaModule`
  - provides a Prisma client with PostgreSQL connection support
- `MailModule`
  - sends OTP emails using Nodemailer
- `AuthModule`
  - handles registration, login, email verification, refresh tokens, and sign out
  - exposes `TokenService` for JWT creation and verification
- `ClientModule`
  - provides client CRUD operations
  - protects creation and update routes with admin-level authorization

Bootstrap in `src/main.ts` configures Fastify with:

- `@fastify/helmet`
- `@fastify/csrf-protection`
- `@fastify/cookie`
- `@fastify/static`
- `@fastify/compress`
- CORS with credential support
- Swagger docs available at `/docs`

## Authentication System

Authentication uses an OTP-based validation flow combined with JWT tokens.

### Registration flow

- User registers with email, password, phone, and company name.
- Passwords are hashed using `bcrypt`.
- The app generates a 6-digit OTP and stores it with an expiration.
- The OTP is emailed to the user.
- A refresh token is set in an HTTP-only cookie.
- A short-lived access token is returned with `accessState: 'pending'`.

### Login flow

- User logs in with email and password.
- After password verification, a new OTP is generated and emailed.
- A new refresh token cookie is issued.
- A pending access token is returned.

### Email verification

- The user submits `email` and `otpCode`.
- The server checks OTP validity and expiry.
- On success, `otpVerified` is set to `true`.
- The server issues a verified access token with `accessState: 'verified'`.

### Token handling

- `access_token` is signed with `JWT_ACCESS_SECRET` and expires in `15m`
- `refresh_token` is signed with `JWT_REFRESH_SECRET` and expires in `7d`
- `refresh_token` is stored in an HTTP-only cookie
- `AuthGuard` validates access tokens and compares `tokenVersion`

### Sign out

- `DELETE /auth/sign-out` revokes the session by incrementing `tokenVersion`
- The refresh cookie is cleared

## Security

This backend uses several security mechanisms:

- JWT access and refresh token separation
- secure HTTP-only cookies for refresh tokens
- token versioning to invalidate existing access tokens after sign out
- role-based authorization using `RolesGuard` and the `@Roles()` decorator
- CSRF protection via Fastify CSRF plugin
- secure HTTP headers via Helmet
- global request validation with `ValidationPipe`
- strict CORS configuration with allowed methods and credentials

> Note: `DELETE /client/:id` in the current code is not protected by authentication. Protect this route before production deployment.

## API Reference

### Auth Endpoints

#### `POST /auth/register`

Registers a new account and sends an OTP email.

Request body:

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "phone": "0123456789",
  "companyName": "Acme Corp"
}
```

Response includes:

- `user`
- `tokens.access_token`
- HTTP-only `refresh_token` cookie

#### `POST /auth/login`

Logs in the user and sends a new OTP.

Request body:

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

Response includes a pending access token and refresh cookie.

#### `POST /auth/verify-email`

Verifies the OTP and upgrades the session.

Request body:

```json
{
  "email": "user@example.com",
  "otpCode": "123456"
}
```

#### `PATCH /auth/refresh-token`

Refreshes the access token using the refresh cookie.

#### `DELETE /auth/sign-out`

Revokes the session and clears the refresh cookie.

### Client Endpoints

#### `GET /client`

Returns all clients. Requires authentication.

#### `GET /client/:id`

Returns a client by ID. Requires authentication.

#### `POST /client`

Creates a client. Requires `ADMIN` role.

Request body:

```json
{
  "name": "Client Name",
  "email": "client@example.com",
  "phone": "0987654321",
  "companyName": "Client Company"
}
```

#### `PATCH /client/:id`

Updates client data. Requires `ADMIN` role.

#### `DELETE /client/:id`

Deletes a client. Requires `ADMIN` role.

## Prisma Models

`schema.prisma` defines:

### `User`

- `id: String` (UUID)
- `email: String` (unique)
- `password: String`
- `role: Role` (`USER`, `ADMIN`)
- `status: UserStatus` (`ACTIVE`, `INACTIVE`, `SUSPENDED`)
- `phone: String`
- `otpCode: String?`
- `otpExpiry: DateTime?`
- `otpVerified: Boolean`
- `tokenVersion: Int`
- `companyId: String?`
- `createdAt: DateTime`
- `updatedAt: DateTime`

Relations:

- optional `company`

### `Client`

- `id: String` (UUID)
- `name: String`
- `email: String` (unique)
- `phone: String`
- `companyId: String?`
- `createdAt: DateTime`
- `updatedAt: DateTime`

Relations:

- optional `company`

### `Company`

- `id: String` (UUID)
- `name: String`
- `createdAt: DateTime`

Relations:

- `users`
- `clients`

### Enums

- `Role`: `USER`, `ADMIN`
- `UserStatus`: `ACTIVE`, `INACTIVE`, `SUSPENDED`

## Environment Variables

Required env vars:

```bash
DATABASE_URL
JWT_SECRET
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
COOKIE_SECRET
CORS_ORIGIN
EMAIL_HOST
EMAIL_USER
EMAIL_PASS
PORT
NODE_ENV
```

## Setup & Run

Install dependencies:

```bash
npm install
```

Run in development:

```bash
npm run start:dev
```

Build and run in production:

```bash
npm run build
npm run start:prod
```

Run tests:

```bash
npm run test
npm run test:e2e
npm run test:cov
```

## Swagger API Docs

Open `http://localhost:3000/docs` after startup.

## Production Notes

- Use strong JWT secrets and rotate them regularly.
- Serve cookies only over HTTPS in production.
- Add route guarding for all mutating operations.
- Use a production SMTP provider for email delivery.
- Enable Prisma migrations before deploying.
