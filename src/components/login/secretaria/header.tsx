'use client';

import React from 'react';

interface HeaderProps {
  title: string;
  subtitle: string;
  showStatus?: boolean;
}

export default function Header({ title, subtitle, showStatus = false }: HeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
            <p className="text-gray-600 mt-1">
              {subtitle}
            </p>
          </div>
          {showStatus && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}