'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { MoreVertical, Eye, Trash2 } from 'lucide-react'

interface ActivityMenuProps {
  id: string
  type: 'donation' | 'asatidz' | 'profile' | 'user' | string
}

export default function ActivityMenu({ id, type }: ActivityMenuProps) {
  
  const handleViewDetails = () => {
    if (type === 'asatidz' || type === 'user') {
      window.location.href = `/dashboard/admin/verifikasi/${id}`
    } else if (type === 'donation') {
      window.location.href = `/dashboard/admin/donasi`
    } else {
      alert(`Melihat detail untuk item dengan ID: ${id}`)
    }
  }

  const handleArchiveItem = () => {
    confirm(`Apakah Anda yakin ingin mengarsipkan data log [${type}] ini?`)
  }

  return (
    <div className="relative inline-block text-left">
      {/* FIX: Menambahkan properti id statis unik dari database.
        Ini menghentikan Headless UI menghasilkan ID acak yang memicu Hydration Error.
      */}
      <Menu>
        <MenuButton 
          id={`menu-button-${id}`}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
        >
          <MoreVertical size={16} />
        </MenuButton>

        <MenuItems 
          transition
          className="absolute right-0 mt-2 w-44 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-30 transition ease-out duration-100 data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <div className="p-1">
            <MenuItem>
              <button
                onClick={handleViewDetails}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 font-medium"
              >
                <Eye size={14} className="text-gray-400" />
                Lihat Detail
              </button>
            </MenuItem>
            
            <MenuItem>
              <button
                onClick={handleArchiveItem}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50 font-medium"
              >
                <Trash2 size={14} className="text-red-400" />
                Arsipkan Log
              </button>
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
    </div>
  )
}