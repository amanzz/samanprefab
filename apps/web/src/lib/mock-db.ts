// Shared mock user database for admin endpoints
export const mockUsers: Record<string, any> = {
  'admin-1': {
    id: 'admin-1',
    email: 'admin@samanprefab.com',
    name: 'Admin User',
    password: '$2a$10$YourHashedPasswordHere', // bcrypt hash
    avatar: null,
  },
};

export function getAdminById(userId: string) {
  return mockUsers[userId] || null;
}

export function updateAdminAvatar(userId: string, avatarUrl: string) {
  if (mockUsers[userId]) {
    mockUsers[userId].avatar = avatarUrl;
    return true;
  }
  return false;
}
