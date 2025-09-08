import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema types for TypeScript-like documentation
export const DatabaseSchema = {
  users: {
    userId: 'UUID',
    email: 'string',
    subscriptionTier: 'string',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  projects: {
    projectId: 'UUID',
    userId: 'UUID',
    projectName: 'string',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  samples: {
    sampleId: 'UUID',
    projectId: 'UUID',
    audioFileUrl: 'string',
    identifiedSongTitle: 'string',
    originalArtist: 'string',
    rightsHolderName: 'string',
    rightsHolderContact: 'string',
    clearanceStatus: 'string',
    clearanceRequestId: 'UUID',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  rightsHolders: {
    rightsHolderId: 'UUID',
    name: 'string',
    contactEmail: 'string',
    contactPhone: 'string',
    address: 'string',
    website: 'string'
  },
  clearanceRequests: {
    clearanceRequestId: 'UUID',
    sampleId: 'UUID',
    requestDate: 'timestamp',
    submissionStatus: 'string',
    responseStatus: 'string',
    termsOffered: 'text',
    agreementUrl: 'string',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  }
}
