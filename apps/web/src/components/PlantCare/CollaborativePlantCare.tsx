// Collaborative Plant Care Component
'use client'

import React, { useState, useEffect } from 'react'
import { usePlantActivity, useRealtimeNotifications } from '@/lib/socket-client'
import { PlantShareActivity } from '@/lib/socket-server'
import {
  Droplets,
  Scissors,
  Sun,
  Zap,
  Camera,
  Eye,
  Users,
  Plus,
  Bell,
  CheckCircle,
  Clock,
  MessageCircle,
  Share2,
  Settings
} from 'lucide-react'

interface Plant {
  id: string
  name: string
  species: string
  image?: string
  collaborators: Collaborator[]
  careSchedule: CareTask[]
  lastCare: { [key: string]: Date }
}

interface Collaborator {
  id: string
  username: string
  email: string
  avatar?: string
  role: 'owner' | 'caretaker' | 'observer'
  permissions: Permission[]
}

interface Permission {
  type: 'water' | 'fertilize' | 'repot' | 'prune' | 'photograph' | 'observe' | 'invite_others'
  granted: boolean
}

interface CareTask {
  id: string
  type: 'watering' | 'fertilizing' | 'repotting' | 'pruning' | 'observation'
  frequency: number // days
  lastCompleted?: Date
  nextDue: Date
  assignedTo?: string
  priority: 'low' | 'medium' | 'high'
  notes?: string
}

interface CollaborativePlantCareProps {
  plant: Plant
  currentUser: {
    id: string
    username: string
    avatar?: string
  }
  onUpdatePlant: (plant: Plant) => void
}

export default function CollaborativePlantCare({ 
  plant, 
  currentUser, 
  onUpdatePlant 
}: CollaborativePlantCareProps) {
  const [selectedTask, setSelectedTask] = useState<CareTask | null>(null)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('')
  const [careLog, setCareLog] = useState('')
  const [showCareLog, setShowCareLog] = useState(false)

  const { activities, shareActivity } = usePlantActivity()
  const { sendNotification } = useRealtimeNotifications()

  const currentUserRole = plant.collaborators.find(c => c.id === currentUser.id)?.role || 'observer'
  const canManagePlant = currentUserRole === 'owner'
  const canPerformCare = currentUserRole === 'owner' || currentUserRole === 'caretaker'

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'watering': return <Droplets className="w-5 h-5 text-blue-500" />
      case 'fertilizing': return <Zap className="w-5 h-5 text-yellow-500" />
      case 'repotting': return <div className="w-5 h-5 bg-brown-500 rounded" />
      case 'pruning': return <Scissors className="w-5 h-5 text-green-500" />
      case 'observation': return <Eye className="w-5 h-5 text-purple-500" />
      default: return <CheckCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getTaskPriorityColor = (priority: string, isOverdue: boolean) => {
    if (isOverdue) return 'text-red-600 bg-red-50 border-red-200'
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const isTaskOverdue = (task: CareTask) => {
    return new Date() > task.nextDue
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const handleCompleteTask = async (task: CareTask) => {
    if (!canPerformCare) return

    const activity: Omit<PlantShareActivity, 'id' | 'timestamp' | 'userId' | 'username'> = {
      type: task.type as any,
      plantId: plant.id,
      plantName: plant.name,
      description: careLog || `Completed ${task.type} for ${plant.name}`,
      collaborators: plant.collaborators.map(c => c.id)
    }

    shareActivity(activity)

    // Update task completion
    const updatedTasks = plant.careSchedule.map(t => 
      t.id === task.id 
        ? { 
            ...t, 
            lastCompleted: new Date(), 
            nextDue: new Date(Date.now() + t.frequency * 24 * 60 * 60 * 1000) 
          }
        : t
    )

    const updatedPlant = { ...plant, careSchedule: updatedTasks }
    onUpdatePlant(updatedPlant)

    // Notify collaborators
    const otherCollaborators = plant.collaborators
      .filter(c => c.id !== currentUser.id)
      .map(c => c.id)

    if (otherCollaborators.length > 0) {
      sendNotification({
        targetUserIds: otherCollaborators,
        type: 'plant_care_completed',
        title: `🌱 ${plant.name} Care Update`,
        message: `${currentUser.username} completed ${task.type} for ${plant.name}`,
        metadata: { plantId: plant.id, taskType: task.type }
      })
    }

    setSelectedTask(null)
    setCareLog('')
    setShowCareLog(false)
  }

  const handleInviteCollaborator = async () => {
    if (!canManagePlant || !newCollaboratorEmail.trim()) return

    // This would typically make an API call to invite a user
    console.log('Inviting collaborator:', newCollaboratorEmail)
    
    // For now, simulate adding collaborator
    const newCollaborator: Collaborator = {
      id: `temp_${Date.now()}`,
      username: newCollaboratorEmail.split('@')[0],
      email: newCollaboratorEmail,
      role: 'caretaker',
      permissions: [
        { type: 'water', granted: true },
        { type: 'fertilize', granted: true },
        { type: 'observe', granted: true },
        { type: 'photograph', granted: true },
        { type: 'prune', granted: false },
        { type: 'repot', granted: false },
        { type: 'invite_others', granted: false }
      ]
    }

    const updatedPlant = {
      ...plant,
      collaborators: [...plant.collaborators, newCollaborator]
    }

    onUpdatePlant(updatedPlant)
    setNewCollaboratorEmail('')
    setShowInviteDialog(false)
  }

  const overdueTasks = plant.careSchedule.filter(isTaskOverdue)
  const upcomingTasks = plant.careSchedule
    .filter(task => !isTaskOverdue(task))
    .sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime())

  const recentActivities = activities.filter(activity => 
    activity.plantId === plant.id
  ).slice(0, 10)

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Plant Header */}
      <div className="relative">
        {plant.image && (
          <img 
            src={plant.image} 
            alt={plant.name}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-2xl font-bold">{plant.name}</h1>
          <p className="text-white/90">{plant.species}</p>
        </div>
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-2 bg-white/90 rounded-full px-3 py-1">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {plant.collaborators.length} collaborator{plant.collaborators.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Collaborators Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Collaborators</h3>
            {canManagePlant && (
              <button
                onClick={() => setShowInviteDialog(true)}
                className="flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Invite</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plant.collaborators.map(collaborator => (
              <div key={collaborator.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {collaborator.avatar ? (
                  <img 
                    src={collaborator.avatar} 
                    alt={collaborator.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {collaborator.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {collaborator.username}
                    {collaborator.id === currentUser.id && (
                      <span className="ml-2 text-xs text-green-600">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{collaborator.role}</p>
                </div>

                {collaborator.role === 'owner' && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Owner
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Care Tasks Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Tasks</h3>
          
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Overdue ({overdueTasks.length})
              </h4>
              <div className="space-y-2">
                {overdueTasks.map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    isOverdue={true}
                    canPerformCare={canPerformCare}
                    onSelect={setSelectedTask}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Tasks */}
          {upcomingTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Upcoming Tasks ({upcomingTasks.length})
              </h4>
              <div className="space-y-2">
                {upcomingTasks.slice(0, 5).map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    isOverdue={false}
                    canPerformCare={canPerformCare}
                    onSelect={setSelectedTask}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getTaskIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.username}</span>
                      {' '}completed{' '}
                      <span className="font-medium capitalize">{activity.type}</span>
                    </p>
                    {activity.description && (
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                  {activity.imageUrl && (
                    <img 
                      src={activity.imageUrl} 
                      alt="Activity"
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No recent activities for this plant.</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Completion Modal */}
      {selectedTask && (
        <TaskCompletionModal
          task={selectedTask}
          plantName={plant.name}
          careLog={careLog}
          setCareLog={setCareLog}
          onComplete={() => handleCompleteTask(selectedTask)}
          onCancel={() => setSelectedTask(null)}
        />
      )}

      {/* Invite Collaborator Modal */}
      {showInviteDialog && (
        <InviteCollaboratorModal
          email={newCollaboratorEmail}
          setEmail={setNewCollaboratorEmail}
          onInvite={handleInviteCollaborator}
          onCancel={() => setShowInviteDialog(false)}
        />
      )}
    </div>
  )
}

// Task Card Component
function TaskCard({ 
  task, 
  isOverdue, 
  canPerformCare, 
  onSelect 
}: { 
  task: CareTask
  isOverdue: boolean
  canPerformCare: boolean
  onSelect: (task: CareTask) => void
}) {
  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'watering': return <Droplets className="w-5 h-5 text-blue-500" />
      case 'fertilizing': return <Zap className="w-5 h-5 text-yellow-500" />
      case 'repotting': return <div className="w-5 h-5 bg-amber-600 rounded" />
      case 'pruning': return <Scissors className="w-5 h-5 text-green-500" />
      case 'observation': return <Eye className="w-5 h-5 text-purple-500" />
      default: return <CheckCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className={`p-3 border rounded-lg ${
      isOverdue 
        ? 'border-red-200 bg-red-50' 
        : 'border-gray-200 bg-white hover:bg-gray-50'
    } transition-colors`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getTaskIcon(task.type)}
          <div>
            <h4 className="text-sm font-medium text-gray-900 capitalize">
              {task.type}
            </h4>
            <p className="text-xs text-gray-500">
              Due: {formatDate(task.nextDue)}
              {task.lastCompleted && (
                <span className="ml-2">
                  Last: {formatDate(task.lastCompleted)}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full capitalize ${
            isOverdue 
              ? 'text-red-700 bg-red-100'
              : task.priority === 'high'
              ? 'text-red-600 bg-red-50'
              : task.priority === 'medium'
              ? 'text-yellow-600 bg-yellow-50'
              : 'text-green-600 bg-green-50'
          }`}>
            {task.priority}
          </span>

          {canPerformCare && (
            <button
              onClick={() => onSelect(task)}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Task Completion Modal
function TaskCompletionModal({
  task,
  plantName,
  careLog,
  setCareLog,
  onComplete,
  onCancel
}: {
  task: CareTask
  plantName: string
  careLog: string
  setCareLog: (log: string) => void
  onComplete: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Complete {task.type} for {plantName}
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Care Notes (Optional)
          </label>
          <textarea
            value={careLog}
            onChange={(e) => setCareLog(e.target.value)}
            placeholder="Add any observations or notes about this care activity..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onComplete}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium"
          >
            Complete Task
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// Invite Collaborator Modal
function InviteCollaboratorModal({
  email,
  setEmail,
  onInvite,
  onCancel
}: {
  email: string
  setEmail: (email: string) => void
  onInvite: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Invite Collaborator
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onInvite}
            disabled={!email.trim()}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Send Invitation
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}