import React, { useState, createContext, useContext } from 'react';
// Icons
import { FaHome, FaUsersCog, FaSignOutAlt, FaFileAlt } from 'react-icons/fa';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth'; // Ensure this path is correct

const SidebarContext = createContext();

const SidebarItem = ({ icon, text, to, action, adminOnly = false, exact = false }) => {
  const { isOpen } = useContext(SidebarContext);
  const { user } = useAuth();

  // Hide item if it's adminOnly and the current user is not an admin
  if (adminOnly && user?.role?.toLowerCase() !== 'admin') {
    return null;
  }

  if (action) {
    return (
      <div
        onClick={action}
        className="group relative flex items-center w-full p-4 hover:bg-gray-100 cursor-pointer"
        title={text}
      >
        <div className="text-[#3c4a5d] text-xl">{icon}</div>
        {isOpen ? (
          <span className="ml-4 text-sm text-[#3c4a5d] font-medium">{text}</span>
        ) : (
          <div className="absolute left-full rounded-md px-2 py-1 ml-3 bg-gray-800 text-white text-xs invisible opacity-0 group-hover:visible group-hover:opacity-100 whitespace-nowrap z-20 shadow-lg">
            {text}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `group relative flex items-center w-full p-4 hover:bg-[#eaf3ffd6] ${
          isActive ? 'bg-blue-50 border-r-4 border-blue-500' : ''
        }`
      }
      title={text}
    >
      {({ isActive }) => (
        <>
          <div className={`text-xl ${isActive ? 'text-blue-600' : 'text-[#3c4a5d]'}`}>{icon}</div>
          {isOpen ? (
            <span className={`ml-4 text-sm font-medium ${isActive ? 'text-blue-700' : 'text-[#3c4a5d]'}`}>{text}</span>
          ) : (
            <div className="absolute left-full rounded-md px-2 py-1 ml-3 bg-gray-800 text-white text-xs invisible opacity-0 group-hover:visible group-hover:opacity-100 whitespace-nowrap z-20 shadow-lg">
              {text}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { icon: <FaHome />, label: 'Dashboard', to: '/', exact: true },
    { icon: <FaFileAlt />, label: 'Certificates', to: '/certificates' },
    { icon: <FaUsersCog />, label: 'User Management', to: '/admin/usersManagement', adminOnly: true },
  ];

  return (
    <SidebarContext.Provider value={{ isOpen }}>
      <aside className={`flex flex-col h-screen bg-[#aaa3bd69] border-r border-[#A2B8D7] shadow-lg shadow-right ${isOpen ? 'w-60' : 'w-18'} transition-all duration-300 ease-in-out`}>

        {/* Branding */}
        <div className={`flex items-center p-2 h-14 ${isOpen ? 'justify-center' : 'justify-center'}`}>
          {isOpen && <h1 className="text-2xl pr-2 font-bold text-[#3c4a5d]">DGAPR - DSI</h1>}
          <button onClick={toggleSidebar} className=" text-[#3c4a5d] rounded-md focus:outline-none">
            {isOpen ? <AiOutlineClose size={18} /> : <AiOutlineMenu size={24} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="rounded-md border-t border-[#A2B8D7] flex-1 flex flex-col space-y-1">
          {navItems.map((item, idx) => (
            <SidebarItem
              key={idx}
              icon={item.icon}
              text={item.label}
              to={item.to}
              adminOnly={item.adminOnly}
              exact={item.exact}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-auto rounded-md border-t border-[#A2B8D7]">
          <SidebarItem icon={<FaSignOutAlt />} text="Logout" action={handleLogout} />
        </div>

        {/* User Profile */}
        <div className="rounded-md border-t border-[#A2B8D7] p-3">
          <div className={`flex items-center ${isOpen ? '' : 'justify-center'}`}>
            <img
              src={
                user?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.displayName || user?.username || 'U'
                )}&background=E0E7FF&color=4F46E5&bold=true&size=128`
              }
              alt="User Avatar"
              className="w-8 h-8 rounded-full border-2 border-[#3b485c]"
            />
            {isOpen && (
              <div className="ml-3 overflow-hidden">
                <h4 className="text-sm font-semibold text-[#3b485c] truncate" title={user?.displayName || user?.username}>
                  {user?.displayName || user?.username || 'User Name'}
                </h4>
                <span className="text-xs text-[#3c4a5d] block truncate" title={user?.email}>
                  {user?.email || 'user@example.com'}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </SidebarContext.Provider>
  );
};

export default Sidebar;
