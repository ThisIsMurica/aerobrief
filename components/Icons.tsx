import React from 'react';

type IconProps = {
  className?: string;
};

export const SearchIcon: React.FC<IconProps> = ({ className = 'h-6 w-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

export const LoaderIcon: React.FC<IconProps> = ({ className = 'h-6 w-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.75V6.25m0 11.5v1.5M17.25 6.75l-1.06 1.06M7.81 16.19l-1.06 1.06M20 12h-1.5M5.5 12H4m13.25-5.25l-1.06-1.06M7.81 7.81l-1.06-1.06"
    />
  </svg>
);

export const AlertTriangleIcon: React.FC<IconProps> = ({ className = 'h-6 w-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const BaseIcon: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
);


export const WindIcon: React.FC = () => <BaseIcon><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></BaseIcon>;
export const VisibilityIcon: React.FC = () => <BaseIcon><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></BaseIcon>;
export const ThermometerIcon: React.FC = () => <BaseIcon><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></BaseIcon>;
export const CloudIcon: React.FC = () => <BaseIcon><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></BaseIcon>;
export const PressureIcon: React.FC = () => <BaseIcon><path d="m12 14 4-4"/><path d="m12 14-4-4"/><path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"/></BaseIcon>;
export const InfoIcon: React.FC = () => <BaseIcon><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></BaseIcon>;
export const ClockIcon: React.FC = () => <BaseIcon><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></BaseIcon>;
export const MountainIcon: React.FC = () => <BaseIcon><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></BaseIcon>;

export const PlaneLandingIcon: React.FC = () => <BaseIcon><path d="M2 22h20"/><path d="M4.34 16.34 12 12l7.66 4.34-1.32-4.64-8.68-8.68-1.32 4.64Z"/></BaseIcon>;
export const LightbulbIcon: React.FC = () => <BaseIcon><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.7.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></BaseIcon>;
// FIX: Update SendIcon to accept a className prop.
export const SendIcon: React.FC<IconProps> = ({ className }) => <BaseIcon className={className}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></BaseIcon>;
export const BotIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => <BaseIcon className={className}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></BaseIcon>;
export const UserIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => <BaseIcon className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></BaseIcon>;

export const CrosswindIcon: React.FC<IconProps> = ({ className }) => <BaseIcon className={className}><path d="M4 12h16"/><path d="m16 8-4 4 4 4"/><path d="m8 16 4-4-4-4"/></BaseIcon>;
export const HeadwindIcon: React.FC<IconProps> = ({ className }) => <BaseIcon className={className}><path d="M2 12h20"/><path d="m6 8-4 4 4 4"/></BaseIcon>;