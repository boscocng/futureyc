export const API_BASE = '/api'

export const ENDPOINTS = {
  health: '/health',

  // Onboarding
  onboardingComplete: '/onboarding/complete',

  // Users
  userProfile: (userId) => `/users/${userId}/profile`,

  // Projects
  userProjects: (userId) => `/users/${userId}/projects`,
  projects: '/projects',
  project: (projectId) => `/projects/${projectId}`,

  // Interview
  interviewMessage: (projectId) => `/projects/${projectId}/interview/message`,
  interviewMessages: (projectId) => `/projects/${projectId}/interview/messages`,

  // Scope Chat
  scopeMessage: (projectId) => `/projects/${projectId}/scope/message`,
  scopeMessages: (projectId) => `/projects/${projectId}/scope/messages`,

  // Tasks
  projectTasks: (projectId) => `/projects/${projectId}/tasks`,
  task: (taskId) => `/tasks/${taskId}`,
  taskMessage: (taskId) => `/tasks/${taskId}/message`,
  taskMessages: (taskId) => `/tasks/${taskId}/messages`,
  generatePrompt: (taskId) => `/tasks/${taskId}/generate-prompt`,
}
