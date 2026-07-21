import { z } from 'zod'

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(128, 'Name must be 128 characters or fewer'),
  permissions: z.array(z.string()),
})

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>
