import { Home, Tags, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';

const Sidebar = () => {
  const menuItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: Tags, label: 'Tags', href: '/dashboard/tags' },
    { icon: Star, label: 'Favorites', href: '/dashboard/favorites' },
    { icon: Trash2, label: 'Trash', href: '/dashboard/trash' },
  ];

  return (
    <div className="flex flex-col h-full p-3 bg-white shadow w-60">
      <div className="space-y-3">
        {/* <div className="flex items-center">
          <h2 className="text-xl font-bold">CodeSnippet Master</h2>
        </div> */}
        <div className="flex-1">
          <ul className="pt-2 pb-4 space-y-1 text-sm">
            {menuItems.map((item, index) => (
              <li key={index} className="rounded-sm">
                <Link href={item.href} className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-100">
                  <item.icon className="w-6 h-6" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
