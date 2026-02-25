import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'

import { CreateUserSchema } from '../backend/schemas'
import { hono } from './lib/hono'

export function App() {
  const { data: hello } = useQuery({
    queryKey: ['hello'],
    async queryFn() {
      const response = await hono.api.hello.$get()

      return response.json()
    },
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    async queryFn() {
      const response = await hono.api.users.$get()

      return response.json()
    },
  })

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(CreateUserSchema),
  })

  const { isPending, mutate: addUser } = useMutation<
    unknown,
    Error,
    {
      name: string
    }
  >({
    async mutationFn(variables, context) {
      await hono.api.users.$post({
        json: variables,
      })

      await context.client.invalidateQueries({
        queryKey: ['users'],
      })
    },
    onSuccess() {
      reset()
    },
  })

  const onSubmit = handleSubmit((data) => {
    if (isPending) {
      return
    }

    addUser(data)
  })

  return (
    <div className="flex flex-col gap-16 p-4">
      <div className="flex flex-col gap-2">
        <div className="size-12 animate-pulse rounded-full bg-amber-600" />

        <h1 className="font-bold text-2xl">duet-ai-starter</h1>

        <p>
          This is the Duet ai starter app built with Hono and React, served with
          Vite
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p>
          Response from <code>/api/hello</code>
        </p>

        <pre className="rounded-lg bg-gray-200 p-4 font-mono text-sm">
          {hello ? JSON.stringify(hello, null, 2) : 'Loading'}
        </pre>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-medium text-lg">Users</h2>

        <div className="grid grid-cols-2 items-start gap-8 text-sm">
          <table className="text-sm">
            <thead>
              <tr>
                <th className="w-1 p-2 text-left font-medium">Id</th>
                <th className="p-2 text-left font-medium">Name</th>
              </tr>
            </thead>

            <tbody>
              {users?.map((user) => (
                <tr className="border-gray-200 border-t" key={user.id}>
                  <td className="p-2">{user.id}</td>
                  <td className="p-2">{user.name}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <form className="flex flex-col items-start gap-4" onSubmit={onSubmit}>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <label className="flex flex-col gap-1">
                  <span className="font-medium text-gray-800">Name</span>

                  <input
                    {...field}
                    className="h-8 rounded-md border border-gray-300 px-2 outline-none ring-amber-500 focus-visible:border-amber-700 focus-visible:ring-2"
                    placeholder="Name"
                  />
                </label>
              )}
            />

            <button
              className="h-8 rounded-md bg-amber-600 px-3 font-medium text-white outline-none ring-amber-500 hover:bg-amber-700 focus-visible:ring-2 active:bg-amber-800"
              disabled={isPending}
              type="submit"
            >
              Add user
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
