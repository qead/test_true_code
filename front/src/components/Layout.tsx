import React from 'react';
import ResponsiveAppBar from '@/components/AppBar'; // Предполагается, что AppBar находится в этом файле
import Box from '@mui/material/Box';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box>
      <ResponsiveAppBar />
      <Box component="main" sx={{ padding: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;