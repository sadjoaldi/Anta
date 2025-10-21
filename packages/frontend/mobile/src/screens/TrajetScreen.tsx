import React from 'react';
import { useAuth } from '../hooks/useAuth';
import DriverTripsScreen from './DriverTripsScreen';
import PassengerTripsScreen from './PassengerTripsScreen';

const TrajetScreen: React.FC = () => {
  const { user } = useAuth();

  // If driver, show driver trips screen
  if (user?.role === 'driver') {
    return <DriverTripsScreen />;
  }

  // Otherwise show passenger trips screen
  return <PassengerTripsScreen />;
};

export default TrajetScreen;
