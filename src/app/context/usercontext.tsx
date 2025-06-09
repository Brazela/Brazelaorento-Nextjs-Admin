'use client';
import React, { createContext, useContext } from 'react';

type User = {
  id: number;
  username: string;
  email: string;
  profilePicture: string;
  permission: string;
};

const UserContext = createContext<User | null>(null);

export const UserProvider = ({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) => {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useCurrentUser = () => useContext(UserContext);
