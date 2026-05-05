---
name: nitro-route-meta-openapi
description: Complete guide to NitroRouteMeta with OpenAPI 3.x support in Nuxt/Nitro. Learn how to use defineRouteMeta() for API documentation, $global components, complete type definitions, working examples from this project, and best practices.
---

# NitroRouteMeta OpenAPI - Complete Skill Guide

This skill provides comprehensive knowledge about Nitro's `defineRouteMeta` function with OpenAPI 3.x support for building API documentation directly in your Nitro route handlers.

## When to Use This Skill

Use this skill when you need to:

- Add OpenAPI/Swagger documentation to your Nitro API routes
- Understand the `NitroRouteMeta` interface structure
- Use `$global` to share OpenAPI components across routes
- Generate API specs from route metadata
- Debug OpenAPI-related issues in Nitro

---

## 1. Your Project Context

### Current Usage in This Project

Based on analysis of this project at `D:\project\web\nuxt`:

- **89 route files** using `defineRouteMeta` with `openAPI`
- APIs: auth, users, posts, blogs, courses, comments, tags, images, videos, resources, permissions, roles, user_roles, role_permissions, post_tags, blog_tags, course_tags, course_resource
- Methods: GET, POST, PUT, PATCH, DELETE

### Example from Your Project - Login Route

```typescript
// server/api/v1/auth/login.post.ts
import { db } from '@nuxthub/db'
import { users } from '#server/db/tables/users'
import { loginSchema, loginJsonSchema } from './schema/validation'
import { compare } from '#server/utils/bcrypt'
import { sign, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS } from '#server/utils/jwt'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['auth'],
    summary: 'Login user',
    requestBody: {
      required: true,
      content: {
        schema: loginJsonSchema,
      },
    },
    responses: {
      200: { description: 'Login successful' },
      400: { description: 'Validation error' },
      401: { description: 'Invalid credentials' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = loginSchema.parse(body)

  const user = await db.select().from(users).where(eq(users.email, data.email)).get()

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  const isValidPassword = await compare(data.password, user.password)

  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  const accessToken = await sign({
    userId: user.id,
    email: user.email,
    name: user.name,
  }, 'access')

  const refreshToken = await sign({
    userId: user.id,
    email: user.email,
    name: user.name,
  }, 'refresh')

  setCookie(event, ACCESS_TOKEN_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 15,
  })

  setCookie(event, REFRESH_TOKEN_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7,
  })

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  }
})
```

### Example from Your Project - GET with Query Parameters

```typescript
// server/api/v1/posts/index.get.ts
import { db } from '@nuxthub/db'
import { posts } from '#server/db/tables/posts'

defineRouteMeta({
  openAPI: {
    tags: ['posts'],
    summary: 'List all posts',
    description: 'Retrieve a list of all posts',
    parameters: [
      {
        in: 'query',
        name: 'limit',
        schema: { type: 'integer', default: 20 },
      },
      {
        in: 'query',
        name: 'offset',
        schema: { type: 'integer', default: 0 },
      },
    ],
    responses: {
      200: { description: 'Posts list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    id: posts.id,
    title: posts.title,
    content: posts.content,
    likes: posts.likes,
    status: posts.status,
    authorId: posts.authorId,
    createdAt: posts.createdAt,
  }).from(posts).limit(limit).offset(offset)

  return result
})
```

---

## 2. Core Interface Definition

### NitroRouteMeta Interface (from Nitro Source)

```typescript
/**
 * @experimental
 * Route metadata for Nitro route handlers
 * Used with defineRouteMeta() macro at build time
 */
export interface NitroRouteMeta {
  // OpenAPI 3.1 OperationObject for route documentation
  openAPI?: OperationObject & {
    // $global allows sharing OpenAPI components across ALL routes
    $global?: Pick<OpenAPI3, 'components'> & Extensable;
  };
}

// Type for global components
type OpenAPIGlobals = Pick<OpenAPI3, 'components'> & Extensable;
```

### OpenAPI 3.x Type Hierarchy

```typescript
// OPENAPI 3.1 Operation Object
// Represents a single API operation on a path
export interface OperationObject extends Extensable {
  // Tags for grouping operations in the docs
  tags?: string[];
  
  // A short summary for the operation
  summary?: string;
  
  // A verbose explanation of the operation
  description?: string;
  
  // External documentation
  externalDocs?: ExternalDocumentationObject;
  
  // Unique identifier for this operation
  operationId?: string;
  
  // Parameters for this operation
  parameters?: (ParameterObject | ReferenceObject)[];
  
  // Request body (for POST, PUT, PATCH)
  requestBody?: RequestBodyObject | ReferenceObject;
  
  // Responses this operation can return
  responses?: ResponsesObject;
  
  // Deprecated flag
  deprecated?: boolean;
  
  // Security requirements
  security?: SecurityRequirementObject[];
  
  // Servers for this operation
  servers?: ServerObject[];
  
  // Callbacks for async operations
  callbacks?: Record<string, CallbackObject>;
}

// Extensible base type (allows x- prefixed extensions)
export interface Extensable {
  [key: string]: unknown;
}

// Parameter location
export type ParameterLocation = 'query' | 'header' | 'path' | 'cookie';

// Parameter object
export interface ParameterObject extends Extensable {
  name: string;
  in: ParameterLocation;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  schema?: SchemaObject | ReferenceObject;
  example?: unknown;
}

// Request body definition
export interface RequestBodyObject extends Extensable {
  description?: string;
  required?: boolean;
  content: MediaTypeObject;
}

// Response object
export interface ResponsesObject {
  [statusCode: string]: ResponseObject | ReferenceObject;
}

export interface ResponseObject extends Extensable {
  description: string;
  headers?: Record<string, HeaderObject>;
  content?: MediaTypeObject;
  links?: Record<string, LinkObject>;
}
```

---

## 3. Complete Working Examples

### EXAMPLE 1: Authentication Route (Login POST)

```typescript
// server/api/v1/auth/login.post.ts
import { db } from '@nuxthub/db'
import { users } from '#server/db/tables/users'
import { loginSchema, loginJsonSchema } from './schema/validation'
import { compare } from '#server/utils/bcrypt'
import { sign, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS } from '#server/utils/jwt'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['auth'],
    summary: 'Login user',
    description: 'Authenticate a user and receive access and refresh tokens',
    operationId: 'loginUser',
    requestBody: {
      required: true,
      description: 'User credentials',
      content: {
        'application/json': {
          schema: loginJsonSchema,
        },
      },
    },
    responses: {
      200: { 
        description: 'Login successful',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    avatar: { type: 'string' },
                  },
                },
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
              },
            },
          },
        },
      },
      400: { description: 'Validation error - invalid request body' },
      401: { description: 'Invalid credentials' },
    },
    security: [{ bearerAuth: [] }],
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = loginSchema.parse(body)

  const user = await db.select().from(users).where(eq(users.email, data.email)).get()

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  const isValidPassword = await compare(data.password, user.password)

  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  const accessToken = await sign({
    userId: user.id,
    email: user.email,
    name: user.name,
  }, 'access')

  const refreshToken = await sign({
    userId: user.id,
    email: user.email,
    name: user.name,
  }, 'refresh')

  setCookie(event, ACCESS_TOKEN_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 15,
  })

  setCookie(event, REFRESH_TOKEN_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7,
  })

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  }
})
```

### EXAMPLE 2: CRUD - Create Operation

```typescript
// server/api/v1/posts/index.post.ts
import { db } from '@nuxthub/db'
import { posts } from '#server/db/tables/posts'
import { createPostSchema, createPostJsonSchema, postResponseJsonSchema } from './schema/validation'

defineRouteMeta({
  openAPI: {
    tags: ['posts'],
    summary: 'Create a new post',
    description: 'Create and publish a new blog post',
    operationId: 'createPost',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: createPostJsonSchema,
        },
      },
    },
    responses: {
      201: {
        description: 'Post created successfully',
        content: {
          'application/json': {
            schema: postResponseJsonSchema,
          },
        },
      },
      400: { description: 'Validation error' },
      401: { description: 'Unauthorized' },
      409: { description: 'Post with title already exists' },
    },
    security: [{ bearerAuth: [] }],
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = createPostSchema.parse(body)

  try {
    const result = await db.insert(posts).values({
      title: data.title,
      content: data.content,
      authorId: data.authorId,
      status: data.status || 'draft',
      publishedAt: data.status === 'published' ? new Date() : null,
      createdAt: new Date(),
    }).returning()

    setResponseStatus(event, 201)
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Post already exists',
    })
  }
})
```

### EXAMPLE 3: GET with Query Parameters

```typescript
// server/api/v1/users/index.get.ts
import { db } from '@nuxthub/db'
import { users } from '#server/db/tables/users'

defineRouteMeta({
  openAPI: {
    tags: ['users'],
    summary: 'List all users',
    description: 'Retrieve a paginated list of users with optional filtering',
    operationId: 'listUsers',
    parameters: [
      {
        in: 'query',
        name: 'limit',
        description: 'Maximum number of results',
        required: false,
        schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
        example: 20,
      },
      {
        in: 'query',
        name: 'offset',
        description: 'Number of results to skip',
        required: false,
        schema: { type: 'integer', default: 0, minimum: 0 },
        example: 0,
      },
      {
        in: 'query',
        name: 'search',
        description: 'Search term to filter by name or email',
        required: false,
        schema: { type: 'string' },
        example: 'john',
      },
      {
        in: 'query',
        name: 'role',
        description: 'Filter by user role',
        required: false,
        schema: { type: 'string', enum: ['admin', 'user', 'guest'] },
      },
    ],
    responses: {
      200: {
        description: 'Users list retrieved successfully',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  avatar: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
      401: { description: 'Unauthorized' },
    },
    security: [{ bearerAuth: [] }],
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20), 1, 100)
  const offset = Math.max(Number(query.offset) || 0), 0)
  const search = query.search as string | undefined
  const role = query.role as string | undefined

  let builder = db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    avatar: users.avatar,
    createdAt: users.createdAt,
  }).from(users)

  const result = builder.limit(limit).offset(offset)
  return result
})
```

### EXAMPLE 4: File Upload Endpoint

```typescript
// server/api/v1/images/index.post.ts
import { db } from '@nuxthub/db'
import { images } from '#server/db/tables/images'
import { createImageSchema } from './schema/validation'

defineRouteMeta({
  openAPI: {
    tags: ['images'],
    summary: 'Upload an image',
    description: 'Upload a new image file to the server',
    operationId: 'uploadImage',
    requestBody: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            required: ['file'],
            properties: {
              file: {
                type: 'string',
                format: 'binary',
                description: 'Image file to upload',
              },
              title: {
                type: 'string',
                description: 'Optional title for the image',
              },
              alt: {
                type: 'string',
                description: 'Alternative text for accessibility',
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Image uploaded successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                url: { type: 'string', format: 'uri' },
                title: { type: 'string' },
                alt: { type: 'string' },
                size: { type: 'integer' },
                mimeType: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      400: { description: 'Invalid file type or size exceeded' },
      401: { description: 'Unauthorized' },
      413: { description: 'File size too large' },
    },
    security: [{ bearerAuth: [] }],
  },
})

export default defineEventHandler(async (event) => {
  const form = await readMultipartForm(event)
  const file = form.files.file
  
  if (!file || file.size > 5 * 1024 * 1024) {
    throw createError({
      statusCode: 413,
      statusMessage: 'File size too large. Maximum 5MB allowed.',
    })
  }

  const body = {
    file: file,
    title: form.fields.title,
    alt: form.fields.alt,
  }
  
  const data = createImageSchema.parse(body)

  const result = await db.insert(images).values({
    url: data.url,
    title: data.title || '',
    alt: data.alt || '',
    size: data.size,
    mimeType: data.mimeType,
    createdAt: new Date(),
  }).returning()

  setResponseStatus(event, 201)
  return result[0]
})
```

### EXAMPLE 5: Using $global for Shared Components

```typescript
// server/api/v1/courses/index.post.ts - Using $global
import { db } from '@nuxthub/db'
import { courses } from '#server/db/tables/courses'
import { createCourseSchema, createCourseJsonSchema, courseResponseJsonSchema } from './schema/validation'

defineRouteMeta({
  openAPI: {
    tags: ['courses'],
    summary: 'Create a new course',
    description: 'Create a new online course',
    operationId: 'createCourse',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: createCourseJsonSchema,
        },
      },
    },
    responses: {
      201: {
        description: 'Course created successfully',
        content: {
          'application/json': {
            schema: courseResponseJsonSchema,
          },
        },
      },
      400: { description: 'Validation error' },
      401: { description: 'Unauthorized' },
    },
    security: [{ bearerAuth: [] }],
    // Using $global to define shared schemas
    $global: {
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              avatar: { type: 'string' },
            },
            required: ['id', 'name', 'email'],
          },
          Course: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              title: { type: 'string' },
              description: { type: 'string' },
              content: { type: 'string' },
              likes: { type: 'integer' },
              status: { type: 'string', enum: ['draft', 'published', 'archived'] },
              instructorId: { type: 'integer' },
              createdAt: { type: 'string', format: 'date-time' },
            },
            required: ['id', 'title', 'status', 'instructorId'],
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              statusCode: { type: 'integer' },
              statusMessage: { type: 'string' },
              message: { type: 'string' },
            },
            required: ['statusCode', 'statusMessage'],
          },
        },
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token from login endpoint',
          },
        },
      },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = createCourseSchema.parse(body)

  const result = await db.insert(courses).values({
    title: data.title,
    description: data.description,
    content: data.content,
    likes: data.likes || 0,
    status: data.status || 'draft',
    instructorId: data.instructorId,
    createdAt: new Date(),
  }).returning()

  setResponseStatus(event, 201)
  return result[0]
})
```

### Reference: How to use $ref in other routes

```typescript
// server/api/v1/courses/[id]/index.get.ts
// After defining $global in one route, reference the schemas

defineRouteMeta({
  openAPI: {
    tags: ['courses'],
    summary: 'Get course by ID',
    operationId: 'getCourseById',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      200: {
        description: 'Course found',
        content: {
          'application/json': {
            // Reference the global schema
            schema: { $ref: '#/components/schemas/Course' },
          },
        },
      },
      404: { description: 'Course not found' },
    },
    security: [{ bearerAuth: [] }],
  },
})
```

---

## 4. Runtime/Build Behavior

### How It Works

1. **Build-time collection**: During `nuxi build` or `nuxi prepare`, Nitro scans all route files
2. **Metadata extraction**: The `defineRouteMeta()` calls are extracted by Nitro's build system
3. **Type aggregation**: All route metadata is collected and merged
4. **OpenAPI generation**: The `$global` components are merged into the top-level spec

### Key Points

- `defineRouteMeta()` is a **build-time macro** - not executed at runtime
- The metadata is collected from `.ts` files in `server/api/` directory
- `$global` components from all routes are merged into a single `components` section
- Duplicate component names may be merged or overwritten (implementation-dependent)

---

## 5. Common Properties Quick Reference

| Property | Type | Description |
|----------|------|--------------|
| `tags` | `string[]` | Group operations in docs |
| `summary` | `string` | Short operation summary |
| `description` | `string` | Detailed description |
| `operationId` | `string` | Unique operation ID |
| `parameters` | `ParameterObject[]` | Query, path, header, cookie params |
| `requestBody` | `RequestBodyObject` | POST/PUT/PATCH body |
| `responses` | `ResponsesObject` | HTTP responses |
| `security` | `SecurityRequirementObject[]` | Security requirements |
| `deprecated` | `boolean` | Mark as deprecated |
| `externalDocs` | `ExternalDocumentationObject` | External documentation |
| `$global` | `OpenAPIGlobals` | Shared components |

---

## 6. Troubleshooting

### Common Errors

1. **Invalid OpenAPI spec**: Validate your JSON schemas
2. **Circular $ref references**: Avoid circular references in schemas
3. **Type conflicts**: Ensure consistent types across routes
4. **Missing required fields**: Check `required: true` fields are provided

### Best Practices

1. **Use $global** for shared schemas and security schemes
2. **Define consistent tags** for grouping related routes
3. **Use operationId** for easy referencing
4. **Always define security** for protected routes
5. **Use $ref** to reference global components instead of duplicating
6. **Keep schemas in sync** with TypeScript types

---

## 7. Project Routes Reference

This project uses 89 routes with `defineRouteMeta`:

| API | Routes |
|-----|-------|
| auth | login, register, logout, me, refresh |
| users | index (GET, POST), [id] (GET, PUT, PATCH, DELETE) |
| posts | index (GET, POST), [id] (GET, PUT, PATCH, DELETE) |
| blogs | index (GET, POST), [id] (GET, PUT, PATCH, DELETE) |
| courses | index (GET, POST), [id] (GET, PUT, PATCH, DELETE) |
| comments | index (GET, POST), [id] (GET, PUT, PATCH, DELETE) |
| tags | index (GET, POST), [id] (GET, PUT, PATCH, DELETE) |
| images | index (GET, POST), [id] (GET, PUT, PATCH, DELETE) |
| videos | index (GET, POST), [id] (GET, PUT, PATCH, DELETE) |
| resources | index (GET, POST), [id] (GET, PUT, PATCH, DELETE) |
| roles | index (GET, POST), [id] (GET, PUT, PATCH, DELETE) |
| permissions | index (GET, POST), [id] (GET, PUT, PATCH, DELETE) |
| user_roles | index (GET, POST), [id] (DELETE) |
| role_permissions | index (GET, POST), [id] (DELETE) |
| post_tags | index (GET, POST), [id] (DELETE) |
| blog_tags | index (GET, POST), [id] (DELETE) |
| course_tags | index (GET, POST), [id] (DELETE) |
| course_resource | index (GET, POST), [id] (DELETE) |

---

(End of skill)