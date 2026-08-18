export type AuditEventType =
  | 'ATTENDANCE_OVERRIDE'
  | 'EXCEPTION_APPROVED'
  | 'EXCEPTION_REJECTED'
  | 'EMPLOYEE_CREATED'
  | 'EMPLOYEE_DEACTIVATED'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'ROSTER_PUBLISHED'
  | 'ROLE_CREATED'
  | 'ROLE_UPDATED'
  | 'SETTINGS_CHANGED'
  | 'LOGIN'
  | 'LOGOUT'
  | 'SITE_GEOFENCE_UPDATED';

export interface AuditLog {
  id: string;
  eventType: AuditEventType;
  actor: string;
  actorRole: string;
  actorAvatar: string;
  description: string;
  module: string;
  entityId?: string;
  entityLabel?: string;
  timestamp: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILED';
}

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    eventType: 'EXCEPTION_APPROVED',
    actor: 'Olivia Chen',
    actorRole: 'Organization Admin',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
    description: 'Approved geofence exception for Ramesh Kumar (EMP-003). Distance: 42m outside zone.',
    module: 'Exceptions',
    entityId: 'exc-001',
    entityLabel: 'Ramesh Kumar – Aug 18',
    timestamp: '2026-08-18T09:42:15Z',
    ipAddress: '192.168.1.10',
    status: 'SUCCESS'
  },
  {
    id: 'audit-2',
    eventType: 'ROSTER_PUBLISHED',
    actor: 'Vikramaditya Rao',
    actorRole: 'Regional Manager',
    actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
    description: 'Published August roster for HDFC Bank FC Road (12 posts, 3 shifts).',
    module: 'Roster',
    entityId: 'roster-aug',
    entityLabel: 'HDFC Bank Roster Aug 2026',
    timestamp: '2026-08-18T09:01:00Z',
    ipAddress: '10.0.0.15',
    status: 'SUCCESS'
  },
  {
    id: 'audit-3',
    eventType: 'LEAVE_APPROVED',
    actor: 'Olivia Chen',
    actorRole: 'Organization Admin',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
    description: 'Approved casual leave for Priya Sharma (EMP-005) from Aug 20 to Aug 22.',
    module: 'Leave',
    entityId: 'leave-002',
    entityLabel: 'Priya Sharma – CL Aug 20–22',
    timestamp: '2026-08-18T08:55:22Z',
    ipAddress: '192.168.1.10',
    status: 'SUCCESS'
  },
  {
    id: 'audit-4',
    eventType: 'ROLE_CREATED',
    actor: 'Olivia Chen',
    actorRole: 'Organization Admin',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
    description: 'Created new role "Compliance Auditor" with read-only access to all modules.',
    module: 'Roles & Access',
    entityId: 'role-5',
    entityLabel: 'Compliance Auditor',
    timestamp: '2026-08-18T08:30:10Z',
    ipAddress: '192.168.1.10',
    status: 'SUCCESS'
  },
  {
    id: 'audit-5',
    eventType: 'EMPLOYEE_CREATED',
    actor: 'Vikramaditya Rao',
    actorRole: 'Regional Manager',
    actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
    description: 'Created new guard profile: Anil Joshi (EMP-045), deployed at Infosys Gate 2.',
    module: 'Employees',
    entityId: 'emp-045',
    entityLabel: 'Anil Joshi (EMP-045)',
    timestamp: '2026-08-18T07:48:00Z',
    ipAddress: '10.0.0.15',
    status: 'SUCCESS'
  },
  {
    id: 'audit-6',
    eventType: 'ATTENDANCE_OVERRIDE',
    actor: 'Priya Sharma',
    actorRole: 'Site Supervisor',
    actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80',
    description: 'Manual attendance override for Suresh Patil (EMP-012) — marked PRESENT for Aug 17.',
    module: 'Attendance',
    entityId: 'att-override-001',
    entityLabel: 'Suresh Patil – Aug 17',
    timestamp: '2026-08-18T07:10:45Z',
    ipAddress: '172.16.0.5',
    status: 'SUCCESS'
  },
  {
    id: 'audit-7',
    eventType: 'EXCEPTION_REJECTED',
    actor: 'Olivia Chen',
    actorRole: 'Organization Admin',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
    description: 'Rejected exception for Deepak Verma (EMP-018) — repeated out-of-geofence pattern.',
    module: 'Exceptions',
    entityId: 'exc-004',
    entityLabel: 'Deepak Verma – Aug 18',
    timestamp: '2026-08-17T17:50:00Z',
    ipAddress: '192.168.1.10',
    status: 'SUCCESS'
  },
  {
    id: 'audit-8',
    eventType: 'SITE_GEOFENCE_UPDATED',
    actor: 'Vikramaditya Rao',
    actorRole: 'Regional Manager',
    actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
    description: 'Updated geofence radius for Infosys Phase 1 Main Gate from 100m to 150m.',
    module: 'Sites & Posts',
    entityId: 'site-3',
    entityLabel: 'Infosys Phase 1',
    timestamp: '2026-08-17T15:20:00Z',
    ipAddress: '10.0.0.15',
    status: 'SUCCESS'
  },
  {
    id: 'audit-9',
    eventType: 'LOGIN',
    actor: 'Priya Sharma',
    actorRole: 'Site Supervisor',
    actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80',
    description: 'Admin console login successful.',
    module: 'Auth',
    timestamp: '2026-08-17T09:05:00Z',
    ipAddress: '172.16.0.5',
    status: 'SUCCESS'
  },
  {
    id: 'audit-10',
    eventType: 'SETTINGS_CHANGED',
    actor: 'Olivia Chen',
    actorRole: 'Organization Admin',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
    description: 'Updated grace period from 10 minutes to 15 minutes for all sites.',
    module: 'Settings',
    timestamp: '2026-08-16T14:10:00Z',
    ipAddress: '192.168.1.10',
    status: 'SUCCESS'
  }
];
