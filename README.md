# TMM Jobs 

TMM Jobs is an Angular staffing workflow that brings client requests and employee assignments into one simple application. Clients can request staff, follow each request, review assigned employees and their CVs, and approve or reject assignments. Administrators can build the employee pool, match available people to open requests, and manage each job through completion.

This repository is a local demonstration project. It uses JSON Server as a lightweight REST API, so no separate backend application or database is required for development.

## What you can do

### As a client

- Create an account and sign in.
- Submit a job request with the role, description, experience level, number of employees, work site, and availability.
- Track only the requests created by your account.
- Review assigned employees and open their PDF CVs.
- Approve or reject each proposed employee.

### As an administrator

- Add employees and record their role, experience, work location, and availability.
- Upload a PDF CV for each employee (up to 70 KB).
- Review active job requests and assign available employees to individual seats.
- Start a job after every required assignment has been approved.
- Mark jobs as complete or remove them, returning assigned employees to the available pool.

## How the workflow fits together

1. A client creates a new request. It begins with a **Pending** status.
2. An administrator assigns employees to the requested seats.
3. The client reviews each employee and approves or rejects the assignment.
4. Once every seat is approved, the administrator can move the job to **Working**.
5. When the work is complete, the administrator marks the job as **Done**, and the employees become available again.

In short: **Pending → Waiting for approval → Working → Done**.

## Tech stack

- Angular 16.2
- TypeScript 5.1
- RxJS 7.8
- Bootstrap 5.3
- JSON Server 0.17

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 LTS (Node 18.10 or newer)
- npm
- Four terminal windows: one for the Angular app and one for each local API

The Angular CLI and JSON Server are installed with the project, so global installations are not required.

### 1. Clone and install

```bash
git clone https://github.com/N-alghamdi/TMM_Angular_Project.git
cd TMM_Angular_Project
npm ci
```

### 2. Create the local data files

The repository does not include personal or seed data. Create the following three files in the project root before starting the application.

`jobs.json`

```json
{
  "jobs": []
}
```

`employees.json`

```json
{
  "employees": []
}
```

`accounts.json`

```json
{
  "accounts": [
    {
      "id": "1",
      "email": "admin@tmm.local",
      "password": "admin123",
      "role": "admin",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

The sample administrator account is only for local development. Change these credentials if you keep the data file.

### 3. Start the three local APIs

Run each command in a separate terminal from the project root:

```bash
npx json-server --watch jobs.json --port 3001
```

```bash
npx json-server --watch accounts.json --port 3002
```

```bash
npx json-server --watch employees.json --port 3003
```

The frontend expects these exact endpoints:

| Data | Endpoint | Local file |
| --- | --- | --- |
| Jobs | `http://localhost:3001/jobs` | `jobs.json` |
| Accounts | `http://localhost:3002/accounts` | `accounts.json` |
| Employees | `http://localhost:3003/employees` | `employees.json` |

### 4. Start the Angular app

In a fourth terminal, run:

```bash
npm start
```

Then open one of these entry points:

- Client registration: [http://localhost:4200/client/register](http://localhost:4200/client/register)
- Client login: [http://localhost:4200/client/login](http://localhost:4200/client/login)
- Administrator login: [http://localhost:4200/admin/login](http://localhost:4200/admin/login)

If you copied the sample account above, sign in as the administrator with `admin@tmm.local` and `admin123`. Clients can create their own accounts from the registration page.

> The application does not currently define a landing page for `/`, so use one of the links above.

## Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Runs the development server at `http://localhost:4200` and reloads when files change. |
| `npm run build` | Creates a production build in `dist/tmm-jobs`. |
| `npm run watch` | Rebuilds in development mode whenever source files change. It does not serve the app. |
| `npm test` | Starts the Karma test runner in watch mode. Chrome or Chromium is required. |

The testing tools are configured, but the repository does not currently contain application test specifications.

## Project structure

```text
src/app/
├── authentication/        # Login, client registration, and role guards
├── admin/                 # Employee management and active job requests
├── client/                # Job creation and request tracking
├── accounts.ts            # Account data model
├── employees.ts           # Employee data model
├── jobs.ts                # Job request data model
├── shared.service.ts      # HTTP access to the three JSON Server APIs
├── app-routing.module.ts  # Lazy-loaded feature routes
└── app.module.ts          # Root Angular module
```

The application keeps authentication, administrator, and client features in separate lazy-loaded modules. `SharedService` is the single place used to read and update accounts, employees, and jobs.

## Development notes

- Authentication is intentionally lightweight: credentials are stored in local JSON, passwords are compared in the browser, and the active user is kept in `localStorage`.
- The API URLs are currently hard-coded in `src/app/shared.service.ts`.
- Employee CVs are stored as Base64 text in `employees.json`; uploads must be PDFs no larger than 70 KB.
- Record IDs are generated in the browser from the current list length.
- A production version should use server-side authentication and authorization, a real database, server-generated IDs, environment-based API URLs, and automated tests.

For a deployed build, the web host must serve `dist/tmm-jobs`, fall back to `index.html` for Angular routes, and provide hosted replacements for all three local APIs.
