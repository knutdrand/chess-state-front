import React from 'react';
import { Box, Typography, Divider, Paper, List, ListItem, ListItemText, Chip } from '@mui/material';

export function _Info({ info, explanation }) {
  if (!info && !explanation) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No information available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {info && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Game Information
          </Typography>
          
          {info.opening && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Opening</Typography>
              <Typography variant="body2">{info.opening}</Typography>
            </Box>
          )}
          
          {info.position_type && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Position Type</Typography>
              <Typography variant="body2">{info.position_type}</Typography>
            </Box>
          )}
          
          {info.evaluation && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Evaluation</Typography>
              <Typography variant="body2">{info.evaluation}</Typography>
            </Box>
          )}
        </Box>
      )}
      
      {explanation && (
        <Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Move Explanation
          </Typography>
          
          <Typography variant="body2" paragraph>
            {explanation.text}
          </Typography>
          
          {explanation.key_concepts && explanation.key_concepts.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Key Concepts
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {explanation.key_concepts.map((concept, index) => (
                  <Chip key={index} label={concept} size="small" />
                ))}
              </Box>
            </Box>
          )}
          
          {explanation.alternative_moves && explanation.alternative_moves.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Alternative Moves
              </Typography>
              <List dense disablePadding>
                {explanation.alternative_moves.map((move, index) => (
                  <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary={move.move} 
                      secondary={move.explanation} 
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}