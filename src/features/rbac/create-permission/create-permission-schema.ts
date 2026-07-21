import { z } from 'zod'

export const createPermissionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(128, 'Name must be 128 characters or fewer'),
  description: z.string().max(255, 'Description must be 255 characters or fewer'),
})

export type CreatePermissionFormValues = z.infer<typeof createPermissionSchema>
