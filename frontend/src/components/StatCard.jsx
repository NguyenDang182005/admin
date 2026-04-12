import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, icon, color = '#6366f1', subtitle }) => {
  return (
    <Card elevation={0} sx={{
      borderRadius: '12px',
      border: '1px solid #f0f0f0',
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" mt={0.5}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 56, height: 56,
            borderRadius: 2,
            backgroundColor: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
