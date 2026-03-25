import { API_BASE, ENDPOINTS } from './config'

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
  } catch {
    throw new Error('Unable to reach the server. Please check your connection.')
  }
  if (!res.ok) {
    let message
    try {
      const body = await res.json()
      message = body.detail || body.message || JSON.stringify(body)
    } catch {
      message = `Request failed (${res.status})`
    }
    throw new Error(message)
  }
  return res.json()
}

export function fetchHealth() {
  return request(ENDPOINTS.health)
}

export function completeOnboarding(payload) {
  return request(ENDPOINTS.onboardingComplete, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getUserProfile(userId) {
  return request(ENDPOINTS.userProfile(userId))
}

export function updateUserProfile(userId, updates) {
  return request(ENDPOINTS.userProfile(userId), {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export function listProjects(userId) {
  return request(ENDPOINTS.userProjects(userId))
}

export function createProject(userId, name) {
  return request(ENDPOINTS.projects, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, name }),
  })
}

export function getProject(projectId) {
  return request(ENDPOINTS.project(projectId))
}

export function deleteProject(projectId) {
  return request(ENDPOINTS.project(projectId), { method: 'DELETE' })
}

export function sendInterviewMessage(projectId, content, history) {
  return request(ENDPOINTS.interviewMessage(projectId), {
    method: 'POST',
    body: JSON.stringify({ content, history }),
  })
}

export function getInterviewMessages(projectId) {
  return request(ENDPOINTS.interviewMessages(projectId))
}

export function sendScopeMessage(projectId, content) {
  return request(ENDPOINTS.scopeMessage(projectId), {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export function getScopeMessages(projectId) {
  return request(ENDPOINTS.scopeMessages(projectId))
}

export function listTasks(projectId) {
  return request(ENDPOINTS.projectTasks(projectId))
}

export function getTask(taskId) {
  return request(ENDPOINTS.task(taskId))
}

export function updateTask(taskId, updates) {
  return request(ENDPOINTS.task(taskId), {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export function archiveTask(taskId) {
  return request(ENDPOINTS.task(taskId), { method: 'DELETE' })
}

export function sendTaskMessage(taskId, content) {
  return request(ENDPOINTS.taskMessage(taskId), {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export function getTaskMessages(taskId) {
  return request(ENDPOINTS.taskMessages(taskId))
}

export function generatePrompt(taskId) {
  return request(ENDPOINTS.generatePrompt(taskId), {
    method: 'POST',
  })
}
