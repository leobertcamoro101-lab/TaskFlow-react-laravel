import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import LoadingSpinner from '../../components/LoadingSpinner';

const formatBirthday = (birthday: string | null | undefined) => {
  if (!birthday) return '—';
  const [year, month, day] = birthday.slice(0, 10).split('-');
  return `${parseInt(month)}/${parseInt(day)}/${year}`;
};

const ProfilePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-12 bg-[#FAF6EF]">
      <div className="w-full max-w-md space-y-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#857A64] hover:text-[#2B2418] transition-colors text-sm"
        >
          <span aria-hidden="true">←</span> Back
        </button>
        {!user && (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        )}
        {user && (
          <Card>
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <Avatar image={user?.avatar_url} name={user?.name} alt={user?.name} />
            </div>
            <h1 className="text-2xl font-bold text-[#2B2418] mb-6">{user?.name}</h1>

            <div className="text-left space-y-2 mb-6">
              <p className="text-[#857A64] text-sm">
                Email: <span className="text-[#2B2418] font-medium">{user?.email}</span>
              </p>
              <p className="text-[#857A64] text-sm">
                Birthday: <span className="text-[#2B2418] font-medium">{formatBirthday(user?.birthday)}</span>
              </p>
              <p className="text-[#857A64] text-sm">
                Gender: <span className="text-[#2B2418] font-medium">{user?.gender}</span>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/profile/edit')}
                className="w-full bg-[#B8862E] hover:bg-[#9C7226] text-white font-bold py-3 rounded-xl transition-colors"
              >
                Edit Profile
              </button>
              <button
                onClick={() => navigate('/profile/password')}
                className="w-full bg-[#F0EAD9] hover:bg-[#E9E0CF] text-[#2B2418] font-bold py-3 rounded-xl transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
