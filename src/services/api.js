import { supabase } from './supabase.js'
import { v4 as uuidv4 } from 'uuid'

// User Management
export const userService = {
  async createUser(email, subscriptionTier = 'free') {
    const userId = uuidv4()
    const { data, error } = await supabase
      .from('users')
      .insert([{
        userId,
        email,
        subscriptionTier,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getUserById(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('userId', userId)
      .single()

    if (error) throw error
    return data
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('userId', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Project Management
export const projectService = {
  async createProject(userId, projectName) {
    const projectId = uuidv4()
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        projectId,
        userId,
        projectName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getUserProjects(userId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })

    if (error) throw error
    return data
  },

  async updateProject(projectId, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('projectId', projectId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteProject(projectId) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('projectId', projectId)

    if (error) throw error
  }
}

// Sample Management
export const sampleService = {
  async createSample(sampleData) {
    const sampleId = uuidv4()
    const { data, error } = await supabase
      .from('samples')
      .insert([{
        sampleId,
        ...sampleData,
        clearanceStatus: sampleData.clearanceStatus || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getProjectSamples(projectId) {
    const { data, error } = await supabase
      .from('samples')
      .select('*')
      .eq('projectId', projectId)
      .order('createdAt', { ascending: false })

    if (error) throw error
    return data
  },

  async getUserSamples(userId) {
    const { data, error } = await supabase
      .from('samples')
      .select(`
        *,
        projects!inner(userId)
      `)
      .eq('projects.userId', userId)
      .order('createdAt', { ascending: false })

    if (error) throw error
    return data
  },

  async updateSample(sampleId, updates) {
    const { data, error } = await supabase
      .from('samples')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('sampleId', sampleId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteSample(sampleId) {
    const { error } = await supabase
      .from('samples')
      .delete()
      .eq('sampleId', sampleId)

    if (error) throw error
  }
}

// Rights Holder Management
export const rightsHolderService = {
  async createRightsHolder(rightsHolderData) {
    const rightsHolderId = uuidv4()
    const { data, error } = await supabase
      .from('rightsHolders')
      .insert([{
        rightsHolderId,
        ...rightsHolderData
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getAllRightsHolders() {
    const { data, error } = await supabase
      .from('rightsHolders')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data
  },

  async searchRightsHolders(searchTerm) {
    const { data, error } = await supabase
      .from('rightsHolders')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,contactEmail.ilike.%${searchTerm}%`)
      .order('name', { ascending: true })

    if (error) throw error
    return data
  },

  async updateRightsHolder(rightsHolderId, updates) {
    const { data, error } = await supabase
      .from('rightsHolders')
      .update(updates)
      .eq('rightsHolderId', rightsHolderId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Clearance Request Management
export const clearanceService = {
  async createClearanceRequest(sampleId, requestData) {
    const clearanceRequestId = uuidv4()
    const { data, error } = await supabase
      .from('clearanceRequests')
      .insert([{
        clearanceRequestId,
        sampleId,
        requestDate: new Date().toISOString(),
        submissionStatus: 'draft',
        responseStatus: 'pending',
        ...requestData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getUserClearanceRequests(userId) {
    const { data, error } = await supabase
      .from('clearanceRequests')
      .select(`
        *,
        samples!inner(
          *,
          projects!inner(userId)
        )
      `)
      .eq('samples.projects.userId', userId)
      .order('createdAt', { ascending: false })

    if (error) throw error
    return data
  },

  async updateClearanceRequest(clearanceRequestId, updates) {
    const { data, error } = await supabase
      .from('clearanceRequests')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('clearanceRequestId', clearanceRequestId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getClearanceRequestById(clearanceRequestId) {
    const { data, error } = await supabase
      .from('clearanceRequests')
      .select(`
        *,
        samples(*)
      `)
      .eq('clearanceRequestId', clearanceRequestId)
      .single()

    if (error) throw error
    return data
  }
}

// Analytics and Dashboard Data
export const analyticsService = {
  async getUserStats(userId) {
    try {
      // Get project count
      const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select('projectId')
        .eq('userId', userId)

      if (projectError) throw projectError

      // Get sample count
      const { data: samples, error: sampleError } = await supabase
        .from('samples')
        .select('sampleId, clearanceStatus')
        .in('projectId', projects.map(p => p.projectId))

      if (sampleError) throw sampleError

      // Get clearance request count
      const { data: clearances, error: clearanceError } = await supabase
        .from('clearanceRequests')
        .select('clearanceRequestId, responseStatus')
        .in('sampleId', samples.map(s => s.sampleId))

      if (clearanceError) throw clearanceError

      return {
        totalProjects: projects.length,
        totalSamples: samples.length,
        totalClearances: clearances.length,
        pendingClearances: clearances.filter(c => c.responseStatus === 'pending').length,
        approvedClearances: clearances.filter(c => c.responseStatus === 'approved').length,
        rejectedClearances: clearances.filter(c => c.responseStatus === 'rejected').length
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      throw error
    }
  },

  async getRecentActivity(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('clearanceRequests')
        .select(`
          clearanceRequestId,
          responseStatus,
          updatedAt,
          samples!inner(
            identifiedSongTitle,
            originalArtist,
            projects!inner(
              projectName,
              userId
            )
          )
        `)
        .eq('samples.projects.userId', userId)
        .order('updatedAt', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      throw error
    }
  }
}
