import { Card, CardContent, Typography, Tabs, Tab } from '@mui/material';
import React from 'react';

interface AnalysisSection {
  title: string;
  content: string;
  icon: React.ReactNode;
}

interface AnalysisCardProps {
  analysisData: AnalysisSection[];
  activeTab: number;
  onTabChange: (_event: React.SyntheticEvent, newValue: number) => void;
}

export function AnalysisCard({ analysisData, activeTab, onTabChange }: AnalysisCardProps) {
  return (
    <Card elevation={3}>
      <CardContent>
        <Tabs value={activeTab} onChange={onTabChange} sx={{ mb: 3 }}>
          {analysisData.map((section, index) => (
            <Tab
              key={index}
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {section.icon}
                  {section.title}
                </div>
              }
            />
          ))}
        </Tabs>
        {analysisData.map((section, index) => (
          <div
            key={index}
            role="tabpanel"
            hidden={activeTab !== index}
          >
            {activeTab === index && (
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {section.content}
              </Typography>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 