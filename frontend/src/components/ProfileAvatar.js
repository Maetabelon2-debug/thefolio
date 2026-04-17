// frontend/src/components/ProfileAvatar.js
import { useAuth } from '../context/AuthContext';

const ProfileAvatar = ({ size = 'small', showName = false }) => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const profilePicUrl = user?.profilePic 
    ? `http://localhost:5000/uploads/${user.profilePic}` 
    : null;
  
  const sizeMap = {
    small: { width: '32px', height: '32px', fontSize: '1.2rem' },
    medium: { width: '48px', height: '48px', fontSize: '1.5rem' },
    large: { width: '64px', height: '64px', fontSize: '2rem' }
  };
  
  const currentSize = sizeMap[size] || sizeMap.small;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {profilePicUrl ? (
        <img 
          src={profilePicUrl} 
          alt={user.name}
          style={{
            width: currentSize.width,
            height: currentSize.height,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--secondary)'
          }}
        />
      ) : (
        <div style={{
          width: currentSize.width,
          height: currentSize.height,
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: currentSize.fontSize,
          color: 'white'
        }}>
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      )}
      {showName && <span style={{ color: 'white' }}>{user.name}</span>}
    </div>
  );
};

export default ProfileAvatar;