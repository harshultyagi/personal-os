import { login, signup } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold">Personal OS</h1>

        {params.error && (
          <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">
            {params.error}
          </p>
        )}
        {params.message && (
          <p className="mb-4 rounded bg-green-50 p-2 text-sm text-green-600">
            {params.message}
          </p>
        )}

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              formAction={login}
              className="flex-1 rounded bg-black py-2 text-white"
            >
              Log In
            </button>
            <button
              formAction={signup}
              className="flex-1 rounded border py-2"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}